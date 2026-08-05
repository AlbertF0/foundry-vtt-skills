---
name: populate-campaign
description: Pobla un mundo de Foundry VTT tras adventure-onboarding, como una reconciliación en dos fases. FASE A: revisa lo que ya existe en Foundry (p.ej. importado de Plutonium) y le superpone las imágenes custom del usuario de las carpetas locales. FASE B: crea/importa lo que falta (mapas con muros, criaturas, objetos/conjuros — de Plutonium o del PDF homebrew) y lo añade, organizado por capítulo (monstruos genéricos en carpeta reutilizable). Crea escenas desde imágenes planas, Universal VTT .dd2vtt/.uvtt (muros/puertas/luces) o mapas oficiales de Plutonium. Usar cuando el usuario quiera "poblar la campaña", "crear/actualizar las escenas/fichas/actores", "montar el mundo" o diga que ya colocó los recursos o importó la aventura en Plutonium.
---

# Poblar campaña

Segunda fase tras `adventure-onboarding`: deja el mundo de Foundry montado (escenas, actores, objetos, journals), organizado por capítulo y con las imágenes custom del usuario.

Trabaja como una **reconciliación en dos fases**, porque puede que el usuario ya haya **importado la aventura desde Plutonium** (en el onboarding se le recomendó si existía), con lo que parte de los recursos ya están en Foundry:

- **FASE A — Reconciliar lo existente:** revisa lo que YA hay en Foundry (lo que trajo Plutonium) y, si el usuario tiene un recurso propio en las carpetas locales para esa entidad, **actualízalo** (superpón su imagen/arte custom).
- **FASE B — Rellenar huecos:** lo que **falte** (porque la aventura no lo traía, es homebrew, o el PDF tiene cosas custom) **créalo/impórtalo** y añádelo a lo ya existente, en su carpeta.

Todo **con Foundry abierto** vía las herramientas MCP `foundry-mcp`. Requiere el módulo **Plutonium** activo para importar fichas/mapas.

## Requisitos previos

1. Foundry abierto en el mundo correcto. Verifícalo con `get-world-info` (comprueba el `id` del mundo). Si responde otro mundo o nada, pídelo al usuario antes de seguir.
2. La carpeta del mundo tiene `campania/manifiesto.md`, `campania/texto_extraido.txt` y los recursos colocados en sus subcarpetas.
3. Carga los schemas MCP que vas a usar con ToolSearch: para leer/inventariar `list-journals`, `list-characters`, `list-scenes`, `manage-world-items` (action list); para marcar estados en el journal de Recursos `update-journal-page`; para reconciliar/crear `create-folder`, `create-scene`, `update-actor`, `set-scene-background`, `plutonium-search`, `plutonium-import`, `plutonium-search-adventure`, `plutonium-search-maps`, `plutonium-import-map`, `apply-walls`, y de respaldo `dnd5e-create-npc`, `dnd5e-add-feature`.

## Paso 0 — ¿La aventura está entera en Plutonium? (LO PRIMERO)

Antes de nada, comprueba con `plutonium-search-adventure` (nombre **original en inglés** de la aventura) si Plutonium la tiene. Esto decide la estrategia.

**Si la aventura ESTÁ en Plutonium (oficial):** existe una ruta rápida que aporta gran parte de los recursos ya hechos. Repártelo así (sé honesto sobre quién hace cada parte):
- **Mapas** → los traigo yo automáticamente con `plutonium-import-map` (mapa oficial con grid **y muros**), por cada escena. Ver Referencia — Escenas.
- **Criaturas/objetos/conjuros** → los traigo yo con `plutonium-import` (ficha completa). Ver Referencia — Actores / Objetos y conjuros.
- **Journals (texto de la aventura, notas de GM, handouts)** → si el usuario ya los importó desde la UI de Plutonium (Importar Aventura), estarán en Foundry y el **Paso 0.5** solo los traducirá. Si no los importó, el **Paso 0.5** los generará del PDF y los traducirá. En ningún caso necesitas pedirle al usuario que lo haga manualmente.

Informa al usuario de lo que Plutonium ofrece y confirma cómo quiere proceder (todo de Plutonium + sus imágenes encima / mezcla / todo del PDF+recursos). Luego sigue con los pasos normales, que ya usan Plutonium cuando aplica.

**Si NO está** (aventuras de la comunidad como A Wild Sheep Chase): flujo normal desde el PDF + recursos. (Aun así, escena por escena puede haber match de mapa suelto; ver Paso 5.)

