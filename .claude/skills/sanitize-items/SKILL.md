---
name: sanitize-items
description: Sanea los objetos (items) de una carpeta del mundo de Foundry VTT — traduce al castellano nombre, descripción y descripción de chat, rellena con una descripción corta los objetos que no tengan ninguna, y propaga el resultado a las copias que ya tengan los actores, tokens e item piles. El alcance es SIEMPRE una carpeta concreta que indica el usuario, para no reprocesar lo ya hecho. Usar cuando el usuario diga "sanea los items de esta carpeta", "traduce los items", "pon los objetos en castellano", "revisa los objetos del capítulo N", "los objetos sin descripción", "traduce los conjuros del mundo" o cualquier variante de querer los objetos de Foundry en español y con descripción.
---

# Sanear objetos del mundo: castellano y descripciones mínimas

Skill monotarea: coge los **items de mundo** (`game.items`, la pestaña Objetos de la barra lateral) de **una carpeta concreta**, deja su texto en castellano, da una descripción corta a los que no tengan ninguna, y sincroniza las copias que los actores ya tuvieran.

**Qué hace y qué NO hace:**
- ✅ Traduce `name`, `system.description.value` (descripción) y `system.description.chat` (descripción de chat). También `system.unidentified.description` cuando existe.
- ✅ **Rellena** con una descripción breve los items que tengan la descripción vacía (Paso 2b).
- ✅ Conserva intacto el HTML, los enlaces y los enrichers de Foundry/Plutonium.
- ✅ Propaga el resultado a las copias embebidas en actores, tokens no vinculados e item piles.
- ✅ Deja un mapa `EN → ES` con los IDs, que sirve de registro de estado y lo pueden leer las demás skills.
- ❌ **No** procesa carpetas enteras del mundo por su cuenta: el alcance lo marca el usuario, carpeta a carpeta.
- ❌ **No** toca compendios (ni de Plutonium ni del sistema): solo items de mundo.
- ❌ **No** cambia mecánica: ni precios, ni rareza, ni propiedades, ni actividades, ni `identifier`.
- ❌ **No** inventa reglas, efectos, historia ni procedencia al escribir una descripción que falta.
- ❌ **No** crea ni borra items.

**Requisitos:** Foundry abierto y conectado por MCP, sesión de GM.

---

## Antes de empezar — Red de seguridad

Esta skill reescribe documentos del mundo. Si la carpeta del mundo es un repositorio git (`worlds/<mundo>/.git`), comprueba que **no haya cambios sin commitear** antes de tocar nada:

```bash
git -C "<Data>/worlds/<mundo>" status --short
```

- **Limpio** → adelante: hay un punto de restauración al que volver.
- **Sucio** → dile al usuario qué hay pendiente y ofrece commitearlo antes de empezar. Un commit hecho con Foundry abierto es una instantánea en caliente: sirve, pero la fiable se toma con el mundo cerrado.
- **No hay repo** → avísalo una vez y continúa si el usuario quiere; no es un bloqueo.

Si algo sale mal a media pasada, la recuperación es cerrar Foundry y:

```bash
cd "<Data>/worlds/<mundo>" && rm -rf data && git checkout <tag o commit> -- data
```

---

## Paso 0 — Fijar el alcance (una carpeta)

El alcance es **una carpeta del árbol de Objetos** (o varias si el usuario las enumera). Nunca "todo el mundo": sanear es caro en tokens y así las carpetas ya hechas no se vuelven a mirar.

1. **Si el usuario nombró la carpeta** (p.ej. "sanea los items de `03. The Astral Sea`"), úsala tal cual.
2. **Si no la nombró**, pregunta con `AskUserQuestion` ofreciendo las carpetas candidatas. Para saber qué carpetas hay, pídeselas al usuario (las ve en la barra lateral) o delega el inventario a un subagente — ver *Notas*.

Con la carpeta decidida:

