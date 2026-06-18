---
name: adventure-onboarding
description: Onboarding de una campaña de Foundry VTT desde un PDF de aventura. Lee el PDF, analiza escenas/NPCs/monstruos/objetos, comprueba si la aventura existe en Plutonium (y si es así recomienda importarla allí para un mejor resultado), crea un sistema de carpetas adaptado a la campaña dentro de la carpeta del mundo, genera un manifiesto con checklist de recursos pendientes y crea un journal-resumen en Foundry. Usar cuando el usuario quiera "hacer onboarding", "preparar una campaña", "importar una aventura" o mencione un PDF de aventura nuevo.
---

# Onboarding de campaña

Convierte un PDF de aventura en la estructura inicial de una campaña de Foundry VTT: carpetas de recursos (vacías, para que el usuario las rellene), un manifiesto de análisis y un journal-checklist dentro de Foundry.

## Entradas necesarias

1. **Ruta al PDF** de la aventura. Si el usuario no la da, pregúntala.
2. **Carpeta del mundo** de Foundry (p.ej. `C:\Users\alber\Desktop\Foundry V14\Data\worlds\test`). Si no se indica, usa el mundo donde esté el PDF; si tampoco, pregunta. Confirma que existe `world.json` en ella.
3. Comprueba con la herramienta MCP `get-world-info` que Foundry está abierto en ese mundo. Si el MCP no responde, continúa con la parte local y avisa al usuario de que el journal se creará cuando abra Foundry.

## Paso 1 — Extraer y analizar la aventura (PDF u otros formatos)

La aventura puede venir en **distintos formatos**, no solo PDF. Detecta la extensión y extrae el texto en consecuencia, guardándolo en `<carpeta_mundo>\assets\texto_extraido.txt`:

- **`.pdf`** → `python scripts/extraer_pdf.py "<ruta.pdf>" "<...>\campania\texto_extraido.txt"` (pdfplumber, fallback pypdf).
- **`.txt` / `.md` / `.markdown`** → ya es texto; léelo directamente (o cópialo a `texto_extraido.txt`). El Markdown conserva la estructura (encabezados de capítulo, tablas), aprovéchala.
- **`.html` / `.htm`** → extrae el texto quitando etiquetas (BeautifulSoup o un strip de tags).
- **`.docx`** → usa la skill `docx` o `python-docx` para extraer el texto.
- **`.rtf` / `.epub`** → conviértelo a texto (p.ej. `pypandoc`/`ebooklib`) o pide ayuda al usuario si no hay herramienta.

Si el archivo es grande, **delega la lectura y el análisis a un subagente** (ver nota al final): que devuelva el inventario estructurado, no el texto entero, para ahorrar contexto.

Con el texto, construye un inventario de la aventura:

- **Metadatos**: título, nivel recomendado, sistema, autor.
- **Capítulos/actos**: la división en capítulos o actos determina las subcarpetas `Chapter N` en toda la estructura (sin cero delante: `Chapter 1`, `Chapter 2`…). Si la aventura no tiene capítulos formales (one-shot, aventura de una sola localización), usa una sola carpeta `Chapter 1` o el nombre de la localización principal.
- **Escenas/localizaciones**: cada lugar jugable que necesitará un mapa en Foundry (tabernas, caminos, mazmorras, edificios…). Distingue mapas de combate de ilustraciones. Asigna cada escena a su capítulo.
- **NPCs con nombre**: personajes con rol narrativo (necesitarán retrato en `Creatures/Portraits/Chapter XX/` y token en `Creatures/Tokens/Chapter XX/`). Para cada NPC anota su **primera aparición** (capítulo + sala o sección, p.ej. "Cap. 3 / Z8"). Marca con 🛒 a todo personaje que venda objetos, tenga un inventario de tienda, o intercambie mercancías con los PJs — aunque sea solo de pasada ("el enano vende pociones de su mochila"). Esta marca es necesaria para una skill futura que construirá el inventario de comerciantes.
- **Monstruos/enemigos**: criaturas con stat block. Las genéricas (reutilizables) van a `generic/`; las nombradas o únicas van a `Monsters/` o al capítulo correspondiente. Anota referencia MM si aplica, y la sección donde aparecen (p.ej. "Z11", "Z14a–Z14b").

