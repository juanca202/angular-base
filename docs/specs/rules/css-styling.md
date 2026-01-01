## Guía de CSS y Estilos

**📖 [English](../en/css-styling.md) | [Español](./css-styling.md)**

- Sigue la convención de nombres **BEM (Block Element Modifier)** para todos los nombres de clases CSS personalizadas.  
  **Ejemplo:** `ft-button`, `ft-button__icon`, `ft-button--primary`

- Todas las clases personalizadas deben comenzar con el prefijo **`ft-`**.  
  **Ejemplo:** ✅ `ft-card__header`, ❌ `card-header`.

- **Prioriza el uso de clases utilitarias y de tema existentes** antes de crear nuevas clases personalizadas.  
  Solo crea una clase personalizada si **ninguna clase existente o combinación de utilidades** logra el diseño requerido.

- Antes de crear una nueva clase, **siempre verifica** si ya existe una que cubra el mismo caso de uso.  
  Reutiliza y extiende clases existentes cuando sea posible.

- Prefiere **estilos a nivel de componente (CSS con scope)** en lugar de estilos globales.

- Usa **variables CSS** (`--ft-primary-color`, `--ft-spacer`, etc.) para colores, espaciado y tipografía para asegurar consistencia en el diseño.

- **No hardcodees** colores, tamaños de fuente o espaciado directamente en CSS. En su lugar, usa las variables compartidas definidas en **`theme/variables.scss`**, que incluyen:
  - Variables de color  
  - Variables de texto y tipografía  
  - Variables de espaciado y layout  

- **Siempre prioriza el uso de clases utilitarias de Tailwind CSS** antes de crear estilos personalizados.  
  Usa utilidades de Tailwind para:
  - **Layout** (display, flex, grid, positioning)
  - **Spacing** (margin, padding, gap)
  - **Tipografía** (tamaño de fuente, peso, alineación, transformación de texto, colores)
  - **Diseño responsive** (variantes de breakpoint: `sm:`, `md:`, `lg:`, `xl:`, `xxl:`)
  - **Otras utilidades** (ancho, alto, colores, bordes, sombras, etc.)
  
  Estas aseguran consistencia entre componentes y reducen CSS redundante.

- Evita estilos inline y `ngStyle`. Usa **clases utilitarias de Tailwind**, **bindings de style**, o **bindings de class** en su lugar.

- Usa **clases utilitarias de Tailwind** para ajustes de layout y necesidades de estilo comunes — no para estilos específicos de componente.

- Para **estilos específicos de componente**, crea clases personalizadas siguiendo la convención BEM con el prefijo `ft-`.

- Mantén las declaraciones CSS **mínimas y con propósito** — evita anidamiento profundo y especificidad excesiva.

- Al definir layouts responsive, usa **breakpoints responsive de Tailwind** (`sm:`, `md:`, `lg:`, `xl:`, `xxl:`).

- Usa **transiciones y animaciones con moderación**; prioriza rendimiento y accesibilidad.

- Para **iconos e imágenes**:
  - Prefiere `NgOptimizedImage` de Angular
  - Siempre incluye atributos `alt` para accesibilidad

- **Regla Resumen:**  
  **1️⃣ Usa utilidades existentes primero** → **2️⃣ Usa clases de componente existentes** → **3️⃣ Crea clases `ft-` personalizadas solo si es estrictamente necesario.**