```
manage-world-items { action: "list", folder: "<nombre de la carpeta>" }
```

Acepta nombre o ID de carpeta y devuelve `id`, `name`, `type`, `img`, `folderName` de cada item — **sin descripciones**. Apunta la lista de `id` + nombre: es tu cola de trabajo.

⚠️ **Nunca llames a `list` sin `folder`**: en un mundo poblado son cientos de items y la respuesta desborda el límite de salida de una tool (medido: 328 items ≈ 68 KB, no cabe). Si necesitas el total, hazlo carpeta por carpeta.

Si el usuario pide varias carpetas, trátalas **de una en una** de principio a fin (incluida su propagación) antes de pasar a la siguiente. Así una interrupción nunca deja una carpeta a medias.

---

## Paso 1 — Leer el registro de estado

Fichero de estado y mapa de nombres: `worlds/<mundo>/assets/traduccion_items.md`.

Formato (una tabla por carpeta, ordenada por nombre original):

```markdown
# Saneado de objetos — <título de la campaña>

## Carpeta: 03. The Astral Sea
| ID | Nombre original (EN) | Nombre traducido (ES) | Descripción | Fecha | Propagado |
|----|----------------------|-----------------------|-------------|-------|-----------|
| aB3xY9… | Staff of Power | Báculo de Poder | traducida | 2026-07-30 | ✅ |
| kL8mN2… | Golden Helm | Yelmo dorado | 🆕 generada | 2026-07-30 | ✅ |
```

- Columna `Descripción`: `traducida` (ya tenía texto) / `🆕 generada` (estaba vacía, Paso 2b) / `—` (sigue vacía porque no había nada cierto que decir).
- Si el fichero no existe, créalo con el encabezado.
- **Idempotencia:** los items cuyo `ID` ya figure con nombre traducido **se omiten**. Si toda la carpeta está registrada, informa "ya saneada" y no gastes ni una llamada más (salvo que el usuario pida rehacerla).
- Este fichero es la fuente para resolver nombres en inglés que aparezcan en el manifiesto, en el journal de Recursos o en otras skills.

---

## Paso 2 — Sanear por lotes

Por cada item pendiente, mira primero si tiene descripción:
- **Tiene texto** → tradúcelo (este paso).
- **`system.description.value` vacío** (o solo HTML hueco tipo `<p></p>`, espacios o `&nbsp;`) → escríbele una descripción corta (Paso 2b).

En ambos casos el nombre se traduce igual.

Por cada item pendiente:

```
manage-world-items { action: "get", id: "<id>" }
```

Devuelve el `system` completo, incluida la descripción HTML. Traduce y escribe:

```
manage-world-items {
  action: "update",
  updates: [
    { id: "<id>", name: "<nombre ES>",
      system: { description: { value: "<HTML ES>", chat: "<chat ES>" } } }
  ]
}
```

El `system` se fusiona de forma recursiva, así que mandar solo `description` **no pisa** precio, rareza, armadura, actividades ni nada más. Puedes agrupar varios items en un mismo `updates[]`.

### Tamaño de los lotes

Trabaja en tramos de **~40 KB de HTML** (≈ 5-10 items normales). Un item con descripción muy larga se traduce **solo**, en su propio tramo. Tras cada tramo, actualiza el fichero de estado antes de seguir: si te quedas sin contexto, la siguiente ejecución retoma exactamente donde lo dejaste.

### Qué se traduce

| Campo | Acción |
|---|---|
| `name` | Traducir |
| `system.description.value` | Traducir el texto, conservar el HTML |
| `system.description.chat` | Traducir (suele estar vacío → dejar vacío) |
| `system.unidentified.description` | Traducir **si existe y no está vacío** |
| `system.unidentified.name` | Traducir **si existe** — ver aviso |