> **Regla — toda criatura/NPC mencionado debe aparecer, con retrato Y token.** Cualquier mención a un NPC o criatura en el texto (aunque sea de pasada: un tabernero, un guardia, un mendigo, un testigo sin descripción) entra en el inventario y se asume que necesita **retrato + token** por defecto. Si el texto no da detalles ni stat block, trátalo como un **`commoner`** (o el genérico que mejor encaje: guardia, bandido…), pero **no lo omitas**: debe figurar en el manifiesto y en el journal con su fila. Mejor un commoner de sobra que un NPC que aparece en la mesa de juego y no tiene ficha ni token.
>
> **Trampa frecuente — misma raza, roles distintos:** si en la aventura aparecen personajes del mismo tipo de criatura en escenas o roles distintos (p.ej. un guerrero plasmoide en el almacén Y un comerciante plasmoide en el mercado), son **entradas separadas** en el inventario. No colapses al segundo sobre el primero solo porque "ya hay uno de ese tipo". El criterio es el **rol y la escena**, no la raza. Aplica lo mismo a cualquier tipo de criatura repetida con función diferente (guardia/interrogador, mercader/espía, etc.).
>
> **Señal de NPC distinto aunque sin nombre:** cualquier personaje sin nombre propio que tenga (a) un rasgo visual o mecánico único descrito en el texto, (b) una función social o de interacción con los PJs, o (c) un horario o ubicación diferenciados, merece fila propia en el inventario. Ejemplos: "el comerciante plasmoide que guarda las pociones dentro de su cuerpo translúcido", "el mercader nocturno que intercambia objetos por secretos". Estos no son commoners genéricos — son NPCs con retrato.

- **Objetos/items**: escanea **todas** las secciones de tesoro y recompensa del texto. Busca explícitamente: encabezados o párrafos `Tesoro.`, `Treasure.`, `Recompensa.`, bloques de loot en encuentros, objetos mencionados en descripciones de sala como adquiribles. Para cada ítem anota la **sección/sala** donde se encuentra y, si el texto especifica un **valor en po/pp/pm**, anótalo también — se usará al crear la ficha. Clasifícalos en tres categorías:
  - **Objetos mágicos** (pociones, pergaminos, armas/armaduras mágicas, objetos maravillosos, etc.): necesitan ficha en Foundry (de Plutonium o creada desde el PDF) e icono propio. `Origen: Plutonium` o `Origen: PDF`. Irán a `Images/Chapter XX/Items/`.
  - **Objetos mundanos adquiribles** (barriles de vino, gemas, obras de arte, monedas especiales, equipamiento corriente con valor notable): los PJs *pueden* llevárselos y también necesitan **ficha en Foundry**, creada con `manage-world-items` action `create` (`Origen: PDF`). Al crear la ficha: pon un nombre descriptivo, añade una descripción breve (una línea con su apariencia y función), y si el texto indica valor **rellena el campo de precio** (`system.price.value` + `system.price.denomination`, p.ej. `500` / `"gp"`). También generan archivo de descripción visual para `describe-objects`. Tipo Foundry sugerido: `loot` para objetos de valor genérico, `consumable` para comida/bebida, `equipment` para equipamiento.
  - **Objetos de plot/narrativos** (diarios, llaves, mapas, cartas, pergaminos de texto): relevantes para la trama. También necesitan **ficha en Foundry** creada con `manage-world-items` action `create` (`Origen: PDF`), con descripción en **castellano**, e **icono custom** igual que las demás categorías. Tipo sugerido: `loot` para llaves/objetos físicos, `consumable` para pergaminos de texto.
- **Documentos de apoyo**: handouts, cartas, mapas de localización (no de combate) — van a `pages/` o `Images/Chapter XX/Localizations/`.
- **Secretos**: cualquier información oculta con relevancia narrativa o mecánica: conspiraciones, identidades secretas, traiciones, objetos escondidos, información que solo sabe un PNJ o que los PJs pueden descubrir. Para cada secreto anota: (a) descripción breve del secreto, (b) quién lo sabe o lo guarda (PNJ, criatura, facción, o los propios PJs si es información que ellos tienen pero ignoran), (c) en qué zona/escena está ubicado o puede revelarse. Si el secreto no está ligado a una zona concreta, indica "Global" o el capítulo al que pertenece.

