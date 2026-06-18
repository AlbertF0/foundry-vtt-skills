---
name: generador-de-tokens
description: Generate reusable themed round transparent Foundry VTT / DnD tokens from existing character portraits, using a local frame index with tagged reusable token frames. Use when the user asks for a token, token frame, round token, Foundry token, DnD token, or to convert character-generator portraits into themed circular transparent tokens.
---

# Generador De Tokens

Use this skill to turn a character portrait into a round transparent tabletop token with a thematic frame that matches the character.

This skill works with portraits created by `generador-criaturas`, but can also use other character images. It must preserve the character's identity and prioritize a readable face/head inside a circular token.

## Storage

This skill owns a reusable token-frame library:

- Frame index: `assets/frames/index.json`
- Frame images: `assets/frames/`
- Frame images must be **token frames only**, with no character/PJ inside.
- Prefer PNG frames with transparency: transparent outside the token, transparent or mostly open center, and visible decorative ring.
- Do not store completed character tokens in `assets/frames/`; completed tokens belong in the user's requested output folder.

## Frame Index Schema

Each frame entry in `assets/frames/index.json` has:

```json
{
  "id": "noble-gold-laurel",
  "file": "noble-gold-laurel.png",
  "tags": ["nobleza", "oro", "laurel", "corte", "aristocracia"],
  "style": "antique gold noble heraldic circular frame with laurel motifs",
  "recommended_for": "nobles, courtiers, royal advisors, aristocratic monsters, dragonborn nobles",
  "notes": "Use for noble or courtly characters. Avoid for poor, feral, military, or rustic characters."
}
```

Use Spanish tags because the campaign notes and user requests are usually in Spanish. Add English synonyms only when useful.

Good tag categories:

- Social role: `nobleza`, `guardia`, `culto`, `mago`, `clerigo`, `mercenario`, `taberna`, `rey`, `criminal`.
- Material/color: `oro`, `bronce`, `hierro`, `plata`, `piedra`, `jade`, `teal`, `rojo`, `negro`.
- Motif: `laurel`, `corona`, `espinas`, `runas`, `llaves`, `calavera`, `sol`, `luna`, `vidriera`.
- Tone: `elegante`, `oscuro`, `civico`, `funerario`, `arcano`, `sagrado`, `militar`, `rustico`.
- Faction/use: `ciudad`, `corte`, `cripta`, `templo`, `guardia-real`, `noble-draconido`.

## Workflow

1. Identify the character image:
   - If the user gives a path, inspect it with `view_image`.
   - If multiple characters are present, use the closest/largest/most central character unless the user specifies another.
   - Preserve the character's species, face, head shape, horns, hair, helmet, crown, colors, and role.
2. Determine desired token theme:
   - Infer tags from the prompt and image: noble, guard, undead, cultist, arcane, tavern, city, monster, etc.
   - For a noble draconid, likely tags include `nobleza`, `oro`, `laurel`, `corte`, `draconido`.
3. Search `assets/frames/index.json`:
   - Use matching tags and semantic fit.
   - Strong match: at least 2-3 meaningful tags and no tone conflict.
   - If there are multiple matches, choose the closest and mention the chosen frame.
4. If a matching frame exists:
   - Use that frame directly unless the user asks for a new frame or different tone.
   - Compose the character into it.
5. If no matching frame exists:
   - Generate a new **empty frame only**, not a completed character token.
   - Show or save the frame preview.
   - Ask the user to confirm whether to keep it.
   - Only after confirmation, save the frame PNG in `assets/frames/` and add an entry to `assets/frames/index.json` with useful tags.
   - Then compose the character token with that frame.
6. Save the completed token beside the source image or in the requested destination. Never overwrite existing files unless explicitly requested.
7. Validate that the final token is PNG `RGBA`, round, transparent outside the token, and visually readable at token size.

## New Frame Generation Rules

When creating a new reusable frame, generate **only the frame**:

- Square canvas.
- Perfectly round token frame.
- Transparent exterior.
- Open/transparent center or center that can be cleanly replaced by a portrait.
- No character, face, body, creature, hands, text, letters, numbers, watermark, or UI.
- The frame should carry theme through material, color, iconography, and silhouette.
- Keep the frame reusable: avoid highly specific character anatomy unless the frame is meant for a narrow family.

If built-in image generation cannot create true transparency directly, use the imagegen chroma-key workflow:

1. Generate frame on a flat solid `#00ff00` background.
2. Use `remove_chroma_key.py` to remove green.
3. Validate transparent corners and RGBA mode.

Frame prompt pattern:

```text
Create a square reusable transparent round DnD / Foundry VTT token frame only, no character inside. Theme: [theme]. The frame is [materials, motifs, colors], with a clean open circular center for placing a portrait. The exterior outside the frame must be perfectly flat #00ff00 chroma-key green for transparency removal. Do not use #00ff00 inside the frame. No text, no letters, no numbers, no face, no character, no body, no watermark, no UI.
```

## Composition Rules

The completed token should look like a real DnD/Foundry token, not a rectangular portrait inside a circle.

Character placement:

- Prioritize the face/head over the full body.
- Crop as bust, head-and-shoulders, or upper torso.
- Keep eyes and face large enough to read at small size.
- If multiple characters are present, choose the nearest/largest/most central character unless told otherwise.
- Preserve horns, crowns, helmets, large ears, hair, and distinctive silhouettes.
- If horns, ears, helmets, weapons, crowns, or shoulders can overlap the token frame slightly, allow that overlap because it gives depth.
- Do not let overlap hide the face or important identity details.

Depth:

- Add an inner shadow or contact shadow inside the ring to seat the portrait.
- Add subtle shadow where the frame overlaps the character.
- Keep outside the token fully transparent; no cast shadow outside the circular token unless the user asks.

Frame behavior:

- The frame should sit above the portrait layer.
- If using image generation/editing, preserve the chosen frame's material, motifs, colors, and circular silhouette.
- If using deterministic composition, use `scripts/composite_token.py` as a first pass.

## Deterministic Composition Helper

Use `scripts/composite_token.py` when you already have:

- a square portrait or portrait crop;
- a transparent PNG frame;
- no complex overlap requirement.

Example:

```powershell
python scripts/composite_token.py --portrait "NobleDraconid2.png" --frame "assets/frames/noble-gold-laurel.png" --out "NobleDraconidToken.png" --scale 1.08 --y -0.08
```

For horns/crowns/weapons overlapping the frame, use image generation or image editing with both the portrait and frame visible, then remove chroma if needed.

## Noble Frame Direction

For noble or courtly characters, prefer:

- Antique gold and oxidized bronze.
- Laurel motifs.
- Small crown-like points or crest at top.
- Dark teal enamel.
- Small red garnets or crimson gems.
- Clean heraldic circle, elegant but not cluttered.

Suggested tags: `nobleza`, `oro`, `laurel`, `corte`, `aristocracia`, `corona`, `teal`, `gema-roja`.

## Output Naming

If the source is `Name.png`, save the completed token as:

- `NameToken.png` by default.
- `NameToken2.png`, `NameToken3.png`, etc. if the file already exists.

For frame files:

- Use lowercase hyphenated IDs, e.g. `noble-gold-laurel.png`.
- Keep `id` and `file` aligned.

## Quick Validation

Before finishing, check:

- Final file exists in the requested destination.
- PNG mode is `RGBA`.
- All four corners have alpha 0.
- Token is square.
- The face/head is readable.
- The frame theme matches the character.
- No text, watermark, UI, or green chroma remains.
- Original portrait was not overwritten.