### Regla transversal — superponer imágenes custom del usuario

Siempre que crees/importes una entidad desde Plutonium **y el usuario tenga una imagen propia para ella** en las carpetas locales, **sustituye la imagen de Plutonium por la del usuario**. Es uno de los objetivos clave: la ficha/mapa viene de Plutonium, pero el arte es el del usuario.
- **Actores** (criaturas/NPCs): tras `plutonium-import`, si hay retrato/token local, `update-actor` con `img`/`tokenImg`. (Ej.: Plutonium baja el zombi, pero usas tu imagen custom de zombi → la sustituyes.)
- **Escenas**: usa la opción 3 de "Referencia — Escenas" (`plutonium-import-map` con `backgroundOverride` = imagen local) o `set-scene-background` después.
- **Objetos**: `manage-world-items` action `update` con el nuevo `img`.
Empareja por nombre (los archivos del usuario no coinciden literalmente; usa similitud, y ante duda real pregunta).

## Paso 0.5 — Journal de la aventura: verificar, crear y traducir

El journal de la aventura (texto completo por partes/salas) es **necesario** para todo lo que viene después: `place-map-notes` lo usa para extraer anchors de sala; `place-encounter-tokens` lo usa para leer qué criaturas hay en cada sala; el DM lo usa como referencia durante la partida. Este paso lo garantiza **en castellano** antes de hacer nada más.

### A) ¿Ya existe el journal?

Con `list-journals`, busca un journal cuyo nombre coincida con el título de la aventura (en inglés o castellano; **no** el "Recursos — …"). Puede haber sido importado por el usuario desde la UI de Plutonium, o creado en una ejecución anterior de esta skill.

- **Sí existe** → salta directamente al sub-paso C (traducción).
- **No existe** → ejecuta el sub-paso B (crear desde PDF) y luego C.

### B) Crear el journal desde el PDF

Lee `campania/texto_extraido.txt` y estructura el contenido en **páginas**, una por parte/capítulo de la aventura (p.ej. Introducción, Parte 1, Parte 2, Parte 3, Parte 4, Apéndices). Usa un subagente (`sonnet`) para hacer la lectura y estructuración si el archivo es largo: pídele que devuelva el contenido de cada página en HTML limpio, sin el texto completo, para no saturar el contexto.

Estructura HTML de cada página:
- Cabecera principal → `<h1 id="slug-del-mapa">Nombre de la sección</h1>` (el `id` debe seguir el mismo criterio de slug que usa `place-map-notes`: minúsculas, espacios→guiones, conserva el punto, elimina apóstrofos).
- Salas/subsecciones → `<h2 id="N.-nombre-de-sala">N. Nombre de la sala</h2>`.
- Texto normal → `<p>`.
- **Texto de lectura a jugadores** (read-aloud, los bloques que el DM lee en voz alta) → `<blockquote class="rd__b--3">…</blockquote>`. Es crítico preservar este formato: son los bloques que distinguen lo que oyen los jugadores de las notas del DM.
- Tablas de encuentro → `<table>` con `<thead>` y `<tbody>`.
- Notas laterales / recuadros de reglas → `<aside>…</aside>`.
- Texto en negrita → `<strong>`, cursiva → `<em>`.

Crea el journal con `create-journal`:
- `name`: título de la aventura (en inglés por ahora; la traducción se aplica en C).
- `folderName`: el de la campaña.
- `pages`: array con una entrada por parte, cada una con su HTML.

### C) Traducir al castellano

Independientemente de si el journal vino de Plutonium o del PDF, **tradúcelo al castellano** página a página. Usa un subagente (`sonnet`) por página para no saturar el contexto: dale el HTML de la página y pídele la versión traducida siguiendo estas reglas, **sin excepciones**:

**Reglas para el subagente de traducción:**

