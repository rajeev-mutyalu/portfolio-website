import os, sys
sys.path.append(r'C:\Users\rajee\AppData\Roaming\Python\Python314\site-packages')
from PIL import Image, ImageFilter

def chroma_key_green(img):
    img = img.convert('RGBA')
    w, h = img.size
    pixels = img.load()
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pix = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Green screen check: g > r + 30 and g > b + 30
            # Also shadow on green floor: g > r + 15 and g > b + 15
            is_green = (g > r + 25 and g > b + 25 and g > 70) or (g > 160 and r < 120 and b < 120)
            
            if is_green:
                out_pix[x, y] = (0, 0, 0, 0)
            else:
                # Despill green bounce on white/tan edges
                if g > (r + b) // 2 + 10:
                    new_g = (r + b) // 2
                    out_pix[x, y] = (r, new_g, b, 255)
                else:
                    out_pix[x, y] = (r, g, b, 255)

    # 1px boundary cleanup
    r_c, g_c, b_c, a_c = out.split()
    a_clean = a_c.filter(ImageFilter.MinFilter(3))
    a_smooth = a_clean.filter(ImageFilter.GaussianBlur(0.4))
    final = Image.merge('RGBA', (r_c, g_c, b_c, a_smooth))
    return final

def extract_and_save_all():
    os.makedirs('sprites', exist_ok=True)
    
    # 1. Run Sheet (Row of 4 frames or 2x2/bottom row)
    run_sheet_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_run_cycle_sheet_1787161009422.jpg'
    run_img = Image.open(run_sheet_path)
    W, H = run_img.size
    # Bottom row has 4 frames across
    # Top row has 2 frames
    # Let's crop the bottom 4 frames: (0, H//2, W, H)
    sub_w = W // 4
    for i in range(4):
        crop_box = (i * sub_w, H // 2 - 40, (i + 1) * sub_w, H)
        frame = run_img.crop(crop_box)
        clean_frame = chroma_key_green(frame)
        bbox = clean_frame.getbbox()
        if bbox:
            clean_frame = clean_frame.crop(bbox)
        clean_frame.save(f'sprites/run_{i+1}.png', 'PNG')
        print(f"Saved sprites/run_{i+1}.png ({clean_frame.size})")

    # 2. Sit & Wag Sheet (4 frames in a row)
    sit_sheet_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_sit_wag_sheet_1787161023088.jpg'
    sit_img = Image.open(sit_sheet_path)
    SW, SH = sit_img.size
    sub_sw = SW // 4
    for i in range(4):
        crop_box = (i * sub_sw, 0, (i + 1) * sub_sw, SH)
        frame = sit_img.crop(crop_box)
        clean_frame = chroma_key_green(frame)
        bbox = clean_frame.getbbox()
        if bbox:
            clean_frame = clean_frame.crop(bbox)
        clean_frame.save(f'sprites/sit_{i+1}.png', 'PNG')
        print(f"Saved sprites/sit_{i+1}.png ({clean_frame.size})")

    # 3. Jump & Catch Sheet (4 frames in a row)
    catch_sheet_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_jump_catch_sheet_1787161038024.jpg'
    catch_img = Image.open(catch_sheet_path)
    CW, CH = catch_img.size
    sub_cw = CW // 4
    for i in range(4):
        crop_box = (i * sub_cw, 0, (i + 1) * sub_cw, CH)
        frame = catch_img.crop(crop_box)
        clean_frame = chroma_key_green(frame)
        bbox = clean_frame.getbbox()
        if bbox:
            clean_frame = clean_frame.crop(bbox)
        clean_frame.save(f'sprites/catch_{i+1}.png', 'PNG')
        print(f"Saved sprites/catch_{i+1}.png ({clean_frame.size})")

if __name__ == '__main__':
    extract_and_save_all()
