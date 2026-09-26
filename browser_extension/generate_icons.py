import os
from PIL import Image, ImageDraw

os.makedirs("browser_extension/icons", exist_ok=True)

def create_shield_icon(size):
    # Create image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shield shape points relative to size
    # Draw a stylized shield
    margin = max(1, size // 10)
    top_y = margin
    mid_y = size // 3
    bottom_y = size - margin
    left_x = margin
    right_x = size - margin
    center_x = size // 2

    # Draw Shield Outer
    shield_pts = [
        (center_x, top_y),
        (right_x, top_y + size // 15),
        (right_x, mid_y),
        (center_x, bottom_y),
        (left_x, mid_y),
        (left_x, top_y + size // 15),
        (center_x, top_y)
    ]
    # Blue/Cyan Gradient Color fill
    draw.polygon(shield_pts, fill=(11, 15, 25), outline=(6, 182, 214), width=max(1, size // 16))
    
    # Draw Inner Checkmark or Shield core
    if size >= 48:
        # Draw a checkmark inside shield for safe appearance
        check_pts = [
            (center_x - size // 8, center_x),
            (center_x - size // 24, center_x + size // 10),
            (center_x + size // 6, center_x - size // 8)
        ]
        draw.line(check_pts, fill=(16, 185, 129), width=max(2, size // 16), joint="round")
    
    # Save Image
    img.save(f"browser_extension/icons/icon{size}.png")
    print(f"Generated icon{size}.png")

if __name__ == "__main__":
    create_shield_icon(16)
    create_shield_icon(48)
    create_shield_icon(128)
