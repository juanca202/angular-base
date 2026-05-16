# Design System

## 1. Visual Theme & Atmosphere

This design system embodies modern fintech minimalism with warmth and accessibility at its core. Built for independent professionals and small business owners, the visual language balances professional credibility with approachable friendliness. The system leverages a clean, spacious aesthetic with strategic use of bold accent orange to draw attention to critical actions and key information. Typography flows with consistent hierarchy, while the neutral foundation ensures clarity for data-heavy invoicing and financial dashboards. The overall mood is confident yet supportive—making complex financial transactions feel manageable and intuitive.

**Key Characteristics**

- Clean, modern fintech aesthetic with generous whitespace
- Bold orange accent (`#ED8116`) for primary calls-to-action and key metrics
- Accessibility-focused with high contrast on dark text (`#212529`)
- Geometric precision balanced with human-centered typography (Quicksand)
- Light, airy backgrounds with subtle depth via minimal shadows
- Data-visualization ready with pastel accent colors for secondary information
- Mobile-first responsive design evident in tabbed navigation and touch-friendly spacing

## 2. Color Palette & Roles

### Primary

- **Brand Orange** (`#ED8116`): Primary CTA buttons, links, headings on light backgrounds, active states, key metrics highlighting
- **Primary Dark** (`#212529`): Main text, navigation, body content, most UI text (274 instances)

### Accent Colors

- **Link Blue** (`#1E7CFF`): Secondary interactive elements, alternative CTAs, focus states
- **Sky Blue** (`#009DFB`): Tertiary interactive states, hover effects, chart backgrounds
- **Dark Blue** (`#0A66C2`): Link underlines, alternative accent contexts, brand consistency

### Interactive

- **Warm Orange Hover** (`#E87A0A`): Derived from `#ED8116`, primary button hover state
- **Orange Link** (`#ED8116`): Default link color, inline actions
- **Dark Text Interactive** (`#212529`): Button text, navigation items

### Neutral Scale

- **Pure White** (`#FFFFFF`): Cards, modals, backgrounds, text on dark, input fields (27 instances)
- **Off-White** (`#F8F9FA`): Subtle background sections, card separators, light surface tint
- **Light Gray** (`#EBECED`): Borders, dividers, disabled states, subtle backgrounds (7 instances)
- **Dark Gray** (`#49454F`): Secondary text, labels, metadata (8 instances)
- **Pure Black** (`#000000`): Fallback text, icons, emphasis (6 instances)

### Surface & Borders

- **Card Surface** (`#FFFFFF`): Default card background with `1px solid #FFFFFF` border
- **Border Subtle** (`#EBECED`): Form inputs, card separators, dividers
- **Border Dark** (`#212529`): Emphasis borders, active input states (minimal use)

### Semantic / Status

- **Success Green** (`#28A745`): Success notifications, checkmarks, valid form states
- **Error Red** (`#FF0000`): Error states, validation failures, critical alerts (6 instances)
- **Error Alt Red** (`#F44336`): Alternative error styling, destructive actions (1 instance)

## 3. Typography Rules

### Font Family

**Primary:** Quicksand (sans-serif)

- Stack: `Quicksand, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

**Fallback:** System stack

- `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

### Hierarchy

| Role            | Font      | Size    | Weight | Line Height | Letter Spacing | Notes                                    |
| --------------- | --------- | ------- | ------ | ----------- | -------------- | ---------------------------------------- |
| Display / H1    | Quicksand | 40px    | 600    | 48px        | 0px            | Hero headings, page titles               |
| Heading / H2    | Quicksand | 28px    | 600    | 33.6px      | 0px            | Section headings, major groupings        |
| Heading / H3    | Quicksand | 18px    | 600    | 21.6px      | 0px            | Subsection titles, card headers          |
| Body            | Quicksand | 24.08px | 400    | 36.12px     | 0px            | Long-form content (legacy/expanded)      |
| Body Standard   | Quicksand | 16px    | 400    | 24px        | 0px            | Standard body text, descriptions         |
| Link            | Quicksand | 16px    | 400    | 24px        | 0px            | Inline and standalone links              |
| Small / Caption | Quicksand | 12.8px  | 400    | 19.2px      | 0px            | Metadata, timestamps, helper text        |
| Button Label    | Quicksand | 16px    | 600    | 40px        | 0px            | CTA button text, uppercase or title case |
| Navigation      | Quicksand | 16px    | 400    | 24px        | 0px            | Header nav, breadcrumbs                  |
| Badge / Tag     | Quicksand | 12px    | 600    | 16px        | 0px            | Status labels, category badges           |

