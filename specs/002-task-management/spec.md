# Feature Specification: Administración de Tareas

**Feature Branch**: `002-task-management`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Quiero crear una funcionalidad de administración de tareas que permita al usuario: - Visualizar un listado de tareas dividido en tres estados: Pendientes, Congeladas, Completadas. - El listado de tareas debe presentarse según el diseño definido en wireframes, mostrando título de la tarea e información temporal asociada. - El usuario debe poder agregar tareas nuevas. - El usuario debe poder seleccionar una o varias tareas desde el listado. - Cuando existe una selección activa, el listado entra en modo selección y la barra de acciones cambia para mostrar únicamente acciones relacionadas con la selección. - Las acciones disponibles sobre tareas seleccionadas serán: Completar y Eliminar. - El sistema debe permitir completar o eliminar múltiples tareas en una sola acción."  
**Location**: `docs/specs/002-task-management/spec.md` (per project constitution)

**Architecture Compliance**: This feature MUST comply with Angular Base Project Constitution and relevant ADRs in `docs/adr/`.

## Clarifications

### Session 2025-01-27

- Q: ¿Cómo se implementará la persistencia de tareas? → A: La persistencia se realizará mediante un API REST que aún no existe. En esta etapa se utilizarán mocks (MockHttpClient) para simular el comportamiento del backend según ADR-006.
- Q: ¿Cómo se maneja la autenticación? → A: La sesión de usuario ya es gestionada por el proyecto base. Todas las peticiones al API se realizan en un contexto autenticado. No se debe implementar lógica adicional de autenticación o autorización.
- Q: ¿Cómo se realiza el ordenamiento y filtrado de tareas? → A: El ordenamiento y filtrado se realizan en el servidor. El cliente debe enviar los parámetros: sort (nombre de la propiedad) y order (asc | desc). En ausencia de estos parámetros, el servidor aplica un ordenamiento por defecto.
- Q: ¿Cómo se manejan los estados vacíos y de carga? → A: Usar el patrón de plantillas existentes (entity-list): mostrar indicador de carga (ft-progress) con "Loading..." durante la carga, mensaje "No records" cuando no hay tareas, y estado de error con icono de warning, mensaje y botón "Retry" cuando hay errores.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Listado de Tareas por Estado (Priority: P1)

El usuario puede visualizar sus tareas organizadas en tres categorías: Pendientes, Congeladas y Completadas. Cada tarea muestra su título e información temporal (tiempo restante o tiempo vencido), con resaltado visual cuando corresponde (por ejemplo, tareas vencidas en rojo).

**Why this priority**: Esta es la funcionalidad central que permite al usuario entender el estado de sus tareas. Sin esta capacidad, no hay valor base para la aplicación.

**Independent Test**: Puede ser probado completamente navegando entre las tres pestañas (Pendientes, Congeladas, Completadas) y verificando que las tareas se muestran correctamente con su información temporal y resaltado visual cuando aplica.

**Acceptance Scenarios**:

1. **Given** el usuario tiene tareas en diferentes estados, **When** accede al listado de tareas, **Then** ve tres pestañas: Pendientes, Congeladas y Completadas
2. **Given** el usuario está en la pestaña Pendientes, **When** visualiza el listado, **Then** ve solo las tareas con estado "Pendientes" con su título e información temporal
3. **Given** una tarea tiene fecha de vencimiento pasada, **When** se muestra en el listado, **Then** la información temporal aparece resaltada visualmente (por ejemplo, en rojo) indicando que está vencida
4. **Given** una tarea tiene fecha de vencimiento futura, **When** se muestra en el listado, **Then** la información temporal muestra el tiempo restante (por ejemplo, "Vence en 2 días", "Vence mañana")
5. **Given** el usuario cambia de pestaña, **When** selecciona "Congeladas" o "Completadas", **Then** el listado se actualiza para mostrar solo las tareas del estado correspondiente

---

### User Story 2 - Agregar Nueva Tarea (Priority: P1)

El usuario puede crear nuevas tareas mediante un botón "Nueva Tarea" visible en la interfaz. Al crear una tarea, debe proporcionar al menos un título.

**Why this priority**: La capacidad de crear tareas es fundamental para que el sistema tenga utilidad. Sin esta funcionalidad, el usuario no puede comenzar a usar la aplicación.

**Independent Test**: Puede ser probado completamente haciendo clic en el botón "Nueva Tarea", completando el formulario con un título y verificando que la tarea aparece en el listado de Pendientes.

