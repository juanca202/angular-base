---
name: abp-extract-figma-variables
description: Extracts design variables from a Figma URL and syncs them to src/theme/tokens/theme.css. Maps variable names, converts px to rem (16px base), and imports Google Fonts in index.html. Use when the user provides a Figma URL to sync design tokens, or when they ask to extract Figma variables.
---

# Extract Figma Variables

Extracts design variables from a Figma file and updates `src/theme/tokens/theme.css` with the correct names and values. Handles px→rem conversion and Google Fonts imports.

## When to Use

- User provides a Figma design URL (e.g. `https://figma.com/design/xxx/file-name?node-id=1-2`)
- User asks to sync design tokens from Figma
- User asks to extract variables from Figma

## If No URL Is Provided

**Ask the user**: _"Necesito la URL del archivo de Figma para extraer las variables. Por ejemplo: https://figma.com/design/[fileKey]/[nombre]?node-id=1-2"_

Do not proceed until the user provides a valid Figma URL.

---

## Workflow

### Step 1: Parse Figma URL

Extract from the URL:

- **fileKey**: The design file key (e.g. from `figma.com/design/ABC123/MyFile` → `ABC123`)
- **nodeId**: Convert hyphen to colon (e.g. `1-2` → `1:2`). If no `node-id` in URL, use `""` for file-level variables.

URL formats:

- `https://figma.com/design/:fileKey/:fileName?node-id=:int1-:int2`
- `https://figma.com/design/:fileKey/branch/:branchKey/:fileName` → use `branchKey` as `fileKey`

### Step 2: Get Variables from Figma

**Option A — MCP:** Call `get_variable_defs` (server: `user-Figma`):

```json
{
  "fileKey": "<extracted fileKey>",
  "nodeId": "<extracted nodeId or \"\">",
  "clientLanguages": "css,typescript",
  "clientFrameworks": "angular"
}
```

**Option B — REST API (if MCP returns no data):** Run the script directly (from project root):

```bash
FIGMA_ACCESS_TOKEN=<token> node .ai/skills/abp-extract-figma-variables/fetch-figma-variables.js <fileKey|url>
```

- Token: Figma Settings > Security > Personal access tokens
- Scopes: `file_content:read` (required); `file_variables:read` (Enterprise only, for Variables API)
- Fallback: If `file_variables:read` is not available, the script extracts colors and typography from the document structure.

### Step 3: Map Variables to theme.css

Target file: `src/theme/tokens/theme.css`

| Figma path / type  | theme.css variable      |
| ------------------ | ----------------------- |
| `color.primary`    | `--ft-color-primary`    |
| `color.secondary`  | `--ft-color-secondary`  |
| `color.tertiary`   | `--ft-color-tertiary`   |
| `color.success`    | `--ft-color-success`    |
| `color.warning`    | `--ft-color-warning`    |
| `color.danger`     | `--ft-color-danger`     |
| `color.info`       | `--ft-color-info`       |
| `color.light`      | `--ft-color-light`      |
| `color.dark`       | `--ft-color-dark`       |
| `color.text`       | `--ft-color-text`       |
| `color.text-muted` | `--ft-color-text-muted` |
| `color.bg`         | `--ft-color-bg`         |
| `color.border`     | `--ft-color-border`     |
| `font.family-base` | `--ft-font-family-base` |
| `font.weight-base` | `--ft-font-weight-base` |
| `font.size.base`   | `--ft-font-size-base`   |
| `font.size.h1`     | `--ft-h1-font-size`     |
| `font.size.h2`     | `--ft-h2-font-size`     |
| `font.size.h3`     | `--ft-h3-font-size`     |
| `line-height-base` | `--ft-line-height-base` |

For nested structures (e.g. `global.color.primary`), map by the last segments (`color.primary` → `--ft-color-primary`).

### Step 4: Transform Values

**Colors**: Use as-is (hex, rgb, etc.).

**Numeric values (font sizes, spacing)**:

- If the variable in `theme.css` uses `rem` and Figma returns `px`:
  - Formula: `rem = px / 16` (base 16px)
  - Example: `24px` → `1.5rem`, `16px` → `1rem`, `14px` → `0.875rem`
- If Figma returns unitless numbers (e.g. `16`), treat as `px` and convert to rem.
- Keep `line-height` as unitless when appropriate (e.g. `1.5` stays `1.5`).

**Font families**:

- If the value is a Google Font name (e.g. `Inter`, `Roboto`, `Open Sans`):
  1. Add import in `src/index.html` inside `<head>`:
     ```html
     <link
       href="https://fonts.googleapis.com/css2?family=Font+Name:wght@400;500;600;700&display=swap"
       rel="stylesheet"
     />
     ```
     Use the correct URL format from [Google Fonts](https://fonts.google.com/). For multiple weights: `wght@400;500;600;700`.
  2. Set `--ft-font-family-base` to `'Font Name', sans-serif` (with quotes if the name has spaces).

### Step 5: Update theme.css

- Replace only the values of existing `--ft-*` variables that have a match in the Figma variables.
- Preserve the structure of `:root`, `@media (prefers-color-scheme: dark)`, and any other rules.
- Do not remove variables that have no Figma counterpart; leave them unchanged.

### Step 6: Update index.html (if fonts added)

- Add Google Fonts `<link>` before other stylesheets in `<head>`.
- Avoid duplicate imports for the same font family.

---

## Alternative: REST API Script

When MCP `get_variable_defs` returns no data, use the script:

```bash
FIGMA_ACCESS_TOKEN=<token> node .ai/skills/abp-extract-figma-variables/fetch-figma-variables.js <fileKey|url>
```

The script outputs JSON with `mapped` variables ready for theme.css. Parse the output and apply Step 3–6.

---

## Summary Rules

| Rule       | Detail                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| No URL     | Ask user for Figma URL before proceeding                                                                                        |
| MCP tool   | Use `get_variable_defs` from server `user-Figma`                                                                                |
| Fallback   | Use `node .ai/skills/abp-extract-figma-variables/fetch-figma-variables.js` with `FIGMA_ACCESS_TOKEN` if MCP returns no data |
| Target CSS | `src/theme/tokens/theme.css`                                                                                                    |
| px → rem   | Base 16px: `rem = px / 16`                                                                                                      |
| Fonts      | Assume Google Fonts; import from `https://fonts.googleapis.com/` in `src/index.html`                                            |
| Mapping    | Use `--ft-*` naming; map by semantic name (primary, secondary, etc.)                                                            |

## Additional Resources

- For conversion tables and Google Fonts format, see [reference.md](reference.md)
