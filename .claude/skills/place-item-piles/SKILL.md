---
name: place-item-piles
description: Coloca tokens de contenedor (cofres, bolsas, cadáveres, muebles) en las escenas de Foundry VTT como "item piles" con el tesoro de cada sala. Lee el journal de la aventura para identificar todas las ubicaciones de tesoro, pregunta al usuario qué actor usar como contenedor para cada grupo de items, coloca ese actor como token en la posición del pin de sala correspondiente y le asigna los objetos que le pertenecen. Crea un pile por ubicación física distinta dentro de una misma sala (escritorio ≠ bajo la cama = dos tokens). Usar cuando el usuario quiera "poner los cofres", "colocar el tesoro", "montar los item piles", "poner los contenedores de loot", "colocar las recompensas en el mapa" o "añadir el tesoro a las salas".
---

# Colocar item piles de tesoro

Skill que **coloca tokens de contenedor** (cofres, bolsas, muebles, cuerpos) en las escenas con los ítems de tesoro de cada sala asignados. El usuario activa el módulo Item Piles después para que los jugadores puedan interactuar con ellos; la skill solo monta la estructura.

## Principio fundamental — un pile por UBICACIÓN FÍSICA

**Un token = un punto físico del mapa donde están agrupados objetos.**

Todo lo que el journal describe en el mismo sitio físico va en el MISMO token, independientemente de cuántos objetos sean o cómo los llame el texto (cofre, caja, bolsa, montón…). Solo se crean tokens separados si el journal describe claramente **dos puntos físicos distintos** dentro de la escena.

| Un solo token ✅ | Dos tokens ✅ |
|---|---|
| "En la pila hay monedas, un diamante oculto y un cofre de hierro" | "Hay una pila de oro EN EL CENTRO y un compartimento secreto EN UNA ROCA" |
| "El escritorio tiene pergaminos y una poción debajo" | "El escritorio tiene pergaminos / el baúl junto a la pared tiene una armadura" |
| "El alquimista guardaba aquí pociones, hierbas y un grimorio" | "En el armario hay pociones / en la mesa de trabajo hay un grimorio" |

Si tienes dudas, menos tokens es mejor. El DM puede separar manualmente más tarde.

## Requisitos previos

1. Foundry abierto en el mundo correcto (`get-world-info`).
2. Los **objetos** de tesoro ya existen como world items (los crea `populate-campaign`). Verifica con `manage-world-items` action `list`.
3. Las **escenas** existen. Idealmente con pins de sala colocados por `place-map-notes`.
4. El **journal de la aventura** existe con el texto de cada sala.
5. Carga los schemas MCP con ToolSearch: `list-scenes`, `list-journals`, `get-scene-notes`, `manage-world-items`, `place-tokens`, `copy-world-item-to-actor`, `list-characters`.

## Paso 1 — Extraer ubicaciones de tesoro del journal

1. `list-journals` → localiza el journal de la aventura (multipágina, **no** el "Recursos — …").
2. Lee cada página y extrae **todas las ubicaciones de tesoro de entorno** (no el equipo encima de los NPCs):
   - Qué objetos hay y **dónde físicamente** están.
   - Agrupa TODO lo que está en el mismo punto físico: si el texto menciona varias cosas en "la pila", "el montón", "el escritorio", etc., es UN solo pile.
3. Construye la lista con estructura `[Escena] → [pin de sala] → [punto físico] → [todos sus items]`:
   ```
   Área 1  →  pin general  →  La Pila  →  [Monedas, Diamante Oculto, Cofre de Hierro]
   Área 4  →  pin "4A"     →  arcón herrumbroso  →  [Armadura de Cuero +1, 80 po]
   Área 4  →  pin "4A"     →  escritorio         →  [Pergamino de Bola de Fuego]
   ```
4. Si una sala no tiene tesoro de entorno, márcala como "sin piles".

Si el journal es largo, usa un subagente (`sonnet`) para que lea y devuelva solo la lista estructurada.

## Paso 2 — Preguntar qué actor usar como contenedor

