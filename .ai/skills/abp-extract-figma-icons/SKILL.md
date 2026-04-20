---
name: abp-extract-figma-icons
description: Extracts icons from a Figma page/frame as SVG files, saves them to src/theme/icons, and runs icons:pack to generate the sprite. Use when the user provides a Figma URL to extract icons, or when they ask to get icons from Figma.
---

# Extract Figma Icons

Extracts icons from a Figma design file and adds them to `src/theme/icons` as SVG files. Then runs `npm run icons:pack` to generate the sprite in `public/images/icons.svg`.

## When to Use

- User provides a Figma URL pointing to an icons page/frame (e.g. `https://figma.com/design/xxx/file?node-id=6-2`)
- User asks to extract icons from Figma
- User asks to get icons as SVG from a Figma design

## If No URL Is Provided

**Ask the user**: _"Necesito la URL de la página o frame de iconos en Figma. Por ejemplo: https://figma.com/design/[fileKey]/[nombre]?node-id=6-2"_

Do not proceed until the user provides a valid Figma URL with `node-id` pointing to the icons page or frame.

---

## Workflow

### Step 1: Parse Figma URL

Extract from the URL:

- **fileKey**: The design file key (e.g. from `figma.com/design/ABC123/MyFile` → `ABC123`)
- **nodeId**: The node ID of the icons page/frame (e.g. `6-2` from `?node-id=6-2`). Convert hyphen to colon for API: `6-2` → `6:2`.

URL formats:

- `https://figma.com/design/:fileKey/:fileName?node-id=:int1-:int2`
- `https://www.figma.com/design/:fileKey/:fileName?node-id=:int1-:int2&p=f&t=...` (extra params are ignored)

### Step 2: Run the Figma Icons Script

This skill includes `fetch-figma-icons.js` in its folder. Run it directly (from project root):

```bash
FIGMA_ACCESS_TOKEN=<token> node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js "<figma-url-with-node-id>"
```

Or with fileKey and nodeId separately:

```bash
FIGMA_ACCESS_TOKEN=<token> node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js <fileKey> <nodeId>
```

Example:

```bash
FIGMA_ACCESS_TOKEN=xxx node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js "https://www.figma.com/design/VT4W8MFWwD8k1TYcABLEjf/Design-system-template?node-id=6-2"
```

**Required**: `FIGMA_ACCESS_TOKEN` must be set. Create at: Figma Settings > Security > Personal access tokens. Scope: `file_content:read`.

The script uses the Figma REST API to: fetch the file structure, collect icon nodes (FRAME, COMPONENT, GROUP, VECTOR, BOOLEAN_OPERATION), export each as SVG, and save to `src/theme/icons/`.

If the script fails with "Set FIGMA_ACCESS_TOKEN", inform the user they must create a token and set it before running.

### Step 3: Run icons:pack

After icons are saved to `src/theme/icons`, run:

```bash
npm run icons:pack
```

This generates `public/images/icons.svg` with all SVGs packed as `<symbol>` elements for use as a sprite.

---

## Summary Rules

| Rule   | Detail                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------- |
| No URL | Ask user for Figma URL with node-id before proceeding                                               |
| Token  | `FIGMA_ACCESS_TOKEN` required; scope `file_content:read`                                            |
| Script | Use `node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js` with URL or fileKey + nodeId |
| Output | SVGs saved to `src/theme/icons/`                                                                    |
| Pack   | Always run `npm run icons:pack` after extraction                                                    |
| Target | Final sprite: `public/images/icons.svg`                                                             |