1. **Preserva toda la estructura HTML exactamente**: tags, atributos, `id`, `class`, `data-*`, anidación. No añadas ni quites ningún elemento. Solo traduce el contenido de texto dentro de los tags.
2. **Preserva los shortcodes de Foundry/5etools tal cual**: `@UUID[…]`, `@Actor[…]`, `@Item[…]`, `@JournalEntry[…]`, `{@creature goblin}`, `{@spell fireball}`, `{@damage 2d6}`, etc. No los toques.
3. **No traduzcas nombres propios de personajes** (Gundren, Sildar, Klarg, Nezznar, Cragmaw, Phandalin, Thundertree, Glasstaff…) salvo que ya tengan una versión establecida en castellano (Gundren Peñabuscador, Sildar Hallinvierno…). Si existe la traducción oficial, úsala.
4. **Texto de lectura a jugadores** (`<blockquote class="rd__b--3">` o similar): tradúcelo con especial cuidado, respetando el tono narrativo y en segunda persona si el original está en segunda persona. Es lo que oirán los jugadores.
5. **Términos de juego**: usa la terminología D&D 5e en castellano donde exista (Puntos de Golpe / PG, Tirada de Salvación, Clase de Armadura / CA, Bono de Competencia, etc.). Ante duda, mantén el término en inglés entre paréntesis la primera vez.
6. **Headers de sala**: traduce el nombre de la sala pero conserva el número y el `id` original del tag (`id="2.-goblin-blind"` → no cambia aunque el header diga "2. Emboscada Goblin").
7. **No reestructures**: devuelve exactamente el mismo árbol HTML, solo con el texto traducido.

Aplica la traducción con `update-journal-page` por cada página (journal + nombre de página). Si la página aún no existe (journal creado en B), usa `createIfMissing: true`.

### D) Verificar

Tras crear/traducir, confirma con `list-journals` + lectura de una página que el journal existe con contenido en castellano. Si alguna página quedó en inglés por error, repite la traducción de esa página.

---

## Paso 1 — Recuperar el análisis y leer el journal de Recursos

1. **Lee el journal de Recursos** (`Recursos — <aventura>`) que creó el onboarding: con `list-journals` localízalo y lee sus páginas (Mapas, Criaturas, Objetos y conjuros). **Es la fuente de verdad**: el estado de cada fila decide qué hacer con ese recurso (ver leyenda). Si no existe el journal (onboarding antiguo o sin Foundry), usa `manifiesto.md` como respaldo.
2. Lee `manifiesto.md` y `texto_extraido.txt` para completar el análisis: capítulos/escenas, CR y origen de cada criatura (bestiario o stat block propio), reglas de objetos, etc.
3. Escanea recursivamente `campania/` y lista los archivos de imagen reales. Los nombres del usuario **no coinciden** literalmente (p.ej. `Brown Bear - Noke Guard Polymorph.png`): empareja por similitud. Ante duda real, pregunta; no inventes rutas.
4. Reparte las entidades por **capítulos** (cada NPC/objeto/escena al capítulo de primera aparición). **Los monstruos genéricos NO van por capítulo**: carpeta `Monstruos`.

**Cómo decidir, por fila:** el **estado** dice *cuánto falta*; la columna **Origen** dice *cómo* hacerlo.

Por estado (cuánto falta):
- ⬜ **Pendiente** o 🟦 **Material reunido** → hay que montarlo (FASE B): créalo/impórtalo según su Origen.
- 🟨 **Parcial** → ya existe en Foundry pero le falta algo (FASE A): complétalo (superpón imagen custom, añade token, aplica muros/luces…), sin recrear.
- 🟩 **Completado** → no toques nada (a lo sumo verifica). **Las escenas marcadas 🟩 no se modifican bajo ningún concepto — ni fondo, ni grid, ni muros.**
- ⬛ **Omitido** → ignóralo.

Por Origen (cómo montarlo cuando toca crear):
- **Plutonium** → `plutonium-import` (criatura/objeto/conjuro) / `plutonium-import-map` (mapa). Si el usuario ya importó la aventura entera en Plutonium, puede que ya exista en Foundry → entonces es 🟨 y solo completas.
- **Local** → usa la imagen/mapa del usuario (`create-scene` desde su archivo o UVTT; `update-actor` para retrato/token; etc.).
- **PDF** (homebrew) → créalo desde el PDF (`dnd5e-create-npc` + features, `manage-world-items`, …).

Aplica siempre la **regla de overlay**: si hay imagen custom local, superponla sobre lo importado de Plutonium.