### Principles

- **Single font family** — Quicksand provides warmth and approachability while maintaining professional credibility
- **Weight hierarchy** — Weight 600 (semibold) for all headings; weight 400 (regular) for body and navigation to reduce cognitive load
- **Generous line height** — 1.2× to 1.5× font size for readability in financial contexts where accuracy is critical
- **No letter spacing** — Quicksand's inherent spacing is optimal; additional letter-spacing reserved for emphasis only
- **Contrast first** — Ensure all text meets WCAG AA minimums; orange text on white, dark text on light backgrounds
- **Financial clarity** — Numbers and data fields use consistent sizing and weight; never italic for crucial metrics

## 4. Component Stylings

### Buttons

#### Primary Button

- **Background:** `#ED8116`
- **Text Color:** `#FFFFFF`
- **Font Size:** `16px`
- **Font Weight:** `600`
- **Padding:** `12px 24px` (inferred from button patterns)
- **Border Radius:** `900px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `none`
- **Hover State:**
  - **Background:** `#E87A0A` (10% darker)
  - **Box Shadow:** `0px 2px 8px rgba(237, 129, 22, 0.2)`
- **Active State:**
  - **Background:** `#D96E00`
- **Disabled State:**
  - **Background:** `#EBECED`
  - **Text Color:** `#49454F`
  - **Cursor:** `not-allowed`

#### Secondary Button (Light)

- **Background:** `#F8F9FA`
- **Text Color:** `#ED8116`
- **Font Size:** `16px`
- **Font Weight:** `600`
- **Padding:** `12px 24px`
- **Border Radius:** `900px`
- **Border:** `2px solid #ED8116`
- **Box Shadow:** `none`
- **Hover State:**
  - **Background:** `#EBECED`
  - **Border Color:** `#E87A0A`

#### Ghost Button (Text Only)

- **Background:** `transparent`
- **Text Color:** `#ED8116`
- **Font Size:** `16px`
- **Font Weight:** `600`
- **Padding:** `8px 16px`
- **Border Radius:** `8px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `none`
- **Hover State:**
  - **Background:** `rgba(237, 129, 22, 0.08)`
  - **Text Color:** `#E87A0A`

### Cards & Containers

#### Default Card

- **Background:** `#FFFFFF`
- **Text Color:** `#212529`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #FFFFFF`
- **Box Shadow:** `0px 0px 0.0394838px 0px rgba(0, 0, 0, 0.004), 0px 0px 0.236903px 0px rgba(0, 0, 0, 0.004)`
- **Line Height:** `normal`
- **Hover State:**
  - **Border Color:** `#EBECED`
  - **Box Shadow:** `0px 2px 12px rgba(0, 0, 0, 0.08)`

#### Data Card (Wide)

- **Background:** `#FFFFFF`
- **Text Color:** `#212529`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `24px`
- **Border Radius:** `8px`
- **Border:** `1px solid #EBECED`
- **Box Shadow:** `0px 1px 3px rgba(0, 0, 0, 0.06)`
- **Line Height:** `1.6`

#### Container (Full Width)

- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#212529`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `0px`
- **Border Radius:** `0px`
- **Border:** `0px none`
- **Box Shadow:** `none`
- **Max Width:** `1440px`
- **Margin:** `0 auto`

### Inputs & Forms

#### Text Input (Default)

- **Background:** `#FFFFFF`
- **Text Color:** `#212529`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `12px 16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #EBECED`
- **Box Shadow:** `none`
- **Font Family:** `Quicksand, sans-serif`
- **Line Height:** `24px`
- **Focus State:**
  - **Border Color:** `#ED8116`
  - **Box Shadow:** `0px 0px 0px 3px rgba(237, 129, 22, 0.1)`
  - **Outline:** `none`
- **Error State:**
  - **Border Color:** `#FF0000`
  - **Background:** `rgba(255, 0, 0, 0.02)`
- **Disabled State:**
  - **Background:** `#F8F9FA`
  - **Text Color:** `#49454F`
  - **Border Color:** `#EBECED`
  - **Cursor:** `not-allowed`
- **Placeholder:**
  - **Color:** `#49454F`
  - **Opacity:** `0.7`

#### Dropdown / Select

- **Background:** `#FFFFFF`
- **Text Color:** `#212529`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `12px 16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #EBECED`
- **Box Shadow:** `none`
- **Arrow Color:** `#212529`
- **Focus State:**
  - **Border Color:** `#1E7CFF`
  - **Box Shadow:** `0px 0px 0px 3px rgba(30, 124, 255, 0.1)`