**Acceptance Scenarios**:

1. **Given** el usuario está en cualquier pestaña del listado, **When** hace clic en el botón "+ Nueva Tarea", **Then** se abre un formulario o diálogo para crear una nueva tarea
2. **Given** el usuario está creando una nueva tarea, **When** proporciona un título válido y confirma, **Then** la tarea se crea y aparece en el listado de Pendientes
3. **Given** el usuario intenta crear una tarea sin título, **When** intenta confirmar, **Then** el sistema muestra un mensaje de error indicando que el título es obligatorio
4. **Given** el usuario crea una tarea con fecha de vencimiento, **When** la tarea se muestra en el listado, **Then** la información temporal se calcula y muestra correctamente

---

### User Story 3 - Seleccionar Tareas Múltiples (Priority: P2)

El usuario puede seleccionar una o varias tareas del listado mediante checkboxes. Cuando hay tareas seleccionadas, la interfaz entra en modo selección y la barra de acciones cambia para mostrar solo acciones relacionadas con la selección (Completar y Eliminar).

**Why this priority**: La selección múltiple mejora significativamente la eficiencia del usuario al permitir operaciones en lote. Es una funcionalidad de valor agregado que complementa las operaciones individuales.

**Independent Test**: Puede ser probado completamente seleccionando una o más tareas, verificando que aparece la barra de acciones con botones de Completar y Eliminar, y que el modo selección se activa correctamente.

**Acceptance Scenarios**:

1. **Given** el usuario está viendo el listado de tareas, **When** hace clic en el checkbox de una tarea, **Then** la tarea se marca como seleccionada y aparece la barra de acciones con botones de Completar y Eliminar
2. **Given** el usuario tiene una tarea seleccionada, **When** hace clic en el checkbox de otra tarea, **Then** ambas tareas quedan seleccionadas y el modo selección permanece activo
3. **Given** el usuario tiene tareas seleccionadas, **When** hace clic nuevamente en el checkbox de una tarea seleccionada, **Then** la tarea se deselecciona
4. **Given** el usuario tiene tareas seleccionadas, **When** deselecciona todas las tareas, **Then** el modo selección se desactiva y la barra de acciones vuelve a su estado normal
5. **Given** el usuario está en modo selección, **When** cambia de pestaña (Pendientes/Congeladas/Completadas), **Then** la selección se mantiene si las tareas seleccionadas están visibles en la nueva pestaña, o se limpia si no están visibles

---

### User Story 4 - Completar Tareas Seleccionadas (Priority: P2)

El usuario puede completar una o múltiples tareas seleccionadas mediante el botón "Completar" en la barra de acciones del modo selección.

**Why this priority**: Completar tareas es una acción fundamental del flujo de trabajo. La capacidad de hacerlo en lote mejora la productividad del usuario.

**Independent Test**: Puede ser probado completamente seleccionando una o más tareas pendientes, haciendo clic en "Completar" y verificando que las tareas se mueven al estado Completadas y desaparecen de la pestaña actual.

**Acceptance Scenarios**:

1. **Given** el usuario tiene una o más tareas seleccionadas en la pestaña Pendientes, **When** hace clic en el botón "Completar", **Then** todas las tareas seleccionadas cambian su estado a "Completadas" y desaparecen del listado de Pendientes
2. **Given** el usuario completa tareas seleccionadas, **When** navega a la pestaña Completadas, **Then** las tareas completadas aparecen en ese listado
3. **Given** el usuario intenta completar tareas que ya están completadas, **When** las selecciona y hace clic en "Completar", **Then** el sistema maneja la acción apropiadamente (puede ignorar la acción o mostrar un mensaje informativo)
4. **Given** el usuario completa múltiples tareas, **When** la operación finaliza, **Then** el modo selección se desactiva y la barra de acciones vuelve a su estado normal

---

### User Story 5 - Eliminar Tareas Seleccionadas (Priority: P2)

El usuario puede eliminar una o múltiples tareas seleccionadas mediante el botón "Eliminar" en la barra de acciones del modo selección.

**Why this priority**: Eliminar tareas es una acción común que permite mantener el listado organizado. La capacidad de hacerlo en lote es eficiente para limpieza masiva.

**Independent Test**: Puede ser probado completamente seleccionando una o más tareas, haciendo clic en "Eliminar", confirmando la acción y verificando que las tareas desaparecen del listado.

