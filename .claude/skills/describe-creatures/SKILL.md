---
name: describe-creatures
description: Genera descripciones visuales detalladas en castellano para todos los NPCs y criaturas importantes de la aventura, listas para usar como prompt en una IA de generación de imágenes. Guarda cada descripción como archivo de texto plano en la carpeta de la criatura (junto a donde iría su retrato). Si ya existe arte custom en esa carpeta, omite la criatura. Usar cuando el usuario quiera "generar descripciones para las imágenes", "preparar los prompts de los personajes", "describir los NPCs para la IA" o "crear las descripciones de imagen".
---

# Generar descripciones visuales para criaturas y NPCs

Skill monotarea: genera un **archivo de descripción visual** por criatura/NPC importante de la aventura, listo para pasarlo a una IA de generación de imágenes. No toca Foundry ni genera imágenes; solo produce texto.

**Qué hace y qué NO hace:**
- ✅ Lee la aventura (journal de Foundry o `texto_extraido.txt`) para identificar criaturas y NPCs con relevancia narrativa o visual.
- ✅ Por cada una, redacta una descripción visual estructurada en **castellano**.
- ✅ Guarda la descripción en `<carpeta_retrato>/<slug-criatura>-descripcion.txt`.
- ✅ **Omite** cualquier criatura cuya carpeta ya contenga un archivo de imagen (`.webp`, `.png`, `.jpg`, `.jpeg` — arte custom del usuario ya presente).
- ❌ No genera imágenes ni llama a ninguna IA de imagen.
- ❌ No toca Foundry (no necesita MCP).
- ❌ No describe el **estilo artístico** (eso lo maneja la IA de generación con su propio sistema de instrucciones).

---

## Paso 1 — Leer la aventura e identificar criaturas/NPCs relevantes

Fuentes de verdad (en orden de preferencia):

1. **Journal de la aventura en Foundry** (`list-journals` + leer páginas) — trae el texto completo importado desde Plutonium, con descripciones de sala y personajes.
2. **`assets/texto_extraido.txt`** — el texto bruto del PDF, respaldo si el journal no está accesible.
3. **`assets/manifiesto.md`** — inventario del onboarding, útil para la lista de criaturas aunque no tenga toda la prosa descriptiva.

**¿Qué es una criatura/NPC "relevante"?**

Incluye siempre:
- NPCs con nombre propio y rol narrativo (misiones, aliados, antagonistas, jefes de facción).
- Jefes/líderes de cada zona (aunque sean genéricos por tipo, si el texto los presenta como individuos: "el bugbear Klarg", "el líder de los Redbrands").
- Cualquier criatura que el texto describe visualmente con más detalle del estándar del bestiario.

Excluye (no merece descripción propia):
- Tropas genéricas sin nombre y sin descripción especial ("three goblins", "two wolves") — ya hay arte genérico para ellos.
- Criaturas puramente de relleno sin rol narrativo.

Si hay duda sobre si una criatura es "relevante", inclúyela: mejor descripción de sobra que de menos.

---

## Paso 2 — Mapear carpetas de destino

Para cada criatura/NPC relevante, determina **dónde guardar su descripción**. La estructura sigue la convención `assets/Creatures/Portraits/`:

- **NPCs con nombre y criaturas únicas de un capítulo concreto** → `assets/Creatures/Portraits/Chapter XX/` (donde XX es el capítulo en que aparecen; sin cero delante: `Chapter 1`, `Chapter 2`…; si hay duda, usa el capítulo de su primera aparición).
- **Todos los monstruos de combate del capítulo** (con o sin nombre propio, incluyendo tipos genéricos como iron golem, mind flayer, grell, dreadnought…) → `assets/Creatures/Portraits/Monsters/`. Estas descripciones son para generar el arte de token; aunque el tipo sea genérico, si aparece en la aventura necesita retrato. **Nunca guardes descripciones de monstruos en `Tokens/`** — los retratos siempre van en `Portraits/`.
- **Tropas de relleno sin descripción especial** (commoners, guardias anónimos sin ningún detalle visual) → `assets/Creatures/Portraits/generic/` (en la práctica rara vez se generan descripciones para estas).

Lee el `assets/manifiesto.md` para saber cuántos capítulos tiene la aventura y a qué capítulo pertenece cada criatura. Las carpetas no llevan cero delante: `Chapter 1`, `Chapter 2`… Para **one-shots sin capítulos formales**, usa `Chapter 1` para todos.

