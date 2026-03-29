# TK-002: Listado, filtrado y detalle al seleccionar registro

- **ID:** TK-002
- **Feature:** catalog
- **Nombre corto:** Tabla de catálogo y detalle
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

Implementar la pantalla de **listado** del catálogo según el wireframe **[Listado de productos](./README.md#listado-de-productos)** (archivo `assets/wireframe-listado-productos.png` en la misma carpeta que la US): filtro de estado con etiquetas en **español** (Todos, Activo, Inactivo, Archivado), campo de búsqueda opcional, columnas **SKU**, nombre, precio (formato con **$** y dos decimales), moneda (`USD`) y estado (Activo / Inactivo / Archivado). **Al hacer clic en una fila (o en el registro)** se abre la **vista de detalle** del producto (ruta hija, panel lateral o patrón acordado con [ADR-013](../../adr/ADR-013-dialog-master-detail.md)) mostrando la información relevante; la navegación desde el detalle de vuelta al listado no rompe el filtro activo cuando tenga sentido en el diseño. **No** incluir en esta tarea el menú contextual ni acciones por fila (archivar, cambio de estado desde archivado, eliminar): eso queda en [TK-003](./TK-003-menu-contextual-producto.md). Consumir datos vía `ProductManager` de [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md). Respetar `ChangeDetectionStrategy.OnPush`, señales y accesibilidad (etiquetas significativas, controles enfocables, sin violaciones AXE evidentes).

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Wireframe (listado de productos):** [Listado de productos — referencia visual](./README.md#listado-de-productos) — imagen `assets/wireframe-listado-productos.png` (relativa a `US-001-gestion-productos/`)
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-004 Component library](../../adr/ADR-004-component-library.md), [ADR-013 Dialog master-detail](../../adr/ADR-013-dialog-master-detail.md)
- **Punto de acceso:** p. ej. `src/app/features/products/components/product-list/`, vista de detalle asociada (ruta o contenedor)
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md)

## Componentes a usar

- Tabla, filtros y controles de la librería compartida; `NgOptimizedImage` solo si hay imágenes estáticas.

## Criterios de aceptación

- El filtro **Todos** nunca muestra filas `archived`; **Archivado** muestra solo archivados.
- Precio y moneda se muestran según US-001; foco y lectores de pantalla operativos en listado y detalle.
- Pulsar el registro abre el detalle del producto correcto (identificador estable).
- La lista obtiene datos del mock vía manager.

## Alcance técnico

- Componente(s) standalone; la ruta lazy viene de TK-001. Las acciones del menú contextual se conectan en TK-003 sin duplicar lógica de datos.
