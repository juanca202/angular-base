# Unidades de trabajo

Este archivo es el **catálogo** de unidades usadas en el metadato **Unidad de trabajo** de las tareas (`TK-XXX` bajo `docs/product/user-stories/US-.../`).

Cada entrada tiene **solo**:

1. **Nombre de la unidad** — título de sección (debe coincidir con el valor que se escribe en las TK).
2. **Descripción del alcance** — texto que indica **qué trabajo encaja** en esa unidad, **límites** respecto a otras unidades y, cuando ayude, **qué queda fuera**. Debe ser suficiente para **clasificar** una tarea nueva: un lector puede decidir si pertenece a esta unidad u otra.

No incluyas aquí listados de tareas, DTOs ni detalle de implementación: eso vive en `technical-docs/` y en los propios `TK-XXX`.

---

## angular-base-project

Aplicación frontend en este repositorio cuando actúa como cliente Angular (SPA). Cubre UI, componentes, estado en cliente, enrutado, formularios, accesibilidad, repositorios y managers en cliente, y consumo de APIs **solo como cliente HTTP**. Incluye mocks en navegador para desarrollo local, con reglas mínimas y acotadas a esta capa. **No** incluye lógica de dominio autoritativa del servidor, persistencia en backend, endpoints ni despliegue de API; la normalización, unicidad y validación definitiva de agregados corresponden a la unidad backend. Los contratos compartidos (forma de API, códigos de error, reglas que ambos lados respetan) se documentan fuera de la tarea, en `technical-docs` o ADRs. Una tarea debe referir el trabajo del otro lado por límites y enlaces, no duplicar su implementación en el cuerpo de la TK.

---

## symfony-base-project

Aplicación backend (proyecto Symfony). Cubre APIs HTTP, persistencia, reglas de dominio en servidor (p. ej. normalización, unicidad, validación autoritativa), capas de controladores, servicios, entidades y migraciones, y lo relativo al despliegue de los endpoints de la API en ese contexto. **No** incluye componentes Angular, enrutado del cliente, ni implementación de UI; el frontend solo consume y muestra según contrato. Si una funcionalidad abarca ambas unidades, conviene dividirla en al menos dos tareas (una por unidad) o enlazar dependencias sin mezclar alcances en una sola TK.