El archivo se llamará `<slug>-descripcion.txt`, donde `<slug>` es el nombre de la criatura en minúsculas, sin acentos, espacios convertidos a guiones, sin caracteres especiales.  
Ejemplos: `klarg-descripcion.txt`, `nezznar-la-arana-negra-descripcion.txt`, `sildar-hallinvierno-descripcion.txt`.

**Detección de arte existente (idempotencia):**
Antes de escribir cada descripción, comprueba si en la carpeta de destino ya hay algún archivo de imagen (`*.webp`, `*.png`, `*.jpg`, `*.jpeg`) cuyo nombre se parezca al de la criatura. Si existe → **omite** esa criatura y apúntala en el informe como "ya tiene arte, omitida".

---

## Paso 3 — Redactar la descripción visual

Por cada criatura a describir, genera un bloque de texto en **castellano**, estructurado en cuatro secciones. La descripción debe ser **específica y concreta** (colores exactos, rasgos únicos, materiales), no genérica ("tiene una espada" → "empuña una espada larga de acero oxidado con la empuñadura envuelta en cuero negro").

El estilo visual (ilustración, fotografía, arte de fantasía…) NO se menciona aquí. La IA de imagen lo pondrá.

### Estructura de cada descripción

```
NOMBRE: <nombre completo del personaje>
TIPO: <NPC / Criatura>
FUENTE: <nombre de la aventura>

RASGO DISTINTIVO:
<Un único detalle visual que no comparte nadie más y que ancla al personaje fuera del arquetipo. No es el tipo de arma ni la clase de armadura — es algo raro y específico que lo hace inconfundible: una cadena enrollada en el antebrazo izquierdo sin razón aparente, un ojo que brilla aunque no haya luz, una cicatriz con forma demasiado regular para ser accidental, un mecanismo de relojería que siempre lleva encima, el hábito de sostener algo con la mano no dominante. Este detalle debe revelar algo de su historia o personalidad, no solo de su aspecto.>

FONDO:
<Dos o tres frases. Describe el lugar concreto donde aparece el personaje en la aventura — la sala, la escena o el entorno específico donde los PJs lo encuentran (p.ej. el interior de una taberna de nave spelljammer, la cubierta de un barco astral, la cocina de un navío, el calabozo de un segmento de nave naufragada, el corazón palpitante de un dios muerto). No inventes un fondo genérico "que evoque su naturaleza" — usa el escenario real de la aventura. El fondo debe reconocerse como su ubicación en el juego. Incluye siempre la fuente de luz y su color: antorchas de pared, bioluminiscencia, linternas de taberna, luz astral que entra por ventanillas de ojo de buey, llamas mágicas… Evita fondos tan detallados que compitan con el sujeto: dos o tres elementos que anclen el lugar son suficientes.>

ASPECTO FÍSICO:
<Descripción completa del cuerpo: raza/tipo de criatura, tamaño relativo, complexión, color de piel/pelaje/escamas, rasgos faciales distintivos, cabello/cuernos/colas/orejas, cicatrices o marcas notables, vestimenta y armadura (materiales, colores, estado de conservación). Incluye al menos un detalle narrativo del equipo — no "lleva una espada" sino "lleva una espada con la empuñadura rehecha con alambre porque la original se partió y nunca la llevó a reparar". El objeto cuenta quién es la persona.>

POSE:
<Cómo está el personaje en la imagen. Orientación del cuerpo (de frente, tres cuartos, perfil). Postura de brazos y piernas. Captura un momento concreto, no un estado: no "lanzando magia" sino "en el instante exacto en que el conjuro abandona los dedos, con la mano todavía extendida y los tendones marcados por el esfuerzo".

**Criterio obligatorio según el rol del personaje:**
- **NPCs sociales / aliados / testigos / víctimas** (comerciantes, clérigos, nobles, prisioneros, investigadores…): dales una **acción cotidiana o reveladora de su personalidad** — no simplemente "de pie". Un archivista hojea un pergamino con el índice sobre una línea específica; un investigador sostiene una lupa sobre una huella; una noble juega con un anillo de sello mientras escucha; un prisionero tiene los pulgares metidos bajo los grilletes para aliviar la presión. La acción define quién son sin necesidad de texto.
- **Enemigos, antagonistas, criaturas de combate o jefes** (cultistas, magos del culto, no-muertos, demonios, monstruos…): pose **dinámica y activa** — en medio de un ataque, lanzando un conjuro con energía visible emanando de las manos, blandiendo un arma en arco, abalanzándose, con el cuerpo en tensión de combate, capa o túnica agitada por el movimiento. Evita poses estáticas: el personaje debe parecer una amenaza en acción.

Ejemplos de poses dinámicas para enemigos: brazo extendido disparando un rayo de energía oscura, ambas manos elevadas invocando una esfera de magia, saltando con el arma en alto, girando con un tajo lateral, energía necromántica fluyendo desde los dedos, túnica y cabello agitados por el conjuro.>

EXPRESIÓN FACIAL:
<Qué expresa la cara. Identifica la emoción dominante, pero añade siempre una **emoción secundaria que la contradiga o matice**: "amenazante pero con un destello de diversión en los ojos", "sereno pero con los tendones del cuello en tensión", "confiado pero la comisura izquierda ligeramente caída como quien carga con algo que nadie más sabe". La contradicción genera carácter. Detalla ojos (color, mirada), boca y ceño con precisión — no "mira con frialdad" sino "los ojos fijos en un punto entre el espectador y el horizonte, como si calculara algo que todavía no ha ocurrido".>
```