#### Checkbox / Radio

- **Accent Color:** `#ED8116`
- **Border Color (Unchecked):** `#EBECED`
- **Background (Checked):** `#ED8116`
- **Size:** `20px`
- **Border Radius (Checkbox):** `4px`
- **Border Radius (Radio):** `50%`

### Navigation

#### Header Navigation

- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#212529`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `0px`
- **Line Height:** `24px`
- **Height:** `40px`
- **Border Radius:** `0px`
- **Border:** `0px none`
- **Box Shadow:** `0px 0px 0.0394838px 0px rgba(0, 0, 0, 0.004), 0px 0px 0.236903px 0px rgba(0, 0, 0, 0.004)`
- **Hover State:**
  - **Text Color:** `#ED8116`
  - **Background:** `rgba(237, 129, 22, 0.04)`
- **Active State:**
  - **Text Color:** `#ED8116`
  - **Font Weight:** `600`
  - **Border Bottom:** `2px solid #ED8116`

#### Sidebar Navigation

- **Background:** `#FFFFFF`
- **Text Color:** `#212529`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `16px`
- **Border Radius:** `0px`
- **Border Right:** `1px solid #EBECED`
- **Active Item Background:** `rgba(237, 129, 22, 0.08)`
- **Active Item Text Color:** `#ED8116`
- **Hover State:**
  - **Background:** `#F8F9FA`

### Badges & Tags

#### Success Badge

- **Background:** `rgba(40, 167, 69, 0.1)`
- **Text Color:** `#28A745`
- **Font Size:** `12px`
- **Font Weight:** `600`
- **Padding:** `6px 12px`
- **Border Radius:** `900px`
- **Border:** `1px solid #28A745`

#### Error Badge

- **Background:** `rgba(255, 0, 0, 0.1)`
- **Text Color:** `#FF0000`
- **Font Size:** `12px`
- **Font Weight:** `600`
- **Padding:** `6px 12px`
- **Border Radius:** `900px`
- **Border:** `1px solid #FF0000`

#### Info Badge (Orange)

- **Background:** `rgba(237, 129, 22, 0.1)`
- **Text Color:** `#ED8116`
- **Font Size:** `12px`
- **Font Weight:** `600`
- **Padding:** `6px 12px`
- **Border Radius:** `900px`
- **Border:** `1px solid #ED8116`

### Tabs

#### Tab (Default)

- **Background:** `transparent`
- **Text Color:** `#212529`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `12px 16px`
- **Border Radius:** `0px`
- **Border Bottom:** `2px solid transparent`
- **Hover State:**
  - **Text Color:** `#ED8116`
  - **Border Bottom Color:** `rgba(237, 129, 22, 0.3)`

#### Tab (Active)

- **Background:** `transparent`
- **Text Color:** `#ED8116`
- **Font Weight:** `600`
- **Border Bottom:** `2px solid #ED8116`

## 5. Layout Principles

### Spacing System

**Base Unit:** `8px`

**Scale:**

- `4px` — Minimal gap between compact elements, icon spacing
- `8px` — Gap between related items, tight grouping
- `16px` — Standard padding for cards, input spacing, form groups
- `24px` — Generous card padding, section separators, modal padding
- `32px` — Large section spacing, component grouping
- `40px` — Major section spacing, hero spacing
- `48px` — Large gap between distinct content sections
- `152px` — Hero-to-content margin, page-level spacing

**Usage Context:**

- **Cards & Components:** `16px` or `24px` padding
- **Form Groups:** `16px` between inputs, `8px` between label and input
- **Sections:** `32px` to `48px` vertical gap
- **Navigation:** `16px` horizontal item spacing
- **Mobile:** Reduce all spacing by `4px` to `8px` on smaller viewports

### Grid & Container

- **Max Width:** `1440px`
- **Column Strategy:** 12-column grid (inferred from responsive design)
- **Gutter Width:** `16px` (responsive, reduce to `8px` on mobile)
- **Center Alignment:** `margin: 0 auto` on main containers
- **Breakpoint-Specific Widths:**
  - Desktop (1440px+): Full grid width
  - Tablet (768px-1439px): 90% width, `32px` margins
  - Mobile (320px-767px): 100% width minus `16px` padding on each side

### Whitespace Philosophy

The layout philosophy emphasizes breathing room and cognitive clarity. Sections are separated by substantial vertical gaps (`32px` to `48px`) to avoid content fatigue. Cards and containers use consistent internal padding (`16px` to `24px`) to create visual hierarchy without visual noise. Navigation and key actions are spaced to ensure touch accessibility on mobile (minimum `44px` height) while maintaining elegance on desktop.

