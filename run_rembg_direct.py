import sys, os
sys.path.append(r'C:\Users\rajee\AppData\Roaming\Python\Python314\site-packages')
import rembg
from PIL import Image

def run_rembg():
    print("Starting rembg on raw turnaround crops...")
    
    # Process Idle
    if os.path.exists('raw_front_left.png'):
        img = Image.open('raw_front_left.png')
        out = rembg.remove(img)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save('donut_real_turnaround_idle.png')
        print("Saved donut_real_turnaround_idle.png")

    # Process Run 1
    if os.path.exists('raw_left_profile.png'):
        img = Image.open('raw_left_profile.png')
        out = rembg.remove(img)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save('donut_real_turnaround_run.png')
        print("Saved donut_real_turnaround_run.png")

    # Process Front
    if os.path.exists('raw_front.png'):
        img = Image.open('raw_front.png')
        out = rembg.remove(img)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save('donut_real_turnaround_front.png')
        print("Saved donut_real_turnaround_front.png")

if __name__ == '__main__':
    run_rembg()
