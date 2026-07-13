 from PIL import Image, ImageDraw, ImageFilter
 import os, math
 
 OUT = os.path.dirname(os.path.abspath(__file__))
 
 def icon(size, name):
     img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
     draw = ImageDraw.Draw(img)
     cx = cy = size // 2
     r = size // 2 - 2
     bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
     bd = ImageDraw.Draw(bg)
     for i in range(r, 0, -1):
         t = 1 - i / r
         c = (int(123 + 32*t), int(47 + 42*t), int(190 + 24*t), 255)
         bd.ellipse([cx-i, cy-i, cx+i, cy+i], fill=c)
     mask = Image.new('L', (size, size), 0)
     ImageDraw.Draw(mask).ellipse([2, 2, size-3, size-3], fill=255)
     bg = Image.composite(bg, Image.new('RGBA', (size, size)), mask)
     pts, s = [], size
     for i in range(60):
         a = 2 * math.pi * i / 60
         rx, ry = s*0.22, s*0.30
         dx, dy = math.cos(a)*rx, math.sin(a)*ry
         yf = 1 + 0.6*(-dy/ry) if dy < 0 else 1 - 0.1*(dy/ry)
         if dy < 0: dx *= 1 - 0.3*(-dy/ry)
         pts.append((cx+dx*yf, cy+dy*yf - s*0.02))
     if pts: draw.polygon(pts, fill=(255,255,255,240))
     draw.ellipse([cx-s*0.06-s*0.06, cy-s*0.06-s*0.06, cx-s*0.06+s*0.06, cy-s*0.06+s*0.06], fill=(255,255,255,50))
     result = Image.alpha_composite(bg, img).filter(ImageFilter.SMOOTH)
     result.save(os.path.join(OUT, name), 'PNG')
     print(f"  {name} ({size}x{size})")
 
 if __name__ == '__main__':
     print("生成图标...")
     for sz, nm in [(48,'icon.png'),(72,'icon-hdpi.png'),(96,'icon-xhdpi.png'),(144,'icon-xxhdpi.png'),(192,'icon-xxxhdpi.png'),(480,'splash.png')]:
         icon(sz, nm)
     print("完成!")