Tras poblar, **actualiza el journal de Recursos** con `update-journal-page` (carga su schema con ToolSearch si hace falta), regenerando las páginas **desde el estado real de Foundry** para reflejar el progreso:
- **"Mapas"**: por escena, pon la columna **"Escena creada"** en 🟩 **Completado** (escena existe con su fondo/grid) o 🟨 si quedó a medias. **No toques** las columnas "Notas de sala" ni "Tokens" (son de `place-map-notes` y `place-encounter-tokens`): léelas de la página actual y consérvalas. Si la página es del formato antiguo (columna única "Estado"), reescríbela al formato por fases `Escena/Mapa | Escena creada | Notas de sala | Tokens | Origen | Ruta/Notas` deduciendo cada columna del estado real.
- **"Criaturas"** y **"Objetos y conjuros"**: marca 🟩 cada fila cuyo actor/objeto ya exista en Foundry (de `list-characters` / `manage-world-items` list), 🟨 si está a medias, ⬜ si falta, ⬛ si se omitió.

Construye una tabla mental (o un `campania/plan-poblado.md` si la campaña es grande) con: entidad → tipo → carpeta destino → archivo(s) de imagen → origen de la ficha.

## Paso 2 — Inventario de lo que YA existe en Foundry

Antes de crear nada, mira qué hay ya en el mundo (lo que pudo traer una importación de aventura de Plutonium): `list-characters` (actores/NPCs), `list-scenes` (escenas), `list-journals` (journals), `manage-world-items` action `list` (objetos).

Empareja cada documento existente con su entidad del análisis (Paso 1) por nombre/similitud. Marca cada entidad como **YA EXISTE** (→ FASE A) o **FALTA** (→ FASE B). Si el mundo está vacío (el usuario no importó la aventura), todo será FASE B.

## Paso 3 — FASE A: reconciliar lo existente

Para cada entidad marcada **YA EXISTE**, no la recrees; solo ajústala:
1. **Superpón la imagen custom del usuario** si la hay en las carpetas locales (objetivo clave). Empareja por similitud de nombre:
   - Actores → `update-actor` (`img` retrato, `tokenImg` token).
   - Escenas → `set-scene-background` (o reimporta con `backgroundOverride` si procede).
   - Objetos → `manage-world-items` action `update` con el nuevo `img`.
2. **Colócala en su carpeta** por capítulo si no lo está (`update-actor` `folderName`, etc.). Ver convención en Paso 4.
3. Renombra a español si el usuario lo quiere (lo importado de Plutonium viene en inglés).

No dupliques: si ya existe, se actualiza, no se crea otra.

## Paso 4 — FASE B: rellenar lo que falta

Para cada entidad marcada **FALTA** (la aventura no la traía, es homebrew, o es custom del PDF), créala/impórtala y añádela a lo existente, en su carpeta del capítulo. El "cómo" está en las secciones de referencia de abajo:
- **Carpetas** → sección "Estructura de carpetas".
- **Actores** (criatura de bestiario → `plutonium-import`; homebrew del PDF → `dnd5e-create-npc` + features) → sección "Actores".
- **Objetos / conjuros** → sección "Objetos y conjuros".
- **Escenas** (Plutonium / imagen local / UVTT) → sección "Escenas".

Tras crear cada entidad, aplícale la **regla transversal de overlay** (imagen custom del usuario si la hay).

---

## Referencia — Estructura de carpetas (convención del onboarding)

Crea las carpetas con `create-folder` (es idempotente). Nombres en español:

- **Escenas** → carpeta `Scene` por capítulo: **`XX.Nombre del capítulo`** donde `XX` es el número de orden del capítulo con dos dígitos (01, 02, 03…). Ej.: `01.Introducción`, `02.Goblin Arrows`, `03.Phandalin`.
- **NPCs** → carpeta `Actor` por capítulo con el mismo nombre (`XX.Nombre del capítulo`): donde el NPC aparece por primera vez.
- **Monstruos genéricos** → carpeta `Actor` única `Monstruos` (un lobo del cap. 1 es el mismo del cap. 7).
- **Objetos / conjuros** → carpeta `Item` por capítulo con el mismo esquema.

Regla monstruo vs NPC: criaturas de bestiario reutilizables (lobo, oso, zombi…) → `Monstruos`. NPCs con nombre propio y rol narrativo (el villano, el que da la misión, un secuaz único) → carpeta del capítulo, aunque tengan ficha de combate.

**Regla de reutilización entre capítulos:** un monstruo genérico que ya existe en la carpeta `Monstruos` de un capítulo anterior **es reutilizable** — no lo reimportes, solo actualiza su retrato/token si el usuario tiene uno nuevo. Un NPC con nombre propio (p.ej. "Sariel") que use el stat block de Vampire Spawn **no es** el mismo actor que el Vampire Spawn genérico: son dos actores distintos. Si en este capítulo aparecen Vampire Spawns anónimos Y ya existen de un capítulo anterior, reutiliza el existente. Si aparece un NPC nombrado que usa ese stat block, créale su propio actor aparte en la carpeta del capítulo.

