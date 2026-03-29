# TK-004: Diálogos crear y editar producto

- **ID:** TK-004
- **Nombre corto:** Alta y edición en diálogo
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

En `src/app/features/catalog/`, implementar en un **mismo patrón de tarea** el diálogo **`features/catalog/components/product-form`** (carpeta `src/app/features/catalog/components/product-form/`) para los flujos **Crear producto** y **Editar producto**. **Crear:** según `assets/wireframe-dialogo-crear-producto.png` — **SKU**, nombre, precio, estado con valor por defecto **Activo** (`active`), descripción opcional; mostrar **`currency` solo lectura `USD`** (obligatorio aunque el wireframe no lo muestre). **Editar:** para productos en estado **no archivado**, permitir **SKU**, nombre, descripción, precio y alternancia `active` ↔ `inactive`; **`currency`** permanece solo lectura. **No** abrir el flujo habitual de edición para filas `archived` (cambio de estado a `active` o `inactive` solo vía [TK-003](./TK-003-menu-contextual-producto.md)). Formularios reactivos o Signal Forms según [ADR-009](../../adr/ADR-009-form-strategy.md) y maquetación [ADR-010](../../adr/ADR-010-form-layout-structure.md). Validaciones: **SKU** y nombre obligatorios, nombre máx. 60 caracteres, precio obligatorio y ≥ 0, presentación a dos decimales. Enviar crear/actualizar vía manager; mostrar feedback de éxito o error; **mostrar** respuestas de conflicto/validación devueltas por el cliente HTTP o mock **sin** replicar en el formulario lógica de unicidad ni normalización de dominio. Cerrar el diálogo tras creación exitosa; en edición, refrescar datos coherentes con el listado y el detalle. Los puntos de apertura pueden ser el listado, el detalle o ambos, alineados con TK-002.

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Diseño:** [Diálogo de creación de producto](./README.md#diálogo-de-creación-de-producto) — `assets/wireframe-dialogo-crear-producto.png`
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-013 Dialog master-detail](../../adr/ADR-013-dialog-master-detail.md), [ADR-009 Form strategy](../../adr/ADR-009-form-strategy.md), [ADR-010 Form layout structure](../../adr/ADR-010-form-layout-structure.md)
- **Ubicación en código:** el componente de diálogo (crear/editar) debe ser **`features/catalog/components/product-form`** (`src/app/features/catalog/components/product-form/`).
- **Plantilla:** `src/app/features/templates/components/entity-form/`
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md); integración de UX con [TK-002](./TK-002-vista-listado-filtro-detalle.md)

## Componentes a usar

- Servicio de diálogo / patrón de diálogo del proyecto; controles del formulario de la librería de componentes.

## Criterios de aceptación

- No se envía datos inválidos según validaciones de formulario; tras el envío, errores devueltos por repositorio/API (p. ej. conflicto) son visibles **sin** exigir lógica de unicidad/normalización en cliente.
- `currency` no es editable; se persiste como `USD`.
- En alta, el estado por defecto es `active` salvo que el usuario cambie antes de guardar.
- Producto archivado no se edita por este diálogo (acción oculta o deshabilitada).
- En edición elegible, el control de estado solo permite `active` / `inactive`.
- Accesible: etiquetas, anuncio de errores, retorno de foco al cerrar.

## Alcance técnico

- Componente de diálogo `product-form` standalone; **no** implementar normalización ni unicidad de negocio en componente, repositorio mock ni manager.
