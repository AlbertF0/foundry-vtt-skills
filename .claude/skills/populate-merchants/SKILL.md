---
name: populate-merchants
description: Skill en dos partes para diseñar y poblar el inventario de mercaderes en Foundry. Parte 1 — diseño interactivo: lee el manifiesto, localiza mercaderes y, uno a uno, propone 20 objetos (oficiales o homebrew) según el tipo de comercio, rareza y nivel de PJs; el usuario elige y se generan descripciones para la IA de imagen. Parte 2 — poblado en Foundry: una vez el usuario ha puesto las imágenes, crea los items en el mundo y los asigna a los actores/tokens de cada mercader. Usar cuando el usuario quiera "diseñar el inventario de los mercaderes", "qué vende X", "poblar las tiendas", "añadir items a los comerciantes".
---

# Diseñar y poblar inventarios de mercaderes

Skill en dos partes. **Parte 1** es conversacional e interactiva: diseña el inventario de cada mercader junto al usuario. **Parte 2** es ejecutora: crea los objetos en Foundry y los asigna a los actores/tokens.

Cada parte puede ejecutarse de forma independiente:
- `/populate-merchants parte1` — solo diseño de inventario.
- `/populate-merchants parte2` — solo poblado en Foundry (requiere que la Parte 1 ya se haya ejecutado).
- `/populate-merchants` sin argumento → empieza siempre por la Parte 1.

---

## PARTE 1 — Diseño interactivo del inventario

### Paso 1.1 — Localizar mercaderes en el manifiesto

Lee `assets/manifiesto.md` (o el manifiesto del capítulo que indique el usuario). Busca NPCs con rol de venta o intercambio; son mercaderes los que cumplan alguno de estos criterios:

- El rol menciona "vendedor", "comerciante", "mercader", "tendero", "tabernero", "suministrador", "traficante", "trueque", "subasta" o similares.
- El NPC aparece en una escena de mercado, taberna, tienda o puerto.
- Su descripción menciona que vende, intercambia o tiene stock de algo.

Lista los mercaderes encontrados con nombre, rol breve y escena. Pregunta al usuario si quiere añadir o excluir alguno antes de continuar.

### Paso 1.2 — Procesar cada mercader (uno a uno)

Para cada mercader de la lista (en orden), **haz las tres preguntas siguientes en un solo mensaje** y espera respuesta antes de proponer nada:

> **Mercader: [Nombre]** — [rol breve, escena]
>
> Para diseñar su inventario necesito tres cosas:
> 1. **Tipo de objetos que comercia** — ¿Armas? ¿Pociones? ¿Objetos mágicos miscélaneos? ¿Consumibles? ¿Mundanos valiosos? ¿Información/documentos? ¿Mezcla? Describe el nicho de este vendedor con tus propias palabras.
> 2. **Rareza máxima del stock** — ¿Qué tan raros deben ser sus mejores objetos? (Mundano / Común / Poco Común / Raro / Muy Raro / Legendario). Los artículos más baratos siempre serán de menor rareza.
> 3. **Nivel de los PJs** — ¿Qué nivel tienen los personajes cuando visitan esta tienda? Esto calibra el poder, el precio y la utilidad de los objetos.

### Paso 1.3 — Proponer 20 objetos

Con las respuestas del usuario, genera una tabla de **20 objetos** candidatos. Mezcla libremente **oficiales** (del SRD, PHB, DMG, sourcebooks de D&D 5e) y **homebrew** (inventados pero coherentes con el mundo). Señala cuáles son cuáles.

**Criterios de la propuesta:**
- Variedad de tipos dentro del nicho declarado (no pongas 20 pociones si el mercader es "miscélaneo").
- Distribución de rareza realista: la mayoría en el rango bajo-medio, 2-3 objetos en la rareza máxima indicada.
- Precio orientativo en po, ajustado al nivel de los PJs (usa la tabla de precios del DMG como referencia base, ajustando por contexto del mundo).
- Al menos 5 objetos homebrew que encajen con la ambientación específica del capítulo/mundo.
- Ningún objeto que ya esté asignado a un NPC o loot concreto en el manifiesto (no vendas lo que los PJs pueden robar).

