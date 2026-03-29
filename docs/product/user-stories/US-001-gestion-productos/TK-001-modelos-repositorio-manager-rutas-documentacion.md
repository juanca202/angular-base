# TK-001: Modelos, repositorio, manager, rutas y documentación técnica

- **ID:** TK-001
- **Feature:** catalog
- **Nombre corto:** Capa de datos y cimientos del feature productos
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

Entregar el cimiento del feature **productos**: tipos/modelo `Product`, unión de estados (`active` | `inactive` | `archived`), literal fijo de `currency`, constantes de mapeo etiqueta de filtro → parámetro, y rutas **lazy** bajo `src/app/features/catalog/` (o ruta acordada por el equipo), registradas en `app.routes.ts`. Implementar `ProductRepository` según [ADR-006](../../adr/ADR-006-repository-pattern.md) con persistencia **mock** (`MockHttpClient`, semilla JSON opcional bajo `src/test/mocks/repositories/`): colección, filtros por estado y búsqueda opcional, `findBy`, y mutaciones crear; actualizar (incluye transiciones de `status` permitidas, entre ellas `archived` → `active` | `inactive` como **mismo** update, sin recurso dedicado); archivar a `archived`; borrado definitivo. Aplicar en cliente/mock **solo** lo acordado para presentación y persistencia local: redondeo de precio a 2 decimales y `currency: 'USD'` fijo; tomar como referencia la parte aplicable a **mock/UI** en [catalogo-productos.md](../technical-docs/catalogo-productos.md) (**sin** implementar en el mock normalización ni unicidad de dominio salvo duplicado literal opcional para pruebas de UI). Implementar `ProductManager` según [ADR-007](../../adr/ADR-007-manager-pattern.md): carga con filtro de estado y búsqueda, estado de carga/error, métodos que delegan en el repositorio y refresco de recursos tras mutaciones; mapear respuestas de error del cliente (mock o HTTP) a feedback visible sin incrustar UI en el manager. Si el mock o la UI divergen de lo ya descrito para mock/UI en [catalogo-productos.md](../technical-docs/catalogo-productos.md), actualizar solo las líneas pertinentes de esa sección.

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-006 Repository pattern](../../adr/ADR-006-repository-pattern.md), [ADR-007 Manager pattern](../../adr/ADR-007-manager-pattern.md), [ADR-002 Angular style guide](../../adr/ADR-002-angular-style-guide.md)
- **Punto de acceso:** `src/app/features/products/` (modelos, `product-repository.ts`, `product-manager.ts`, `products-routes.ts`, `app.routes.ts`)
- **Plantilla:** `src/app/features/templates/` (repositorio, manager, rutas)

## Componentes a usar

- `MockHttpClient`, `BaseRepository`, helpers de recursos asíncronos compartidos; `MessageService` o equivalente para notificaciones desde el manager.

## Criterios de aceptación

- El listado respeta la semántica de filtros: **Todos** = solo `active` + `inactive`; **Archivado** = solo `archived`; filtros por un estado coinciden exactamente.
- Alta por defecto: `status` = `active`, `currency` = `USD`. **No** exige simular en mock unicidad ni normalización de dominio; opcionalmente el mock puede rechazar duplicados **literales** solo para pruebas de UI. Tras llamadas HTTP, conflictos y errores de validación deben poder mostrarse al usuario (mapeo genérico).
- Actualización no permite cambiar `currency`; en ítems no archivados permite `active` ↔ `inactive` y el resto de campos permitidos; el comportamiento sobre archivados sigue la referencia técnica salvo que la US indique lo contrario.
- Archivar pone `archived`; para filas archivadas, pasar a `active` o `inactive` se hace con una actualización de estado (misma mutación que cambiar `active` ↔ `inactive` en ítems no archivados, aplicable solo en el contexto de listado filtrado por Archivado según la US).
- Borrado elimina el registro en cualquier estado; mock preparado para `DELETE`.
- Precio persistido con como mucho dos decimales.
- Tras cambiar filtro u operación de búsqueda, el manager recarga con los parámetros correctos del repositorio.
- Tras mutación exitosa, el listado o recurso individual se actualiza sin recarga completa de página.
- Si hubo divergencia respecto al mock/UI documentado en [catalogo-productos.md](../technical-docs/catalogo-productos.md), la parte correspondiente queda actualizada.

## Alcance técnico

- Servicios con `providedIn: 'root'` o alcance por feature según convención del proyecto.
- Tests unitarios centrados en repositorio y manager (filtros, mapeo de errores), acordes con la política del equipo.
