# TK-003: Menú contextual y acciones por fila

- **ID:** TK-003
- **Feature:** catalog
- **Nombre corto:** Acciones archivar, cambio de estado desde archivado y eliminar
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

**Alcance:** solo **frontend**; la lógica de unicidad/normalización de catálogo es **backend** y **no** forma parte de esta tarea.

## Descripción

Sobre el listado de [TK-002](./TK-002-vista-listado-filtro-detalle.md), implementar el **menú contextual** (u otra UI equivalente del sistema de diseño) por fila con las acciones de negocio: **Archivar** y **Eliminar** para filas no archivadas; con filtro **Archivado**, permitir **actualizar el estado** a **`active`** o **`inactive`** (misma mutación de update de `status` que en dominio), **sin diálogo de confirmación**. **Archivar** tampoco lleva confirmación. **Eliminar** aplica a **cualquier** estado y **siempre** abre un diálogo cuyo texto debe coincidir **exactamente** con la plantilla de US-001, sustituyendo solo el nombre del producto:  
`¿Desea eliminar [Nombre del producto] definitivamente? Esta acción no se puede recuperar.`  
Al cancelar, los datos no cambian; al confirmar, se llama al borrado vía manager/repositorio. Las acciones no deben mostrarse cuando violen las reglas de US-001 (p. ej. cambio de estado desde archivado fuera del contexto Archivado). Opciones de implementación coherentes con el diseño: botón partido, submenú con dos entradas, o dos controles con etiquetas accesibles (español / i18n). Enlazar con [ADR-004](../../adr/ADR-004-component-library.md) y [ADR-013](../../adr/ADR-013-dialog-master-detail.md) para el diálogo de confirmación.

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo) — Reglas de negocio (Archivar, cambio de estado desde archivado, Eliminar)
- **Diseño:** [Listado de productos](./README.md#listado-de-productos)
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-004 Component library](../../adr/ADR-004-component-library.md), [ADR-013 Dialog master-detail](../../adr/ADR-013-dialog-master-detail.md)
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md), [TK-002](./TK-002-vista-listado-filtro-detalle.md)

## Componentes a usar

- Diálogo de confirmación del proyecto (`MatDialog` o equivalente); trampa de foco y retorno de foco al control que abrió el diálogo.

## Criterios de aceptación

- Cambio de estado desde archivado: el usuario elige un único estado destino (`active` o `inactive`); doble clic no corrompe datos; sin modal de confirmación para esa actualización.
- Archivar sin confirmación; estado pasa a `archived` de inmediato.
- Eliminar: para el producto llamado exactamente `Aceite 1L`, el cuerpo del diálogo coincide carácter a carácter con el escenario de US-001.
- Eliminar no se ejecuta hasta confirmar; tras confirmar, el producto no aparece en listados pertinentes; funciona en `active`, `inactive` y `archived`.
- Las acciones visibles respetan el filtro de estado (p. ej. pasar de `archived` a operativo solo con filtro Archivado).
- Teclado y lector de pantalla utilizables (roles y etiquetas).

## Alcance técnico

- Cambio acotado en configuración de filas del listado o subcomponente de acciones; reutilizar el método de **actualización de estado** / `update` del manager (p. ej. `updateProduct` o equivalente) para `archived` → `active` | `inactive` en lugar de un método de aplicación con nombre distinto al de actualización general.
