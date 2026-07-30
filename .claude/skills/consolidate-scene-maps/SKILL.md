---
name: consolidate-scene-maps
description: Consolida dentro del mundo de Foundry VTT los mapas y tiles de las escenas que viven fuera de él — importaciones de Moulinette, carpetas de módulos o URLs remotas — moviéndolos a assets/maps/ y renombrándolos con el nombre de la escena, y quitando la pista de audio a los mapas en vídeo. Usar cuando el usuario diga "los mapas no están donde tocan", "he importado mapas con Moulinette", "consolida los mapas", "voy a hacer copia del mundo y pierdo los mapas", "mueve los mapas al mundo", "renombra los mapas como las escenas" o "quita el sonido a los mapas de vídeo".
---

# Consolidar los mapas de las escenas dentro del mundo

Skill monotarea: hace que **una copia de la carpeta del mundo sea autosuficiente**. Recorre las escenas, detecta los mapas y tiles que apuntan fuera de `worlds/<mundo>/`, los trae dentro renombrados con el nombre de la escena, y reescribe las rutas en Foundry.

**Qué hace y qué NO hace:**
- ✅ Audita **fondo, foreground (overhead) y todos los tiles** de cada escena.
- ✅ Trae al mundo lo que esté en `moulinette/`, `moulinette-v2/`, `modules/` o cualquier ruta fuera del mundo.
- ✅ Descarga al mundo los fondos que apunten a **URLs remotas** (`https://…`).
- ✅ Reordena dentro del mundo los mapas que estén en una subcarpeta que no es la de mapas.
- ✅ Renombra el fondo con el **nombre de la escena** (`03.Market` → `03.Market.webp`).
- ✅ Quita la **pista de audio** a los mapas en vídeo (`.webm`, `.mp4`) sin recodificar la imagen.
- ✅ Reescribe las rutas en Foundry con `manage-scene-assets`.
- ❌ **No** toca retratos, tokens, iconos de objeto ni imágenes de journal: solo **mapas y tiles de escena**.
- ❌ **No** borra los archivos de origen (ver *Limpieza opcional*).
- ❌ **No** recodifica vídeo ni cambia resolución, grid, muros ni luces.

**Requisitos:** Foundry abierto y conectado por MCP, sesión de GM, y `ffmpeg` disponible si hay mapas en vídeo.

---

## Paso 0 — Comprobar ffmpeg

Solo hace falta si aparecen mapas en vídeo. Por orden:

1. `ffmpeg -version` (si está en el PATH).
2. Ruta de la instalación por winget: `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*-full_build\bin\ffmpeg.exe`.
3. Si no está en ninguna: `winget install --id Gyan.FFmpeg -e --accept-package-agreements --accept-source-agreements`. Tras instalar, **el PATH nuevo no llega a la sesión actual**: usa la ruta absoluta del `.exe` en esta ejecución.

Guarda la ruta que funcione; se usa en el Paso 4. `ffprobe` está junto a `ffmpeg`.

---

## Paso 1 — Auditar las escenas

```
manage-scene-assets { action: "list", onlyExternal: true }
```

Sin `sceneIdentifier` escanea **todas** las escenas. `onlyExternal: true` deja solo lo que hay que arreglar, y es lo que mantiene la respuesta pequeña.

### ⚠️ El trabajo se hace CAPÍTULO A CAPÍTULO

La auditoría se hace de una vez sobre todo el mundo — es de solo lectura y barata. **El trabajo, no.** Agrupa los hallazgos por capítulo (prefijo numérico de la escena) y preséntale al usuario el recuento por capítulo:

```
Capítulo 02: 2 escenas (1 descarga, 1 vídeo de Moulinette)
Capítulo 03: 2 escenas (2 mapas + 10 tiles de Moulinette)
Capítulo 10: 4 escenas (4 descargas)
…
```

Entonces **pregunta por dónde empezar** y procesa **un capítulo por vez**, de principio a fin (copiar → audio → reescribir rutas → informe de ese capítulo). Al terminar, informa y espera antes de seguir con el siguiente.

Por qué: son descargas y escrituras en el mundo del usuario. Capítulo a capítulo él ve el resultado en Foundry antes de que sigas, puede parar en cualquier punto sin dejar nada a medias, y si algo sale mal el alcance del problema es un capítulo, no cincuenta escenas. Procesarlo todo de golpe solo es aceptable si el usuario lo pide explícitamente.

Cada asset trae:

| Campo | Qué es |
|---|---|
| `kind` | `background` · `foreground` · `tile` |
| `tileId` | Solo en tiles — lo necesitas para reescribir la ruta |
| `src` | La ruta tal cual la guarda Foundry (URL-encoded: `%20` por espacio) |
| `path` | La misma ruta **decodificada** — esta es la que existe en disco |
| `location` | `external` (fuera del mundo, se pierde en la copia) · `remote` (URL) · `world` · `core` |