**Carpetas de imágenes locales para actores (convención del proyecto):**
- Retratos de NPCs únicos del capítulo → `assets/Creatures/Portraits/Chapter N/`
- Retratos de monstruos de combate (genéricos o sin capítulo fijo) → `assets/Creatures/Portraits/Monsters/`
- Retratos de criaturas completamente genéricas y reutilizables → `assets/Creatures/Portraits/generic/`
- Tokens de NPCs del capítulo → `assets/Creatures/Tokens/Chapter N/`
- Tokens de monstruos → `assets/Creatures/Tokens/Monsters/`
- Tokens genéricos → `assets/Creatures/Tokens/Generic/`

Busca el retrato/token de cada actor en estas tres ubicaciones antes de declarar que no hay imagen local.

## Referencia — Actores (monstruos y NPCs)

Para cada criatura, **prioriza importar la ficha completa** en vez de construirla a mano:

1. **Está en el bestiario** (la mayoría): `plutonium-search` con `category: "creature"` y el nombre en inglés para confirmar nombre/`source`; luego `plutonium-import` con ese `name`/`source`, `customName` = nombre final en español (p.ej. "Lobo (guardia de Noke)") y `folderName` = `Monstruos` o el capítulo. Esto crea el actor con stat block completo.
2. **Stat block propio del PDF / homebrew** (no está en ningún bestiario, p.ej. un "Bed Dragon Wyrmling"): `dnd5e-create-npc` con todos los campos del stat block, y luego `dnd5e-add-feature` por cada acción/ataque/rasgo/conjuros (featureType: passive, attack, save, attack-with-save, aura, spellcasting, spells). Biografía (`biography`, HTML en español) con la descripción y notas de rol del PDF. Si es una variante de una criatura existente, puedes importar la base con Plutonium y ajustar.
3. **NPCs sin combate** (p.ej. el que da la misión): `dnd5e-create-npc` con stats mínimos coherentes y biografía rica en español.

**Regla — columna "Quién es" a la biografía:** para todo NPC con fila en la tabla de NPCs del manifiesto o en la página "Criaturas" del journal de Recursos, el texto de su columna **`Quién es`** va como primera línea de `biography` (envuélvelo en `<p><strong>` para que destaque, p.ej. `<p><strong>Quién es:</strong> lavandera enferma, pasa sus últimas horas en casa, sabe el 3r fragmento de la canción.</p>`), seguido del resto de la biografía si el PDF da más detalle. Esto **solo funciona en el momento de creación** con `dnd5e-create-npc` (parámetro `biography`, que escribe en `system.details.biography.value`, la pestaña "Details" de la ficha) — no hay tool en el MCP para editar la biografía de un actor **ya existente** (p.ej. uno importado de Plutonium en el Paso "reconciliar"). Para esos casos, anota en el informe final la lista de NPCs cuya columna "Quién es" no se pudo volcar a la ficha, para que el usuario la copie a mano o pida una macro de Foundry.

Después de crear cada actor, asígnale sus imágenes con `update-actor`: `img` = retrato, `tokenImg` = token (rutas relativas a Data, p.ej. `worlds/test/campania/monstruos/tokens/lobo.png`), `folderName` si no lo pusiste al importar, `newName` si hace falta. **No** coloques tokens en escenas todavía (eso es una fase posterior).

**Regla — Nombre en el Prototype Token:** `update-actor` con `newName` actualiza tanto `actor.name` como `prototypeToken.name` (corregido en el módulo). Los tokens nuevos arrastrados desde el sidebar mostrarán el nombre correcto. Para tokens **ya colocados en escena antes de hacer el NPC vinculado**, usa `switch-scene` + `update-token` (`updates.name`) si hace falta renombrarlos — `update-token` solo opera en la escena activa. Los NPCs vinculados (`actorLink: true`) ya no requieren este paso para cambios de items, pero sí para el nombre si el token fue colocado antes del renombrado.

**Regla — Dynamic Token Ring desactivado:** al crear o importar cualquier actor, desactiva siempre el anillo dinámico del token. Si `update-actor` expone el parámetro (`ringEnabled: false` o similar), pásalo en la misma llamada. Si no lo expone, anótalo en el informe final como tarea pendiente para que el usuario lo desmarque manualmente en la ficha de cada actor (pestaña Token → Dynamic Token Ring → desmarcar "Enabled").

