---
name: describe-objects
description: Genera descripciones visuales detalladas en castellano para los objetos mágicos y relevantes de la aventura, listas para usar como prompt en una IA de generación de imágenes. Cada descripción usa fondo plano, objeto centrado y formato cuadrado (para iconos de Foundry). Si ya existe arte custom en la carpeta de objetos, omite ese objeto. Usar cuando el usuario quiera "generar descripciones para los objetos", "preparar los prompts de los items", "describir los objetos mágicos para la IA" o "crear las descripciones de iconos".
---

# Generar descripciones visuales para objetos mágicos

Skill monotarea: genera un **archivo de descripción visual** por objeto mágico o relevante de la aventura, listo para pasarlo a una IA de generación de imágenes. Produce iconos cuadrados de objeto — no ilustraciones de escena.

**Qué hace y qué NO hace:**
- ✅ Lee la aventura (manifiesto, `texto_extraido.txt` o journal de Foundry) para identificar objetos mágicos y relevantes.
- ✅ Por cada uno, redacta una descripción visual estructurada en **castellano**, orientada a un icono de item cuadrado.
- ✅ Guarda la descripción en `assets/Images/Chapter XX/Items/<slug>-descripcion.txt` o `assets/Images/Items Generic/<slug>-descripcion.txt`.
- ✅ **Omite** cualquier objeto cuya carpeta ya contenga un archivo de imagen (`.webp`, `.png`, `.jpg`, `.jpeg`).
- ❌ No genera imágenes ni llama a ninguna IA de imagen.
- ❌ No toca Foundry.
- ❌ No describe el **estilo artístico** (la IA de imagen lo aplica con su propio sistema).

---

## Paso 1 — Identificar objetos relevantes

Fuentes en orden de preferencia:
1. **`assets/manifiesto.md`** — tabla de objetos mágicos detectados en el onboarding.
2. **`assets/texto_extraido.txt`** — texto bruto de la aventura para detalles visuales adicionales.
3. **Journal de la aventura en Foundry** (`list-journals`) — si está disponible.

**¿Qué objeto merece descripción?**

Incluye:
- Objetos mágicos con nombre propio (espadas, báculos, anillos, varitas…).
- Objetos mundanos adquiribles con categoría `Mundano` en el manifiesto (barriles de vino especial, gemas, obras de arte, equipamiento con valor notable) — también necesitan icono propio en Foundry.
- Objetos únicos de la aventura con relevancia narrativa o visual especial.
- Objetos custom creados para la aventura (reglas propias del PDF).

Excluye:
- Objetos completamente genéricos sin descripción visual distintiva (poción de curación estándar, antorcha, cuerda) — ya hay iconos en Foundry/5e. Si el texto los describe visualmente de forma especial, inclúyelos igualmente.
- Monedas sueltas sin descripción especial.

Los objetos `Plot` (diarios, llaves, cartas, mapas) también generan descripción visual e icono custom — no los omitas por ser narrativos. Infiere su apariencia del texto y del contexto de la aventura; si el texto no da detalles, usa el tipo de objeto para construir una descripción concreta y plausible (p.ej. una llave de mazmorra medieval, un pergamino sellado con lacre oscuro).

**Regla — sin spoilers, solo descripción física:** Las descripciones son puramente visuales. **No menciones** qué contiene un diario, a quién va dirigida una carta, qué revela un mapa, qué secreto guarda un objeto ni cuál es su función narrativa en la aventura. Solo describe su aspecto externo: materiales, forma, colores, ornamentación visible. Un jugador que vea el icono no debe poder deducir información que su personaje no conoce todavía.

Si un objeto tiene reglas custom o apariencia distintiva definida en el PDF, inclúyelo aunque sea "estándar" en su categoría.

**Detección de arte existente (idempotencia):**
Comprueba si en la carpeta de destino (`assets/Images/Chapter XX/Items/` o `assets/Images/Items Generic/`) ya hay una imagen cuyo nombre se parezca al slug del objeto. Si existe → omite y apunta en el informe.

---

## Paso 2 — Redactar la descripción visual

Por cada objeto, genera un bloque de texto en **castellano**, estructurado en cuatro secciones. El objetivo es un **icono cuadrado** — la imagen mostrará el objeto solo, centrado, con fondo plano. No hay personajes, no hay escena.

La descripción debe ser **específica y concreta**: materiales exactos, colores reales, proporciones, detalles de ornamentación. Nunca genérica.

### Estructura de cada descripción