Trabaja siempre con `path` para el sistema de archivos y con `src` para comparar contra lo que tiene Foundry.

**Clasifica el trabajo por escena.** Si el listado sale vacío, informa "nada que consolidar" y termina.

---

## Paso 2 — Decidir destino y nombre

### Carpeta destino

`worlds/<mundo>/assets/maps/<carpeta de capítulo>/`

**Detecta la convención de capítulos que ya usa el mundo** en vez de imponer una: mira los nombres existentes en `assets/maps/` (este mundo usa `Chapter 00`, `Chapter 01`… con dos dígitos; otros mundos usan `Chapter 1`). El capítulo sale del prefijo numérico del nombre de la escena — `3.01: Warehouse` → capítulo 3, `0.2: Neverdeath Catacombs` → capítulo 0. Si la escena no tiene prefijo numérico, pregunta al usuario a qué capítulo va. Crea la carpeta si no existe, con el mismo formato que las demás.

### Nombre del fondo

El **nombre de la escena**, saneado para el sistema de archivos, conservando la extensión original:

- Quita los caracteres ilegales en Windows: `\ / : * ? " < > |`
- `:` seguido de espacio se colapsa a un espacio: `3.06: Lambent Zenith` → `3.06 Lambent Zenith.webp`
- Sin dobles espacios, sin espacios al principio ni al final.
- **No cambies la extensión.** Un `.webm` sigue siendo `.webm`.

### Nombre de los tiles

Los tiles van a una **subcarpeta con el nombre de la escena**, conservando su nombre original:

```
assets/maps/Chapter 03/3.01 Warehouse.webp            ← fondo
assets/maps/Chapter 03/3.01 Warehouse/                ← tiles de esa escena
    03 - Astral Warehouse Door.webp
    03 - Astral Warehouse Boxes 1.webp
```

Así el fondo cumple la regla de nombre que pide el usuario y los tiles quedan agrupados sin nombres kilométricos. Un tile mantiene su nombre porque es lo que permite reconocer para qué sirve (`Door`, `Overhead`, `Boxes 1`).

---

## Paso 3 — Traer los archivos

**Copia, no muevas** (el origen se conserva; ver *Limpieza opcional*).

### Caso A — Archivo local fuera del mundo (`location: external`)

Copia de `<Data>/<path>` a `<Data>/worlds/<mundo>/assets/maps/…`. Crea las carpetas que falten.

### Caso B — URL remota (`location: remote`)

Descarga a la ruta destino, **solo las del capítulo en curso**. Si una descarga falla, apúntala y sigue con las demás del capítulo — no abortes la pasada.

**Descarga a un archivo temporal y renombra al terminar** (`curl -L --fail -o "<destino>.part"` y luego renombrar). Si el proceso se interrumpe a media descarga, un archivo truncado con tamaño > 0 pasaría la comprobación de idempotencia de la siguiente ejecución y se quedaría corrupto para siempre. Con `.part` eso no puede pasar.

La extensión sale de la URL (`…-player.webp` → `.webp`).

Cuando termines el capítulo, verifica lo descargado antes de cantar victoria: los `.webp` empiezan por `RIFF` y llevan `WEBP` en los bytes 8-11.

### Caso C — Archivo dentro del mundo pero en la carpeta equivocada

⚠️ **Antes de mover, comprueba que nadie más lo usa.** Una imagen de `assets/Images/…` puede estar además en un journal, en un objeto o como retrato. Busca la ruta en la base de datos del mundo:

```bash
grep -ral "<nombre del archivo>" "<Data>/worlds/<mundo>/data/"
```

- Si solo aparece en `data/scenes/` → puedes **mover**.
- Si aparece en `journal/`, `items/`, `actors/`… → **copia** y deja el original donde está, o se rompen esas referencias. Apúntalo en el informe.

(La base de datos es LevelDB y guarda las rutas URL-encoded; busca por el nombre del archivo con `%20` en los espacios, o por un trozo sin espacios.)

### Un archivo, muchos tiles (lo normal)

Dentro de una escena, **muchos tiles comparten el mismo archivo**: las 10 puertas de un mapa son 10 documentos Tile apuntando a un único `Door.webp`. Copia el archivo **una sola vez** y apunta todos esos `tileId` a la misma ruta nueva. Nunca hagas una copia por tile.

### Compartidos entre escenas

Si dos escenas apuntan al mismo archivo, cada una recibe **su propia copia** con su nombre. Duplica bytes, pero mantiene la regla "el mapa se llama como la escena" y evita que renombrar para una escena rompa la otra. Señálalo en el informe.

### Idempotencia

