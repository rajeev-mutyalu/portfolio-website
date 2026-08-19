import os
from PIL import Image, ImageDraw, ImageFilter

def perfect_chroma_cutout(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    
    pixels = img.load()
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pix = out.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            
            # Magenta / Floor shadow condition:
            # Background is magenta where (r > 120 and b > 120 and g < 75)
            # Even in shadow: r > 110, b > 110, g < 40
            if (r > 110 and b > 110 and g < 75) or (min(r, b) - g > 65):
                out_pix[x, y] = (0, 0, 0, 0)
            else:
                # Foreground Dog Pixel
                # If there is slight magenta fringe (e.g. min(r,b) > g + 25):
                if r > g + 20 and b > g + 20:
                    # Despill magenta tint from edge hairs
                    new_r = min(r, g + 15)
                    new_b = min(b, g + 15)
                    out_pix[x, y] = (new_r, g, new_b, 255)
                else:
                    out_pix[x, y] = (r, g, b, 255)

    # Clean 1px alpha erosion + soft feather to remove any microscopic boundary artifact
    r_c, g_c, b_c, a_c = out.split()
    a_clean = a_c.filter(ImageFilter.MinFilter(3))
    a_smooth = a_clean.filter(ImageFilter.GaussianBlur(0.5))
    
    final_img = Image.merge('RGBA', (r_c, g_c, b_c, a_smooth))
    
    # Crop to dog bbox
    bbox = final_img.getbbox()
    if bbox:
        final_img = final_img.crop(bbox)
        
    final_img.save(output_path, 'PNG')
    print(f"Generated perfect transparent PNG: {output_path} (size: {final_img.size})")

def run():
    idle_src = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_idle_1787159989468.jpg'
    run_src = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_run_1787160004283.jpg'
    catch_src = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_catch_1787160019387.jpg'

    perfect_chroma_cutout(idle_src, 'donut_idle.png')
    perfect_chroma_cutout(run_src, 'donut_run.png')
    perfect_chroma_cutout(catch_src, 'donut_catch.png')

    # Fetch ball clean cutout
    ball_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'
    b_img = Image.open(ball_path).convert('RGBA')
    bw, bh = b_img.size
    mask = Image.new('L', (bw, bh), 0)
    m_draw = ImageDraw.Draw(mask)
    cx, cy = bw // 2, bh // 2
    rad = int(bw * 0.435)
    m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    
    ball_out = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    ball_out.paste(b_img, (0, 0), mask)
    bbox = ball_out.getbbox()
    if bbox:
        ball_out = ball_out.crop(bbox)
    ball_out.save('fetch_ball.png', 'PNG')
    print("Generated perfect transparent fetch_ball.png")

if __name__ == '__main__':
    run()
