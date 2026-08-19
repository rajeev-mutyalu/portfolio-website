import os, sys
sys.path.append(r'C:\Users\rajee\AppData\Roaming\Python\Python314\site-packages')
from PIL import Image, ImageFilter

def extract_spritesheet():
    sheet_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_spritesheet_preview_1787160968608.jpg'
    sheet = Image.open(sheet_path).convert('RGBA')
    W, H = sheet.size
    print(f"Spritesheet dimensions: {W} x {H}")

    # 4 rows, 4 columns
    cols = 4
    rows = 4
    cw = W // cols
    ch = H // rows

    os.makedirs('sprites', exist_ok=True)

    states = {
        0: 'run',
        1: 'wag',
        2: 'sit',
        3: 'catch'
    }

    frames_by_state = {
        'run': [],
        'wag': [],
        'sit': [],
        'catch': []
    }

    for r in range(rows):
        state_name = states[r]
        for c in range(cols):
            x1 = c * cw
            y1 = r * ch
            x2 = (c + 1) * cw
            y2 = (r + 1) * ch

            cell = sheet.crop((x1, y1, x2, y2))
            
            # White background removal (chroma keying white #FFFFFF)
            pix = cell.load()
            w, h = cell.size
            out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
            out_pix = out.load()

            for y in range(h):
                for x in range(w):
                    red, grn, blu, a = pix[x, y]
                    # Check if pixel is background white / off-white
                    # Dark outlines and tan fur have red/grn/blu < 235 or saturated
                    is_white_bg = (red >= 240 and grn >= 240 and blu >= 240)
                    
                    if is_white_bg:
                        out_pix[x, y] = (0, 0, 0, 0)
                    else:
                        out_pix[x, y] = (red, grn, blu, 255)

            # Crop tight to dog
            bbox = out.getbbox()
            if bbox:
                out = out.crop(bbox)

            frame_filename = f'sprites/donut_{state_name}_{c+1}.png'
            out.save(frame_filename, 'PNG')
            frames_by_state[state_name].append(out)
            print(f"Saved {frame_filename} ({out.size})")

    # Generate Animated GIFs for each state
    # 1. Run Loop (100ms per frame = 10fps)
    if frames_by_state['run']:
        # Normalize sizes for gif
        max_w = max(f.width for f in frames_by_state['run'])
        max_h = max(f.height for f in frames_by_state['run'])
        norm_run = []
        for f in frames_by_state['run']:
            canvas = Image.new('RGBA', (max_w + 10, max_h + 10), (0, 0, 0, 0))
            # align to bottom
            canvas.paste(f, ((max_w - f.width)//2 + 5, max_h - f.height + 5), f)
            norm_run.append(canvas)
        
        norm_run[0].save('donut_anim_run.gif', save_all=True, append_images=norm_run[1:], duration=110, loop=0, disposal=2)
        print("Generated donut_anim_run.gif")

    # 2. Idle Wag Loop (180ms per frame)
    if frames_by_state['wag']:
        max_w = max(f.width for f in frames_by_state['wag'])
        max_h = max(f.height for f in frames_by_state['wag'])
        norm_wag = []
        for f in frames_by_state['wag']:
            canvas = Image.new('RGBA', (max_w + 10, max_h + 10), (0, 0, 0, 0))
            canvas.paste(f, ((max_w - f.width)//2 + 5, max_h - f.height + 5), f)
            norm_wag.append(canvas)
        
        norm_wag[0].save('donut_anim_wag.gif', save_all=True, append_images=norm_wag[1:], duration=200, loop=0, disposal=2)
        print("Generated donut_anim_wag.gif")

    # 3. Sitting Idle (280ms per frame)
    if frames_by_state['sit']:
        max_w = max(f.width for f in frames_by_state['sit'])
        max_h = max(f.height for f in frames_by_state['sit'])
        norm_sit = []
        for f in frames_by_state['sit']:
            canvas = Image.new('RGBA', (max_w + 10, max_h + 10), (0, 0, 0, 0))
            canvas.paste(f, ((max_w - f.width)//2 + 5, max_h - f.height + 5), f)
            norm_sit.append(canvas)
        
        norm_sit[0].save('donut_anim_sit.gif', save_all=True, append_images=norm_sit[1:], duration=300, loop=0, disposal=2)
        print("Generated donut_anim_sit.gif")

    # 4. Jump & Catch (160ms per frame)
    if frames_by_state['catch']:
        max_w = max(f.width for f in frames_by_state['catch'])
        max_h = max(f.height for f in frames_by_state['catch'])
        norm_catch = []
        for f in frames_by_state['catch']:
            canvas = Image.new('RGBA', (max_w + 10, max_h + 10), (0, 0, 0, 0))
            canvas.paste(f, ((max_w - f.width)//2 + 5, max_h - f.height + 5), f)
            norm_catch.append(canvas)
        
        norm_catch[0].save('donut_anim_catch.gif', save_all=True, append_images=norm_catch[1:], duration=180, loop=0, disposal=2)
        print("Generated donut_anim_catch.gif")

if __name__ == '__main__':
    extract_spritesheet()
