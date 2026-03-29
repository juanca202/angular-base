- **ID:** US-001
- **Nombre corto:** Gestión de productos (catálogo)
- **Estado:** Ready
- **Prioridad:** Media

## Descripción

**Como** administrador de productos
**Quiero** crear, editar, actualizar y ver, productos de mi catálogo  
**Para** mantener el catálogo correcto, actualizando precios, descripciones o actualizando el estado de los productos según las necesidades del negocio

## Referencias de UI

1. **Listado de productos** — `[wireframe-listado-productos.png](./assets/wireframe-listado-productos.png)`
2. **Diálogo de creación y edición** — `[wireframe-dialogo-crear-producto.png](./assets/wireframe-dialogo-crear-producto.png)`
3. **Diálogo de detalle** — `[wireframe-dialogo-detalle-producto.png](./assets/wireframe-dialogo-detalle-producto.png)`

## Reglas de negocio

- El nombre tiene máximo 60 caracteres
- El precio debe ser positivo, mayor a cero y con máximo 2 decimales
- La moneda es siempre USD y no editable
- La unicidad de nombre considera normalización (acentos, espacios, mayúsculas); la verificación en esta entrega se hace en **mocks**
- Eliminación definitiva requiere mensaje de confirmación que incluya el nombre del producto a eliminar
- Filtro por estado: valores `all` (en UI, etiqueta **«Todos»**), `active`, `inactive`, `archived`. Con `all` el listado incluye solo **active** e **inactive** (excluye **archived**)
- Búsqueda por texto: filtra por **nombre**; la búsqueda puede ser parcial

## Criterios de Aceptación

```gherkin
Scenario: Crear un producto válido
  Given que soy administrador de productos
  When completo los campos requeridos y guardo
  Then el producto se registra con estado active, currency USD y aparece en el listado

Scenario: Validación de campos obligatorios y precio
  Given que estoy en el formulario de producto
  When intento guardar sin SKU o sin nombre, con precio vacío o negativo, con más de 2 decimales en precio, o sin estado válido
  Then el sistema no permite guardar y muestra mensajes de validación claros

Scenario: Longitud máxima del nombre
  Given que estoy en el formulario de producto
  When ingreso un nombre de más de 60 caracteres e intento guardar
  Then el sistema no persiste el cambio y muestra validación clara

Scenario: Unicidad de producto por nombre o SKU literal
  Given que existe un producto con el mismo nombre o SKU sin ambigüedad
  When intento crear o editar otro producto duplicado respecto a ese nombre o SKU
  Then el sistema rechaza la operación y muestra un mensaje de conflicto

Scenario: Unicidad de nombre con normalización
  Given que existe un producto cuyo nombre normalizado equivale a "Café Rojo"
  When intento crear o editar un producto cuyo nombre tras las reglas de normalización coincide (p. ej. distinto solo en mayúsculas, acentos o espacios)
  Then el sistema rechaza la duplicidad y muestra un mensaje de conflicto de nombre

Scenario: Currency no es editable
  Given que estoy en creación o edición de producto
  When intento cambiar el currency
  Then el sistema no permite modificarlo y permanece USD

Scenario: Actualizar producto
  Given que existe un producto
  When modifico sus datos permitidos y guardo
  Then el sistema actualiza la información correctamente

Scenario: Listado con filtro all sin archived
  Given que existen productos en estado active, inactive y archived
  When selecciono el filtro de estado all (etiqueta «Todos»)
  Then el listado muestra solo productos active e inactive y no muestra ninguno archived

Scenario: Búsqueda por texto por nombre
  Given que existen productos con distintos nombres en el listado actual según filtros
  When ingreso texto en el campo de búsqueda
  Then el listado muestra solo productos cuyo nombre tiene coincidencia parcial con el texto ingresado, coherente con las reglas de negocio y con la implementación en mocks

Scenario: Eliminación con confirmación que incluye el nombre del producto
  Given que existe un producto llamado "Aceite 1L"
  When elijo eliminarlo definitivamente
  Then el sistema solicita confirmación y el mensaje mostrado incluye el nombre del producto ("Aceite 1L") de forma identificable para el usuario

Scenario: Navegación a detalle
  Given que estoy en el listado de productos
  When selecciono un producto
  Then el sistema muestra el detalle del producto
```