⚠️ **Objetos sin identificar (`system.identified: false`).** En dnd5e el nombre que ven los jugadores sale de `system.unidentified.name`, no de `name`: el getter `name` devuelve el nombre enmascarado. Si traduces solo `name`, en la mesa se sigue leyendo el nombre viejo. Traduce **los dos** en la misma llamada. Si `unidentified.name` es un genérico del sistema (`"Unidentified Loot"`), tradúcelo igual (`"Botín sin identificar"`): también es texto que ven los jugadores.

### Qué NO se toca — nunca

- `system.identifier` (p.ej. `"1-armor"`) — es la clave por la que el Paso 3 encuentra las copias en los actores. Tocarla rompe la propagación.
- `system.source.*` (libro, página, reglas), `system.price`, `system.rarity`, `system.properties`, `system.type.value`, `system.activities`, `system.uses`, `system.armor`, `system.damage`… todo lo mecánico.
- `img` — el arte lo gestionan `describe-objects` y `populate-campaign`.
- Los nombres de las actividades (`system.activities.*.name`): en blanco dnd5e ya los muestra localizados; rellenarlos en castellano rompe esa localización automática.

### Reglas de HTML y enrichers — OBLIGATORIAS

1. **Estructura intacta.** Mantén etiquetas, clases (`rd__b`, `rd__list`, `entry-title-inner`…) y atributos `data-*` exactamente como están. Solo cambia el texto visible. Los encabezados incrustados de Plutonium (`<span class="entry-title-inner">Base items.</span>`) sí se traducen — es texto visible.
2. **Enrichers: no se toca el interior.** El destino de un enlace es un identificador, no texto.
   - `@item[Breastplate|XPHB]` → **déjalo igual**. Si necesitas que se lea en castellano y el enricher admite etiqueta, usa `@item[Breastplate|XPHB]{Coraza}`; si dudas, déjalo sin etiqueta antes que romper el enlace.
   - `@UUID[Compendium.dnd5e...]{Longsword}` → traduce **solo** lo de `{…}`: `{Espada larga}`.
   - `&Reference[prone]{Prone}` → traduce solo `{…}`.
   - `[[/damage 2d6 fire]]`, `[[/save dex 15]]`, `[[/check sleight]]`, `@Embed[…]` → **intactos**, incluidos los tipos de daño y las abreviaturas de característica.
3. **Terminología dnd5e.** Usa el glosario de `references/glosario-dnd5e.md` para que rareza, tipos de daño, estados y propiedades salgan siempre igual.
4. **Nombres propios.** Personajes, lugares y deidades se quedan en su forma original (Vecna, Kas, Neverdeath) salvo que el journal de la campaña ya use una versión castellana — en ese caso, manda la del journal.
5. **Registro y voz.** Segunda persona ("Tienes un bonificador de +1 a la CA mientras llevas esta armadura"), presente, tono de manual. Sin florituras añadidas ni información inventada.

---

## Paso 2b — Descripción corta para los items que no tienen ninguna

Hay objetos creados a mano o importados a medias que llegan con la descripción vacía. En la ficha se ven mudos, así que se les da un texto **breve y descriptivo**. La consigna es **corta y sin asunciones**: 1-3 frases, un solo `<p>` (dos como máximo).

**De dónde sale el contenido — solo de datos que ya existen en el item:**

| Fuente | Uso |
|---|---|
| `name` | Qué es la cosa (un yelmo, un diamante, una llave, un pergamino) |
| `type` (`weapon`, `equipment`, `consumable`, `loot`, `tool`, `container`…) | Categoría y para qué sirve |
| `system.type.value` (`food`, `trinket`, `heavy`, `gem`…) | Subtipo concreto |
| `system.rarity` | Solo si no es `common`: mencionar que es una pieza poco corriente |
| `system.properties` incluye `mgc` | Se puede decir que porta magia — **sin decir qué hace** |
| `system.price`, `system.weight`, `system.damage`, `system.armor` | Solo como color si aportan algo obvio (una pieza voluminosa, una gema de valor) |

