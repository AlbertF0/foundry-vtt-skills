---
name: place-map-notes
description: Coloca notas de mapa (pins de journal) en las escenas de una campaña de Foundry VTT, con el mismo formato que Plutonium (puck numerado, enlace a la página del journal y al header exacto de la sala). Garantiza también un pin genérico de mapa en la esquina inferior izquierda enlazado al inicio de la sección que describe el mapa. Si una escena ya tiene notas, verifica que estén todas y añade solo las que falten; si no tiene ninguna, coloca todas ordenadas en una fila abajo del mapa para que el DM las arrastre a su sala. Usar cuando el usuario quiera "poner las notas en los mapas", "pins de las salas", "notas de las escenas" o "enlazar las salas al journal".
---

# Colocar notas de mapa (pins de salas)

Skill **monotarea**: poblar las escenas de Foundry con **notas de mapa** (documentos `Note` = pins de journal), una por sala, con el **formato de Plutonium**, para que al clicar un pin se abra la parte de la aventura que describe esa sala.

**Qué hace y qué NO hace:**
- ✅ Crea/completa las notas con su enlace correcto (journal + página + header anchor) e icono puck numerado.
- ✅ **Pin genérico de mapa**: en CADA escena garantiza un pin en la **esquina inferior izquierda**, enlazado al **inicio de la sección** del journal que describe ese mapa (no a una sala). Es el acceso rápido a la descripción general del mapa, y se queda fijo en la esquina.
- ✅ Si la escena ya tiene notas (p.ej. importadas con la aventura de Plutonium), **verifica** que estén todas y añade solo las que falten.
- ✅ Si la escena no tiene notas, las pone **ordenadas en una fila abajo** del mapa.
- ❌ **No** intenta adivinar en qué punto del mapa va cada sala. Cuando las crea nuevas, las deja en fila abajo y **el DM las arrastra** a la sala que toca. (El pin genérico SÍ se deja ya colocado en la esquina inferior izquierda.)
- ❌ No crea actores, tokens, objetos ni escenas (eso son otras skills).

## Formato de nota (igual que Plutonium)

Cada sala = un `Note` con:
- **Enlace**: `journalIdentifier` = journal de la aventura (el multipágina, no "Recursos — …"); `pageName` = la página que describe esa parte/mapa.
- **Header anchor**: `headerAnchor` = slug del encabezado de la sala dentro de la página, para que el pin haga scroll a la sección exacta. Se guarda en la flag `plutonium.journalPageHeaderAnchor`. Ej.: sala "2. Goblin Blind" → `2.-goblin-blind`.
- **Etiqueta**: `text` = nombre de la sala tal cual ("2. Goblin Blind").
- **Icono**: si la sala está numerada, `icon` = `assets/srd5e/puck/<N>.webp` (pucks numerados de Plutonium, existen ~1–13); `iconSize` = **75**. Si no está numerada, deja el icono por defecto (libro) o un puck genérico.

## Requisitos previos

1. Foundry abierto en el mundo correcto (`get-world-info`).
2. Existe en Foundry el **journal de la aventura** (el texto importado, multipágina) — es el destino de los enlaces. Si no existe, avisa: las notas necesitan un journal al que enlazar (el usuario debe importar la aventura en Plutonium, o generar el journal antes).
3. Existen las **escenas** de los mapas.
4. Carga los schemas MCP: `list-journals`, `list-scenes`, `get-current-scene`, `get-scene-notes`, `place-scene-notes` (carga con ToolSearch si hace falta).

## Paso 1 — Localizar el journal de la aventura y las escenas

1. `list-journals` → identifica el journal de la aventura (el de varias páginas tipo "Part 1 — …", **no** el "Recursos — …"). Apunta su `id` y la lista de páginas con sus `id`/nombre.
2. `list-scenes` → lista de escenas con dimensiones y `gridSize`.

## Paso 2 — Construir el índice de salas por escena

Para cada escena, hay que saber **qué salas** le corresponden, en **qué página** del journal están y cuál es el **anchor** de cada una. Fuente de verdad: el **contenido del journal** (ya trae los anchors canónicos).