**Regla — NPCs siempre con token vinculado (`actorLink: true`):** Todos los actores con nombre propio y rol narrativo (los que van en carpetas de capítulo, no en `Monstruos`) deben tener su token prototipo **vinculado**. Pasa `actorLink: true` en la misma llamada a `update-actor` que ya usas para asignar imagen/token. Un token vinculado refleja en tiempo real cualquier cambio del actor base (items, HP, habilidades), por lo que **no hay que actualizar los tokens colocados en escenas** cuando se añaden o quitan objetos al actor.

Los **monstruos genéricos** (carpeta `Monstruos`) deben quedar **no vinculados** (comportamiento por defecto): cada instancia en escena puede tener distinto HP o estado.

`dnd5e-create-npc` deja los actores en una carpeta `Foundry MCP Creatures`; al moverlos con `update-actor` esa carpeta queda vacía. Bórrala al final con `delete-documents` (`folders: [{name: "Foundry MCP Creatures", type: "Actor"}]`).

**Regla — Objetos en inventario de NPC/criatura:** tras crear o importar un actor, lee su descripción en el journal (o el texto del PDF) y detecta si porta objetos con entidad propia como item de mundo — no equipo genérico estándar (espada larga, armadura de cuero…), sino objetos con nombre propio o mecánicas especiales (Lengua de Fuego, Varita de Bolas de Fuego, Manto del Engaño…). Si el objeto ya existe en Foundry como item de mundo, usa `manage-world-items` action `copy-world-item-to-actor` (`actorIdentifier` = nombre del actor, `itemIdentifier` = nombre del objeto) para copiárselo al inventario. Si el objeto aún no existe, créalo primero (ver "Referencia — Objetos y conjuros") y luego cópialo. Reporta en el informe cada objeto asignado a su actor.

Para **NPCs vinculados** (`actorLink: true`), asignar el objeto al actor base es suficiente — los tokens en escena lo reflejan automáticamente. Para **monstruos no vinculados**, habría que copiar el item a cada token de escena por separado (ver `copy-world-item-to-actor` con token ID).

Apunta los nombres exactos de los actores creados.

## Referencia — Objetos y conjuros

**Regla transversal — nombre y descripción siempre en castellano:** tanto el nombre (`name`) como la descripción (`system.description.value`) de todo objeto en Foundry deben estar en castellano, sin excepción.
- **Importado de Plutonium** (viene en inglés): tras `plutonium-import`, usa `manage-world-items` action `update` para sobrescribir `name` con el nombre en castellano y `system.description.value` con la traducción de la descripción.
- **Creado desde el PDF**: escribe `name` y `system.description.value` directamente en castellano.

**Por categoría (según el manifiesto):**

- **`Mágico`** (existe en 5etools): `plutonium-import` con `category` `item` o `spell`, `folderName` = capítulo. Luego traduce la descripción al castellano con `manage-world-items` action `update`. Aplica icono custom del usuario si existe.
- **`Mundano`** (barriles, gemas, obras de arte, equipamiento con valor): `manage-world-items` action `create`, tipo `loot`/`consumable`/`equipment`, descripción en castellano, y si el manifiesto indica valor rellena `system.price.value` (número) + `system.price.denomination` (`"gp"`, `"sp"`, etc.). Icono custom si existe.
- **`Plot`** (diarios, llaves, mapas, cartas): `manage-world-items` action `create`, tipo `loot` o `consumable`, descripción en castellano con la función narrativa. Icono custom si existe.
- **Homebrew con reglas mecánicas** (objeto único con propiedades especiales del PDF): `manage-world-items` action `create`, tipo adecuado, descripción en castellano con reglas completas, `system.price.value` si el PDF indica valor.

## Referencia — Pilas de objetos (Item Piles)

Cuando en el texto de la aventura una sala tiene un objeto especial **físicamente presente** en la sala (está sobre una mesa, en un cofre, colgado de la pared, escondido bajo el suelo…), coloca en esa escena un actor token "Generic item pile" y mete el objeto dentro. Así los jugadores pueden interactuar con él en la mesa.

