"""Extrae la imagen incrustada y los metadatos de un mapa Universal VTT.

Acepta .dd2vtt / .uvtt / .df2vtt (JSON con la imagen en base64 + line_of_sight,
portals, lights, resolution).

Uso: python extract_uvtt.py <ruta.dd2vtt> [ruta_salida_imagen]

- Guarda la imagen como <mismo_nombre>.webp junto al archivo (o en la ruta dada).
- Imprime por stdout un JSON con: image (ruta), image_size, pixels_per_grid,
  map_size, y conteos de walls/portals/lights.

La ruta de imagen impresa es absoluta; conviértela a ruta relativa a la carpeta
Data de Foundry antes de pasarla a create-scene.
"""
import sys, os, json, base64, io


def main(path, out_img=None):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    res = data.get("resolution", {})
    img_b64 = data.get("image")
    if out_img is None:
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
            out_img = os.path.splitext(out_img)[0] + ".png"
            with open(out_img, "wb") as g:
                g.write(raw)
    info = {
        "image": out_img,
        "image_size": [img_w, img_h],
        "pixels_per_grid": res.get("pixels_per_grid"),
        "map_size": res.get("map_size"),
        "walls_polylines": len(data.get("line_of_sight", []))
        + len(data.get("objects_line_of_sight", [])),
        "portals": len(data.get("portals", [])),
        "lights": len(data.get("lights", [])),
        "transparent_blueprint": (img_w is not None and img_b64 is not None),
    }
    print(json.dumps(info, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