1. **Empareja escena → página**: por similitud de nombre. Quita sufijos como "(Player Version)" del nombre de escena (p.ej. "Cragmaw Hideout (Player Version)" → "Cragmaw Hideout") y busca esa localización como encabezado dentro de las páginas (`list-journals` con `journalId`+`pageId` para leer el contenido). Una página puede contener varios mapas; un mapa cae en una sola página. Si la correspondencia es ambigua, **pregunta al DM** con `AskUserQuestion`.
2. **Extrae las salas y sus anchors** del contenido de la página:
   - Las salas numeradas aparecen como encabezados "N. Nombre" (en el HTML, `data-roll-name-ancestor="2. Goblin Blind"` y/o `<span class="entry-title-inner">2. Goblin Blind</span>`).
   - Los **anchors canónicos** están en los enlaces UUID del propio contenido: `@UUID[.<pageId>#<slug>]{…}`. Extrae todos con un regex tipo `\[\.<pageId>#([^\]]+)\]` → obtienes `1.-cave-mouth`, `2.-goblin-blind`, `8.-klargs-cave`, etc. **Usa estos** (son exactos).
   - Si una sala no tuviera enlace UUID, **deriva** el slug del nombre del encabezado con esta regla (verificada): pasar a minúsculas, espacios → guiones, **conservar el punto**, y **eliminar** cualquier carácter que no sea `[a-z0-9.-]` (así los apóstrofos se quitan: "8. Klarg's Cave" → `8.-klargs-cave`).
   - El **número de puck** sale del prefijo "N." del nombre.
