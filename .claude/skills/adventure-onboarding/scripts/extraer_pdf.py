"""Extrae el texto completo de un PDF de campaña, página a página.

Uso: python extraer_pdf.py <ruta_al_pdf> [ruta_salida.txt]
Si no se da ruta de salida, imprime por stdout.
"""
import sys
import io

def extraer(ruta):
    try:
        import pdfplumber
        partes = []
        with pdfplumber.open(ruta) as pdf:
            for i, p in enumerate(pdf.pages):
                partes.append(f"--- PAGINA {i+1} ---\n{p.extract_text() or ''}")
        return "\n".join(partes)
    except ImportError:
        from pypdf import PdfReader
        reader = PdfReader(ruta)
        return "\n".join(
            f"--- PAGINA {i+1} ---\n{p.extract_text() or ''}"
            for i, p in enumerate(reader.pages)
        )

if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    texto = extraer(sys.argv[1])
    if len(sys.argv) > 2:
        with open(sys.argv[2], "w", encoding="utf-8") as f:
            f.write(texto)
        print(f"Texto guardado en {sys.argv[2]} ({len(texto)} caracteres)")
    else:
        print(texto)