```
NOMBRE: <nombre completo del objeto>
TIPO: <Arma / Armadura / Varita / Báculo / Anillo / Amuleto / Objeto maravilloso / Pergamino / Poción…>
FUENTE: <nombre de la aventura>

FONDO:
Fondo color pergamino — crema cálido envejecido, liso, sin texturas ni elementos secundarios.

FORMA Y MATERIALES:
<Descripción precisa de la forma física del objeto: silueta general, proporciones, materiales (tipos de metal, piedra, madera, tela…), colores exactos de cada parte. Para armas: longitud aproximada relativa, forma de la hoja/cabeza, guardia, empuñadura. Para joyería: forma de la montura, tipo de gema, color de la gema. Para báculos/varitas: forma del fuste, longitud, remate. Sé exhaustivo en materiales y colores.>

DETALLES Y ORNAMENTACIÓN:
<Grabados, runas, símbolos, gemas incrustadas, filigranas, inscripciones, nudos, motivos decorativos. Dónde están en el objeto exactamente. Si no tiene ornamentación, describe la textura de la superficie (pulida, forjada, rugosa, cristalina…).>

EFECTO VISUAL MÁGICO:
<Si el objeto emite luz, aura, humo, electricidad, llamas u otro efecto visual: color exacto, intensidad, forma del efecto. Si el objeto no tiene efecto visible en reposo, escribe "Ninguno — apariencia inerte en reposo". No inventes efectos que el texto no menciona.>
```

**Regla de neutralidad narrativa — OBLIGATORIA:** Cada descripción debe poder mostrarse a un jugador sin revelar ningún spoiler. Nunca incluyas: destinatarios de cartas, contenido de diarios, lo que revela un mapa, el secreto que guarda un objeto, ni ningún dato de trama. Si el texto de la aventura te da esos detalles para ayudarte a imaginar el objeto, úsalos solo para construir la imagen visual — nunca los escribas en la descripción.

**Reglas de tono visual — OBLIGATORIAS (iguales que en describe-creatures):**

1. **Descripción limpia.** Materiales desgastados, mellados, envejecidos están bien si definen el objeto. Descríbelos con precisión: "acero con marcas de combate", "madera oscurecida por el tiempo", nunca "oxidado y asqueroso" o "lleno de mugre".
2. **Estilo editorial limpio.** Icono de libro de referencia o manual ilustrado. Volumen con hatching/crosshatching limpio. Sin efectos grunge.
3. **Formato cuadrado centrado.** El objeto ocupa el 60-80% del encuadre, centrado. Sin personajes, sin escenas, sin fondos complejos. Solo el objeto.

---

## Paso 3 — Guardar los archivos

Determina la carpeta de destino según el capítulo del objeto:
- **Objeto de un capítulo concreto** → `assets/Images/Chapter XX/Items/<slug>-descripcion.txt`
- **Objeto genérico, reutilizable o sin capítulo fijo** → `assets/Images/Items Generic/<slug>-descripcion.txt`

Lee `assets/manifiesto.md` para saber a qué capítulo pertenece cada objeto. Las carpetas no llevan cero delante: `Chapter 1`, `Chapter 2`… Para **one-shots sin capítulos**, usa `Chapter 1` para todos.

- Slug: nombre en minúsculas, sin acentos, espacios → guiones, sin caracteres especiales.  
  Ejemplos: `staff-of-power-descripcion.txt`, `luck-blade-descripcion.txt`, `void-descripcion.txt`
- Sin frontmatter. El archivo empieza directamente con `NOMBRE:`.
- Crea la carpeta de destino si no existe.

---

## Paso 4 — Informe

- **Descripciones generadas**: nombre → ruta del archivo.
- **Omitidas (ya tienen arte)**: nombre → ruta de la imagen existente.
- **Sin información suficiente**: objetos cuya apariencia el texto no describe (la descripción se generó con mínimos del SRD estándar — indícalo).

Termina recordando: *"Las descripciones están listas. Cuando tengas el arte, guárdalo en `assets/Images/Chapter XX/Items/` o `assets/Images/Items Generic/` con un nombre similar al slug (ej. `void.webp`) para que `populate-campaign` lo detecte."*

---

## Notas

- **Hermana de `describe-creatures`**: mismas reglas de tono, misma idempotencia, mismo flujo. La diferencia clave es que aquí el encuadre es cuadrado, el fondo es plano y no hay personajes.
- **Objetos sentientes**: si el objeto tiene personalidad o historia (p.ej. una espada que habla), menciona en DETALLES si esa personalidad se refleja visualmente (runas que pulsan, ojos incrustados, etc.).
- **Subagente para lecturas largas**: si el texto es extenso, delega la extracción de objetos y sus descripciones a un subagente (`sonnet`).
- **Idempotencia**: si el archivo de descripción ya existe y no hay imagen, reemplázalo; si hay imagen, no toques nada.