**Fuente de información para la descripción:**
- El texto de la aventura es la fuente principal (busca la sección donde se describe al personaje).
- El bestiario estándar de D&D para rasgos físicos genéricos del tipo de criatura (completar lo que el texto no dice).
- El nombre y rol del personaje para inferir detalles coherentes cuando el texto no especifica (un líder lleva símbolo de mando; un mago lleva componentes arcanos…).

**Regla de diversidad racial — OBLIGATORIA:**

Cuando el texto de la aventura **no especifica la raza** del personaje, no asumas humano por defecto. Asigna una raza de D&D que sea coherente con su rol y personalidad, distribuyendo variedad entre el conjunto de personajes del capítulo. Razas disponibles y sus rasgos físicos clave:

| Raza | Rasgos físicos distintivos |
|---|---|
| Humano | Piel variable (clara, morena, oscura, olivácea), sin rasgos fantásticos. Buena elección de relleno si ya hay mucha variedad. |
| Elfo (alto) | Orejas puntiagudas largas, pómulos marcados, piel pálida o dorada, ojos de color poco natural (plata, violeta, ámbar). Complexión esbelta. |
| Elfo (bosque) | Igual que alto pero piel con tonos verdosos o terrosos, cabello castaño/rojizo, ojos ambarinos o verdes. |
| Elfo oscuro / Drow | Piel gris antracita o negra azulada, cabello blanco o plateado, ojos rojos o lavanda. |
| Enano (de montaña) | Corpulento y achaparrado (1,3 m aprox.), barba prominente, piel rojiza o parda, manos anchas, espalda ancha. |
| Enano (de colinas) | Más robusto aún, nariz bulbosa, cabello oscuro o rojo cobrizo. |
| Mediano (pie peludo) | Estatura 90 cm, pies grandes con pelo en el dorso, orejas ligeramente redondeadas, cara afable y redonda. |
| Gnomo | Pequeño (~1 m), nariz prominente, piel con tonos tierra o azulados, ojos grandes y expresivos, cabello desgreñado o extravagante. |
| Semiorco | Prominentes colmillos inferiores, mandíbula ancha, piel verdosa o grisácea, nariz aplanada, constitución musculosa. |
| Semielfos | Orejas levemente puntiagudas, facciones intermedias entre humano y elfo, longevidad visible. |
| Dracónido | 1,9 m aprox., escamas (rojo, azul, verde, negro, blanco, dorado, plateado…), hocico alargado, cuernos curvados, cola. |
| Tiefling | Cuernos retorcidos (forma variable), cola, piel en tonos rojizos/malva/púrpura, ojos sin iris (negro sólido, rojo, blanco), dientes ligeramente colmillados. |
| Aasimar | Piel que emite un sutil brillo cálido, ojos de color poco natural (dorado, plateado), a veces pequeñas marcas o halos apenas visibles. |
| Genasi (Fuego) | Piel con venas de luz ígneo, cabello como llamas, ojos brillantes. |
| Genasi (Tierra) | Piel pétrea, tonos ocres o grises, cabello como mineral cristalizado. |
| Genasi (Agua) | Piel con tonos azules o verdes, cabello ondulante como el agua. |
| Genasi (Aire) | Piel pálida casi translúcida, cabello flotante, ojos blancos. |
| Githyanki | Piel amarillenta-verdosa, cráneo alargado, ojos oscuros, complexión musculosa y angulosa. |

