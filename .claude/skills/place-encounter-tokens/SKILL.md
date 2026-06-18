---
name: place-encounter-tokens
description: Coloca en las escenas de Foundry VTT los tokens de los actores (criaturas y NPCs) de cada encuentro de la aventura. Si la escena tiene pins de sala (notas de journal), coloca los tokens de cada sala alrededor del pin de esa sala (su posición es el centro). Si la escena no tiene pins de sala, lee la sección de la escena entera y deja los tokens en fila abajo, ordenados, para que el DM los reparta. Usar cuando el usuario quiera "poner los tokens", "colocar los monstruos/enemigos en los mapas", "montar los encuentros" o "tokens de las salas".
---

# Colocar tokens de encuentros

Skill que **puebla las escenas con los tokens** de los actores de cada encuentro (los actores ya deben existir en Foundry — los crea `populate-campaign` o la importación de Plutonium). Se apoya en los **pins de sala** que coloca `place-map-notes`: el pin de una sala marca **dónde** va su encuentro.

**Regla de oro — dónde se ponen (lo decide el usuario):**
- **Escena CON pins de sala** → los tokens de cada sala aparecen **en su sala**, usando la **posición del pin de esa sala como centro** y colocándolos alrededor.
- **Escena SIN pins de sala** → se lee la sección de la escena entera y los tokens aparecen **en fila abajo**, ordenados; el **DM los coloca** donde toca.

**Qué NO hace:** no crea actores/fichas (eso es `populate-campaign`), no coloca notas (eso es `place-map-notes`), no monta escenas. Solo instancia tokens de actores existentes.

## Requisitos previos

1. Foundry abierto en el mundo correcto (`get-world-info`).
2. Los **actores** de la aventura ya existen (criaturas y NPCs). Verifica con `list-characters`. Si faltan muchos, ejecuta antes `populate-campaign`.
3. Existen las **escenas**. Idealmente ya pasó `place-map-notes` (para tener pins de sala donde anclar los encuentros).
4. Existe el **journal de la aventura** (texto por partes/salas) para saber qué criaturas y cuántas hay en cada sala.
5. Carga los schemas MCP: `list-characters`, `list-scenes`, `list-journals`, `get-scene-notes`, `place-tokens` (y opcional `delete-tokens` para rehacer). Carga con ToolSearch si hace falta.

## Paso 1 — Inventario y emparejado escena ↔ sección del journal

1. `list-scenes` (dimensiones y `gridSize` de cada escena), `list-characters` (actores disponibles, con su nombre — recuerda que pueden estar en español tras `populate-campaign`), `list-journals` (journal de la aventura y sus páginas).
2. Por cada escena, identifica la **página** del journal que la describe (igual que en `place-map-notes`: por nombre, quitando "(Player Version)").

## Paso 2 — ¿La escena tiene pins de sala?

Llama a `get-scene-notes` para cada escena. Descarta el **pin genérico de mapa** (icono `icons/svg/book.svg`, en la esquina inferior izquierda): ese no es una sala. Lo que quede (pucks numerados u otras notas de sala) son las **salas con ancla de posición**.

- Si hay pins de sala → **modo SALA** (Paso 3A).
- Si no hay pins de sala (solo el genérico, o ninguno) → **modo FILA ABAJO** (Paso 3B).

Cada pin de sala trae: `text` (p.ej. "2. Goblin Blind"), `pageName`, `headerAnchor` (slug de la sección de la sala, p.ej. `2.-goblin-blind`) y `x`/`y` (centro del icono = punto de anclaje del encuentro).

## Paso 2.5 — Extraer el encuentro de cada sala/sección (lectura del journal)

Esto es lo más pesado en tokens: **delégalo a un subagente** (modelo `sonnet`) que devuelva SOLO la estructura, no el texto. Pásale el contenido de la página (o de las secciones relevantes) y pide, por sala, la lista de criaturas:

- **Acota la sección de cada sala** por su encabezado: desde el header de la sala (texto "2. Goblin Blind" / anchor `2.-goblin-blind`) hasta el siguiente header de igual nivel.
- **Identifica criaturas y cantidades** del texto: cuenta explícita ("three goblins", "a bugbear named Klarg", "two wolves"). Pistas fiables:
  - Enlaces a actor en el HTML: `@UUID[Actor.<id>]{Nombre}` → referencia directa a un actor concreto (úsalo para emparejar sin ambigüedad).
  - Prosa con números y plurales para las cantidades.
- **Empareja cada criatura con un actor** existente (`list-characters`): por el id del `@UUID[Actor.<id>]` si lo hay, o por nombre/similitud (inglés del journal ↔ nombre en Foundry, que puede estar en español: "goblin"↔"Guerrero Goblin", "wolf"↔"Lobo"). Ante duda real, pregunta.
- **Coloca a TODOS los que aparezcan** en la sala: enemigos **y** NPCs aliados/civiles (no solo los hostiles).
- **Disposición**: monstruos/enemigos → `hostile`; NPCs aliados con nombre → `friendly`; civiles neutrales → `neutral`.
- **Nombres propios (IMPORTANTE)**: cuando el texto da un **nombre propio** a un individuo (un jefe, un líder, una mascota: "Klarg the bugbear", "a leader… named Yeemik", "his pet wolf, Ripper"), ese token debe **llevar su nombre**, no el genérico de la ficha. Sepáralo del recuento: una entrada para el individuo con nombre (`count` 1 + su `nombre`) y otra para los genéricos restantes. Ej. Goblin Den = 5 goblins genéricos **+ 1 "Yeemik"** (mismo actor Guerrero Goblin); Klarg's Cave = "Klarg" (bugbear) + "Ripper" (lobo) + 2 goblins genéricos. Los NPCs con ficha propia (Sildar) ya traen su nombre.

