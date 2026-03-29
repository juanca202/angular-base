# TK-003: Listado, filtrado y detalle al seleccionar registro

- **ID:** TK-003
- **Nombre corto:** Tabla de catálogo y detalle
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

Dentro de `src/app/features/catalog/`, implementar la pantalla de **listado** del catálogo según el wireframe **[Listado de productos](./README.md#listado-de-productos)** (archivo `assets/wireframe-listado-productos.png` en la misma carpeta que la US): filtro de estado con etiquetas en **español** (Todos, Activo, Inactivo, Archivado), campo de búsqueda opcional, columnas **SKU**, nombre, precio (formato con **$** y dos decimales), moneda (`USD`) y estado (Activo / Inactivo / Archivado). La **búsqueda** debe filtrar por subcadena (insensible a mayúsculas/minúsculas) sobre **SKU** (`code`) y **nombre**, acorde a [catalogo-productos.md](../../technical-docs/catalogo-productos.md). Incluir en la cabecera del listado un **punto de entrada para crear producto** (p. ej. botón principal) y en la **vista de detalle** un acceso para **editar** cuando el producto **no** esté `archived`; esas acciones deben abrir el diálogo único de [TK-002](./TK-002-dialogo-crear-editar-producto.md) (TK-002 sigue a esta tarea en el orden sugerido o en el mismo entregable, sin segundo formulario duplicado). **Al hacer clic en una fila (o en el registro)** se abre la **vista de detalle** del producto (ruta hija, panel lateral o patrón acordado con [ADR-013](../../../adr/ADR-013-dialog-master-detail.md)) mostrando la información relevante (incluida descripción y demás campos acordados en la US); la navegación desde el detalle de vuelta al listado no rompe el filtro activo cuando tenga sentido en el diseño. **No** incluir en esta tarea el menú contextual ni acciones por fila (archivar, cambio de estado desde archivado, eliminar): eso queda en [TK-004](./TK-004-menu-contextual-producto.md). Consumir datos vía `ProductManager` de [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md). Respetar `ChangeDetectionStrategy.OnPush`, señales y accesibilidad (etiquetas significativas, controles enfocables, sin violaciones AXE evidentes).

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Wireframe (listado de productos):** [Listado de productos — referencia visual](./README.md#listado-de-productos) — imagen `assets/wireframe-listado-productos.png` (relativa a `US-001-gestion-productos/`)
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-004 Component library](../../../adr/ADR-004-component-library.md), [ADR-013 Dialog master-detail](../../../adr/ADR-013-dialog-master-detail.md)
- **Ubicación en código:** el componente de listado debe ser **`features/catalog/components/product-list`** (en disco: `src/app/features/catalog/components/product-list/`); vista de detalle asociada (ruta o contenedor)
- **Pantalla de referencia (plantilla):** `src/app/features/templates/components/entity-list/` — tomar como guía de estructura de listado, tabla y cabecera de página del proyecto.
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md)
- **Siguiente paso:** [TK-002](./TK-002-dialogo-crear-editar-producto.md) implementa `product-form` y conecta Crear/Editar a este listado y detalle.

## Criterios de aceptación

Los escenarios siguientes **se derivan** de los criterios de aceptación en formato Gherkin de [US-001 — Criterios de Aceptación](./README.md#criterios-de-aceptación), limitados a **listado, filtro, detalle y puntos de entrada** a crear/editar. El menú contextual y acciones por fila son **TK-004**.

```gherkin
Feature: TK-003 — Listado, filtro, búsqueda y detalle (trazabilidad US-001)

  Scenario: Listado con filtro Todos excluye archivados
    Given que existen productos en estado active, inactive y archived
    When selecciono el filtro de etiqueta Todos
    Then el listado muestra solo productos active e inactive y no muestra ninguno archived
    # Trazabilidad: US-001 — Listado con filtro Todos excluye archivados

  Scenario: Listado filtrado por un estado operativo
    Given que existen productos en varios estados
    When selecciono el filtro Activo o el filtro Inactivo
    Then el listado muestra únicamente productos en ese estado
    # Trazabilidad: US-001 — Listado filtrado por un estado operativo

  Scenario: Listado filtrado por Archivado muestra solo archivados
    Given que existen productos archived y otros en active o inactive
    When selecciono el filtro Archivado
    Then el listado muestra únicamente productos en estado archived
    # Trazabilidad: US-001 — Listado filtrado por Archivado muestra solo archivados

  Scenario: Seleccionar un producto en el listado abre su detalle
    Given que estoy en el listado del catálogo y existe un producto visible
    When selecciono ese producto en la fila o registro
    Then se muestra el detalle del producto correspondiente con la información acordada en US-001
    # Trazabilidad: US-001 — Seleccionar un producto en el listado abre su detalle

  Scenario: Precio con dos decimales en listado y detalle
    Given que un producto tiene precio que requiere presentación acotada
    When visualizo el listado o el detalle
    Then el precio se muestra con la precisión de hasta 2 dígitos decimales y formato acorde a US-001
    # Trazabilidad: US-001 — Precio con dos decimales

  # --- Alcance técnico TK-003 (mismo formato Gherkin) ---

  Scenario: Etiquetas de filtro en español
    Given que el administrador ve el filtro de estado
    Then las opciones visibles incluyen Todos, Activo, Inactivo y Archivado como en US-001

  Scenario: Búsqueda por SKU y nombre
    Given que existen productos en el catálogo mock
    When ingreso texto en el campo de búsqueda
    Then el conjunto mostrado se reduce por coincidencia en SKU (code) y nombre según la referencia técnica

  Scenario: Puntos de entrada Crear y Editar integrados con TK-002
    Given que estoy en el listado o en el detalle de un producto
    When el producto no está archived o cuando abro crear desde la cabecera
    Then existen controles visibles y accesibles para Crear producto y, en detalle, Editar solo si el producto no está archived, abriendo el diálogo product-form definido en TK-002

  Scenario: Datos vía manager
    Given que la pantalla de catálogo está montada
    When se cargan o refrescan listado y detalle
    Then los datos provienen del ProductManager sobre el mock de TK-001

  Scenario: Accesibilidad de listado y detalle
    Given que uso teclado o lector de pantalla en listado y detalle
    Then los controles son enfocables, las etiquetas son significativas y no hay violaciones AXE evidentes según esta TK
```
