# TK-001: Modelos, repositorio, manager, rutas y documentación técnica

- **ID:** TK-001
- **Feature:** catalog
- **Nombre corto:** Capa de datos y cimientos del feature productos
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

Entregar el cimiento del feature **catalog**: tipos/modelo `Product`, unión de estados (`active` | `inactive` | `archived`), literal fijo de `currency`, constantes de mapeo etiqueta de filtro → parámetro, y rutas **lazy** bajo `src/app/features/catalog/`, registradas en `app.routes.ts`. Implementar `ProductRepository` según [ADR-006](../../../adr/ADR-006-repository-pattern.md) con persistencia **mock** (`MockHttpClient`, semilla JSON opcional bajo `src/test/mocks/repositories/`): colección, filtros por estado, búsqueda por **nombre** (subcadena, sin distinguir mayúsculas; **no** filtrar por SKU en `search`, según [US-001](./README.md#reglas-de-negocio)), `findBy`, y mutaciones crear; actualizar (incluye transiciones de `status` permitidas, entre ellas `archived` → `active` | `inactive` como **mismo** update, sin recurso dedicado); archivar a `archived`; borrado definitivo. En el mock, aplicar **unicidad** al persistir, alineado con US-001 y con [Comportamiento del repositorio mock](../../technical-docs/catalog/product.md#comportamiento-del-repositorio-mock): **`code`** único tras trim (comparación literal); **`name`** único tras la **misma normalización** que en [Reglas de negocio](../../technical-docs/catalog/product.md#reglas-de-negocio) del documento técnico (espacios, mayúsculas, acentos); en `update`, excluir el `id` actual del conjunto comparado. Devolver conflicto (p. ej. 409, códigos `PRODUCT_SKU_CONFLICT` / `PRODUCT_NAME_CONFLICT`) consumible por el manager. Validar en mock que `price` sea **estrictamente positivo** (> 0) en creación y actualización, coherente con [US-001](./README.md#reglas-de-negocio). Redondeo de precio a 2 decimales y `currency: 'USD'` fijo. Implementar `ProductManager` según [ADR-007](../../../adr/ADR-007-manager-pattern.md): carga con filtro de estado y búsqueda, estado de carga/error, métodos que delegan en el repositorio y refresco de recursos tras mutaciones; mapear respuestas de error del cliente (mock o HTTP) a feedback visible sin incrustar UI en el manager. Centralizar la función de **normalización de nombre** en un util compartido del feature (invocado desde el repositorio mock) para una sola definición de regla. Si el mock o el manager divergen de [product.md](../../technical-docs/catalog/product.md), actualizar solo las líneas pertinentes de esa sección.

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo)
- **Documentación técnica (producto):** [Catálogo — contrato y mock](../../technical-docs/catalog/product.md)
- **ADRs:** [ADR-006 Repository pattern](../../../adr/ADR-006-repository-pattern.md), [ADR-007 Manager pattern](../../../adr/ADR-007-manager-pattern.md), [ADR-002 Angular style guide](../../../adr/ADR-002-angular-style-guide.md)
- **Punto de acceso:** `src/app/features/catalog/` (modelos, util de normalización de nombre si aplica, `product-repository.ts`, `product-manager.ts`, `products-routes.ts`, `app.routes.ts`). El modelo y el mock deben alinearse con los nombres de campo de [product.md](../../technical-docs/catalog/product.md) (p. ej. **`code`** en persistencia/API como SKU; las pantallas pueden mostrar la etiqueta «SKU»).
- **Plantilla:** `src/app/features/templates/` (repositorio, manager, rutas)

## Infraestructura y dependencias

- `MockHttpClient`, `BaseRepository`, helpers de recursos asíncronos compartidos; `MessageService` o equivalente solo como contrato para emitir mensajes desde el manager (sin crear vistas, plantillas ni componentes de pantalla del catálogo).

**Fuera de alcance (interfaz):** Esta tarea no incluye la creación de componentes gráficos del feature (listado, formularios, diálogos ni menús de fila); ese trabajo corresponde a **TK-002–TK-004**.

## Criterios de aceptación

**Alcance:** solo **modelo, repositorio mock, manager, constantes de filtro, rutas y documentación técnica**. No incluyen pantallas, componentes, ni copy de diálogos; la trazabilidad a [US-001 — Criterios de Aceptación](./README.md#criterios-de-aceptación) describe la **misma semántica de negocio** en términos de **API interna** (colección, mutaciones, respuestas).

```gherkin
Feature: TK-001 — Contrato de capa de datos del catálogo (trazabilidad US-001, sin UI)

  Scenario: Consulta de colección con semántica «Todos» excluye archived
    Given que la fuente mock contiene entidades en active, inactive y archived
    When el repositorio resuelve la colección con el parámetro de filtro alineado a la constante «Todos» (active + inactive únicamente)
    Then la respuesta incluye solo registros active e inactive y excluye todo archived
    # Trazabilidad: US-001 — Listado con filtro Todos excluye archivados (semántica en datos)

  Scenario: Consulta de colección filtrada por un estado operativo
    Given que la fuente mock contiene entidades en varios status
    When el repositorio resuelve la colección con filtro estricto active o inactive
    Then la respuesta contiene únicamente entidades cuyo status coincide con el filtro
    # Trazabilidad: US-001 — Listado filtrado por un estado operativo (semántica en datos)

  Scenario: Consulta de colección con semántica «Archivado»
    Given que la fuente mock contiene archived y entidades en active o inactive
    When el repositorio resuelve la colección con filtro alineado a archived
    Then la respuesta contiene únicamente entidades en status archived
    # Trazabilidad: US-001 — Listado filtrado por Archivado (semántica en datos)

  Scenario: Constantes de mapeo etiqueta de filtro a parámetro
    Given que el feature define las etiquetas de producto para filtro según US-001
    When se revisa el artefacto de constantes del feature catalog en código
    Then existen constantes o equivalente revisable que mapean Todos, Activo, Inactivo y Archivado a los parámetros de consulta acordados en esta TK
    # Trazabilidad: US-001 — Reglas de filtro (contrato de cliente, no maquetación)

  Scenario: Crear entidad con defaults de negocio en persistencia mock
    Given una petición de creación con los campos requeridos y opcionales según modelo
    When el repositorio persiste en mock sin sobrescribir defaults definidos en esta TK
    Then el registro almacenado tiene status active, currency USD y precio persistido con como mucho dos decimales
    # Trazabilidad: US-001 — Crear un producto válido; Precio con dos decimales

  Scenario: Crear o actualizar rechazado si precio no es estrictamente positivo
    Given una petición de creación o actualización con price igual a 0 o negativo
    When el repositorio intenta persistir esa mutación en mock
    Then la operación falla con error de validación (p. ej. VALIDATION_ERROR / 400) y no se almacena el valor inválido
    # Trazabilidad: US-001 — precio positivo; Validación de campos obligatorios y precio

  Scenario: Actualizar no altera currency
    Given un registro existente en la fuente mock
    When el repositorio aplica un update que incluiría otro currency distinto de USD
    Then la persistencia rechaza o ignora el cambio de currency y el valor permanece USD según reglas de esta TK y US-001
    # Trazabilidad: US-001 — Currency no es editable

  Scenario: Update en entidad no archived: campos y transición active ↔ inactive
    Given un registro en active o inactive en la fuente mock
    When el repositorio aplica update de campos permitidos y/o toggling active ↔ inactive
    Then el registro refleja los cambios y el status sigue siendo operativo hasta una mutación explícita de archivo
    # Trazabilidad: US-001 — Editar producto y cambiar entre activo e inactivo

  Scenario: Mutación de archivo a status archived
    Given un registro que no está en archived en la fuente mock
    When el repositorio ejecuta la operación de archivar definida en esta TK
    Then el registro queda persistido con status archived tras esa única operación
    # Trazabilidad: US-001 — Archivar (efecto en datos; la confirmación en UI es TK-004)

  Scenario: Update de status desde archived a active o inactive
    Given un registro en archived en la fuente mock
    When el repositorio aplica el mismo tipo de update de status permitido en US-001 hacia active o inactive
    Then el registro queda en el nuevo status operativo tras esa operación
    # Trazabilidad: US-001 — Restaurar desde archived (efecto en datos)

  Scenario: Borrado definitivo vía repositorio en cualquier status
    Given un registro en active, inactive o archived en la fuente mock
    When el repositorio ejecuta la operación delete acordada (p. ej. DELETE en mock)
    Then el registro deja de existir en la fuente y las lecturas por id o colección filtrada no lo devuelven
    # Trazabilidad: US-001 — Eliminación definitiva (efecto en datos; confirmación en UI es TK-004)

  Scenario: Crear rechazado si SKU duplicado tras trim en mock
    Given un registro con code " SKU-1 " en la fuente mock
    When intento crear otro con code "SKU-1" u otro equivalente tras trim espacios
    Then la operación falla con conflicto SKU (p. ej. PRODUCT_SKU_CONFLICT / 409) y no se persiste duplicado
    # Trazabilidad: US-001 — Unicidad de producto por nombre o SKU literal

  Scenario: Crear rechazado si nombre colisiona con otro ya normalizado
    Given un registro cuyo nombre normalizado equivale a "cafe rojo"
    When intento crear con nombre que tras normalización coincide (p. ej. "Café  Rojo")
    Then la operación falla con conflicto de nombre (p. ej. PRODUCT_NAME_CONFLICT / 409)
    # Trazabilidad: US-001 — Unicidad de nombre con normalización

  Scenario: Actualizar el mismo producto con literal distinto pero misma forma normalizada
    Given un único registro con nombre "Café Rojo"
    When actualizo ese id con nombre "cafe  rojo" sin otro producto en catálogo
    Then la operación tiene éxito y el nombre almacenado refleja el literal enviado
    # Trazabilidad: US-001 — Exclusión del propio id en comprobación de unicidad

  Scenario: Actualizar rechazado si nombre normalizado coincide con otro producto distinto
    Given dos registros A y B con nombres normalizados distintos
    When actualizo B con un nombre cuya forma normalizada es igual a la de A
    Then la operación falla con conflicto de nombre y A no se modifica
    # Trazabilidad: US-001 — Unicidad de nombre con normalización en edición

  Scenario: Búsqueda por texto aplica solo a nombre en mock
    Given un registro cuyo code contiene "X" pero name no, y otro cuyo name contiene "xan"
    When consulto la colección con search "xan" sin distinguir mayúsculas
    Then la respuesta incluye solo productos cuyo name cumple la subcadena y no incluye el registro que coincide solo por code
    # Trazabilidad: US-001 — Búsqueda por texto por nombre

  Scenario: Errores de validación o conflicto propagados sin renderizar vistas
    Given una respuesta de error del mock (validación, 409 por SKU o nombre, etc.)
    When el manager procesa el resultado de la operación
    Then el API del manager expone el fallo de forma consumible por capas superiores y el manager no incrusta plantillas ni widgets
    # Trazabilidad: US-001 — Mensajes de conflicto y validación hacia la UI

  Scenario: Rutas lazy del feature catalog registradas en la app
    Given la configuración de rutas de la aplicación según app.routes.ts
    When se instancia o resuelve la entrada del feature catalog definida en esta TK
    Then el bundle o definición bajo src/app/features/catalog/ se carga de forma diferida conforme al patrón del proyecto

  Scenario: Manager delega filtro y búsqueda al repositorio con parámetros correctos
    Given llamadas sucesivas al manager con distinto filtro de estado y distinto término de búsqueda
    When el manager solicita la colección al repositorio
    Then cada invocación incluye los parámetros correspondientes y el estado expuesto por el manager refleja el resultado devuelto

  Scenario: Tras mutación exitosa el estado del manager refleja el nuevo snapshot
    Given una operación create, update o delete que el repositorio completa con éxito
    When el manager actualiza recursos derivados según ADR-007
    Then las señales o streams expuestos por el manager para colección o ítem muestran datos coherentes con la fuente mock sin requerir reinicio manual del proceso

  Scenario: Documentación técnica alineada si el mock diverge del documento
    Given cambios en la semántica del mock o del manager respecto a product.md (sección mock)
    When se completa esta tarea
    Then las líneas pertinentes de product.md quedan actualizadas
```

**Nota:** Las etiquetas «Todos» / «Archivado» en escenarios se refieren a **parámetros de consulta nombrados en constantes**, no a textos de interfaz. La **unicidad** (SKU literal tras trim y nombre normalizado) y la **búsqueda solo por nombre** en el mock son obligatorias en esta entrega por [US-001](./README.md).
