from PIL import Image, ImageDraw, ImageFilter
import math

def process_with_pillow():
    print("Processing turnaround with Pillow flood cutout...")
    
    src = Image.open('docs/Donut_dog_character_turnaround.jpeg').convert('RGB')
    W, H = src.size
    cell_w = W // 4
    cell_h = H // 2

    views = {
        'donut_idle.png': (cell_w, 0, cell_w * 2, cell_h - 95),  # Front-Left 45 (view 2)
        'donut_run1.png': (cell_w * 2, 0, cell_w * 3, cell_h - 95), # Left profile (view 3)
        'donut_run2.png': (cell_w * 2, cell_h, cell_w * 3, cell_h * 2 - 95), # Right profile (view 7)
    }

    for filename, bbox in views.items():
        cell = src.crop(bbox)
        cw, ch = cell.size
        
        # Sample background colors around the 4 corners
        # Flood fill from boundaries
        mask = Image.new('L', (cw, ch), 255) # 255 = dog (foreground), 0 = background
        
        # Floodfill from (0,0), (cw-1,0), (0, ch-1), (cw-1, ch-1), top border, etc.
        # Find pixels that are near-neutral light gray
        # Background pixels satisfy: R > 220 and G > 220 and B > 220 and max(R,G,B) - min(R,G,B) < 15
        # Also shadow under paws: R ~ 180-210, neutral
        pixels = cell.load()
        mask_pix = mask.load()

        # Let's perform breadth-first search / flood fill starting from all border pixels
        visited = set()
        queue = []
        for x in range(cw):
            queue.append((x, 0))
            queue.append((x, ch - 1))
        for y in range(ch):
            queue.append((0, y))
            queue.append((cw - 1, y))

        for pt in queue:
            visited.add(pt)

        while queue:
            x, y = queue.pop(0)
            r, g, b = pixels[x, y]
            
            # Check if this pixel is background (near white / light gray or floor shadow)
            # The dog has tan patches (R > B + 30) or white body (enclosed inside dog outline)
            # Studio backdrop is very light neutral gray: R >= 215, G >= 215, B >= 215 and |R-G| <= 12 and |R-B| <= 12
            is_bg = (r >= 210 and g >= 210 and b >= 210 and abs(r - g) <= 18 and abs(r - b) <= 18) or \
                    (y > ch * 0.78 and r >= 170 and g >= 170 and b >= 170 and abs(r - g) <= 15 and abs(r - b) <= 15) # floor shadow

            if is_bg:
                mask_pix[x, y] = 0 # background
                # Check 4 neighbors
                for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    if 0 <= nx < cw and 0 <= ny < ch and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

        # Smooth mask slightly with GaussianBlur
        mask_smooth = mask.filter(ImageFilter.GaussianBlur(1.0))
        
        # Create transparent RGBA image
        out = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        out.paste(cell, (0, 0), mask_smooth)
        
        # Crop to tight bounding box
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
            
        out.save(filename)
        print(f"Saved {filename} with clean cutout")

    # Clean Fetch Ball cutout (from pure circle mask)
    ball_src_path = r'C:\Users\rajee\.gemini\antigravity-ide\brain\e16d0395-e727-4f22-9ced-1a5d1ded0225\fetch_ball_sprite_1787157344710.jpg'
    b_img = Image.open(ball_src_path)
    w, h = b_img.size
    mask = Image.new('L', (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    cx, cy = w // 2, h // 2
    rad = int(w * 0.432)
    m_draw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))

    ball_clean = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ball_clean.paste(b_img.convert('RGBA'), (0, 0), mask)
    bbox = ball_clean.getbbox()
    if bbox:
        ball_clean = ball_clean.crop(bbox)
    ball_clean.save('fetch_ball.png')
    print("Saved clean fetch_ball.png")

    # Create Donut Catch Sprite with ball in mouth
    dog_idle = Image.open('donut_idle.png')
    ball_clean = Image.open('fetch_ball.png')
    dw, dh = dog_idle.size
    # Realistically scaled ball for dog snout
    bw = int(dw * 0.20)
    b_scaled = ball_clean.resize((bw, bw), Image.Resampling.LANCZOS)
    
    dog_catch = dog_idle.copy()
    # Snout coordinates in front-left 45 view
    mouth_x = int(dw * 0.58)
    mouth_y = int(dh * 0.19)
    dog_catch.paste(b_scaled, (mouth_x, mouth_y), b_scaled)
    dog_catch.save('donut_catch.png')
    print("Saved clean donut_catch.png")

process_with_pillow()