**Formato de la tabla:**

| # | Nombre | Tipo Foundry | Rareza | Precio (po) | Origen | Descripción mecánica breve |
|---|--------|-------------|--------|-------------|--------|---------------------------|
| 1 | ... | consumable / weapon / equipment / loot / tool | Común | 50 | Oficial (DMG p.187) / Homebrew | Una frase de qué hace |
| … | … | … | … | … | … | … |

Tipos Foundry válidos: `weapon`, `equipment`, `consumable`, `loot`, `tool`.

### Paso 1.4 — El usuario elige

El usuario responde con los números que quiere incluir (o con ajustes). Confirma la selección con una lista compacta y pregunta si quiere cambiar algo antes de continuar.

Si el usuario pide ajustes a algún objeto (cambiar rareza, precio, nombre, mecánica), incorpóralos antes de pasar al siguiente paso.

### Paso 1.5 — Generar descripciones visuales

Para cada objeto **seleccionado**, genera su archivo de descripción visual usando exactamente el formato de la skill `describe-objects` (misma estructura NOMBRE / TIPO / FUENTE / FONDO / FORMA Y MATERIALES / DETALLES Y ORNAMENTACIÓN / EFECTO VISUAL MÁGICO). Aplica las mismas reglas: sin spoilers, sin estilo artístico, descripción limpia y concreta.

Ruta de destino: `assets/Images/Chapter XX/Items/<slug>-descripcion.txt` (o `assets/Images/Items Generic/` si el objeto es genérico/reutilizable). Capítulo = el del mercader en el manifiesto.

Si el archivo ya existe y no hay imagen → reemplázalo. Si hay imagen → omítelo e indícalo.

### Paso 1.6 — Guardar el inventario

Guarda el inventario del mercader en `assets/Images/Chapter XX/Items/<slug-mercader>-inventario.md` (misma carpeta que las descripciones del capítulo; XX = capítulo del mercader). Estructura:

```markdown
# Inventario — [Nombre del mercader]

**Escena:** [nombre de la escena]
**Actor Foundry:** [nombre del actor tal como está en Foundry]
**Capítulo:** [XX]
**Generado:** [fecha]

## Objetos seleccionados

| Nombre | Tipo Foundry | Rareza | Precio (po) | Origen | Icono esperado |
|--------|-------------|--------|-------------|--------|----------------|
| Nombre del objeto | consumable | Poco Común | 150 | Homebrew | `assets/Images/Chapter XX/Items/slug.webp` |
| … | … | … | … | … | … |

## Descripción mecánica completa

### [Nombre del objeto]
[Descripción mecánica completa en castellano, lista para pegar en Foundry]

…
```

El campo **"Icono esperado"** es la ruta donde el usuario debe dejar la imagen generada por la IA. Es lo que usa la Parte 2 para detectar si el icono ya está listo.

### Paso 1.7 — Siguiente mercader

Informa cuántos mercaderes quedan y pasa al siguiente (Paso 1.2).

Al terminar todos los mercaderes, muestra un resumen:
- Mercaderes procesados: N
- Total de objetos diseñados: N
- Descripciones generadas: N
- Archivos de inventario en: `assets/Images/Chapter XX/Items/`

Recuerda: *"Cuando tengas el arte de cada objeto, guárdalo en la ruta indicada en 'Icono esperado' de cada inventario. Luego ejecuta `/populate-merchants parte2` para crear los items en Foundry y asignarlos a los mercaderes."*

---

## PARTE 2 — Poblado en Foundry

### Paso 2.1 — Leer inventarios guardados

Lista todos los archivos `assets/Images/Chapter **/Items/*-inventario.md`. Para cada uno, extrae:
- Nombre del mercader y actor de Foundry
- Capítulo y escena
- Lista de objetos con nombre, tipo, rareza, precio e icono esperado

### Paso 2.2 — Detectar iconos listos

