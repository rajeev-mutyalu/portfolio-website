import os
import rembg
from PIL import Image, ImageDraw

def process_dog_assets():
    print("Processing turnaround images with rembg AI cutout...")
    
    # 1. Process Idle / Standing Donut (from 45 deg front-left)
    if os.path.exists('raw_front_left.png'):
        img = Image.open('raw_front_left.png')
        out = rembg.remove(img)
        # Crop tight around dog
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save('donut_real_idle.png')
        print("Saved donut_real_idle.png")

    # 2. Process Running / Profile Donut
    if os.path.exists('raw_left_profile.png'):
        img = Image.open('raw_left_profile.png')
        out = rembg.remove(img)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save('donut_real_run1.png')
        print("Saved donut_real_run1.png")

    if os.path.exists('raw_right_profile.png'):
        img = Image.open('raw_right_profile.png')
        out = rembg.remove(img)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        # Flip to match left-facing
        out_flipped = out.transpose(Image.FLIP_LEFT_RIGHT)
        out_flipped.save('donut_real_run2.png')
        print("Saved donut_real_run2.png")

    # 3. Create Fetch Ball (Clean high-res duo-tone blue/orange ball with true transparency)
    ball_size = 120
    ball = Image.new('RGBA', (ball_size, ball_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ball)
    
    # Draw circular clipping
    # Left hemisphere: Electric Sky Blue (#00b4d8 / #38bdf8)
    # Right hemisphere: Vibrant Orange (#fb923c / #f97316)
    # Plus glossy highlight and subtle paw print
    # Let's draw glossy spheres
    for r in range(ball_size // 2, 0, -1):
        pass

    # Better: If we have the ball image from artifact, let's rembg it!
    ball_src_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'
    if os.path.exists(ball_src_path):
        b_img = Image.open(ball_src_path)
        # Cutout pure circle without checkerboard
        # The ball is a circle in the center
        w, h = b_img.size
        # Create mask
        mask = Image.new('L', (w, h), 0)
        m_draw = ImageDraw.Draw(mask)
        # Inset slightly inside the sticker border (radius ~ 42% of width)
        cx, cy = w // 2, h // 2
        rad = int(w * 0.435)
        m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
        
        ball_clean = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ball_clean.paste(b_img.convert('RGBA'), (0, 0), mask)
        bbox = ball_clean.getbbox()
        if bbox:
            ball_clean = ball_clean.crop(bbox)
        ball_clean.save('fetch_ball_clean.png')
        ball_clean.save('fetch_ball.png')
        print("Saved clean fetch_ball.png with true alpha transparency")

    # 4. Create Catch Sprite: Donut holding fetch ball in his mouth
    if os.path.exists('donut_real_idle.png') and os.path.exists('fetch_ball.png'):
        dog_img = Image.open('donut_real_idle.png')
        b_img = Image.open('fetch_ball.png')
        
        # Scale ball to realistic size relative to dog's snout
        dw, dh = dog_img.size
        bw = int(dw * 0.22)
        b_scaled = b_img.resize((bw, bw), Image.Resampling.LANCZOS)
        
        # Donut's snout position in raw_front_left is around head area (x: ~58%, y: ~22%)
        dog_catch = dog_img.copy()
        # Paste ball near mouth
        mouth_x = int(dw * 0.52)
        mouth_y = int(dh * 0.19)
        dog_catch.paste(b_scaled, (mouth_x, mouth_y), b_scaled)
        dog_catch.save('donut_real_catch.png')
        print("Saved donut_real_catch.png")

if __name__ == '__main__':
    process_dog_assets()
