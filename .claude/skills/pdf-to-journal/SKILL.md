---
name: pdf-to-journal
description: Convierte el PDF de una aventura (o su texto ya extraído) en un journal de Foundry VTT con una página por área/capítulo, en castellano, con HTML limpio listo para usar a la mesa. Incluye texto de lectura en voz alta en blockquote, secciones con títulos enlazables (H2/H3), datos mecánicos (PNJs, encuentros con CR/HP/AC, trampas con DC, tesoros). Por defecto genera un único journal. Usar cuando el usuario diga "convierte el PDF a journal", "haz el journal de la aventura", "pasa el PDF a Foundry como journal", "crea el journal del DM", "quiero la aventura en Foundry como journal" o cualquier variante de querer el contenido del PDF organizado como páginas de journal en Foundry.
---

# PDF → Journal de Foundry

Convierte una aventura en PDF en un journal de Foundry VTT navegable, con una página por área, en castellano y con HTML que Foundry renderiza correctamente.

## Entradas

- **PDF o texto ya extraído**: ruta al `.pdf` o al `assets/texto_extraido.txt` del mundo.
- **Carpeta del mundo**: se deduce del path del PDF si está dentro del mundo; si no, pregunta.
- **Nombre del journal** (opcional): por defecto `Guía del DM — <Título de la aventura>`.
- **Un journal o varios**: por defecto un solo journal. Si el usuario especifica "uno por capítulo" o similar, crea varios.

## Paso 1 — Obtener el texto

Comprueba si ya existe `assets/texto_extraido.txt` en la carpeta del mundo (lo genera `adventure-onboarding`). Si existe, úsalo directamente. Si no:

```python
import pdfplumber, os
out = []
with pdfplumber.open(r"<ruta.pdf>") as pdf:
    for i, page in enumerate(pdf.pages):
        t = page.extract_text()
        if t:
            out.append(f"--- PAGE {i+1} ---\n{t}")
os.makedirs("assets", exist_ok=True)
with open(r"assets\texto_extraido.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
```

## Paso 2 — Analizar estructura y generar HTML (subagente)

El texto puede ser largo. **Delega la lectura y generación a un subagente** (`sonnet`) para ahorrar contexto. El subagente debe devolver un array JSON de páginas, no el texto completo.

### Instrucciones para el subagente

Lee `assets/texto_extraido.txt`. Identifica todas las **áreas, salas o capítulos** de la aventura. Para cada uno genera un objeto `{name, content}` donde `content` es HTML en castellano listo para Foundry.

#### Reglas de identificación de áreas

- Detecta los bloques numerados o titulados: `Area 1`, `Room 3`, `Chapter II`, encabezados en mayúsculas, líneas como `--- PAGE X ---` seguidas de un encabezado.
- Si la aventura no tiene áreas formales (one-shot de una sola localización), usa secciones narrativas como páginas.
- Crea **una página** por área/sala/capítulo.
- Añade siempre una **primera página** de introducción/sinopsis y una **última página** de apéndices/notas si el texto los tiene.

#### Estructura HTML de cada página

Sigue este esquema en orden. Omite secciones que no apliquen al área.

