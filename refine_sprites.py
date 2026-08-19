import os, sys
sys.path.append(r'C:\Users\rajee\AppData\Roaming\Python\Python314\site-packages')
from PIL import Image, ImageFilter, ImageChops

def refine_magenta_sprite(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    
    # Load pixels
    pix = img.load()
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pix = out.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            
            # Magenta background check
            # In magenta backdrop: R is high (~230-255), G is low (< 30), B is high (~230-255)
            # Distance to pure magenta (255, 0, 255)
            is_magenta = (r > 160 and b > 160 and g < 100) or (r > 190 and b > 190 and g < 130)
            
            if is_magenta:
                out_pix[x, y] = (0, 0, 0, 0)
            else:
                # If there's slight purple fringe (r > g + 25 and b > g + 25):
                if r > g + 20 and b > g + 20:
                    # Despill
                    new_r = (g + min(r, g + 15)) // 2
                    new_b = (g + min(b, g + 15)) // 2
                    out_pix[x, y] = (new_r, g, new_b, 255)
                else:
                    out_pix[x, y] = (r, g, b, 255)
                    
    # Morphological erosion on alpha channel to strip any 1-2px edge bleed
    r_chan, g_chan, b_chan, a_chan = out.split()
    # MinFilter shrinks white area (erodes 1 pixel of edge)
    a_eroded = a_chan.filter(ImageFilter.MinFilter(3))
    # Soften edge with 0.6px blur
    a_smooth = a_eroded.filter(ImageFilter.GaussianBlur(0.6))
    
    result = Image.merge('RGBA', (r_chan, g_chan, b_chan, a_smooth))
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    result.save(output_path, 'PNG')
    print(f"Refined {output_path}: {result.size}")

if __name__ == '__main__':
    idle_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_idle_1787159989468.jpg'
    run_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_run_1787160004283.jpg'
    catch_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_catch_1787160019387.jpg'

    refine_magenta_sprite(idle_path, 'donut_idle.png')
    refine_magenta_sprite(run_path, 'donut_run.png')
    refine_magenta_sprite(catch_path, 'donut_catch.png')