**¿Qué cuenta como "objeto en una sala"?**
- El texto dice explícitamente que está en la sala ("a ruby pendant lies on the altar", "a chest contains a Spell Scroll of Flame Strike"…).
- También objetos en trampas con recompensa visible, tesoros de monstruos que lo lleven encima **solo** si tienen entidad propia como objeto de mundo (no monedas genéricas).
- NO cuentas: objetos que se dan como recompensa tras un combate sin ubicación física, ni dinero/recursos genéricos sin ficha de mundo.

**Solo aplica a objetos que YA EXISTEN como ítems de mundo en Foundry** (`manage-world-items` action `list`). Si un objeto aún no existe como item de mundo, créalo primero (ver "Referencia — Objetos y conjuros") y luego coloca la pila.

**Flujo por sala:**

1. **Detectar** el objeto en el texto del journal (sala por sala).
2. **Confirmar** que el actor "Default Item Pile" existe en Foundry (`list-characters` sin filtro de tipo, buscando "Default Item Pile"). Es un actor global reutilizable configurado con Item Piles; no lo crees tú — el usuario debe haberlo creado ya. Si no existe, repórtalo como pendiente y pasa a la siguiente sala.
3. **Cambiar a la escena correcta** con `switch-scene` (necesario para colocar el token).
4. **Colocar el token** del actor "Default Item Pile" en la sala usando `place-tokens`:
   - `actorName`: `"Default Item Pile"`
   - `sceneId` o nombre de la escena activa
   - Posición: usa el pin/nota de sala de esa sala como referencia (igual que `place-encounter-tokens` en MODO SALA); si no hay pin, coloca en el centro de la sala estimado o en MODO FILA ABAJO como fallback.
5. **Copiar el objeto dentro del pile** con `manage-world-items` action `copy-world-item-to-actor`:
   - `actorIdentifier`: nombre o ID del token de pila recién creado (o el actor base "Generic item pile" si es el único en la escena — Foundry copia el item al actor base y se propaga al token).
   - `itemIdentifier`: nombre del objeto de mundo.

**Nota:** `copy-world-item-to-actor` copia el item del compendio de ítems de mundo al inventario del actor, sin modificar el item original. El token "Default Item Pile" en la escena mostrará el contenido cuando los jugadores hagan clic en él (requiere el módulo **Item Piles** activo en Foundry).

**Informe:** añade una sección "Pilas de objetos" al informe final con cada sala procesada: sala → objeto colocado → ✅ / ⚠️ pendiente (si Generic item pile no existía o la escena no tenía mapa).

## Referencia — Escenas (una por una)

Para **cada escena** que haya que crear, sigue este flujo en orden:

### Paso 5.1 — ¿Existe el mapa en Plutonium?

Llama a `plutonium-search-maps` con el nombre del mapa/localización en **inglés** (el nombre original de la aventura, no la traducción).

- Detección **fiable para mapas oficiales** (WotC). Para **homebrew** es best-effort: la respuesta trae `homebrewLoaded`; solo aparece si el usuario ha abierto el importador de Plutonium esta sesión. Si no encuentra nada (lo normal en aventuras comunitarias), **salta al Paso 5.3** y monta desde las carpetas.
- (Opcional, una vez por campaña: `plutonium-search-adventure` con el nombre de la aventura, para informar al usuario de que Plutonium tiene la aventura entera y podría importarla él desde la UI de Plutonium.)

### Paso 5.2 — Si hay coincidencia: preguntar al jugador (por escena)

Con `AskUserQuestion`, **una pregunta por escena** (cada mapa puede elegir distinto). Tres opciones:

1. **Plutonium solo** → la importas tú automáticamente con `plutonium-import-map` (`name`, `source`, `customName` = `XX.Nombre de la escena` en español (por orden de aparición), `folderName` = `XX.Nombre del capítulo`). Trae el mapa oficial con su grid, sus **muros** y pins de región. *(Requiere que Plutonium tenga la fuente de imágenes configurada; si la importación falla por eso, avisa y ofrece el Paso 5.3.)*
2. **El mapa de las carpetas** → crea la escena con el recurso local del usuario (Paso 5.3: imagen plana o UVTT).
3. **Plutonium primero y luego sobrescribir con el mapa de las carpetas** → `plutonium-import-map` con `backgroundOverride` = ruta (relativa a Data) de la imagen local del usuario. Mantiene el **grid y los muros oficiales de Plutonium** pero muestra la imagen del usuario. (Equivale a `plutonium-import-map` + `set-scene-background`.) **Útil cuando el usuario tiene una imagen plana cuyas paredes coinciden con el mapa oficial.**

Si no hay coincidencia, no preguntes: ve al Paso 5.3.

