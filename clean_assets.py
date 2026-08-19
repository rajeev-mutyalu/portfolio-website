import os
from PIL import Image, ImageDraw, ImageFilter

def perfect_ball_cutout():
    ball_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'
    b_img = Image.open(ball_path).convert('RGBA')
    w, h = b_img.size
    
    # The actual sphere (excluding white sticker border and outside checkerboard)
    cx, cy = w // 2, h // 2
    # Radius of inner colored ball sphere (tighter to remove white outer rim)
    rad = int(w * 0.358)
    
    mask = Image.new('L', (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    
    ball_clean = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ball_clean.paste(b_img, (0, 0), mask)
    
    # Crop to circle
    ball_clean = ball_clean.crop((cx - rad, cy - rad, cx + rad, cy + rad))
    ball_clean.save('fetch_ball.png', 'PNG')
    print(f"Generated 100% clean circular fetch_ball.png: {ball_clean.size}")

def clean_dog_mattes():
    for fname in ['donut_idle.png', 'donut_run.png', 'donut_catch.png']:
        img = Image.open(fname).convert('RGBA')
        w, h = img.size
        pix = img.load()
        
        for y in range(h):
            for x in range(w):
                r, g, b, a = pix[x, y]
                if a > 0:
                    # Clean any dark/purple underbelly shadow
                    if (r < 100 and g < 100 and b < 100 and a < 230) or (r > 130 and b > 130 and g < 90):
                        pix[x, y] = (0, 0, 0, 0)
                    # Despill pink
                    elif r > g + 15 and b > g + 15:
                        pix[x, y] = (min(r, g + 8), g, min(b, g + 8), a)
                        
        # Crop tight
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        img.save(fname, 'PNG')
        print(f"Cleaned {fname}: {img.size}")

if __name__ == '__main__':
    perfect_ball_cutout()
    clean_dog_mattes()