### Border Radius Scale

- `0px` — Full-width containers, navigation bars, hero sections
- `4px` — Micro-interactions, small badges, compact form states
- `8px` — Cards, modals, input fields, standard components
- `12px` — Slightly softer cards, prominent containers
- `900px` (pill) — Button shapes, badge shapes, rounded pills
- `1440px` (circular) — Avatar containers, icon badges (fallback to `50%`)

## 6. Depth & Elevation

| Level      | Treatment                                                                                   | Use                                                             |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Flat (0)   | No shadow, `box-shadow: none`                                                               | Backgrounds, typography-only sections, flat UI components       |
| Subtle (1) | `0px 0px 0.0394838px 0px rgba(0, 0, 0, 0.004), 0px 0px 0.236903px 0px rgba(0, 0, 0, 0.004)` | Navigation, subtle component separation, minimal depth emphasis |
| Small (2)  | `0px 2px 8px rgba(0, 0, 0, 0.06)`                                                           | Cards, input focus states, component hover effects              |
| Medium (3) | `0px 4px 12px rgba(0, 0, 0, 0.08)`                                                          | Modal overlays, dropdown menus, floating panels                 |
| Large (4)  | `0px 8px 24px rgba(0, 0, 0, 0.12)`                                                          | Full-screen modals, alert boxes, critical overlays              |

**Shadow Philosophy:**
The shadow system uses ultra-light, barely perceptible shadows at the base layer (Subtle/1), escalating only when interaction demands visual separation. This creates a flat, modern aesthetic while preserving depth cues for interactive elements. Shadows use black with minimal opacity (0.004 to 0.12) to ensure colors remain true and text remains legible. The system avoids harsh drop shadows; every shadow is diffused and soft, reflecting the approachable, non-aggressive brand personality.

## 7. Do's and Don'ts

### Do

- **Use `#ED8116` (Brand Orange)** for all primary CTAs, active states, and key metrics to maintain consistent brand recognition
- **Apply `#212529` (Primary Dark)** as default text color; it provides excellent contrast on light backgrounds and maintains legibility
- **Respect the `8px` base spacing unit** — use multiples (8px, 16px, 24px, 32px, 48px) to maintain visual rhythm and harmony
- **Leverage Quicksand exclusively** for all typography; its geometric warmth is core to the brand identity
- **Use pill-shaped buttons** (`border-radius: 900px`) for all primary and secondary CTA buttons
- **Apply generous padding** (`16px` to `24px`) within cards to ensure content doesn't feel cramped or overwhelming
- **Employ the subtle shadow** (`0px 0px 0.0394838px 0px rgba(0, 0, 0, 0.004)`) for navigation and low-emphasis elements
- **Test all text** against WCAG AA contrast ratios; aim for 4.5:1 on body text, 3:1 on larger text
- **Use semantic colors** (`#28A745` for success, `#FF0000` for error) consistently across all success/error states
- **Include `:focus` states** with visible outlines (`3px solid rgba(color, 0.3)`) to support keyboard navigation

### Don't

- **Never override Quicksand** with alternative fonts; even for code, use monospace fallbacks only, not brand font changes
- **Avoid harsh shadows** or shadows with opacity > 0.15; they break the flat, modern aesthetic and can obscure content
- **Don't use pure black** (`#000000`) as default text; always use `#212529` for softer, more accessible contrast
- **Never mix orange shades** — stick to `#ED8116` as primary, `#E87A0A` for hover, `#D96E00` for active
- **Avoid reducing spacing** below `4px` (the base unit); it compromises clarity and alignment
- **Don't apply shadows** to text directly; shadows are for containers, cards, and floating elements only
- **Never disable buttons without visual feedback** — always use `#EBECED` background + `#49454F` text + `cursor: not-allowed`
- **Avoid color-only distinction** for interactive states; always combine color with weight, background, or underline changes
- **Don't center-align body text** for readability; use left alignment for paragraphs and descriptions
- **Never remove `:focus` visual indicators** — keyboard accessibility is non-negotiable for fintech applications

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width Range   | Key Changes                                                                           | Max Width   | Gutter |
| --------------- | ------------- | ------------------------------------------------------------------------------------- | ----------- | ------ |
| Mobile          | 320px–479px   | Single column, full-width cards, collapsed navigation, `16px` padding                 | 100% - 32px | 8px    |
| Mobile Large    | 480px–767px   | Single column with wider margins, begin horizontal scrolling support                  | 100% - 32px | 12px   |
| Tablet          | 768px–1023px  | 2-column layout option, sidebar navigation collapses to hamburger menu, `32px` gutter | 90%         | 16px   |
| Desktop         | 1024px–1439px | 12-column grid, full sidebar navigation, 2–3 column content areas                     | 95%         | 16px   |
| Desktop Large   | 1440px+       | Full 12-column grid, max-width container at 1440px, optimal spacing                   | 1440px      | 24px   |