## Complejidad sugerida

- **Story points propuestos:** 8 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación (breve):**
  - **Qué suma esfuerzo:** varias pantallas (listado con filtro y búsqueda, detalle, alta/edición, baja con confirmación) y varias reglas en cliente/mocks (validaciones, unicidad literal y por nombre normalizado).
  - **Por qué no 5:** demasiadas superficies y escenarios para encajarlo como incremento pequeño.
  - **Por qué no 13:** alcance solo frontend con mocks, sin API ni integraciones — baja incertidumbre frente a una épica.

## Validación

### INVEST

| Letra | Criterio      | Resultado  | Evidencia (solo en este documento)                                                                                                                                                                                                             |
| ----- | ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | **Cumple** | [Observaciones](#observaciones): alcance solo en cliente con mocks; sin dependencia de otras historias ni sistemas externos.                                                                                                                   |
| **N** | Negociable    | **Cumple** | Prioridad media; redacción de mensajes de confirmación y microcopy negociables si se cumplen [Reglas de negocio](#reglas-de-negocio) y [Criterios de Aceptación](#criterios-de-aceptación) (p. ej. incluir nombre en confirmación de borrado). |
| **V** | Valiosa       | **Cumple** | [Descripción](#descripción): beneficio explícito para mantener el catálogo alineado al negocio.                                                                                                                                                |
| **E** | Estimable     | **Cumple** | [Reglas de negocio](#reglas-de-negocio), [Criterios de Aceptación](#criterios-de-aceptación), [Referencias de UI](#referencias-de-ui) y [Complejidad sugerida](#complejidad-sugerida) permiten estimar esfuerzo.                               |
| **S** | Pequeña       | **Cumple** | [Complejidad sugerida](#complejidad-sugerida): story points acotados a un incremento razonable; conviene validar contra la capacidad del sprint del equipo.                                                                                    |
| **T** | Testeable     | **Cumple** | Los escenarios Given/When/Then son comprobables; las reglas y observaciones sitúan validaciones y unicidad en **mocks**, y los criterios enlazan comportamiento observable (listado, formulario, detalle, mensajes).                           |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado     | Notas (solo en este documento)                                                                                                                                                                                              |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependencias listas                | **Cumple** | [Observaciones](#observaciones): sin dependencias externas.                                                                                                                                                                 |
| Inputs/outputs claros              | **Cumple** | [Reglas de negocio](#reglas-de-negocio) y [Criterios de Aceptación](#criterios-de-aceptación) definen entradas, estados y resultados esperados.                                                                             |
| Unidades de trabajo definidas      | **Cumple** | La descripción y los escenarios delimitan superficies de entrega (listado, detalle, altas/edición, filtrado, búsqueda, eliminación) con comportamiento verificable; el reparto en tareas no pertenece a la historia.        |
| Sin decisiones técnicas pendientes | **Cumple** | [Observaciones](#observaciones) fijan alcance (**solo frontend**, **mocks**); [Reglas de negocio](#reglas-de-negocio) fijan dónde corre la verificación de unicidad en esta entrega.                                        |
| Referencias de UI                  | **Cumple** | [Referencias de UI](#referencias-de-ui) enlazan tres wireframes y los archivos existen en `./assets/`: `wireframe-listado-productos.png`, `wireframe-dialogo-crear-producto.png`, `wireframe-dialogo-detalle-producto.png`. |

## Observaciones

- **Implementación:** el alcance es **solo frontend**; los servicios REST deben apoyarse en **mocks en el frontend** (no hay backend ni API real en esta entrega).
- **Dependencias:** no existen dependencias externas.
- **Unicidad y normalización de nombres:** según **Reglas de negocio**, la verificación en esta entrega se hace en **mocks**; el comportamiento esperado frente al usuario está en los escenarios de **Criterios de Aceptación**.
- **Filtros:** por **estado** con valores `all`, `active`, `inactive` o `archived`. Si el filtro es `all` (UI: «Todos»), el listado muestra solo productos `active` e `inactive` (no `archived`). **Búsqueda por texto:** filtra por **nombre** únicamente (coincidencia parcial; semántica coherente con mocks y con el escenario de búsqueda).
