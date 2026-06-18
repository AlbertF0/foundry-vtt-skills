---
name: generador-objetos
description: "Generate square tabletop RPG item images from object descriptions. Use when Codex is asked to create Foundry VTT item art for magical fantasy items, equipment, treasures, weapons, armor, relics, potions, scrolls, keys, tools, food, herbs, globes, or object tokens: one clearly identifiable object, usually in a slightly three-dimensional 3/4 view, centered on an aged cream parchment background, bold vintage ink illustration, heavy black outlines, controlled engraved hatching, muted earthy colors, no glow effects, no labels, no borders, no characters, and no scene background."
---

# Generador Objetos

Use this skill to turn an item description into a finished square tabletop RPG object-token image.

When the user provides an object description and asks to use this skill, generate the image directly with the image-generation tool. Do not stop after writing a prompt unless the user explicitly asks only for the prompt.

## Workflow

1. Extract the object type, magical function, visible materials, shape, color accents, condition, scale, and any iconic details.
2. Preserve the item identity literally. Do not turn the object into a symbol, logo, scene, character, or abstract concept.
3. Write the internal image-generation prompt in English unless the user asks otherwise; image models usually follow detailed English art direction better.
4. Generate a square image suitable for Foundry VTT item art.
5. Keep the image to one item only, centered and fully visible.
6. If the source description contains glow, aura, energy, or dramatic lighting, translate it into subtle color accents, gem inclusions, color variation, engravings, or decorative marks. Do not request lighting overlays.
7. If details are missing, invent coherent visible high-fantasy object details that support the item identity without adding extra items, characters, hands, a scene, text, borders, or labels.

## Required Format

Always generate the image as a square tabletop RPG object token:

- Square 1:1 composition.
- One primary object only.
- Centered and fully visible with comfortable padding.
- Prefer a slightly three-dimensional three-quarter view instead of a flat front-facing emblem, unless the object identity requires a direct front view.
- Show visible thickness, side planes, curved rims, overlapping parts, or angled facets where appropriate.
- Aged cream or off-white parchment-tone background.
- A small graphic ground shadow made of thin parallel ink hatching is allowed under the item.
- No scene, no hand, no character, no table, no border, no label, no readable text.

## Core Style Contract

Use this style contract, adapted only with the specific object details:

```text
A single magical fantasy item in a bold vintage ink illustration style, centered on an aged cream parchment background. Show the item in a slightly three-dimensional three-quarter view when possible, with visible side planes, thickness, rim ellipses, angled facets, or overlapping construction details that make it feel like a real physical object rather than a flat icon. The item has thick confident black outer contours, heavy black silhouette accents, and clean hand-drawn interior linework. Shading is built with controlled engraved hatching, short directional ink strokes, and flat graphic shadow shapes, using darker hatching on side planes and underside areas to clarify volume, like an old fantasy RPG equipment illustration, linocut print, or woodcut-inspired graphic novel object plate. Use muted earthy colors and selective rich accents: deep crimson, dark teal, olive green, ochre, brass gold, warm brown, bone ivory, dull silver, and black ink. Include a small ground shadow made from thin parallel hatch lines beneath the object when it helps anchor the token. No glowing effects or lighting overlays. The object is literal and clearly identifiable, with no symbolic or abstract elements. Cropped square for tabletop RPG use (like Foundry VTT tokens). No borders, no labels.
```

## Reference Style Notes

The desired look is closer to old printed fantasy object art than modern polished concept art:

- Bold black contour around the whole object, with occasional very dark filled shadow areas.
- Interior details use visible ink strokes, short curved hatching, and simplified material marks.
- Colors are printed-looking and slightly subdued, not glossy or digitally luminous.
- Background is warm aged paper or cream parchment, mostly empty.
- A small slanted hatch shadow under the item is encouraged; it should not become a table, floor, or scene.
- The object should feel dimensional through a 3/4 angle, visible thickness, overlapping forms, rim ellipses, side faces, or faceted planes.
- Use hatching density to separate front planes, side planes, undersides, and cast shadow.
- Glass, metal, food, cloth, plants, parchment, and wood should read through simple color masses plus ink marks, not photorealistic texture.
- Avoid smooth airbrushed highlights; use hard-edged white or pale accent marks only when needed.

## Object Rules

- Show exactly one primary item.
- Center the item with comfortable padding so it reads well as a square token.
- Use a neutral off-white parchment-tone background, not a scene.
- Keep the full object visible; do not crop off important edges unless the user explicitly asks.
- Prefer 3/4 object presentation: front plane plus one side plane, top rim plus inner opening, angled handle plus visible thickness, or faceted gem planes depending on the item.
- Use thick clean black outlines, a readable silhouette, and bold ink shading.
- Prefer flat or lightly textured color fields with controlled hatching over smooth painterly rendering.
- Add selective color accents only where they clarify material, enchantment, gem, liquid, metal, leather, cloth, bone, wood, or runes.
- If runes or markings are included, make them decorative marks only, not readable text.
- Avoid dramatic light, bloom, aura, spell effects, sparks, smoke, or cinematic shadows.

## Image Prompt Template

Use this template internally for image generation:

```text
Create a square tabletop RPG item token of [ITEM NAME], a single [item type]. Show it in a slightly three-dimensional three-quarter view when possible, with visible thickness, side planes, curved rims, angled facets, or overlapping construction details. [Describe shape, materials, construction, color accents, magical or historical details as visible physical features]. The object is centered, fully visible, and clearly identifiable on a neutral textured off-white parchment-tone background.

A single magical fantasy item in a bold vintage ink illustration style, centered on an aged cream parchment background. Show the item in a slightly three-dimensional three-quarter view when possible, with visible side planes, thickness, rim ellipses, angled facets, or overlapping construction details that make it feel like a real physical object rather than a flat icon. The item has thick confident black outer contours, heavy black silhouette accents, and clean hand-drawn interior linework. Shading is built with controlled engraved hatching, short directional ink strokes, and flat graphic shadow shapes, using darker hatching on side planes and underside areas to clarify volume, like an old fantasy RPG equipment illustration, linocut print, or woodcut-inspired graphic novel object plate. Use muted earthy colors and selective rich accents: deep crimson, dark teal, olive green, ochre, brass gold, warm brown, bone ivory, dull silver, and black ink. Include a small ground shadow made from thin parallel hatch lines beneath the object. No glowing effects or lighting overlays. The object is literal and clearly identifiable, with no symbolic or abstract elements. Cropped square for tabletop RPG use (like Foundry VTT tokens). No borders, no labels.

Negative constraints: no character, no hand holding the item, no table, no room, no landscape, no scene background, no glow, no aura, no bloom, no lighting overlay, no sparks, no smoke, no readable text, no labels, no border, no frame, no logo, no symbolic abstraction, no photorealism, no 3D render, no painterly brushstrokes, no oil paint, no watercolor wash, no airbrushed gradients, no glossy video-game concept art, no anime, no messy linework, no weak outlines, no cropped-off object.
```

## Response Rule

After generation, return the image to the user. Keep any accompanying text brief, such as the item name and a short note that it was generated in the skill style. Do not paste the full prompt unless the user asks for it.

## Quick Quality Check

Before finalizing the prompt, confirm:

- The output is square and token-ready.
- There is exactly one primary item.
- The item is centered, fully visible, and literal.
- The item has a dimensional 3/4 presentation when appropriate, with visible thickness or side planes.
- The background is aged cream parchment, not a scene.
- There is no glow, aura, readable text, label, border, or character.
- The style has thick black outlines, bold ink shadows, controlled hatching, muted earthy colors, and a small hatch ground shadow when useful.