## Paso 1b — ¿Está la aventura en Plutonium? (recomendación clave)

Si Foundry está accesible por MCP, comprueba con `plutonium-search-adventure` (nombre **original en inglés** de la aventura) si Plutonium la tiene (carga el schema con ToolSearch si hace falta).

- **Si la encuentra (oficial):** es la mejor vía. **Recomienda al usuario, de forma destacada, que importe la aventura en Plutonium** (su importador de Aventuras) **antes** de poblar. Eso deja en Foundry, ya hechos, los **mapas (con muros), criaturas, objetos y journals oficiales**. Luego la skill `populate-campaign` solo tendrá que **reconciliar**: superponer las imágenes custom del usuario sobre lo importado y rellenar lo que falte (homebrew del PDF, recursos propios). Anota los datos que devuelve (source, nivel, nº de capítulos) en el manifiesto y el journal.
- **Si NO la encuentra** (aventura de la comunidad): flujo normal — el usuario rellenará las carpetas y `populate-campaign` lo montará desde el PDF + recursos.

No bloquees el onboarding por esto; es informativo/recomendación. La decisión de importar en Plutonium es del usuario.

## Paso 2 — Crear la estructura local

Dentro de la carpeta del mundo crea la raíz `assets/` con subcarpetas adaptadas al análisis. Sigue la convención de carpetas del usuario (CamelCase en inglés, como en sus otras campañas). Esqueleto estándar (adáptalo al número real de capítulos/actos de la aventura):

```
assets/
  manifiesto.md
  texto_extraido.txt
  Audio/
    Ambience/
    Combat/
  Creatures/
    Portraits/
      Chapter 1/       (retratos de NPCs y criaturas únicas de ese capítulo)
      Chapter 2/
      …
      generic/          (criaturas genéricas reutilizables — soldados, guardias…)
      Monsters/         (monstruos nombrados o importantes sin capítulo fijo)
    Tokens/
      Chapter 1/
      Chapter 2/
      …
      Generic/
      Monsters/
  Images/
    Chapter 1/
      Items/            (iconos de objetos mágicos y relevantes del capítulo)
      Localizations/    (ilustraciones de localizaciones, handouts de lugar)
    Chapter 2/
      Items/
      Localizations/
    …
    Items Generic/      (iconos de objetos reutilizables o sin capítulo fijo)
  maps/
    Chapter 1/
      doors/            (assets de puertas para el editor de muros, si aplica)
      tiles/            (tiles decorativos, si aplica)
    Chapter 2/
    …
  pages/                (imágenes de handouts, cartas, pergaminos — para journal pages)
  scenes/               (assets de escena: overlays, fondos adicionales…)
```

**Convenciones:**
- Número de carpetas `Chapter N` se ajusta al número real de capítulos/actos de la aventura (sin cero delante: `Chapter 1`, `Chapter 2`…). Para one-shots sin capítulos formales, usa una sola carpeta `Chapter 1` o sustitúyela por la localización principal (p.ej. `Vault 17/`).
- Las subcarpetas `doors/` y `tiles/` dentro de `maps/Chapter XX/` solo se crean si la aventura tiene mapas con esos assets (frecuente en aventuras con UVTT o mapas de comunidad con tiles separados).
- Las carpetas quedan **vacías**: son los huecos que el usuario rellenará con sus recursos. No generes imágenes.

## Paso 3 — Manifiesto con checklist

Escribe `assets/manifiesto.md` en español con:

