#!/usr/bin/env python3
"""
Teams App Icon Transparency Fixer
Converts solid color icons to proper transparent outline icons for Teams
"""

from PIL import Image, ImageDraw
import os

def create_transparent_outline_icon():
    """Create a 32x32 transparent outline icon for Teams"""
    
    # Create transparent image
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Teams outline color - should be white/light for outline
    outline_color = (255, 255, 255, 255)  # White with full opacity
    
    # Draw RewardStation "R" outline - simple design
    # Outer rectangle outline
    draw.rectangle([4, 4, 28, 28], outline=outline_color, width=2, fill=None)
    
    # R shape - vertical line
    draw.rectangle([8, 8, 10, 24], fill=outline_color)
    
    # R shape - top horizontal
    draw.rectangle([8, 8, 18, 10], fill=outline_color)
    
    # R shape - middle horizontal  
    draw.rectangle([8, 15, 16, 17], fill=outline_color)
    
    # R shape - diagonal leg
    draw.line([(12, 17), (18, 24)], fill=outline_color, width=2)
    
    return img

def create_color_icon():
    """Create a 192x192 color icon for Teams"""
    
    # Create colored background
    img = Image.new('RGBA', (192, 192), (81, 43, 212, 255))  # Purple background
    draw = ImageDraw.Draw(img)
    
    # White "R" for contrast
    white = (255, 255, 255, 255)
    
    # Scale up the R design for 192x192
    # Outer border (optional)
    draw.rectangle([16, 16, 176, 176], outline=white, width=4)
    
    # R shape - vertical line (scaled 6x)
    draw.rectangle([48, 48, 60, 144], fill=white)
    
    # R shape - top horizontal (scaled 6x)
    draw.rectangle([48, 48, 108, 60], fill=white)
    
    # R shape - middle horizontal (scaled 6x)
    draw.rectangle([48, 90, 96, 102], fill=white)
    
    # R shape - diagonal leg (scaled 6x)
    draw.line([(72, 102), (108, 144)], fill=white, width=12)
    
    return img

def main():
    print("🎨 Fixing Teams App Icons")
    print("========================")
    
    # Create output directory
    icon_dir = "/Users/chrisw/xceleration/project-collab/teams-app"
    os.makedirs(icon_dir, exist_ok=True)
    
    # Create transparent outline icon (32x32)
    print("📝 Creating transparent outline icon (32x32)...")
    outline_icon = create_transparent_outline_icon()
    outline_path = os.path.join(icon_dir, "icon-outline-32.png")
    outline_icon.save(outline_path, "PNG")
    print(f"✅ Saved: {outline_path}")
    
    # Update color icon (192x192) - make sure it's proper
    print("🎨 Creating color icon (192x192)...")
    color_icon = create_color_icon()
    color_path = os.path.join(icon_dir, "icon-color-192.png")
    color_icon.save(color_path, "PNG")
    print(f"✅ Saved: {color_path}")
    
    # Verify transparency
    print("\n🔍 Verifying icon properties...")
    
    # Check outline icon
    outline_check = Image.open(outline_path)
    if outline_check.mode == 'RGBA':
        print("✅ Outline icon has alpha channel (transparency)")
        # Check if it actually uses transparency
        extrema = outline_check.getextrema()
        if len(extrema) == 4 and extrema[3][0] < 255:  # Alpha channel has values < 255
            print("✅ Outline icon uses transparency correctly")
        else:
            print("⚠️  Outline icon may not use transparency effectively")
    else:
        print("❌ Outline icon missing alpha channel")
    
    # Check color icon
    color_check = Image.open(color_path)
    print(f"✅ Color icon: {color_check.size[0]}x{color_check.size[1]} pixels")
    
    print("\n🎉 Icons fixed! Ready for Teams package creation.")
    return True

if __name__ == "__main__":
    try:
        main()
    except ImportError as e:
        print("❌ Missing PIL/Pillow library")
        print("💡 Install with: pip install Pillow")
        print(f"   Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")