**Acceptance Scenarios**:

1. **Given** el usuario tiene una o más tareas seleccionadas, **When** hace clic en el botón "Eliminar", **Then** el sistema solicita confirmación antes de eliminar las tareas
2. **Given** el usuario confirma la eliminación, **When** la acción se procesa, **Then** todas las tareas seleccionadas se eliminan permanentemente y desaparecen del listado
3. **Given** el usuario cancela la eliminación, **When** cierra el diálogo de confirmación, **Then** las tareas permanecen en el listado y la selección se mantiene
4. **Given** el usuario elimina múltiples tareas, **When** la operación finaliza, **Then** el modo selección se desactiva y la barra de acciones vuelve a su estado normal

---

### Edge Cases

- ¿Qué sucede cuando el usuario intenta completar una tarea que ya está completada?
- ¿Qué sucede cuando el usuario intenta eliminar una tarea que no existe o fue eliminada por otro usuario?
- ¿Cómo maneja el sistema cuando hay un error de red al completar o eliminar tareas?
- ¿Qué sucede cuando el usuario selecciona tareas de diferentes estados (por ejemplo, algunas pendientes y algunas congeladas)?
- ¿Cómo se comporta el sistema cuando hay muchas tareas (por ejemplo, más de 100) en un estado?
- ¿Qué sucede cuando una tarea tiene una fecha de vencimiento muy lejana en el futuro (por ejemplo, años)?
- ¿Cómo se muestra la información temporal cuando una tarea vence exactamente hoy?
- ¿Qué sucede cuando el usuario intenta crear una tarea con un título que excede el límite de caracteres?
- ¿Cómo maneja el sistema la selección cuando el usuario cambia rápidamente entre pestañas mientras tiene tareas seleccionadas?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un listado de tareas organizado en tres estados: Pendientes, Congeladas y Completadas
- **FR-002**: El sistema MUST presentar cada tarea en el listado mostrando al menos su título e información temporal asociada (tiempo restante o tiempo vencido)
- **FR-003**: El sistema MUST resaltar visualmente la información temporal cuando una tarea está vencida (por ejemplo, mostrar el texto en rojo)
- **FR-004**: El sistema MUST permitir al usuario agregar nuevas tareas mediante un botón "Nueva Tarea" visible en la interfaz
- **FR-005**: El sistema MUST validar que el título de la tarea sea obligatorio al crear una nueva tarea
- **FR-006**: El sistema MUST validar que el título de la tarea no exceda 50 caracteres
- **FR-007**: El sistema MUST permitir al usuario seleccionar una o múltiples tareas mediante checkboxes en el listado
- **FR-008**: El sistema MUST activar el modo selección cuando hay al menos una tarea seleccionada
- **FR-009**: El sistema MUST mostrar una barra de acciones con botones "Completar" y "Eliminar" cuando el modo selección está activo
- **FR-010**: El sistema MUST ocultar o reemplazar la barra de acciones normal cuando el modo selección está activo
- **FR-011**: El sistema MUST permitir al usuario completar todas las tareas seleccionadas en una sola acción mediante el botón "Completar"
- **FR-012**: El sistema MUST cambiar el estado de las tareas completadas a "Completadas" y moverlas al listado correspondiente
- **FR-013**: El sistema MUST permitir al usuario eliminar todas las tareas seleccionadas en una sola acción mediante el botón "Eliminar"
- **FR-014**: El sistema MUST solicitar confirmación antes de eliminar tareas
- **FR-015**: El sistema MUST desactivar el modo selección cuando no hay tareas seleccionadas
- **FR-016**: El sistema MUST calcular y mostrar correctamente la información temporal basada en la fecha de vencimiento de la tarea (dueAt)
- **FR-017**: El sistema MUST mostrar mensajes de error apropiados cuando falla una operación (crear, completar, eliminar)
- **FR-018**: El sistema MUST comunicarse con el backend mediante API REST para todas las operaciones de persistencia (crear, leer, actualizar, eliminar tareas)
- **FR-019**: El sistema MUST utilizar mocks (MockHttpClient) para simular el comportamiento del backend cuando el API REST no esté disponible
- **FR-020**: El sistema MUST enviar parámetros de ordenamiento (sort y order) al servidor cuando se requiera ordenar el listado de tareas
- **FR-021**: El sistema MUST aceptar el ordenamiento por defecto del servidor cuando no se especifiquen parámetros de ordenamiento
- **FR-022**: El sistema MUST mostrar un indicador de carga (ft-progress) con el texto "Loading..." mientras se obtienen las tareas del servidor
- **FR-023**: El sistema MUST mostrar el mensaje "No records" (o equivalente traducido) cuando no hay tareas en el estado seleccionado
- **FR-024**: El sistema MUST mostrar un estado de error con icono de warning, mensaje de error y botón "Retry" cuando falla la carga de tareas
- **FR-025**: El sistema MUST seguir el patrón de manejo de estados de las plantillas existentes (entity-list) para mantener consistencia en la interfaz