Para cada objeto, comprueba si el icono esperado existe en disco (`.webp`, `.png`, `.jpg`, `.jpeg`). Separa:
- **Listo** → tiene imagen → se puede crear en Foundry.
- **Pendiente** → sin imagen → se omite esta vuelta (apunta en el informe).

Si ningún objeto de un mercader tiene imagen, sáltate ese mercader y avisa.

### Paso 2.3 — Crear items en Foundry

Para cada objeto **listo**, usa `manage-world-items` (action `create`) para crear el item en el mundo si aún no existe:
- `name`: nombre en castellano
- `type`: el tipo Foundry del inventario
- `img`: ruta relativa al Data de Foundry (e.g. `worlds/vecna-eve-of-the-ruin/assets/Images/Chapter 03/Items/slug.webp`)
- `system.description.value`: descripción mecánica del inventario (HTML mínimo: `<p>texto</p>`)
- `system.price.value` y `system.price.denomination`: precio en po
- `system.rarity`: `common` / `uncommon` / `rare` / `veryRare` / `legendary`
- `folderName`: carpeta del capítulo del mercader (`Cap. X: Nombre del capítulo` — busca la carpeta existente con `manage-world-items` action `list` para no duplicar)

Si el item ya existe en Foundry (mismo nombre en la carpeta), actualiza solo el `img` con `manage-world-items` action `update` — no lo recrees.

**Importante:** `manage-world-items` action `update` requiere `updates` como **array**: `[{"id": "...", "img": "..."}]`, no como objeto plano.

### Paso 2.4 — Asignar items al actor del mercader

Usa `manage-world-items` action `copy-world-item-to-actor` con `actorIdentifier` = nombre del actor en Foundry e `itemIdentifier` = nombre del objeto. Esto añade el item al inventario del actor base.

Si el actor ya tiene el item (ejecutar la skill dos veces), el sistema duplicará — comprueba primero con `get-character` o `search-character-items` si el item ya está en el inventario antes de copiarlo.

### Paso 2.5 — Actualizar tokens no vinculados en escena

Los tokens de NPCs en Foundry suelen ser **no vinculados** (unlinked): cada token es un actor sintético independiente. Añadir el item al actor base **no** lo propaga al token ya colocado en la escena.

Para cada mercader cuyo token esté colocado en una escena:
1. `switch-scene` a la escena del mercader.
2. `get-current-scene` con `includeTokens: true` para encontrar el token ID por nombre.
3. `copy-world-item-to-actor` con el **token ID** (no el actor ID) e `itemIdentifier` = nombre del objeto.

Repite para cada objeto del inventario de ese mercader.

### Paso 2.6 — Informe final

Por mercader:
- ✅ Items creados y asignados: lista de nombres
- ⏳ Items pendientes de imagen: lista de nombres + ruta esperada del icono

Al final: *"Para los items pendientes, genera el arte y guárdalo en la ruta indicada; luego vuelve a ejecutar `/populate-merchants parte2` — es idempotente."*

---

## Notas

- **Idempotencia**: la Parte 2 es segura de ejecutar varias veces. Solo crea items que no existen y solo asigna los que aún no están en el inventario del actor/token.
- **Homebrew vs oficial**: para objetos oficiales, usa el nombre en español si existe traducción canónica (p.ej. "Poción de Curación" no "Potion of Healing"). Para objetos importables de Plutonium, usa `plutonium-import` en vez de `manage-world-items create` para obtener la ficha completa con reglas.
- **Imágenes de respaldo**: si un objeto oficial no tiene imagen del usuario, busca el icono genérico del sistema D&D 5e que más encaje (Foundry usa iconos SVG del compendio por defecto; déjalo si no hay arte custom).
- **Precio en Foundry**: el sistema D&D 5e usa `system.price.value` (número) y `system.price.denomination` (`"gp"` para po). Si el precio está en pp o pe, ajusta `denomination` en consecuencia.
- **Mercaderes sin actor en Foundry**: si el mercader aún no existe como actor, avisa al usuario — la Parte 2 no puede asignar items sin un actor destino. Crea el actor primero con `populate-campaign` o `dnd5e-create-npc`.
