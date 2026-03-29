# Validación de tareas frente a US-001

Documento de revisión: las tareas **TK-001–TK-004** se contrastan con [US-001 — README](./README.md) (reglas, criterios de aceptación en Gherkin, observaciones). **La historia de usuario no se modifica**; ante hueco o contradicción, las tareas y esta matriz se ajustan.

**Objetivo:** alineación, ausencia de contradicción respecto a la US, ambigüedad acotada y **cobertura** de todos los escenarios Gherkin de la historia.

## Matriz: criterio de aceptación (US-001) → tareas

| Criterio US-001 (Gherkin)                      | TK-001 (mock/manager)            | TK-002 (formulario)                      | TK-003 (listado/detalle)    | TK-004 (menú fila) |
| ---------------------------------------------- | -------------------------------- | ---------------------------------------- | --------------------------- | ------------------ |
| Crear un producto válido                       | Defaults `active`, USD, precio   | Envío, feedback, **aparece en listado**¹ | Listado, crear, refresco    | —                  |
| Validación obligatorios y precio               | Rechazo precio ≤ 0               | Validación cliente + errores mock        | —                           | —                  |
| Longitud nombre 60                             | —                                | Validación                               | —                           | —                  |
| Unicidad nombre o SKU literal                  | `code` trim + nombre normalizado | Conflicts 409                            | —                           | —                  |
| Unicidad nombre normalizado                    | Util + 409 nombre, excluye `id`  | Muestra conflicto                        | —                           | —                  |
| Currency no editable                           | Rechazo/ignora currency ≠ USD    | Solo lectura USD                         | Muestra USD                 | —                  |
| Actualizar producto                            | Update                           | Edición no `archived`                    | Detalle / listado           | —                  |
| Listado con filtro all sin archived            | Semántica «Todos» / operativo    | —                                        | UI Todos                    | —                  |
| Búsqueda por texto por nombre                  | `search` solo `name`             | —                                        | Campo búsqueda              | —                  |
| Eliminación con confirmación (nombre incluido) | Delete                           | —                                        | —                           | Diálogo            |
| Navegación a detalle                           | Colección / `findBy`             | —                                        | Fila → detalle              | —                  |
| **Archivar / restaurar desde `archived`**      | Mutaciones `status`              | —                                        | Filtro Archivado + contexto | Acciones fila      |

¹ El criterio US exige que el producto **aparezca en el listado**; TK-002 lo explicita junto con refresco del manager y TK-003.

### Alcance fuera de los escenarios Gherkin de la US (pero coherente con la historia)

En [US-001](./README.md), el bloque **Criterios de Aceptación** **no** incluye escenarios nombrados para «archivar» ni «restaurar desde archivado». Ese comportamiento se deriva de:

- [Reglas de negocio](./README.md#reglas-de-negocio) (existencia del estado `archived`, filtro «Archivado», exclusión de archivados en «Todos»).
- [Descripción](./README.md#descripción) (actualizar el estado de los productos).

Por tanto, **TK-001** y **TK-004** cubren esas transiciones con trazabilidad a reglas y descripción, no a un `Scenario:` inexistente en la US.

## Contradicciones y correcciones aplicadas en tareas (US manda)

| Hallazgo                                                                                                                      | Resolución                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enlaces `#listado-de-productos`, `#diálogo-de-creación-y-edición` sin ancla en el README (solo existe `## Referencias de UI`) | TK-002 y TK-003 enlazan a `#referencias-de-ui` con ítem numerado.                                                                                                                             |
| TK-004 citaba trazabilidad «Archivar / Restaurar» como si existieran escenarios Gherkin en US-001                             | Comentarios de trazabilidad en TK-004 actualizados a reglas + descripción (+ TK-001 donde aplica).                                                                                            |
| Criterio «aparece en el listado» poco explícito solo en TK-002                                                                | Ampliado el `Then` del escenario de creación en TK-002 con listado + refresco (TK-003).                                                                                                       |
| Posibles ambigüedad «unicidad nombre literal» vs mock solo por normalización en dominio                                       | TK-002 aclara alineación con `product.md`: el mock rechaza duplicados por normalización de nombre; el escenario US de «literal» sigue cubierto vía SKU literal y nombres que el mock unifica. |

## Ambigüedades residuales (bajo riesgo; desambiguadas en TK-001 / product.md)

- **Búsqueda parcial:** la US remite a mocks; el contrato concreto es subcadena insensible a mayúsculas solo en `name` (TK-001, [product.md](../../technical-docs/catalog/product.md)).
- **Copy del diálogo de eliminación:** negociable en UX; obligatorio incluir el **nombre** del producto (US-001).

## Conclusión

**TK-001 a TK-004 cubren los once escenarios Gherkin** del bloque [Criterios de Aceptación](./README.md#criterios-de-aceptación) de US-001 y el resto de reglas necesarias para archivar/restaurar sin contradecir la historia. Cualquier cambio futuro en US-001 debe revalidarse contra esta matriz y, si aplica, añadir escenarios Gherkin explícitos para archivo/restauración en la propia historia (fuera del alcance de «solo adaptar tareas»).