### Key Entities *(include if feature involves data)*

- **Task (Tarea)**: Representa una tarea asignada a un usuario. Atributos clave incluyen: identificador único, título (obligatorio, máximo 50 caracteres), descripción (opcional, máximo 250 caracteres), estado (Pendiente, Congelada, Completada), fecha de vencimiento (dueAt), fechas de auditoría (creación, actualización), y referencias al usuario que creó y actualizó la tarea.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden visualizar sus tareas organizadas por estado (Pendientes, Congeladas, Completadas) en menos de 2 segundos desde que acceden a la funcionalidad
- **SC-002**: Los usuarios pueden crear una nueva tarea en menos de 30 segundos desde que hacen clic en "Nueva Tarea" hasta que la tarea aparece en el listado
- **SC-003**: Los usuarios pueden completar múltiples tareas seleccionadas (hasta 10 tareas) en una sola acción en menos de 3 segundos
- **SC-004**: Los usuarios pueden eliminar múltiples tareas seleccionadas (hasta 10 tareas) en una sola acción en menos de 3 segundos después de confirmar
- **SC-005**: El 95% de los usuarios pueden completar exitosamente la creación de una tarea en su primer intento sin necesidad de ayuda
- **SC-006**: El sistema muestra correctamente la información temporal (tiempo restante o vencido) para el 100% de las tareas que tienen fecha de vencimiento
- **SC-007**: El sistema resalta visualmente el 100% de las tareas vencidas según el diseño definido
- **SC-008**: Los usuarios pueden seleccionar y operar sobre hasta 50 tareas simultáneamente sin degradación en el rendimiento de la interfaz

## Assumptions

- Las tareas se almacenan de forma persistente mediante un API REST y están asociadas a un usuario autenticado
- La autenticación y autorización son gestionadas por el proyecto base; todas las peticiones al API se realizan en contexto autenticado
- El ordenamiento y filtrado de tareas se realizan en el servidor; el cliente envía parámetros sort y order cuando es necesario
- El sistema utiliza mocks (MockHttpClient) para simular el backend cuando el API REST no está disponible, siguiendo el patrón definido en ADR-006
- El sistema tiene acceso a la fecha y hora actual para calcular la información temporal de las tareas
- La información temporal se muestra en formato legible para humanos (por ejemplo, "Vence en 2 días", "Vencida hace 3 días", "Vence mañana")
- El diseño visual de la interfaz sigue los wireframes proporcionados en `docs/wireframes/tasks-list.png` y `docs/wireframes/tasks-list-selection.png`
- Las tareas pueden tener o no tener fecha de vencimiento (dueAt es opcional)
- El estado de una tarea puede ser: "Pendiente", "Congelada" o "Completada"
- Las acciones de completar y eliminar requieren que las tareas estén seleccionadas y el modo selección esté activo
- La barra de acciones normal (cuando no hay selección) incluye al menos el botón "Nueva Tarea"
- El sistema maneja errores de red o del servidor mostrando mensajes apropiados al usuario
- La selección de tareas se mantiene dentro de la misma sesión de usuario hasta que se deseleccione manualmente o se realice una acción

## Out of Scope

Las siguientes funcionalidades están explícitamente fuera del alcance de esta especificación:

- Subtareas o tareas anidadas
- Sistema de prioridades para tareas
- Recordatorios o notificaciones
- Etiquetas avanzadas o categorías personalizadas
- Sincronización externa con otros sistemas o aplicaciones
- Compartir tareas entre usuarios
- Asignación de tareas a otros usuarios
- Archivos adjuntos o documentos asociados a tareas
- Comentarios o notas colaborativas en tareas
- Historial de cambios o auditoría detallada de acciones sobre tareas
- Búsqueda avanzada o filtros complejos más allá de los tres estados básicos
- Exportación o importación de tareas
- Plantillas de tareas