### Paso 5.3 — Montar desde las carpetas (Caso A o B)

#### Caso A — Imagen plana (`.webp`/`.png`/`.jpg`)

`create-scene`:
- `name` = **`XX.Nombre de la escena`** donde `XX` es el número de orden de aparición de la escena en la aventura (con dos dígitos, 01, 02, 03…, global para toda la campaña). Ej.: `01.Guarida Cragmaw`, `02.Phandalin`, `03.Guarida Bandas Rojas`. `folderName` = carpeta del capítulo (`XX.Nombre del capítulo`), `imagePath` = ruta relativa a Data del mapa.
- Las dimensiones de la escena se toman solas del tamaño real de la imagen.
- `gridSize` 100 por defecto. Si el nombre del archivo o el manifiesto indican la cuadrícula (p.ej. "30x30"), calcula `gridSize` = ancho_px / nº_casillas para que el grid cuadre con el mapa.
- Interiores/día: `globalLight: true`. Exteriores nocturnos o mazmorras: sube `darkness` y/o `globalLight: false`.
- No actives las escenas (`activate` por defecto false) salvo que el usuario lo pida.
- Esta vía **no pone muros** (ver Caso B y la nota de imágenes sin datos abajo).

#### Caso B — Universal VTT (`.dd2vtt` / `.uvtt` / `.df2vtt`)

Estos archivos son JSON con la imagen del mapa incrustada en base64 **más** los datos de muros, puertas y luces que puso el autor. Flujo automático (un mapa = una escena completa con muros):

1. **Extraer imagen + metadatos** con el script:
   ```
   python scripts/extract_uvtt.py "<carpeta_mundo>\campania\mapas\...\mapa.dd2vtt"
   ```
   Devuelve JSON con `image` (ruta absoluta del `.webp` extraído), `image_size`, `pixels_per_grid`, `portals`, `lights`. Convierte la ruta de imagen a **relativa a Data** (`worlds/<mundo>/campania/...`).
2. **Crear la escena** con `create-scene`: `imagePath` = imagen extraída, `gridSize` = `pixels_per_grid` del UVTT (clave para que los muros alineen), `folderName` = capítulo.
3. **Aplicar muros/puertas/luces** con `apply-walls`: `sceneIdentifier` = nombre de la escena, `uvttPath` = ruta relativa a Data del `.dd2vtt`, `includeWalls: true`, `includeDoors: true`, `includeLights: true`, `clearExisting: true`. Es exacto: las coordenadas las puso el autor.

Nota: algunos UVTT incrustan solo un plano de líneas con fondo transparente (blueprint) en vez del mapa pintado; en ese caso la escena se verá "vacía con muros" — es el contenido del archivo, no un fallo. El campo `transparent_blueprint`/tamaño del script y una mirada al `.webp` extraído lo delatan; avísalo en el informe.

#### Imágenes planas sin datos de muros

NO inventes paredes a ojo — saldrían desalineadas. Avisa al usuario de que para ese mapa, si quiere muros, hay que conseguir su versión Universal VTT (del creador del mapa, Moulinette…) o generar un `.uvtt` con una herramienta de detección (p.ej. **Auto-Wall**), y luego volver a pasar la escena por el Caso B. Las puertas se marcan a mano en esas herramientas. Un UVTT estándar ya trae el hueco del muro donde va cada puerta.

## Paso 5 — Verificar e informar

1. Verifica con `list-scenes` y `list-characters` que todo aparece, y pide al usuario que confirme visualmente (carpetas, una ficha de actor con su retrato/token, una escena con su grid).
2. Informe final en español, separando lo de cada fase: **reconciliado** (lo que ya existía y se actualizó/superpuso imagen) vs **creado nuevo** (FASE B); escenas (dimensiones y grid), actores por carpeta (origen: Plutonium/PDF), objetos/conjuros por capítulo, e incidencias (recursos sin emparejar, entidades no encontradas).
3. Siguiente paso sugerido: colocar los tokens de los actores en sus escenas (fase futura).

## Notas

- Idempotencia: `create-folder` no duplica; `plutonium-import`, `create-scene` y `dnd5e-create-npc` **sí** crearían duplicados si se reejecutan. Antes de reimportar, comprueba con `list-characters`/`list-scenes` lo que ya exista y omítelo o avisa al usuario.
- Todo el contenido visible (nombres, biografías, descripciones) en español, aunque el origen esté en inglés.
