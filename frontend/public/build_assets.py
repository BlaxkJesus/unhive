import os
import subprocess
from PIL import Image

output_dir = r"C:\Users\ONU\.gemini\antigravity\scratch\unihive-logo"
os.makedirs(output_dir, exist_ok=True)

# 1. Standalone UH Monogram SVG (Square viewbox, centered)
uh_mark_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100%" height="100%" fill="#000000">
  <!-- UniHive UH Interlocking Monogram - Standalone Initials Mark -->
  <g transform="translate(3, 22)">
    <path d="M 16 16 L 30 16 L 30 56 C 30 63 35 68 45 68 C 55 68 60 63 60 56 L 60 16 L 74 16 L 74 44 L 104 44 L 104 16 L 118 16 L 118 80 L 104 80 L 104 56 L 74 56 C 74 70 61 82 45 82 C 29 82 16 70 16 56 Z" />
  </g>
</svg>'''

# 2. Full UniHive Logo SVG (Horizontal lockup with typography)
full_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 100" width="100%" height="100%" fill="#000000">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&amp;display=swap');
      .brand-title {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 46px;
        font-weight: 700;
        letter-spacing: -1.2px;
        fill: #000000;
      }
    </style>
  </defs>
  <!-- UniHive UH Interlocking Mark -->
  <g id="monogram" transform="translate(6, 2)">
    <path d="M 16 16 L 30 16 L 30 56 C 30 63 35 68 45 68 C 55 68 60 63 60 56 L 60 16 L 74 16 L 74 44 L 104 44 L 104 16 L 118 16 L 118 80 L 104 80 L 104 56 L 74 56 C 74 70 61 82 45 82 C 29 82 16 70 16 56 Z" />
  </g>
  <!-- Brand Wordmark -->
  <text x="156" y="66" class="brand-title">UniHive</text>
</svg>'''

# Also create dark/white variations for dark backgrounds
uh_mark_white_svg = uh_mark_svg.replace('#000000', '#ffffff')
full_logo_white_svg = full_logo_svg.replace('#000000', '#ffffff')

# Write SVGs
files = {
    "unihive-mark-uh.svg": uh_mark_svg,
    "unihive-logo-concept1.svg": full_logo_svg,
    "unihive-mark-uh-white.svg": uh_mark_white_svg,
    "unihive-logo-concept1-white.svg": full_logo_white_svg,
}

for filename, content in files.items():
    path = os.path.join(output_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Saved: {path}")

# Now render PNGs using Chrome Headless with high resolution
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def render_html_to_png(svg_content, out_png_path, width=2000, height=600, pad=40):
    html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap');
  html, body {{
    margin: 0;
    padding: 0;
    background: transparent !important;
    width: {width}px;
    height: {height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }}
  svg {{
    width: {width - pad*2}px;
    height: {height - pad*2}px;
  }}
</style>
</head>
<body>
{svg_content}
</body>
</html>'''
    temp_html = os.path.join(output_dir, "_temp_render.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html)
    
    temp_png = os.path.join(output_dir, "_temp_shot.png")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--default-background-color=00000000",
        f"--window-size={width},{height}",
        f"--screenshot={temp_png}",
        temp_html
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    # Crop to content with padding
    if os.path.exists(temp_png):
        img = Image.open(temp_png)
        bbox = img.getbbox()
        if bbox:
            # Add breathing margin
            m = 30
            crop_box = (
                max(0, bbox[0] - m),
                max(0, bbox[1] - m),
                min(img.width, bbox[2] + m),
                min(img.height, bbox[3] + m)
            )
            cropped = img.crop(crop_box)
            cropped.save(out_png_path, "PNG")
            print(f"Rendered PNG: {out_png_path} ({cropped.size[0]}x{cropped.size[1]})")
        else:
            img.save(out_png_path, "PNG")
        
        # Cleanup temp
        if os.path.exists(temp_png):
            os.remove(temp_png)
    if os.path.exists(temp_html):
        os.remove(temp_html)

# Render Full Logo PNG (High-Res 2400 x 650)
render_html_to_png(full_logo_svg, os.path.join(output_dir, "unihive-logo-concept1.png"), width=2400, height=650)

# Render Full Logo White PNG (for dark themes)
render_html_to_png(full_logo_white_svg, os.path.join(output_dir, "unihive-logo-concept1-white.png"), width=2400, height=650)

# Render Initials Mark UH PNG (Square 1200 x 1200)
render_html_to_png(uh_mark_svg, os.path.join(output_dir, "unihive-mark-uh.png"), width=1200, height=1200, pad=100)

# Render Initials Mark UH White PNG (Square 1200 x 1200)
render_html_to_png(uh_mark_white_svg, os.path.join(output_dir, "unihive-mark-uh-white.png"), width=1200, height=1200, pad=100)

print("All asset builds completed successfully!")
