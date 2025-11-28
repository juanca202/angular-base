## Icon Usage Guidelines

- Always use the `<ft-icon />` component for all icons in the application.
- The `<ft-icon />` component accepts two main properties:
  - `name`: the icon’s symbol name.
  - `collection`: the icon collection source.

### Available Collections

- `factoricons-slim`
- `factoricons-regular` *(default collection — no need to specify the property)*
- `factoricons-solid`
- `icons` → used for **custom icons** stored in `public/images/icons.svg`

### Custom Icon Library

- When using the `icons` collection, the icon must exist in:  
  `public/images/icons.svg`
- Each custom icon should be defined as an **SVG symbol** optimized to **24×24 pixels**.
- If the icon does **not exist**, create it inside `public/images/icons.svg` as follows:

  ```html
  <symbol id="settings" viewBox="0 0 24 24">
    <path d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z" />
  </symbol>
  ```

- Example structure of `public/images/icons.svg`:

  ```html
  <symbol id="settings" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z" />
  </symbol>
  ```

### Icon Sizes

- To adjust the icon size, use the **size modifier class** `ft-icon--{n}` where `{n}` ranges from **1 to 5**.  

  Example:
  ```html
  <ft-icon name="user" class="ft-icon--3" />
  ```

- Size scale reference:
  - `ft-icon--1`: Extra small  
  - `ft-icon--2`: Small  
  - `ft-icon--3`: Medium *(default)*  
  - `ft-icon--4`: Large  
  - `ft-icon--5`: Extra large

- If a specific size is required beyond the predefined scale, apply a custom size using **`font-size`**:

  ```html
  <ft-icon name="user" style="font-size: 32px;" />
  ```
### Usage Examples

#### Using default collection (factoricons-regular):

```html
<ft-icon name="user" />
<ft-icon name="settings" />
```

#### Using another predefined collection:

```html
<ft-icon name="user" collection="factoricons-slim" />
<ft-icon name="settings" collection="factoricons-solid" />
```

#### Using custom icons:

```html
<ft-icon name="user-settings" collection="icons" />
<ft-icon name="calendar-add" collection="icons" />
```

### General Rules

- Prefer using icons from the predefined factoricons-* collections when possible.
- Only add new icons to the `icons` collection when no suitable symbol exists in the predefined sets.
- Do not use `<mat-icon>` or raw `<svg>` elements directly in templates.
- All icons (custom or predefined) must visually align with the **Material 24×24 grid** for consistency.

### Icon Selection Guidelines

- To select an icon, **search within the desired collection** for a symbol whose `id` best represents the intended meaning or concept.  
- The `id` of each `<symbol>` acts as the **descriptive identifier** and is used in the `name` property of the `<ft-icon />` component.  

Example:

```html
<symbol id="user-settings" viewBox="0 0 24 24">
  <path d="..." />
</symbol>
```
