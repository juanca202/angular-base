DTO: Task

Description:
Representación de una tarea asignada a un usuario.

Fields:
- id: uuid v7
- title: string
- description: string
- status: string
- dueAt: date
- createdAt: date
- updatedAt: date
- createdBy: User
- updatedBy: User

Constraints:
- El título es obligatorio, tiene máximo 50 caracteres
- La descripción puede tener máximo 250 caracteres

API Endpoints:
- GET /tasks/:id - Obtiene una tarea individual por su identificador
- GET /tasks - Obtiene un listado de requirements con parámetros de ordenado, filtrado y paginación