**Prohibido — esto es lo que significa "sin asunciones":**
- No inventes **efectos, reglas, bonificadores, cargas, sintonización ni CD**. Si no hay reglas en el item, la descripción no menciona ninguna.
- No inventes **historia, procedencia, dueño anterior, ni relación con la trama** de la campaña.
- No decidas que un objeto es mágico porque el nombre suene evocador: solo si `rarity` o `properties` lo dicen.
- No metas spoilers: como en `describe-objects`, describe el aspecto externo, nunca lo que un objeto contiene o revela.
- Si el nombre es tan opaco que no puedes decir nada cierto (p.ej. "Notas ocultas"), quédate en lo mínimo verificable — "Un pequeño manojo de hojas manuscritas." — y no rellenes de paja.

**Formato:**

```html
<p>Una gema transparente y bien tallada, del tamaño de una uña. Pieza de valor destinada a la venta o al trueque.</p>
```

- Castellano, presente, tono de manual, misma terminología del glosario.
- No toques `system.description.chat` (déjalo vacío) ni `unidentified.description`.
- Anota el item en el registro como **descripción generada** para que el DM la revise y la amplíe si quiere: es un mínimo funcional, no una descripción de autor.

Si un item **ya tiene** descripción, este paso no aplica: se traduce y se deja como está. Nunca amplíes ni reescribas una descripción existente.

---

## Paso 3 — Propagar a las copias de los actores

Los items que ya se repartieron (inventarios de PNJ, mercaderes, cofres del loot) son **copias independientes**: editar el item de mundo no las cambia. Para eso está la acción `propagate-to-actors` de `manage-world-items`. Propaga igual las traducciones y las descripciones generadas en el Paso 2b.

**Primero en seco**, con los nombres originales para que el emparejado por nombre también funcione:

```
manage-world-items {
  action: "propagate-to-actors",
  propagateItems: [
    { id: "<id>", originalName: "Staff of Power" },
    { id: "<id>", originalName: "Potion of Healing" }
  ],
  dryRun: true
}
```

Lee la respuesta:

| Campo | Qué es |
|---|---|
| `matched` | Copias que cambiarían (o han cambiado) |
| `applied` | Copias escritas de verdad (**0** siempre en `dryRun`) |
| `summary[]` | Rollup por poseedor: `actorName`, `sceneName` si es token, y `count` |
| `changes[]` | Detalle (máx. 40): actor, token/escena, `from` → `to`, `matchedBy` |
| `changesOmitted` | Detalles recortados por el tope de 40 |
| `unmatchedWorldItems[]` | Items sin ninguna copia en el mundo |
| `ambiguousKeysIgnored` | Claves descartadas por ambiguas (ver abajo) |

Si el `summary` cuadra con lo que esperas, repite la llamada **sin** `dryRun` para aplicarlo.

- El emparejado ocurre dentro de Foundry, en cascada: `compendiumSource` → `system.identifier` → nombre (actual u `originalName`), y exige que **coincida el `type`** del item.
- **Una clave solo vale si es única en todo el mundo.** Esto es clave en la práctica: todos los items creados por el MCP nacen con `system.identifier: "new-item"`, así que en objetos homebrew el `identifier` se descarta como ambiguo (lo verás contado en `ambiguousKeysIgnored`) y el emparejado real lo hace el **nombre**. Por eso **pasa siempre `originalName`**: sin él, un item ya traducido no encuentra sus copias.
- Recorre todos los actores del mundo **y** los tokens no vinculados de todas las escenas (ahí viven los item piles). En los tokens no vinculados solo toca los items propios del token; los heredados ya siguen a su actor base.
- `fields` por defecto es `["name","description"]`. Añade `"img"` solo si también quieres arrastrar el icono.
- Es **idempotente**: si el texto ya coincide, no escribe nada. La comparación ignora cómo Foundry reescribe el marcado al guardar (`<br />` → `<br>`), así que una copia ya sincronizada no se vuelve a tocar. Contrapartida asumida: un cambio **solo de formato** (poner una palabra en negrita, convertir un párrafo en lista) no se propaga; los cambios de texto sí, que es lo que hace esta skill.
⚠️ **Propaga solo los items que has cambiado en esta pasada.** Existe el atajo `folder: "<carpeta>"` para propagar la carpeta entera, pero **no lo uses para cerrar una ejecución**: el item de mundo gana siempre, y muchas copias están **personalizadas a propósito** para su ubicación (la copia de un mapa en un cadáver añade "se encontraba en el cuerpo de…", la de un contrabando añade de qué cargamento venía). Propagar en bloque borra ese texto. El atajo sirve para **auditar** con `dryRun`: te dice qué copias divergen, y entonces decides una por una.

