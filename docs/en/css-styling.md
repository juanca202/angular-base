## CSS & Styling Guide

**📖 [English](./css-styling.md) | [Español](../es/css-styling.md)**

- Follow the **BEM (Block Element Modifier)** naming convention for all custom CSS class names.  
  **Example:** `ft-button`, `ft-button__icon`, `ft-button--primary`

- All custom classes must start with the prefix **`ft-`**.  
  **Example:** ✅ `ft-card__header`, ❌ `card-header`.

- **Prioritize using existing utility and theme classes** before creating new custom classes.  
  Only create a custom class if **no existing class or combination of utilities** achieves the required design.

- Before creating a new class, **always check** if an existing one already covers the same use case.  
  Reuse and extend existing classes when possible.

- Prefer **component-level styles (scoped CSS)** instead of global styles.

- Use **CSS variables** (`--ft-primary-color`, `--ft-spacer`, etc.) for colors, spacing, and typography to ensure design consistency.

- **Do not hardcode** colors, font sizes, or spacing directly in CSS. Instead, use the shared variables defined in **`theme/variables.scss`**, which include:
  - Color variables  
  - Text and typography variables  
  - Spacing and layout variables  

- **Always prioritize using Tailwind CSS utility classes** before creating custom styles.  
  Use Tailwind utilities for:
  - **Layout** (display, flex, grid, positioning)
  - **Spacing** (margin, padding, gap)
  - **Typography** (font size, weight, alignment, text transform, colors)
  - **Responsive design** (breakpoint variants: `sm:`, `md:`, `lg:`, `xl:`, `xxl:`)
  - **Other utilities** (width, height, colors, borders, shadows, etc.)
  
  These ensure consistency across components and reduce redundant CSS.

- Avoid inline styles and `ngStyle`. Use **Tailwind utility classes**, **style bindings**, or **class bindings** instead.

- Use **Tailwind utility classes** for layout adjustments and common styling needs — not for component-specific styling.

- For **component-specific styling**, create custom classes following BEM convention with the `ft-` prefix.

- Keep CSS declarations **minimal and purposeful** — avoid deep nesting and excessive specificity.

- When defining responsive layouts, use **Tailwind responsive breakpoints** (`sm:`, `md:`, `lg:`, `xl:`, `xxl:`).

- Use **transitions and animations sparingly**; prioritize performance and accessibility.

- For **icons and images**:
  - Prefer Angular's `NgOptimizedImage`
  - Always include `alt` attributes for accessibility

- **Summary Rule:**  
  **1️⃣ Use existing utilities first** → **2️⃣ Use existing component classes** → **3️⃣ Create custom `ft-` classes only if strictly necessary.**
