---
name: generador-escenarios
description: Generate or refine prompts for tabletop RPG locations, backgrounds, establishing shots, scene art, and environmental illustrations in the same refined gothic art nouveau fantasy style as generador-criaturas: readable narrative environments, elegant dark linework, stained-glass-like color areas, integrated art nouveau curves, atmospheric but structured architecture or habitat, and no photorealism, no 3D render, no glossy video-game concept art, no empty generic backgrounds.
---

# Generador Escenarios

Use this skill to create prompts for campaign **scenarios, locations, backgrounds, environment art, establishing shots, and atmospheric scene plates** that visually match the `generador-criaturas` character portraits.

This is the environment-focused sibling of `generador-criaturas`. It should produce places where those characters could believably stand: old city streets, palace halls, crypts, taverns, temples, cursed roads, astral decks, monster lairs, battle aftermaths, planar ruins, laboratories, forests, sewers, archives, throne rooms, and other RPG locations.

The style is **refined gothic art nouveau fantasy environment illustration**: elegant, readable, mature, hand-illustrated, strongly Art Nouveau, and compatible with the campaign portrait style. It is not photorealistic, cinematic, 3D, anime, generic fantasy splash art, gritty comic art, or a videogame environment concept.

## Workflow

1. Extract the location: place type, purpose, time of day, mood, culture/faction, climate, key objects, scale, and whether it is interior/exterior/planar.
2. Preserve any user-specified canon details. Do not change named locations, required props, lighting, faction symbols, or story beats.
3. Decide the output use:
   - **Scene plate / handout**: usually vertical 2:3 or horizontal 16:9, visually rich.
   - **Background for portraits**: vertical 2:3, lower-detail center space or architecture suitable behind a character.
   - **Foundry scene splash**: horizontal 16:9 or 4:3, readable at screen size.
   - **Battlemap inspiration**: overhead/isometric only if the user explicitly asks; otherwise use illustrated scene view.
4. Write the prompt in English unless the user asks otherwise.
5. Structure the prompt as: composition, location details, focal point, style contract, palette/lighting, atmosphere, negative constraints.
6. Keep the scene readable and staged. Avoid chaotic clutter, random props, generic fog, or darkness that hides the place.

## Format Selection

Default format:

- Use **horizontal 16:9** for broad locations, room scenes, city streets, vistas, taverns, exteriors, lairs, and Foundry scene splash art.
- Use **vertical 2:3** only when the user wants a portrait-like location plate, doorway, tower, throne, altar, corridor, narrow street, or background compatible with a character portrait.
- Use **square** only for icons, location tiles, token-like assets, or when explicitly requested.
- Use **top-down battlemap** only when explicitly requested; this style is primarily for illustrated environments, not tactical maps.

Always specify the chosen aspect ratio clearly.

## Core Style Contract

Include this style direction, adapted to the location:

```text
Refined gothic art nouveau fantasy environment illustration, elegant and readable, like a serious illustrated fantasy sourcebook location plate. The image must read clearly as Art Nouveau: graceful architectural rhythm, sinuous S-curves, elegant negative space, integrated decorative shapes, and broad stained-glass-like color areas. Use crisp dark hand-inked linework with varied weight to define architecture, furniture, terrain edges, arches, windows, trees, rocks, stairs, doors, props, and silhouettes. Use subtle painterly shading over clean color planes, not photorealistic rendering and not flat vector art. Keep the environment structured and narrative, with a clear focal point and readable depth. Ornament must belong to the place: architecture, windows, banners, roots, smoke, water, vines, ironwork, lanterns, magic residue, tomb carvings, or faction symbols. No decorative frame, no filigree border, no ornate corner flourishes, no empty generic background.
```

## Hard Style Lock

The image must read as **illustration, not realism**.

Always reinforce:

- visible hand-inked contour lines and designed environmental shapes;
- broad, clean color masses with stained-glass-like separation;
- graceful art nouveau curves integrated into real scene elements;
- mature gothic fantasy mood without photorealistic lighting or 3D material rendering;
- readable scale, perspective, and focal point;
- strong silhouette design for doorways, towers, trees, arches, bridges, altars, furniture, ruins, and props.

Avoid:

- photorealism, cinematic realism, realistic camera lens effects, ray-traced lighting, 3D render, matte painting, digital concept-art polish, glossy videogame environment art;
- anime backgrounds, cartoon simplification, flat vector scenery, childish fairytale simplicity, chibi or mascot tone;
- gritty comic rendering, noisy hatching, random scratches, over-textured stone, all-over dirt, chaotic brushwork, heavy smoke hiding the scene;
- decorative borders, floating filigree, corner ornaments, lace frames, poster-like framing unrelated to the location.

## Composition

Every scenario needs a clear visual idea:

- Establish one focal point: gate, altar, throne, tavern table, portal, bridge, tower, crypt door, fountain, ship deck, market stall, ruined statue, ritual circle, window, or distant citadel.
- Use foreground/midground/background layers for depth.
- Make the main path of the eye obvious through arches, stairs, street lines, tree trunks, banners, light beams, canal edges, roots, or columns.
- Use elegant negative space. Do not fill every area with tiny props.
- Use quiet vertical rhythm for gothic/civic locations: arches, windows, towers, columns, banners, lanterns, doorways.
- Use flowing S-curves for nouveau identity: smoke, roots, vines, cloak-like banners, river curves, stairs, waves, magic residue, ironwork, tree branches, tentacles, or cosmic trails.
- If tiny figures are included for scale, make them simple silhouettes or low-detail extras. Do not let them become the subject unless asked.

## Background And Habitat Fidelity

Do not force every scene into a gothic hall. Preserve the correct location type:

- City/civic: streets, gates, towers, watch posts, bridges, alleys, courtyards, noble halls, council chambers.
- Tavern/social: stone alcoves, beams, lanterns, bottles, hearth, tables, warm amber light, subdued patrons.
- Noble/court: pale palace halls, tall arched windows, banners, polished stone, restrained brass/gold, teal or blue accents.
- Undead/funerary: crypts, tomb niches, sarcophagi, graveyards, chapel ruins, moonlit burial grounds, candlelit stairs.
- Arcane: laboratories, libraries, rune chambers, observatories, floating diagrams, restrained magical residues, shelves, instruments.
- Religious/occult: temples, altars, stained glass, reliquaries, processional arches, sacred geometry integrated into architecture.
- Natural/wild: forests, ruins overgrown by roots, cliffs, groves, marshes, caves, mountain passes, riverbanks.
- Aquatic: flooded ruins, canals, cisterns, grottos, underwater halls, water-vortex chambers.
- Infernal/abyssal: volcanic plains, basalt halls, burnt battlefields, fiendish ruins, ash-dark caverns.
- Astral/planar: ship decks, star voids, floating stones, cosmic horizons, planar rifts, impossible architecture.
- Battlefield/road: old roads, abandoned camps, broken siege works, ruined armories, watchtowers, cursed crossroads.

Art Nouveau should shape the **lines and rhythm** of the scene, not overwrite the setting category.

## Palette And Lighting

Use rich but restrained fantasy colors, compatible with `generador-criaturas`.

Core palette:

- dark teal, oxidized green, slate blue, charcoal black, cold iron gray;
- aged ivory, pale limestone, muted warm stone, bone ivory;
- deep plum, desaturated violet-black, smoky black, Payne's gray, indigo shadow;
- muted brass, antique gold, old bronze, small crimson/garnet accents;
- lantern amber or candlelight as small warm accents.

Lighting modes:

- **Daylight civic**: pale limestone, cool slate shadows, restrained warm highlights, readable architecture.
- **Lantern evening**: amber focal pools, teal/blue shadows, crisp silhouettes, no muddy darkness.
- **Crypt/candle interior**: ivory candles, indigo-black corners, muted gold, readable tomb shapes.
- **Arcane**: restrained teal, violet, or pale green accents; no neon glow flood.
- **Planar/astral**: deep blue/black, ivory stars, muted violet, controlled luminous trails.
- **Infernal**: black basalt, muted ember red, smoky umber, antique brass, no chaotic flame wall unless required.

Avoid one-note palettes, full sepia wash, neon saturation, and excessive darkness hiding the scene.

## Detail And Texture

Age, wear, ruin, and dirt should be designed, not noisy.

Prefer:

- clean stone blocks, a few readable cracks, chipped edges, patinated metal, faded banners, clear stains, grouped roots, stylized water ripples, deliberate rubble piles, controlled shadow shapes.

Avoid:

- all-over grit, dusty haze, dirty overlays, speckled noise, muddy stone texture, dense micro-scratches, random debris everywhere, noisy foliage, overgrown clutter that hides the composition.

## People, Creatures, And Scale

Scenarios may include small figures only if they help scale or story:

- Keep them low-detail and subordinate.
- Use silhouettes, cloaked figures, guards in the distance, patrons in shadow, or tiny travelers.
- Do not make a single figure the main subject unless the user asks for a character scene.
- For a character-centered scene, switch to `generador-criaturas` or combine both intentionally.

## Prompt Template

Use this template for generation requests:

```text
Create a [horizontal 16:9 / vertical 2:3 / square] fantasy environment illustration of [LOCATION], in refined gothic art nouveau fantasy style. The scene shows [main composition and focal point], with [foreground elements], [midground elements], and [background depth]. The location feels [mood], [story function], and [time of day / weather / lighting].

Environment details: [5-8 specific props, architecture, terrain, symbols, or story objects]. Keep the scene readable and structured, with a clear focal point, elegant negative space, and a strong path for the eye. If figures are present, keep them small and secondary for scale only.

Refined gothic art nouveau fantasy environment illustration, elegant and readable, like a serious illustrated fantasy sourcebook location plate. The image must read clearly as Art Nouveau: graceful architectural rhythm, sinuous S-curves, elegant negative space, integrated decorative shapes, and broad stained-glass-like color areas. Use crisp dark hand-inked linework with varied weight to define architecture, furniture, terrain edges, arches, windows, trees, rocks, stairs, doors, props, and silhouettes. Use subtle painterly shading over clean color planes, not photorealistic rendering and not flat vector art. Palette of [chosen palette]. Lighting is [chosen lighting mode], with clear value separation and no excessive darkness hiding important structures.

Style lock: mature hand-illustrated fantasy environment plate with strong Art Nouveau identity. Do not render as photorealism, cinematic realism, matte painting, 3D render, videogame concept art, anime background, cartoon scenery, flat vector, or gritty comic art. Ornament must be integrated into real scene elements: architecture, windows, banners, roots, smoke, water, vines, ironwork, lanterns, magic residue, tomb carvings, or faction symbols.

Negative constraints: no decorative frame, no filigree border, no ornate corner ornaments, no empty generic background, no plain studio backdrop, no modern objects, no readable text, no watermark, no UI, no photorealism, no cinematic realism, no camera lens blur, no 3D render, no 3D material shaders, no matte painting, no glossy videogame concept art, no anime, no cartoon simplification, no flat vector scenery, no neon palette, no full sepia wash, no excessive darkness hiding the scene, no chaotic clutter, no all-over dirt, no noisy grit, no over-textured stone, no random rubble everywhere.
```

## Example: Daytime Noble Hall

```text
Create a horizontal 16:9 fantasy environment illustration of a noble palace audience hall in refined gothic art nouveau fantasy style. The scene shows a long pale limestone hall with tall arched windows on the left, a restrained brass-and-teal dais at the far end, polished stone floor patterns leading toward the focal point, and hanging blue civic banners without text. Morning daylight enters in soft angled bands, making the hall feel dignified, quiet, and politically tense.

Environment details: pointed gothic windows, slender columns, muted brass sconces, dark teal enamel accents, carved stone benches, a distant closed council door, simple geometric floor tiles, and two tiny guard silhouettes for scale. Keep the scene readable and structured, with a clear focal point, elegant negative space, and a strong path for the eye.

Refined gothic art nouveau fantasy environment illustration, elegant and readable, like a serious illustrated fantasy sourcebook location plate. The image must read clearly as Art Nouveau: graceful architectural rhythm, sinuous S-curves in window tracery and banner edges, elegant negative space, integrated decorative shapes, and broad stained-glass-like color areas. Use crisp dark hand-inked linework with varied weight to define architecture, furniture, stairs, doors, props, and silhouettes. Use subtle painterly shading over clean color planes. Palette of pale limestone, aged ivory, dark teal, oxidized green, muted brass, slate-blue shadows, and restrained warm daylight. Lighting is pale morning daylight, with clear value separation.

Negative constraints: no decorative frame, no filigree border, no ornate corner ornaments, no readable text, no watermark, no photorealism, no cinematic realism, no 3D render, no anime, no cartoon scenery, no glossy videogame concept art, no chaotic clutter, no excessive darkness.
```

## Example: Crypt Entrance

```text
Create a vertical 2:3 fantasy environment illustration of an old crypt entrance beneath a ruined chapel, in refined gothic art nouveau fantasy style. The scene centers on a tall arched stone door half-open to darkness, with shallow stairs descending, candle stubs on both sides, tomb niches in the walls, and pale roots curling through cracked limestone. The mood is solemn, funerary, ancient, and invitingly dangerous.

Environment details: carved sarcophagus lids, simple skull reliefs, wax trails, tarnished bronze hinges, faded violet burial cloth, cool moonlight from a broken chapel window above, and a faint indigo shadow inside the door. Keep the scene readable and structured, with the crypt door as the focal point and the roots and stairs forming graceful S-curves.

Refined gothic art nouveau fantasy environment illustration, elegant and readable, like a serious illustrated fantasy sourcebook location plate. Use crisp dark hand-inked linework, broad stained-glass-like color areas, subtle painterly shading, and integrated art nouveau curves in roots, candle smoke, arch shapes, and broken window tracery. Palette of bone ivory, pale limestone, indigo shadow, desaturated violet-black, antique bronze, wax yellow, and small cold moonlit blue accents.

Negative constraints: no decorative frame, no filigree border, no ornate corner ornaments, no photorealism, no 3D render, no glossy videogame concept art, no chaotic rubble, no excessive gore, no unreadable darkness, no text, no watermark.
```

## Quick Quality Check

Before finalizing a prompt, confirm:

- The aspect ratio matches the intended use.
- The scene has a clear focal point and readable depth.
- The environment type fits the story; it was not forced into a gothic hall without reason.
- Art Nouveau is visible through integrated curves, rhythm, negative space, linework, and color shapes.
- The scene matches `generador-criaturas` visually: mature hand illustration, dark elegant linework, stained-glass-like color planes, restrained palette.
- The lighting is readable and does not hide the location.
- Tiny figures, if present, are secondary.
- There is no decorative border, filigree frame, text, UI, photorealism, 3D render, anime, cartoon simplification, or glossy videogame concept-art finish.
