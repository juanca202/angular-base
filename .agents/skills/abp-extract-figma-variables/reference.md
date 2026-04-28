# Extract Figma Variables — Reference

## Alternative: REST API Script

When MCP returns no data:

```bash
FIGMA_ACCESS_TOKEN=<token> npm run figma:variables -- VT4W8MFWwD8k1TYcABLEjf
# or with full URL:
FIGMA_ACCESS_TOKEN=<token> npm run figma:variables -- "https://figma.com/design/VT4W8MFWwD8k1TYcABLEjf/Untitled"
```

- Token: Figma Settings > Security > Personal access tokens
- Scopes: `file_content:read` (required); `file_variables:read` (Enterprise only)
- Output: JSON with `source`, `mapped` (and `extracted` for document fallback)

---

## MCP Tool Schema

**Tool**: `get_variable_defs`  
**Server**: `user-Figma`

**Required parameters**:

- `fileKey` (string): From URL `figma.com/design/:fileKey/...`
- `nodeId` (string): From URL `?node-id=1-2` → `1:2`. Use `""` for file-level variables.

**Optional**:

- `clientLanguages`: `"css,typescript"`
- `clientFrameworks`: `"angular"`

## px to rem Conversion Table (16px base)

| px  | rem      |
| --- | -------- |
| 8   | 0.5rem   |
| 10  | 0.625rem |
| 12  | 0.75rem  |
| 14  | 0.875rem |
| 16  | 1rem     |
| 18  | 1.125rem |
| 20  | 1.25rem  |
| 24  | 1.5rem   |
| 28  | 1.75rem  |
| 32  | 2rem     |

Formula: `rem = px / 16`

## Google Fonts Import Format

Single font:

```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
```

Font with spaces (e.g. "Open Sans"):

```
https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap
```

## theme.css Variable Naming Convention

Prefix: `--ft-` (theme tokens)  
Pattern: `--ft-{category}-{name}` or `--ft-{element}-{property}`

Examples:

- `--ft-color-primary`
- `--ft-font-family-base`
- `--ft-h1-font-size`