**Criterios para elegir raza:**
1. **El texto lo dice** → úsalo tal cual, con todos sus rasgos físicos.
2. **El texto no lo dice** → elige la raza que mejor encaje con el rol y el tono del personaje. Un archivista académico puede ser un gnomo o un elfo; un guardaespaldas puede ser un semiorco o un enano; un comerciante puede ser un mediano o un tiefling.
3. **Variedad en el capítulo** → si ya describiste 3 humanos seguidos, el siguiente personaje sin raza asignada debe ser de otra raza. Revisa las descripciones ya generadas antes de asignar.
4. **Coherencia con el mundo** → Neverwinter (Forgotten Realms) tiene gran diversidad racial; cualquier raza del PHB es plausible. En otros escenarios adapta según el lore.

**Reglas de tono visual — OBLIGATORIAS:**

1. **Elementos crudos bienvenidos, descripción limpia obligatoria.** Sangre, cicatrices, texturas ásperas, metal mellado, cuero desgastado — todo eso puede y debe aparecer si define al personaje. Lo que no puede aparecer es la forma en que se describen: nunca uses adjetivos que evoquen suciedad acumulada, mugre o descuido ("grasiento", "apelmazado", "mugriento", "cubiertas de hollín", "manchas oscuras de herrumbre y sangre seca"). En su lugar, descríbelos con precisión limpia: "manchas de carmín", "cicatriz bien curada", "metal mellado por el combate", "cuero oscurecido por el uso". La imagen puede ser dura; la descripción es siempre nítida.
2. **Estilo editorial limpio.** Todas las descripciones deben evocar una ilustración de libro de referencia de alta calidad: contornos definidos, formas claras. El volumen se construye con **hatching y crosshatching limpios** (tramas de líneas paralelas o cruzadas, ordenadas), no con manchas, ruido de textura ni efectos orgánicos difusos. Piensa en una enciclopedia de fantasía ilustrada, no en concept art sucio ni arte de videojuego oscuro.
3. **Fondos simples y leídos limpiamente.** El fondo puede incluir elementos crudos (huesos, telas de araña, llamas) pero descríbelos de forma limpia y concisa, sin apilar detalles sucios. El sujeto es el protagonista; el fondo lo contextualiza en dos frases y no compite.

---

## Paso 4 — Guardar los archivos

Escribe cada descripción en su archivo de texto:
- Ruta: `<carpeta_mundo>/assets/Creatures/Portraits/Chapter XX/<slug>-descripcion.txt` o `.../Monsters/<slug>-descripcion.txt` según el mapeo del Paso 2.
- Encoding: UTF-8.
- Sin frontmatter ni metadatos adicionales: el archivo empieza directamente con `NOMBRE:`.

Si la carpeta de destino no existe todavía, créala.

---

## Paso 5 — Informe

Informe en español al finalizar:

- **Descripciones generadas**: lista con nombre → ruta del archivo.
- **Omitidas (ya tienen arte)**: lista con nombre → ruta de la imagen existente que provocó la omisión.
- **Sin información suficiente**: criaturas relevantes para las que el texto de la aventura no da detalles visuales (la descripción se generó con mínimos del bestiario estándar — indica cuáles).

Termina recordando al usuario: *"Las descripciones están listas. Pásalas a tu IA de imagen una a una; cuando tengas el arte, guárdalo en la misma carpeta (`assets/Creatures/Portraits/Chapter XX/` o `Monsters/`) con un nombre similar al slug para que esta skill (y `populate-campaign`) lo detecte y no lo sobreescriba."*

---

## Notas

- **Una descripción por individuo, no por tipo**: si hay dos NPCs del mismo tipo (dos bugbears con nombre), cada uno tiene su `<slug>-descripcion.txt` con sus rasgos propios.
- **Idempotencia**: si el archivo de descripción ya existe y no hay arte, reemplázalo (la descripción puede mejorar); si hay arte, no toques nada.
- **Subagente para lecturas largas**: si el journal o el texto extraído es muy extenso, delega la lectura y extracción de descripciones a un subagente (`sonnet`), pidiéndole solo la lista estructurada de personajes con sus detalles visuales, no el texto completo.
