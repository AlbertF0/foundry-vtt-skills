"""Extrae la imagen incrustada y metadatos de un .dd2vtt/.uvtt/.df2vtt.

Uso: python extract_uvtt.py <ruta.dd2vtt>
Guarda la imagen como <mismo_nombre>.webp junto al archivo e imprime metadatos JSON.
"""
import sys, os, json, base64, io

def main(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    res = data.get("resolution", {})
    img_b64 = data.get("image")
    out_img = os.path.splitext(path)[0] + ".webp"
    img_w = img_h = None
    if img_b64:
        raw = base64.b64decode(img_b64)
        try:
            from PIL import Image
            im = Image.open(io.BytesIO(raw)).convert("RGBA")
            img_w, img_h = im.size
            im.save(out_img, "WEBP", quality=90)
        except Exception:
            # fallback: write raw bytes as .png
            out_img = os.path.splitext(path)[0] + ".png"
            with open(out_img, "wb") as g:
                g.write(raw)
    info = {
        "image": out_img,
        "image_size": [img_w, img_h],
        "pixels_per_grid": res.get("pixels_per_grid"),
        "map_size": res.get("map_size"),
        "walls_polylines": len(data.get("line_of_sight", [])) + len(data.get("objects_line_of_sight", [])),
        "portals": len(data.get("portals", [])),
        "lights": len(data.get("lights", [])),
    }
    print(json.dumps(info, ensure_ascii=False))

if __name__ == "__main__":
    main(sys.argv[1])
