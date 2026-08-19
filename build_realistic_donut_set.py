import sys, os
sys.path.append(r'C:\Users\rajee\AppData\Roaming\Python\Python314\site-packages')
import rembg
from PIL import Image, ImageDraw, ImageFilter

def build_all():
    print("Building full realistic Donut sprite library from turnaround...")
    src = Image.open('docs/Donut_dog_character_turnaround.jpeg').convert('RGB')
    W, H = src.size
    cell_w = W // 4
    cell_h = H // 2

    # View bounding boxes (excluding bottom labels)
    views = {
        'donut_idle': (cell_w, 0, cell_w * 2, cell_h - 95),       # View 2: Front-Left 45
        'donut_run1': (cell_w * 2, 0, cell_w * 3, cell_h - 95),   # View 3: Left Profile
        'donut_run2': (cell_w * 2, cell_h, cell_w * 3, cell_h * 2 - 95), # View 7: Right Profile
        'donut_front': (0, 0, cell_w, cell_h - 95),               # View 1: Front View
        'donut_trot': (cell_w * 3, cell_h, cell_w * 4, cell_h * 2 - 95)  # View 8: Front-Right 45
    }

    processed = {}
    for name, bbox in views.items():
        cropped = src.crop(bbox)
        # Apply rembg AI background removal
        cutout = rembg.remove(cropped)
        # Crop tight
        c_bbox = cutout.getbbox()
        if c_bbox:
            cutout = cutout.crop(c_bbox)
        processed[name] = cutout
        cutout.save(f'{name}.png')
        print(f"Generated {name}.png ({cutout.size})")

    # 1. Clean Fetch Ball
    ball_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'
    b_img = Image.open(ball_path).convert('RGBA')
    bw, bh = b_img.size
    mask = Image.new('L', (bw, bh), 0)
    m_draw = ImageDraw.Draw(mask)
    cx, cy = bw // 2, bh // 2
    # Radius of inner colored ball
    rad = int(bw * 0.356)
    m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    
    ball_clean = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    ball_clean.paste(b_img, (0, 0), mask)
    ball_clean = ball_clean.crop((cx - rad, cy - rad, cx + rad, cy + rad))
    ball_clean.save('fetch_ball.png', 'PNG')
    print("Generated clean fetch_ball.png")

    # 2. Donut Catch Sprite (Donut holding the clean fetch ball in mouth)
    dog_idle = processed['donut_idle'].copy()
    dw, dh = dog_idle.size
    
    # Scale ball to realistic size relative to Donut's snout (~16% of dog width)
    ball_size = int(dw * 0.165)
    b_thumb = ball_clean.resize((ball_size, ball_size), Image.Resampling.LANCZOS)
    
    # Snout coordinates on Donut's V-shaped muzzle in front-left view (x ~ 80%, y ~ 33%)
    mouth_x = int(dw * 0.81)
    mouth_y = int(dh * 0.31)
    
    dog_catch = dog_idle.copy()
    # Paste ball at mouth
    dog_catch.paste(b_thumb, (mouth_x, mouth_y), b_thumb)
    dog_catch.save('donut_catch.png', 'PNG')
    print("Generated donut_catch.png with ball in mouth")

if __name__ == '__main__':
    build_all()
