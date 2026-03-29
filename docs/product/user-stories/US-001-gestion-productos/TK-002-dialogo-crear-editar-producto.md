# TK-002: Diálogos crear y editar producto

- **ID:** TK-002
- **Nombre corto:** Alta y edición en diálogo
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

En `src/app/features/catalog/`, implementar en un **mismo patrón de tarea** el diálogo **`features/catalog/components/product-form`** (carpeta `src/app/features/catalog/components/product-form/`) para los flujos **Crear producto** y **Editar producto**. **Crear:** según `assets/wireframe-dialogo-crear-producto.png` — **SKU**, nombre, precio, estado con valor por defecto **Activo** (`active`), descripción opcional; mostrar **`currency` solo lectura `USD`** (obligatorio aunque el wireframe no lo muestre). **Editar:** para productos en estado **no archivado**, permitir **SKU**, nombre, descripción, precio y alternancia `active` ↔ `inactive`; **`currency`** permanece solo lectura. **No** abrir el flujo habitual de edición para filas `archived` (cambio de estado a `active` o `inactive` solo vía [TK-004](./TK-004-menu-contextual-producto.md)). Formularios reactivos o Signal Forms según [ADR-009](../../../adr/ADR-009-form-strategy.md) y maquetación [ADR-010](../../../adr/ADR-010-form-layout-structure.md). Validaciones: **SKU** y nombre obligatorios, nombre máx. 60 caracteres, precio obligatorio y ≥ 0, presentación a dos decimales. Enviar crear/actualizar vía manager; mostrar feedback de éxito o error; **mostrar** respuestas de conflicto/validación devueltas por el cliente HTTP o mock **sin** replicar en el formulario lógica de unicidad ni normalización de dominio. Cerrar el diálogo tras creación exitosa; en edición, refrescar datos coherentes con el listado y el detalle. Los puntos de apertura pueden ser el listado, el detalle o ambos, alineados con [TK-003](./TK-003-vista-listado-filtro-detalle.md).

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Diseño:** [Diálogo de creación de producto](./README.md#diálogo-de-creación-de-producto) — `assets/wireframe-dialogo-crear-producto.png`
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-013 Dialog master-detail](../../../adr/ADR-013-dialog-master-detail.md), [ADR-009 Form strategy](../../../adr/ADR-009-form-strategy.md), [ADR-010 Form layout structure](../../../adr/ADR-010-form-layout-structure.md)
- **Ubicación en código:** el componente de diálogo (crear/editar) debe ser **`features/catalog/components/product-form`** (`src/app/features/catalog/components/product-form/`).
- **Pantalla de referencia (plantilla):** `src/app/features/templates/components/entity-form/` — tomar como guía de estructura, layout y patrones de formulario del proyecto.
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md); **integración obligatoria** con la shell de [TK-003](./TK-003-vista-listado-filtro-detalle.md) (botones Crear/Editar). Orden recomendado en [README](./README.md#tareas): TK-003 antes que TK-002.

## Componentes a usar

- Servicio de diálogo / patrón de diálogo del proyecto; controles del formulario de la librería de componentes.

## Criterios de aceptación

Los escenarios siguientes **se derivan** de los criterios de aceptación en formato Gherkin de [US-001 — Criterios de Aceptación](./README.md#criterios-de-aceptación). La parte de **listado y filtros** corresponde a TK-003; aquí solo se afirma lo que aplica al **diálogo** crear/editar. Cualquier criterio adicional usa el mismo formato.

```gherkin
Feature: TK-002 — Diálogo crear y editar producto (trazabilidad US-001)

  Scenario: Crear un producto válido desde el diálogo
    Given que soy administrador de productos y abro el diálogo de alta
    When completo SKU, nombre, precio y descripción opcional, y guardo sin cambiar el estado por defecto ni el currency
    Then el formulario envía los datos al manager, el producto queda registrado en estado active con currency USD y recibo feedback claro de éxito o error
    # Trazabilidad: US-001 — Crear un producto válido

  Scenario: Validación al crear o editar
    Given que estoy en el formulario de alta o edición de producto en el diálogo
    When intento guardar sin SKU, sin nombre, con precio inválido (vacío o negativo) o sin estado válido
    Then el sistema no persiste los cambios y muestra mensajes de validación claros
    # Trazabilidad: US-001 — Validación al crear o editar

  Scenario: Longitud máxima del nombre
    Given que estoy en el formulario de alta o edición de producto en el diálogo
    When ingreso un nombre con más de 60 caracteres e intento guardar
    Then el sistema no acepta el valor o no persiste según las validaciones definidas en planificación de tareas y muestra retroalimentación clara
    # Trazabilidad: US-001 — Longitud máxima del nombre

  Scenario: Unicidad de nombre y SKU — feedback desde backend o mock
    Given que ya existe un producto con un nombre o SKU determinado y el cliente devuelve conflicto según contrato
    When intento crear o editar desde el diálogo reutilizando ese nombre o ese SKU
    Then la operación no se completa en UI y el usuario recibe indicación clara del conflicto sin replicar en el formulario lógica de unicidad ni normalización de dominio
    # Trazabilidad: US-001 — Unicidad de nombre y SKU validada en backend

  Scenario: Editar producto y cambiar entre activo e inactivo
    Given que existe un producto en estado active o inactive y abro el diálogo de edición
    When modifico datos permitidos o cambio entre active e inactive y guardo
    Then los cambios se envían correctamente y el feedback confirma éxito o error según corresponda
    # Trazabilidad: US-001 — Editar producto y cambiar entre activo e inactivo

  Scenario: Currency no es editable en el diálogo
    Given que estoy en alta o edición de producto en el diálogo
    When intento cambiar el campo currency
    Then el sistema no permite modificarlo y permanece USD en pantalla y en el envío
    # Trazabilidad: US-001 — Currency no es editable

  Scenario: Feedback claro tras guardar
    Given que envío el formulario de crear o editar con datos válidos o inválidos según el caso
    When el manager o el repositorio responde con éxito o con error de validación
    Then el administrador ve retroalimentación clara acorde a US-001
    # Trazabilidad: US-001 — Regla de negocio (feedback tras crear o editar)

  # --- Alcance técnico / reglas de la TK-002 (mismo formato Gherkin) ---

  Scenario: Estado por defecto en alta
    Given que abro el diálogo de crear producto
    When no he cambiado el control de estado antes de guardar
    Then el valor por defecto mostrado y enviado es active (Activo)

  Scenario: Producto archivado no editable por este diálogo
    Given que el producto seleccionado está en estado archived
    When intento abrir o usar el flujo habitual de edición desde los puntos de entrada definidos en TK-003
    Then la acción de editar está oculta o deshabilitada y el cambio de estado a active o inactive solo puede hacerse vía TK-004

  Scenario: Control de estado solo active o inactive en edición elegible
    Given que estoy editando un producto no archivado
    When uso el control de estado del formulario
    Then solo puedo alternar entre active e inactive (no archived desde este diálogo)

  Scenario: Accesibilidad del diálogo
    Given que el diálogo de producto está abierto
    When navego con teclado o uso un lector de pantalla
    Then las etiquetas son significativas, los errores se anuncian y al cerrar el foco retorna de forma coherente
```

## Alcance técnico

- Componente de diálogo `product-form` standalone; **no** implementar normalización ni unicidad de negocio en componente, repositorio mock ni manager.