1. Resumen de la aventura (2-3 párrafos, sin spoilers innecesarios en la primera línea).
2. Tabla de escenas: número, nombre, carpeta destino del mapa, dimensiones/grid sugeridos si el PDF da pistas.
3. **Tabla de NPCs**: columnas `Cap./Sección | Nombre | Rol | 🛒 | Ficha | Carpeta retrato/token | Notas`. La columna `🛒` lleva una ✓ para comerciantes/mercaderes; déjala vacía para los demás. La columna `Ficha` indica si necesita stat block propio o basta con un genérico.
4. Tabla de monstruos: nombre, CR, sección/sala, cantidad, origen (stat block del PDF o compendio, con página).
5. **Tabla de objetos y tesoros**: columnas `Cap./Sección | Objeto | Categoría | Valor | Origen | Notas`. `Categoría` es una de: `Mágico` / `Mundano` / `Plot`. Las tres categorías necesitan ficha de Foundry **e icono custom**. La diferencia es el nivel de detalle: `Mágico` viene de Plutonium o se crea con reglas completas; `Mundano` se crea con nombre, descripción y precio; `Plot` se crea con nombre y descripción narrativa. `Valor` recoge lo que indica el texto (p.ej. "500 po/unidad × 2d4") o "—" si no se especifica. `Origen` = Plutonium / PDF. Incluye **todos** los hallazgos de todas las secciones de tesoro — no omitas ninguno aunque sea mundano.
6. **Tabla de secretos**: cada fila con columnas `Secreto | Quién lo sabe/guarda | Zona/Escena | Notas`. Incluye todos los secretos detectados en el inventario (PNJs con información oculta, tramas escondidas, objetos secretos, información que los PJs pueden descubrir). Si un secreto puede revelar el giro principal de la aventura, márcalo con ⚠️ para que el DM tenga cuidado al enseñar el documento.
7. **Checklist de recursos pendientes**: una casilla `- [ ]` por archivo esperado, con la ruta exacta donde dejarlo (p.ej. `- [ ] assets/maps/Chapter 1/taberna.webp — mapa de combate de la taberna`, `- [ ] assets/Creatures/Portraits/Chapter 1/npc-nombre.webp`). Esta checklist es el contrato con la siguiente skill (poblar la campaña).

## Paso 4 — Journal de Recursos en Foundry

Si Foundry está accesible por MCP, crea **un journal de Recursos** con `create-journal` (carga su schema con ToolSearch si hace falta). **Usa `create-journal`, NO `create-quest-journal`**: el primero inserta tus páginas tal cual (sin la plantilla quest en inglés). Este journal es el **panel de control** de la campaña: el usuario lo edita (cambia estados, añade sus propios mapas) y **todas las skills posteriores lo leen Y lo actualizan** — `populate-campaign`, `place-map-notes` y `place-encounter-tokens` marcan su progreso aquí con `update-journal-page` (cada una regenera su parte desde el estado real de Foundry). Todo en **castellano**.

- `name`: `Recursos — <título de la campaña>`. `folderName`: el de la campaña.
- `pages`: array ordenado de `{name, content}` (HTML en español, insertado tal cual):

1. **"Leyenda de estados"** — los estados miden **cuán completado** está el recurso (NO su origen; el origen es una columna aparte). Estados (puedes ampliarlos si el usuario lo pide):
   - ⬜ **Pendiente** — sin empezar.
   - 🟦 **Material reunido** — el recurso (imagen del usuario) o la ficha de Plutonium ya está listo, pero aún no montado en Foundry.
   - 🟨 **Parcial** — montado en Foundry, pero le falta algo (imagen custom, token, muros/luces…).
   - 🟩 **Completado** — terminado del todo.
   - ⬛ **Omitido** — no se usará en esta campaña.