Si el destino ya existe con el mismo tamaño, no lo vuelvas a copiar. Si el asset ya está en su sitio y con su nombre, sáltalo: esta skill se puede ejecutar tantas veces como haga falta.

---

## Paso 4 — Quitar el audio a los mapas en vídeo

Solo para `.webm`, `.mp4`, `.m4v`, `.mov`, y **sobre la copia ya dentro del mundo**, nunca sobre el original.

Detecta si hay pista de audio:

```bash
ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "<destino>"
```

Salida vacía → no tiene audio, no toques nada. Si devuelve algo, quítalo re-empaquetando **sin recodificar**:

```bash
ffmpeg -y -v error -i "<destino>" -c copy -an "<destino>.tmp.<ext>"
```

Si el comando termina bien y el `.tmp` no está vacío, reemplaza el destino por el `.tmp`. Si falla, **deja el archivo original intacto**, borra el `.tmp` y apúntalo como fallo: es preferible un mapa con sonido que un mapa corrupto.

`-c copy -an` no recodifica: copia el vídeo tal cual y descarta el audio. Es cuestión de segundos incluso en archivos grandes, y no pierde calidad.

---

## Paso 5 — Reescribir las rutas en Foundry

Una llamada por escena, con todo lo que haya cambiado en ella:

```
manage-scene-assets {
  action: "update",
  sceneIdentifier: "3.01: Warehouse",
  background: "worlds/<mundo>/assets/maps/Chapter 03/3.01 Warehouse.webp",
  tiles: [
    { id: "<tileId>", src: "worlds/<mundo>/assets/maps/Chapter 03/3.01 Warehouse/03 - Astral Warehouse Door.webp" }
  ]
}
```

- Los `tileId` salen del Paso 1.
- Pasa las rutas **sin URL-encoding**; Foundry las normaliza al guardar.
- El fondo en v14 vive en el documento Level de la escena, no en `scene.background`: la tool ya se encarga de eso.
- Hazlo **escena a escena** y verifica sobre la marcha: si algo falla, las demás escenas ya están arregladas.

**Verificación final:** repite el Paso 1. Debe devolver `scenesWithFindings: 0` (o solo lo que hayas decidido dejar fuera a propósito). Si algo sigue apareciendo, la ruta no coincide con lo copiado — normalmente un problema de acentos o de espacios.

---

## Paso 6 — Informe

- **Por escena**: qué se trajo (fondo / N tiles), de dónde (Moulinette, módulo, URL) y a qué ruta.
- **Vídeos**: a cuáles se les quitó el audio, cuáles ya venían sin él.
- **Copiados en vez de movidos**: archivos que se quedaron también en su origen porque otro documento los usa.
- **Compartidos**: escenas que comparten origen y ahora tienen copia propia.
- **Fallos**: descargas caídas, ffmpeg fallido, escenas sin prefijo de capítulo.
- **Espacio recuperable**: total en MB de los orígenes que ya no hacen falta (ver abajo).

Termina con la comprobación: *"`manage-scene-assets` con `onlyExternal` ya no encuentra nada; una copia de `worlds/<mundo>/` se lleva todos los mapas."*

### Limpieza opcional

La skill **no borra nada** por su cuenta. Al final, ofrece al usuario borrar los orígenes ya copiados de `moulinette/` y `moulinette-v2/`, indicando el tamaño total. Que lo confirme explícitamente antes de borrar, y borra solo archivos que hayas verificado que existen en el destino con el mismo tamaño. Los archivos dentro del mundo que se copiaron por estar compartidos **no se borran nunca**.

---

## Notas

- **Por qué pasa esto.** Moulinette descarga a `Data/moulinette/…` y `Data/moulinette-v2/cloud/…`, fuera de la carpeta del mundo. Los packs de aventura (tipo CarlosProMaps) no traen solo el fondo: también puertas, *overhead*, cajas y muros rotos que la escena usa como **tiles**. Consolidar solo el fondo deja la escena a medias tras restaurar una copia.
- **Los mapas de Plutonium** apuntan a `raw.githubusercontent.com`. No se pierden en la copia, pero dependen del mirror y de tener internet en la mesa. Descargarlos es opcional y el usuario decide.
- **No toques el grid.** Copiar y renombrar no cambia dimensiones, así que muros, luces, notas y tokens siguen alineados. Si el usuario quiere cambiar de mapa (otra imagen, otra resolución), eso es `populate-campaign`, no esta skill.
- **Nombres con acentos y `ñ`** funcionan; Foundry los guarda URL-encoded (`Risue%C3%B1o`). Escribe la ruta en claro al actualizar y compárala siempre contra `path`, no contra `src`.
- **Orden respecto a otras skills**: da igual, pero después de `place-map-notes` y `place-encounter-tokens` no rompe nada — las notas y los tokens van por coordenadas, no por ruta de imagen.
