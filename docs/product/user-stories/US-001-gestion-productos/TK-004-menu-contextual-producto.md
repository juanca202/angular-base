# TK-004: Menú contextual y acciones por fila

- **ID:** TK-004
- **Nombre corto:** Acciones archivar, cambio de estado desde archivado y eliminar
- **Estado:** Ready
- **Prioridad:** Alta
- **Unidad de trabajo:** angular-base-project

## Descripción

En `src/app/features/catalog/`, sobre el listado de [TK-003](./TK-003-vista-listado-filtro-detalle.md), implementar el **menú contextual** (u otra UI equivalente del sistema de diseño) por fila con las acciones de negocio: **Archivar** y **Eliminar** para filas no archivadas; con filtro **Archivado**, permitir **actualizar el estado** a **`active`** o **`inactive`** (misma mutación de `status` que ya expone el manager/repositorio en cliente, según US-001), **sin diálogo de confirmación**. **Archivar** tampoco lleva confirmación. **Eliminar** aplica a **cualquier** estado y **siempre** abre un diálogo cuyo texto debe coincidir **exactamente** con la plantilla de US-001, sustituyendo solo el nombre del producto:  
`¿Desea eliminar [Nombre del producto] definitivamente? Esta acción no se puede recuperar.`  
Al cancelar, los datos no cambian; al confirmar, se llama al borrado vía manager/repositorio. Las acciones no deben mostrarse cuando violen las reglas de US-001 (p. ej. cambio de estado desde archivado fuera del contexto Archivado). Opciones de implementación coherentes con el diseño: botón partido, submenú con dos entradas, o dos controles con etiquetas accesibles (español / i18n). Enlazar con [ADR-004](../../../adr/ADR-004-component-library.md) y [ADR-013](../../../adr/ADR-013-dialog-master-detail.md) para el diálogo de confirmación.

## Referencias

- **Historia de usuario:** [US-001](./README.md) — Gestión de productos (catálogo) — Reglas de negocio (Archivar, cambio de estado desde archivado, Eliminar)
- **Diseño:** [Listado de productos](./README.md#listado-de-productos)
- **Documentación técnica (producto):** [Referencia técnica del catálogo de productos](../../technical-docs/catalogo-productos.md)
- **ADRs:** [ADR-004 Component library](../../../adr/ADR-004-component-library.md), [ADR-013 Dialog master-detail](../../../adr/ADR-013-dialog-master-detail.md)
- **Depende de:** [TK-001](./TK-001-modelos-repositorio-manager-rutas-documentacion.md), [TK-003](./TK-003-vista-listado-filtro-detalle.md)

## Componentes a usar

- Diálogo de confirmación del proyecto (`MatDialog` o equivalente); trampa de foco y retorno de foco al control que abrió el diálogo.

## Criterios de aceptación

Los escenarios siguientes **se derivan** de los criterios de aceptación en formato Gherkin de [US-001 — Criterios de Aceptación](./README.md#criterios-de-aceptación). Criterios de implementación adicionales respetan el mismo formato.

```gherkin
Feature: TK-004 — Menú contextual y acciones por fila (trazabilidad US-001)

  Scenario: Archivar un producto sin confirmación
    Given que soy administrador de productos y existe un producto que no está archivado en el listado
    When elijo la acción de archivar (distinta de eliminar) desde el menú o acción por fila
    Then el producto pasa a estado archived sin mostrar diálogo de confirmación
    # Trazabilidad: US-001 — Archivar un producto sin confirmación

  Scenario: Restaurar desde archived a active sin confirmación
    Given que el filtro de estado es archived y hay un producto en estado archived
    When elijo llevar ese producto a active desde el menú o acción por fila
    Then el producto queda en estado active y ya no está archived sin haberse mostrado un diálogo de confirmación
    # Trazabilidad: US-001 — Restaurar desde archived a active sin confirmación

  Scenario: Restaurar desde archived a inactive sin confirmación
    Given que el filtro de estado es archived y hay un producto en estado archived
    When elijo llevar ese producto a inactive desde el menú o acción por fila
    Then el producto queda en estado inactive y ya no está archived sin haberse mostrado un diálogo de confirmación
    # Trazabilidad: US-001 — Restaurar desde archived a inactive sin confirmación

  Scenario: Eliminar producto con texto de confirmación obligatorio
    Given que existe un producto llamado "Aceite 1L" en cualquier estado (active, inactive o archived)
    When elijo la acción de eliminar (borrado definitivo)
    Then el sistema exige confirmación y el mensaje es exactamente: ¿Desea eliminar Aceite 1L definitivamente? Esta acción no se puede recuperar
    # Trazabilidad: US-001 — Eliminar producto en cualquier estado con texto de confirmación obligatorio

  Scenario: Confirmar eliminación definitiva
    Given que estoy ante el diálogo de confirmación de eliminación con el texto obligatorio visible
    When confirmo la eliminación
    Then el producto se borra definitivamente y ya no figura en el catálogo
    # Trazabilidad: US-001 — Confirmar eliminación definitiva

  Scenario: Cancelar eliminación
    Given que estoy ante el diálogo de confirmación de eliminación
    When cancelo la acción
    Then el producto permanece sin cambios en el catálogo
    # Trazabilidad: US-001 — Cancelar eliminación

  # --- Alcance técnico TK-004 (mismo formato Gherkin) ---

  Scenario: Un único estado destino al salir de archived
    Given que el filtro es Archivado y elijo actualizar un producto archived
    When selecciono active o inactive como destino
    Then la interfaz aplica una sola transición coherente por acción y los datos no se corrompen por doble activación accidental

  Scenario: Visibilidad de acciones según contexto de filtro
    Given que el listado está filtrado por Todos, por un estado operativo o por Archivado
    When abro el menú o las acciones por fila
    Then pasar de archived a active o inactive solo se ofrece con filtro Archivado y las demás acciones respetan las reglas de US-001

  Scenario: Eliminar disponible en cualquier estado
    Given que existe un producto en active, inactive o archived
    When abro las acciones de fila
    Then puedo iniciar eliminación con confirmación en cualquiera de esos estados

  Scenario: Accesibilidad del menú y del diálogo de eliminación
    Given que uso teclado o lector de pantalla en acciones por fila
    Then los controles tienen roles y etiquetas adecuados y el foco se gestiona al abrir y cerrar el diálogo de confirmación
```