Pregunta al usuario **una sola vez** qué actor usar como contenedor. Usa `AskUserQuestion`. Verifica con `list-characters`. Ese mismo actor se usa para todos los piles de la campaña.

## Paso 3 — Colocar los tokens

### 3A — Posición del pile

Usa `get-scene-notes` para obtener las notas de la escena. La posición sigue esta jerarquía:

**1. Pin de sala específico** (si el tesoro pertenece a una sala concreta):
- Busca la nota cuyo `text` coincide con la sala (p.ej. "4A", "Sala del Trono").
- `x = pin_x - gridSize/2`, `y = pin_y - gridSize/2`
- Varios piles en la misma sala: desplaza `+gridSize` en x por cada pile adicional.

**2. Pin general del mapa** (si no hay pin de sala, o el tesoro es de toda el área):
- Busca la nota genérica del mapa (la que tiene el nombre del área completo, con icono de libro o similar).
- Usa su posición del mismo modo: `x = pin_x - gridSize/2`, `y = pin_y - gridSize/2`.

**3. Posición por defecto** (si no hay ninguna nota en la escena):
- Igual que `place-map-notes` coloca el pin general: esquina inferior izquierda **dentro del fondo**.
- `x = gridSize`, `y = height - gridSize * 2`
- Pile adicional: `x += gridSize * 1.2`; si supera `width - gridSize`, nueva fila: `x = gridSize`, `y -= gridSize`.

**Límites siempre dentro de la imagen:** `x` entre `0` y `width - gridSize`; `y` entre `0` y `height - gridSize`. Si el pin está fuera de esos límites, aplica `y = min(pin_y, height - gridSize * 2)`.

### 3B — Colocar el token y asignar items

Por cada pile:
1. `place-tokens` con el actor elegido, posición calculada, `name` descriptivo, `disposition: "neutral"`, `actorLink: false`. **Captura el `tokenId`** de la respuesta.
2. Verifica que los world items existen (`manage-world-items list`). Si falta alguno, créalo (`create`, tipo `"loot"`).
3. `copy-world-item-to-actor` para **cada item** usando el `tokenId` como `actorIdentifier`.

### 3C — Nombre del token

El nombre refleja el punto físico, no los items:

| ❌ | ✅ |
|---|---|
| "Monedas + Diamante + Cofre" | "La Pila" |
| "Cofre con armadura" | "Arcón herrumbroso" |
| "Pociones y grimorio del alquimista" | "Armario del Alquimista" |

## Paso 4 — Informe final

Por escena:
- Piles colocados, nombre, items asignados y posición usada (pin de sala / pin general / posición por defecto).
- Items creados nuevos como world items.
- Salas sin tesoro (omitidas).
- Incidencias.

Recuerda al DM: *"Activa Item Piles y configura cada token como contenedor (tipo 'pile') para que los jugadores puedan abrirlos."*

## Notas técnicas

- **x,y en `place-tokens`**: esquina superior izquierda en píxeles. `y` nunca debe superar `height - gridSize` ni `x` superar `width - gridSize`.
- **`actorLink: false`**: imprescindible para que cada token sea independiente.
- **Macro obligatorio antes de `copy-world-item-to-actor`**: La app de escritorio de Foundry cachea el módulo y la función original no encuentra tokens de escena. Pide al usuario que ejecute el macro de parche una vez al inicio de la sesión (código en memoria `feedback_foundry_desktop_patch.md`). Sin él, fallará con "Actor not found".
- **`move-token` y `update-token` con Levels**: Si el módulo Levels está activo, mover tokens vía MCP falla con "level must exist". Usa un macro Script de Foundry para reposicionar, o borra y recrea el token en la posición correcta.
- **Monedas**: créalas como world items tipo `"loot"` con la cantidad en el nombre (p.ej. "500 Piezas de Oro").
- **Idempotencia**: `place-tokens` siempre crea nuevos. Si re-ejecutas, borra los piles previos con `delete-tokens`.
- **Equipo de NPCs**: no lo incluyas. El loot post-combate lo gestiona el DM o Item Piles automáticamente.