### Touch Targets

- **Minimum Touch Size:** `44px × 44px` for all interactive elements (buttons, links, checkboxes, form inputs)
- **Spacing Between Targets:** Minimum `8px` between adjacent interactive elements to prevent mis-taps
- **Button Padding (Mobile):** `14px 20px` (increased from `12px 24px` on desktop) to meet touch requirements
- **Input Height (Mobile):** `48px` minimum to ensure finger-friendly interactions
- **Navigation Items:** `44px` height on mobile, `40px` on desktop
- **Hover States:** Only apply to devices with pointer capability; use `:hover` media queries to prevent sticky hover on touch

### Collapsing Strategy

**Mobile (320px–767px):**

- Stack all content vertically (single column)
- Convert header navigation to hamburger menu (icon: `24px`, menu width: 80% or `280px`)
- Reduce all spacing by `4px` to `8px` (e.g., `24px` → `16px` card padding)
- Full-width cards with `16px` padding
- Buttons expand to full width within their container
- Sidebars collapse; content shifts to modal or overlay

**Tablet (768px–1023px):**

- 2-column layout for content + sidebar
- Navigation remains horizontal but tabs stack on small tablets
- Card grid adjusts to 2 columns
- Hamburger menu → mini sidebar (90px width) with icons
- Maintain `16px` gutter between columns

**Desktop (1024px+):**

- Full 12-column grid enables flexible multi-column layouts
- Persistent sidebar navigation (240px width)
- Cards can occupy 3–4 columns
- Full horizontal navigation bar with all items visible
- All spacing restored to default scale

**Specific Component Collapse Patterns:**

- **Cards:** Reduce from `24px` padding (desktop) to `16px` (mobile)
- **Headings:** H1 reduces from `40px` to `28px` on mobile; H2 from `28px` to `20px`
- **Font Sizes:** Body text remains `16px` for readability; only caption sizes reduce (to `11px` on mobile)
- **Forms:** Full-width input fields; labels stack above inputs (not beside)
- **Modals:** Reduce max-width to 90vw with `16px` padding on mobile; full-height with bottom sheet on very small devices

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Brand Orange (`#ED8116`) — buttons, active links, highlights
- **Primary Text:** Primary Dark (`#212529`) — all body text, navigation, default states
- **Background:** Pure White (`#FFFFFF`) — cards, modals, main content area
- **Borders & Subtle BG:** Light Gray (`#EBECED`) — dividers, inactive states, subtle backgrounds
- **Success State:** Success Green (`#28A745`) — checkmarks, validation passes
- **Error State:** Error Red (`#FF0000`) — validation failures, error messages
- **Link Color:** Orange Link (`#ED8116`) — inline and standalone links
- **Secondary Text:** Dark Gray (`#49454F`) — metadata, helper text, labels
- **Disabled State:** Off-White background (`#F8F9FA`) + `#49454F` text

### Iteration Guide

1. **All buttons default to pill shape** (`border-radius: 900px`) with `#ED8116` background; secondary buttons use outline style (`border: 2px solid #ED8116`, transparent background)
2. **Cards always have `16px` to `24px` padding**, `border-radius: 8px`, white background (`#FFFFFF`), and minimal shadow (`0px 0px 0.0394838px`)
3. **Typography uses Quicksand exclusively** — body at `16px` weight 400, headings at weight 600, no other font overrides
4. **Spacing adheres to `8px` multiples** — never use arbitrary values like `18px` or `13px`; use `16px`, `24px`, `32px`, etc.
5. **Focus states always include visible indicator** — outline (`3px solid rgba(color, 0.3)`) or underline, never removed
6. **Interactive states use color + weight + background changes** — never rely on color alone for accessibility
7. **Mobile layouts collapse to single column** with `16px` side padding; buttons expand to full width
8. **All text meets WCAG AA contrast** — `#212529` on `#FFFFFF` (21:1), `#ED8116` on `#FFFFFF` (5.5:1), verified with tools
9. **Hover states apply only to `:hover` media query** (pointer devices); touch devices skip hover, jump to active state
10. **Max container width is `1440px`** with centered margin; breakpoint grid adjusts from 1 column (mobile) to 12 columns (desktop)