```html
<h1>Área X — Nombre del Área</h1>
<p><em>Conexiones: norte → Área 2, sur → Área 5.</em></p>

<h2>🔊 Texto de lectura en voz alta</h2>
<blockquote>
  <p>El texto que el DM lee a los jugadores, tal cual.</p>
</blockquote>

<h2>📋 Descripción (notas del DM)</h2>
<p>Descripción detallada del área para el DM: iluminación, olores, pistas ocultas, mecánicas especiales.</p>

<h2>👥 PNJs presentes</h2>
<h3>Nombre del PNJ</h3>
<p><strong>Rol:</strong> descripción del rol narrativo.</p>
<p><strong>Actitud inicial:</strong> hostil / neutral / amistoso.</p>
<p>Información clave que puede dar el PNJ, condiciones de negociación, etc.</p>

<h2>⚔️ Encuentros</h2>
<h3>Nombre de la Criatura (×N)</h3>
<p><strong>CR:</strong> X | <strong>CA:</strong> X | <strong>HP:</strong> XX | <strong>Velocidad:</strong> X ft.</p>
<p><strong>Ataques:</strong> descripción breve de ataques principales.</p>
<p><strong>Tácticas:</strong> cómo combate esta criatura en este contexto.</p>
<p><strong>Fuente:</strong> Monster Manual p.XXX / Homebrew PDF p.XX.</p>

<h2>⚠️ Trampas y Peligros</h2>
<h3>Nombre de la Trampa</h3>
<p><strong>Detección:</strong> Percepción CD XX o Investigación CD XX.</p>
<p><strong>Desactivar:</strong> Herramientas de Ladrón CD XX / descripción de la solución.</p>
<p><strong>Efecto:</strong> descripción del daño o consecuencia.</p>

<h2>💰 Tesoro</h2>
<ul>
  <li>Objeto mágico: <strong>Nombre</strong> — descripción mecánica breve.</li>
  <li>Monedas: XXX po, XXX pp.</li>
  <li>Objeto mundano: descripción y valor si se indica.</li>
</ul>

<h2>🗒️ Notas del DM</h2>
<p>Información adicional: vínculos con otras áreas, variantes, secretos, consecuencias narrativas.</p>
```

#### Reglas de estilo obligatorias

- **Todo en castellano.** Si el texto fuente está en inglés, traduce con naturalidad. Los nombres de hechizos y objetos pueden mantenerse en inglés si tienen nombre canónico conocido, pero con la descripción en castellano.
- Los **emojis de sección** (🔊 📋 👥 ⚔️ ⚠️ 💰 🗒️) son marcadores visuales en Foundry — úsalos.
- Los `<h2>` y `<h3>` son **anchors enlazables** en Foundry. Ponles nombres claros y consistentes.
- Usa `<blockquote>` solo para texto de lectura en voz alta (Foundry lo renderiza como caja dorada).
- Datos mecánicos clave (CD, CR, HP, AC) siempre en `<strong>`.
- No uses `<style>`, `<script>`, ni atributos `class`/`id` en el HTML.
- Si una sección no tiene contenido (p.ej. no hay trampa en esa área), omítela completamente.
- Mantén el HTML limpio: sin líneas en blanco dentro de las etiquetas, sin indentaciones excesivas.

#### Output del subagente

Devuelve **solo** el array JSON, sin texto adicional:

```json
[
  {"name": "Introducción", "content": "<h1>...</h1>..."},
  {"name": "Área 1 — The Pile", "content": "<h1>...</h1>..."},
  ...
]
```

Límite práctico: si el contenido de una página supera ~8.000 caracteres HTML, divídela en dos páginas (`Área 7A — Artificiary: Entrada`, `Área 7B — Artificiary: Laboratorio`).

## Paso 3 — Crear el journal en Foundry

Usa `create-journal` (carga su schema con ToolSearch si hace falta).

- `name`: `Guía del DM — <Título>` (o el nombre que indique el usuario).
- `folderName`: nombre de la carpeta de la campaña en Foundry (la misma que usan los otros journals de la aventura).
- `pages`: el array generado por el subagente.

Si el array supera ~50 páginas o el MCP devuelve error de tamaño, divide en dos journals: `Guía del DM — <Título> (Parte 1)` y `(Parte 2)`.

## Paso 4 — Informe final

Muestra al usuario:
- Nombre del journal creado en Foundry.
- Número de páginas generadas.
- Lista de áreas/páginas con sus títulos.
- Si alguna página se dividió por tamaño, indícalo.

Recuerda al usuario: *"Los `<h2>` y `<h3>` de cada página son anchors enlazables en Foundry — puedes referenciarlos con `@UUID[JournalEntry.xxx.JournalEntryPage.yyy#nombre-del-h2]{Texto}`."*

## Notas

- Si el texto extraído es muy largo (>100 KB), divide el subagente en dos llamadas: primera mitad de áreas y segunda mitad.
- Si Foundry no está accesible por MCP, avisa y guarda el JSON de páginas en `assets/journal_paginas.json` para crearlo manualmente cuando se abra Foundry.
- Esta skill es complementaria a `adventure-onboarding`: el onboarding crea la estructura de recursos; esta skill crea el contenido narrativo para la mesa.
