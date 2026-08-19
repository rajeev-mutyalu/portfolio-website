import os, sys
from PIL import Image

def finalize():
    # 1. Idle Sprite (Front-Left 45 View)
    idle = Image.open('donut_real_turnaround_idle.png').convert('RGBA')
    idle.save('donut_idle.png', 'PNG')
    print("Saved donut_idle.png")

    # 2. Run Sprite (Alert Front / Trot View)
    front = Image.open('donut_real_turnaround_front.png').convert('RGBA')
    front.save('donut_run.png', 'PNG')
    print("Saved donut_run.png")

    # 3. Clean Ball
    ball = Image.open('fetch_ball.png').convert('RGBA')

    # 4. Catch Sprite (Real Donut holding ball in mouth)
    catch = idle.copy()
    cw, ch = catch.size
    
    # Scale ball to realistic mouth proportion (~17% of dog width)
    bw = int(cw * 0.17)
    b_scaled = ball.resize((bw, bw), Image.Resampling.LANCZOS)
    
    # Position ball at Donut's snout (around x: 80%, y: 31%)
    mouth_x = int(cw * 0.79)
    mouth_y = int(ch * 0.30)
    catch.paste(b_scaled, (mouth_x, mouth_y), b_scaled)
    catch.save('donut_catch.png', 'PNG')
    print("Saved donut_catch.png")

if __name__ == '__main__':
    finalize()