3. Resultado: por escena, una lista ordenada de `{ numero, nombreSala, anchor, pageName }`.
4. **Anchor de sección del mapa** (para el pin genérico): identifica el **encabezado de la sección** que describe el mapa (no una sala). Puede ser un `<h1>` (p.ej. "Cragmaw Hideout", "Phandalin", "Wave Echo Cave") o un encabezado de menor nivel `<h2>` dentro de una página que cubre varios mapas (p.ej. "Redbrand Hideout" y "Tresendar Manor" dentro de *Part 2 — Phandalin*; "Ruins of Thundertree" y "Cragmaw Castle" dentro de *Part 3 — The Spider's Web*). Su anchor es el **slug del encabezado** (misma regla que las salas: minúsculas, espacios→guiones, conserva punto, quita apóstrofos/puntuación): `cragmaw-hideout`, `redbrand-hideout`, `ruins-of-thundertree`, `cragmaw-castle`, `wave-echo-cave`. Ojo: la sección del mapa puede NO estar al inicio de la página (en Part 1 primero va el viaje "Goblin Arrows" y luego la mazmorra), por eso se apunta al anchor de sección, no al top. **Mapa regional/sin sección propia** (p.ej. "The Sword Coast", que no tiene un encabezado homónimo): enlaza a la página de introducción (sin anchor = top, o el anchor que el DM prefiera); si dudas, pregunta al DM.

> Nota: muchas aventuras oficiales importadas con Plutonium **ya traen las notas de sala** en las escenas. En ese caso este paso sirve para **verificar** que están todas; rara vez habrá que crear. El **pin genérico de mapa**, en cambio, Plutonium no lo pone — hay que garantizarlo en todas las escenas.

## Paso 3 — Reconciliar por escena

Para **cada escena**:

1. `get-scene-notes` (con el nombre/id de la escena) → notas existentes, con su `text`, `entryName`, `pageName` y `pageAnchor`/flag.
2. **Diff** contra el índice de salas del Paso 2, emparejando por número/nombre de sala (normaliza: "2. Goblin Blind" ↔ "2.-goblin-blind"):
   - **Sala con nota ya presente** → OK, no la toques. (Opcional: si la nota no tiene el header anchor o enlaza mal, ofrécele al DM corregirla — pero por defecto respeta lo existente.)
   - **Sala sin nota** → va a la lista de "faltantes a crear".
3. **Colocar las faltantes** con `place-scene-notes`, **en una fila abajo del mapa** (no en la sala; el DM las moverá):
   - Calcula coordenadas desde las dimensiones reales de la escena (`list-scenes`/`get-current-scene`): `gridSize`, `width`, `height`.
   - Fila inferior: `y` ≈ `height - gridSize*1.5`. `x` de la primera ≈ `gridSize`, e incrementa `spacing` ≈ `max(gridSize*1.5, 90)` px por nota. Si te pasas de `width - gridSize`, salta a una fila por encima (`y -= gridSize*1.5`).
   - Ordena las faltantes por número de sala antes de colocarlas.
   - Cada nota con su `journalIdentifier`, `pageName`, `headerAnchor`, `text`, `icon` = puck del número, `iconSize` 75, y las coordenadas `x`/`y` calculadas (en píxeles).
4. Si la escena **no tenía ninguna nota**, es el mismo flujo: todas las salas son "faltantes" → todas en fila abajo.
5. **Pin genérico de mapa** (siempre, en toda escena): garantiza un pin en la **esquina inferior izquierda** enlazado al inicio de la sección del mapa.
   - **Detecta** si ya existe (idempotencia): busca entre las notas existentes una cuyo header anchor sea el **anchor de sección** del mapa (Paso 2.4), o cuyo `text` sea el nombre del mapa sin número. Si existe, no lo dupliques.
   - Si no existe, créalo con `place-scene-notes`: `journalIdentifier` = journal de la aventura, `pageName` = la página de esa parte, `headerAnchor` = **anchor de sección** del mapa (p.ej. `cragmaw-hideout`), `text` = nombre del mapa (p.ej. "Cragmaw Hideout"), **icono genérico** (no un puck numerado: usa `icons/svg/book.svg` u otro genérico), `iconSize` **grande** (p.ej. **160**; debe destacar claramente sobre los pucks de sala, que son 75, por ser el acceso principal del mapa) y `fontSize` **grande** para la etiqueta (p.ej. **56**; el valor por defecto es 32).
   - **Posición**: esquina inferior izquierda, `x` ≈ `gridSize`, `y` ≈ `height - gridSize`. Para que no choque con la fila de notas de sala, coloca esa fila empezando más a la derecha (`x` inicial ≈ `gridSize*2.5`) o una fila por encima. El pin genérico se queda fijo en la esquina (el DM no lo mueve).
   - **Recorre TODAS las escenas**: este pin genérico se garantiza en cada mapa de la campaña, incluidas las regionales/sin salas. Si quieres reemplazar uno existente (p.ej. cambiar su tamaño), bórralo antes con `delete-scene-notes` (por `noteIds`) y vuelve a crearlo.

No dupliques: si una sala ya tiene nota, no crees otra; si el pin genérico ya existe, no lo recrees. La skill debe poder re-ejecutarse sin generar duplicados (idempotencia por diff).

## Paso 4 — Informe

Por cada escena, informa en español:
- **Pin genérico de mapa**: creado o ya presente (en la esquina inferior izquierda, enlazado a la sección del mapa).
- Notas de sala que **ya existían** (verificadas) y a qué página enlazan.
- Notas de sala **creadas nuevas** (y que están **en fila abajo del mapa**, pendientes de que el DM las arrastre a su sala).
- Salas del journal **sin escena** asociada, o escenas **sin salas** detectadas (incidencias).

Termina recordando al DM: *"Las notas nuevas están alineadas abajo en cada mapa; arrástralas a la sala que corresponde. Las que ya estaban se han dejado en su sitio."*

## Paso 5 — Actualizar el journal de Recursos

Tras colocar las notas, refleja el progreso en el **panel de control** (`Recursos — <campaña>`). Localízalo con `list-journals` y **regenera la página "Mapas"** con `update-journal-page` (`journalIdentifier` = "Recursos — <campaña>", `pageName` = "Mapas"), recomponiendo la tabla **desde el estado real de Foundry** para no pisar las otras columnas:

- Una fila por escena (de `list-scenes`). Mantén las columnas `Escena/Mapa | Escena creada | Notas de sala | Tokens | Origen | Ruta/Notas`.
- Calcula tú la columna **"Notas de sala"** por escena con `get-scene-notes` (descartando el pin genérico): 🟩 **Completado** si la escena tiene sus pins de sala (y su pin genérico); 🟨 **Parcial** si solo algunas o solo el genérico; ⬜ si ninguna. Para mapas regionales sin salas, marca 🟩 con nota "solo pin de mapa".
- Las columnas **"Escena creada"** y **"Tokens"**: léelas de la página actual y consérvalas tal cual (no son tuyas). Si la página aún no tiene esas columnas (journal antiguo), créalas con su valor actual deducido del estado real (escena existe → 🟩; tokens en la escena → 🟩).
- Si no existe el journal de Recursos, omite este paso (avisa en el informe).

## Notas técnicas

- **Anchors**: preferir los extraídos del contenido (`@UUID[.<pageId>#<slug>]`); la derivación por slug es el respaldo. Si un anchor no coincide con un encabezado real, el pin abrirá la página pero sin scroll (no rompe nada).
- **Pucks**: `assets/srd5e/puck/<N>.webp` (los trae Plutonium). Para salas sin número, icono por defecto.
- **Posición de nota**: `x`/`y` es el **centro** del icono. Con `gridX`/`gridY` se usa el centro de esa casilla; aquí trabajamos en píxeles para alinear la fila inferior.
- **Solo notas**: esta skill no toca actores, tokens, objetos ni fondos.