Salida del subagente, por escena: lista de `{ sala, anchor, criaturas: [{ actorName, nombre?, count, disposition }] }` (donde `nombre` es el nombre propio del token si lo tiene; si falta, el token usa el nombre del actor). Para el modo FILA ABAJO, una sola lista de toda la escena.

## Paso 3A — Modo SALA: tokens alrededor del pin

Para cada sala con pin, coloca sus criaturas **agrupadas alrededor del punto del pin** (`x`,`y` del pin = centro):

- Recuerda: el `x`/`y` del pin es el **centro del icono**; el `x`/`y` de un token es su **esquina superior izquierda**. Para centrar, resta medio token (`gridSize/2`) al situar cada uno.
- **Disposición: rejilla compacta centrada** en el pin. Para `N` tokens totales de la sala: `cols = ceil(sqrt(N))`, `filas = ceil(N/cols)`, y coloca cada token (índice `i`, `col = i%cols`, `fila = floor(i/cols)`) en `x = cx - (cols*gridSize)/2 + col*gridSize`, `y = cy - (filas*gridSize)/2 + fila*gridSize` (donde `cx`,`cy` es el centro del pin). Bloque ordenado y predecible; si la sala es pequeña y se sale de los muros, el DM ajusta.
- Usa `place-tokens` con el `sceneIdentifier`, y por criatura un item con `actorIdentifier`, `count` (nº de copias; la tool las reparte en bloque, pero si quieres control fino calcula tú cada `x`/`y` e itera), `disposition`, las coordenadas en **píxeles** (`x`/`y`), y **`name`** cuando el individuo tenga **nombre propio** (Klarg, Yeemik, Ripper…). Para un individuo con nombre, una entrada con `count` 1 y su `name`; los genéricos van aparte sin `name` (usan el de la ficha).
- Si una sala no tiene criaturas (sala vacía o de exploración), no pongas nada.

> Nota: si el DM aún no ha arrastrado los pins a sus salas (p.ej. tras un `place-map-notes` que los dejó en fila abajo), los tokens se anclarán a la posición actual del pin (abajo). Es coherente: el pin es la fuente de verdad de la posición. Avisa de esto en el informe si detectas todos los pins alineados abajo.

## Paso 3B — Modo FILA ABAJO: tokens ordenados al pie del mapa

Cuando la escena no tiene pins de sala, no adivines posiciones: deja los tokens en una fila al pie para que el DM los reparta.

- Reúne todas las criaturas de la sección de la escena (Paso 2.5, lista única).
- Coloca con `place-tokens` en una fila inferior: `y` ≈ `height - gridSize*1.5`; `x` de la primera ≈ `gridSize`, incrementando `gridSize*1.2` por token (envuelve a una fila por encima si te pasas de `width - gridSize`). Ordénalos por aparición/sala.
- Mantén `disposition` correcta. Si un mismo monstruo aparece muchas veces, usa `count` para agruparlos.

## Paso 4 — Verificar e informar

1. `get-current-scene` (con la escena activa) o relee con la herramienta de escena para confirmar el número de tokens colocados.
2. Informe en español, por escena:
   - Modo usado (SALA o FILA ABAJO).
   - Por sala (modo SALA): criaturas y cantidades colocadas alrededor de su pin.
   - Criaturas **sin actor** emparejado (incidencias) y salas vacías.
   - Si los pins estaban todos abajo (sin repartir), recuérdaselo al DM.
3. Siguiente paso sugerido al DM: ajustar posiciones finas y, en modo FILA ABAJO, repartir los tokens por las salas.

## Paso 5 — Actualizar el journal de Recursos

Refleja el progreso en el **panel de control** (`Recursos — <campaña>`). Localízalo con `list-journals` y **regenera la página "Mapas"** con `update-journal-page` (`pageName` = "Mapas"), recomponiendo la tabla **desde el estado real de Foundry** para no pisar las otras columnas:

- Una fila por escena (de `list-scenes`), columnas `Escena/Mapa | Escena creada | Notas de sala | Tokens | Origen | Ruta/Notas`.
- Calcula la columna **"Tokens"** por escena con el conteo de tokens (`get-current-scene` / herramienta de escena): 🟩 **Completado** si la escena tiene los tokens de sus encuentros colocados; 🟨 **Parcial** si solo algunos; ⬜ si ninguno; ⬛ **Omitido** para mapas sin encuentros (regionales sin combate).
- Las columnas **"Escena creada"** y **"Notas de sala"** no son tuyas: léelas de la página actual y consérvalas.
- Si no existe el journal de Recursos, omite este paso (avisa en el informe).

## Notas

- **Idempotencia**: `place-tokens` crea siempre (re-ejecutar duplica). Antes de re-colocar en una escena, borra los tokens previos con `delete-tokens` (ids de `get-current-scene`) o avisa al usuario.
- **Tokens grandes** (ogro 2×2, dragón…): el token hereda su tamaño del prototype del actor; al agrupar alrededor del pin, dale más holgura.
- **Solo tokens**: no toca actores, notas, objetos ni fondos.
- Todo el contenido visible en español; nombres de criaturas del journal en inglés solo para emparejar con los actores.
