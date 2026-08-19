import os
from PIL import Image, ImageDraw, ImageFilter
import math

def chroma_key_magenta(img_path, output_path, despill=True):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    
    # We want to key out magenta / bright pink: High Red, Low Green, High Blue
    # Pure magenta is (255, 0, 255)
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        
        # Calculate how "magenta" the pixel is
        # Magenta difference from green: min(r, b) - g
        magenta_score = min(r, b) - g
        
        # If strong magenta, it is background
        if magenta_score > 85 and g < 150:
            if magenta_score > 130:
                # 100% transparent
                new_data.append((0, 0, 0, 0))
            else:
                # Soft feathering edge
                alpha = int(255 * (1.0 - (magenta_score - 85) / 45.0))
                alpha = max(0, min(255, alpha))
                
                # Despill magenta from edge fur
                if despill:
                    # Remove magenta tint from semi-transparent edge
                    avg_gb = (g + b) // 2
                    r_clean = min(r, g + 30)
                    b_clean = min(b, g + 30)
                    new_data.append((r_clean, g, b_clean, alpha))
                else:
                    new_data.append((r, g, b, alpha))
        else:
            # Foreground dog pixel
            # Also despill any slight magenta bounce on white fur
            if despill and (r > g + 40) and (b > g + 40):
                r_fixed = min(r, g + 25)
                b_fixed = min(b, g + 25)
                new_data.append((r_fixed, g, b_fixed, 255))
            else:
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        # Add slight padding
        img = img.crop(bbox)
        
    img.save(output_path, 'PNG')
    print(f"Successfully generated transparent PNG: {output_path} (size: {img.size})")

def process_all():
    idle_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_idle_1787159989468.jpg'
    run_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_run_1787160004283.jpg'
    catch_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\donut_realistic_catch_1787160019387.jpg'
    ball_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'

    chroma_key_magenta(idle_path, 'donut_idle.png')
    chroma_key_magenta(run_path, 'donut_run.png')
    chroma_key_magenta(catch_path, 'donut_catch.png')

    # Fetch ball clean circle mask
    b_img = Image.open(ball_path).convert('RGBA')
    w, h = b_img.size
    mask = Image.new('L', (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    cx, cy = w // 2, h // 2
    rad = int(w * 0.435)
    m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    
    ball_out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ball_out.paste(b_img, (0, 0), mask)
    bbox = ball_out.getbbox()
    if bbox:
        ball_out = ball_out.crop(bbox)
    ball_out.save('fetch_ball.png', 'PNG')
    print(f"Successfully generated transparent fetch_ball.png (size: {ball_out.size})")

if __name__ == '__main__':
    process_all()