Un item en `unmatchedWorldItems` significa "nadie tenía copia": normal para objetos que aún no se han repartido. Anota en el registro `Propagado` = ✅ (aplicado) / — (sin copias).

---

## Paso 4 — Registro, panel de control e informe

1. **Actualiza** `worlds/<mundo>/assets/traduccion_items.md` con cada item saneado: ID, nombre EN, nombre ES, origen de la descripción, fecha y estado de propagación.
2. **Panel de control** (`Recursos — <campaña>`): si existe, localízalo con `list-journals` y regenera la página **"Objetos y conjuros"** con `update-journal-page`, poniendo el nombre en castellano en la columna `Objeto/Conjuro` con el original entre paréntesis — `Báculo de Poder (Staff of Power)`. **Conserva las demás columnas** (Categoría, Valor, Estado, Origen, Icono, Notas) tal como están: recompón la tabla desde su contenido actual, no la reinventes.
3. **Informe** al usuario:
   - Carpeta procesada y cuántos items saneados / omitidos por estar ya hechos.
   - Tabla EN → ES de esta ejecución.
   - **Descripciones generadas**: lista aparte, con el texto que has escrito, señalando que son mínimos revisables (y cuáles se quedaron sin descripción por falta de datos).
   - Propagación: cuántas copias actualizadas y en qué actores/escenas; qué items no tenían copias.
   - Carpetas que quedan pendientes, para la siguiente ejecución.

---

## Notas

- **Orden respecto a otras skills.** Sanea **después** de repartir el tesoro (`place-item-piles`) y de poblar mercaderes (`populate-merchants`): esas skills buscan items por nombre y el manifiesto los lista en inglés. Si ya has saneado y una skill posterior no encuentra un objeto, el mapa EN → ES de `traduccion_items.md` es la tabla de conversión.
- **Objetos sin descripción y sin traducir.** Un item puede necesitar las dos cosas: nombre en inglés y descripción vacía. Traduce el nombre y genera la descripción **en la misma llamada de `update`**; cuenta como un solo item en el registro.
- **Conjuros.** Se traducen igual, pero ojo: los imports del SRD y de Plutonium se buscan **por nombre en inglés**. Traducir el conjuro del mundo no rompe esos imports (van al compendio), pero sí las búsquedas por nombre en el mundo — otra razón para mantener el mapa al día.
- **Subagente para inventarios largos.** Si necesitas ver todas las carpetas y sus recuentos, lanza un subagente (`sonnet`) que llame a `list` y devuelva **solo** carpetas + número de items, no la lista completa. La traducción en sí hazla en la sesión principal: necesita el contexto de terminología de la campaña.
- **Solo GM.** `update` y `propagate-to-actors` requieren sesión de GM en Foundry; si falla con "Access denied", el usuario no está conectado como GM.
- **Si `propagate-to-actors` responde "No handler found for query"**, el módulo de Foundry está corriendo una versión cacheada: pide al usuario un `Ctrl+F5` en Foundry y reintenta.
