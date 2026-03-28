# Unidades de trabajo

Este documento define las **unidades de trabajo del producto**: bases de código y contextos de despliegue distintos. Las tareas (`TK-xxx`) y demás ítems de trabajo deben mantenerse **acotadas a una sola unidad**. No incluir en una tarea requisitos, criterios de aceptación ni notas de implementación que correspondan a otra unidad.

## Unidades registradas

| Unidad                   | Repositorio / proyecto                                                   | Rol                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **angular-base-project** | Aplicación frontend (este repositorio cuando actúa como cliente Angular) | SPA/UI: componentes, estado en cliente, consumo vía cliente HTTP, mocks para desarrollo local, enrutado, formularios, accesibilidad.                                  |
| **symfony-base-project** | Aplicación backend                                                       | APIs HTTP, persistencia, reglas de dominio en servidor (p. ej. normalización, unicidad, validación autoritativa del agregado), despliegue de los endpoints de la API. |

## Reglas de alcance para las tareas

1. **Una unidad por tarea** — Cada tarea pertenece a una sola unidad de trabajo (metadato `Unidad de trabajo` u equivalente). La descripción, los criterios de aceptación y el alcance técnico solo deben cubrir entregables de esa unidad.

2. **Sin mezclar alcances** — No especificar en una tarea de frontend comportamientos que solo debe implementar el backend (ni al revés). Referenciar el otro lado mediante **límites claros** en lugar de duplicar su trabajo, por ejemplo:
   - Tarea frontend: «Mapear códigos de error de la API a mensajes visibles para el usuario» — aceptable.
   - Tarea frontend: «Implementar normalización de nombre para unicidad» cuando la normalización es del backend — **no** aceptable; corresponde a una tarea de backend o solo a documentación de contrato.

3. **Los contratos viven en documentación compartida** — Forma de la API, códigos de error y reglas de producto que **ambos** lados deben respetar se documentan en `technical-docs`, ADRs o referencias tipo OpenAPI; no como pasos de implementación dentro de las tareas de la unidad equivocada.

4. **Mocks** — Los mocks en el navegador simulan respuestas del servidor para desarrollar la UI. **No** sustituyen la lógica de dominio del backend salvo acuerdo explícito (p. ej. spike); mantener reglas de mock mínimas y acotadas a la unidad frontend.

## Uso práctico

- Al redactar **TK-xxx** para **angular-base-project**, acotar a UI, repositorios/managers en cliente e integración con APIs **solo como consumidor**.
- Al redactar **TK-xxx** para **symfony-base-project**, acotar a controladores, servicios, entidades, migraciones y validación en servidor; no a componentes Angular ni al enrutado del cliente.

Si una funcionalidad requiere ambas unidades, dividirla en **al menos dos tareas** (una por unidad) o enlazar con claridad: «Depende de la tarea backend TK-… / contrato en …» sin copiar el detalle de implementación de la otra unidad en el cuerpo de esta tarea.