2. **"Mapas"** — tabla con **una columna por fase** del montaje, para que cada skill posterior marque su progreso: `Escena/Mapa | Escena creada | Notas de sala | Tokens | Origen | Ruta local / Notas`. Una fila por escena. `Escena creada` la actualiza `populate-campaign`; `Notas de sala`, `place-map-notes`; `Tokens`, `place-encounter-tokens`. Deja espacio para que el usuario **añada sus propios mapas** (fila nueva con su ruta). `Origen` = Plutonium / Local (imagen o UVTT) / —.
3. **"Criaturas"** — tabla: `Cap./Sección | Criatura | 🛒 | CR | Cantidad | Estado | Origen | Retrato/Token (ruta) | Notas`. `Origen` = Plutonium (bestiario) / PDF (homebrew). La columna `🛒` marca comerciantes (✓ / vacío). La columna `Cap./Sección` indica la primera aparición (p.ej. "Cap. 3 / Z8").
4. **"Objetos y conjuros"** — tabla: `Cap./Sección | Objeto/Conjuro | Categoría | Valor | Estado | Origen | Icono (ruta) | Notas`. `Categoría` = Mágico / Mundano / Plot. Las tres categorías llevan estado de Foundry (empiezan en ⬜). `Valor` recoge el precio indicado en el texto o "—". `Origen` = Plutonium / PDF. Al poblar, los `Mundano` se crean con `manage-world-items` action `create` incluyendo `system.price.value` y `system.price.denomination`.
5. **"Secretos"** — tabla de referencia rápida para el DM (página privada, no para jugadores): `Secreto | Quién lo sabe/guarda | Zona/Escena | Revelado`. Columna `Revelado` arranca en ⬜; el DM puede marcarla ✅ cuando los PJs descubran el secreto. Si el secreto es un spoiler mayor (identidad del villain, giro final…), añade ⚠️ al título del secreto. Esta página NO forma parte del flujo de estados de recursos — es puramente narrativa.

Columna **Origen** (de dónde sale el recurso, independiente del estado): **Plutonium** (oficial), **Local** (imagen/UVTT del usuario en las carpetas), **PDF** (homebrew creado del stat block/reglas).

Estado inicial al crear (todo arranca por completar): casi todo en ⬜ **Pendiente**. Si ya hay imagen del usuario en la carpeta, o la ficha está en Plutonium y disponible, puedes ponerlo en 🟦 **Material reunido**. El `Origen` sí se rellena siempre según el análisis y el Paso 1b.

- Cada fila debe indicar la **ruta esperada** en las carpetas (`assets/maps/Chapter XX/...`, `assets/Creatures/Portraits/Chapter XX/...`, `assets/Images/Chapter XX/Items/...`, etc.) para que el usuario sepa dónde dejar su recurso.
- (La página 1 puede ser la "Leyenda de estados"; con `create-journal` no hay portada residual en inglés.)
- Si la herramienta de journals fallara, informa y deja el equivalente en el `manifiesto.md` local.

## Paso 5 — Informe final

Termina mostrando al usuario: árbol de carpetas creado, conteos (escenas/criaturas/objetos detectados), ruta del manifiesto, y el **journal de Recursos** creado.

Explica al usuario que el journal de Recursos es su panel de control: ve **cuán completado** está cada recurso (estado), **de dónde sale** (columna Origen), y puede **añadir sus propios mapas** (fila nueva con su ruta). `populate-campaign` lo leerá para saber qué falta por completar y cómo hacerlo.

- **Si la aventura está en Plutonium** (Paso 1b): destácalo — "importa la aventura en Plutonium ahora; sus criaturas/objetos/mapas (Origen: Plutonium) quedarán a un paso de completarse. Luego deja tus imágenes custom en las carpetas para superponerlas".
- **Si no**: "deja tus recursos en las carpetas (Origen: Local); después ejecuta `populate-campaign`".

## Nota — delegar la lectura a un subagente (ahorro de contexto)

El Paso 1 (leer la aventura entera y producir el inventario) es lo más pesado en tokens. Para aventuras largas, **delégalo a un subagente** (modelo `sonnet`, suficiente para extraer/clasificar): pásale la ruta del archivo y pídele que devuelva **solo el inventario estructurado** (metadatos, escenas, criaturas con CR y sección, NPCs con primera aparición y flag 🛒, objetos con sección y categoría Mágico/Mundano/Plot), no el texto completo. Recuerda al subagente que escanee explícitamente todas las secciones de `Tesoro.` / `Treasure.` / `Recompensa.` de cada sala — es la fuente más común de ítems omitidos. El agente principal usa ese inventario para los pasos con MCP/ficheros (Plutonium, carpetas, manifiesto, journal de Recursos), que necesitan el contexto de esta sesión. Que el subagente también guarde el texto extraído en `assets/texto_extraido.txt`.
