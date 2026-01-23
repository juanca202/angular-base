# API Contract: Tasks

**Feature**: 002-task-management  
**Date**: 2025-01-27  
**Base URL**: `/tasks`

## Endpoints

### GET /tasks

Obtiene un listado de tareas con parámetros de ordenamiento, filtrado y paginación.

**Query Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `status` | `string` | No | Filtra por estado: `pending`, `frozen`, `completed` |
| `sort` | `string` | No | Nombre de la propiedad por la cual ordenar (ej: `dueAt`, `createdAt`, `title`) |
| `order` | `string` | No | Orden: `asc` o `desc` (default: `asc`) |

**Ejemplo de Request**:
```
GET /tasks?status=pending&sort=dueAt&order=asc
```

**Response** (200 OK):
```json
[
  {
    "id": "01HZ1234567890ABCDEFGHIJKL",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the new feature",
    "status": "pending",
    "dueAt": "2026-01-30T10:00:00Z",
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-01-20T10:00:00Z",
    "createdBy": {
      "id": "user-001",
      "name": "John Doe"
    },
    "updatedBy": {
      "id": "user-001",
      "name": "John Doe"
    }
  }
]
```

**Ordenamiento por defecto**: Si no se especifican `sort` y `order`, el servidor aplica un ordenamiento por defecto (por ejemplo, por `createdAt` descendente).

**Nota**: El frontend NO debe aplicar lógica de ordenamiento ni filtrado local. Todo se delega al servidor.

### GET /tasks/:id

Obtiene una tarea individual por su identificador.

**Path Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `id` | `string` (UUID) | Sí | Identificador único de la tarea |

**Ejemplo de Request**:
```
GET /tasks/01HZ1234567890ABCDEFGHIJKL
```

**Response** (200 OK):
```json
{
  "id": "01HZ1234567890ABCDEFGHIJKL",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the new feature",
  "status": "pending",
  "dueAt": "2026-01-30T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "updatedAt": "2026-01-20T10:00:00Z",
  "createdBy": {
    "id": "user-001",
    "name": "John Doe"
  },
  "updatedBy": {
    "id": "user-001",
    "name": "John Doe"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

### POST /tasks

Crea una nueva tarea.

**Request Body**:
```json
{
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",
  "dueAt": "2026-01-30T10:00:00Z"
}
```

**Campos obligatorios**:
- `title`: string (máximo 50 caracteres)
- `status`: string (`pending`, `frozen`, `completed`)

**Campos opcionales**:
- `description`: string (máximo 250 caracteres)
- `dueAt`: string (ISO 8601 date)

**Response** (201 Created):
```json
{
  "id": "01HZ1234567890ABCDEFGHIJKL",
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",
  "dueAt": "2026-01-30T10:00:00Z",
  "createdAt": "2026-01-27T10:00:00Z",
  "updatedAt": "2026-01-27T10:00:00Z",
  "createdBy": {
    "id": "user-001",
    "name": "John Doe"
  },
  "updatedBy": {
    "id": "user-001",
    "name": "John Doe"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "messages": [
    "Title is required",
    "Title must not exceed 50 characters"
  ]
}
```

### PUT /tasks/:id

Actualiza una tarea existente.

**Path Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `id` | `string` (UUID) | Sí | Identificador único de la tarea |

**Request Body**:
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "completed",
  "dueAt": "2026-01-30T10:00:00Z"
}
```

**Nota**: Todos los campos son opcionales en el request. Solo se actualizan los campos proporcionados.

**Response** (200 OK):
```json
{
  "id": "01HZ1234567890ABCDEFGHIJKL",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "completed",
  "dueAt": "2026-01-30T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "updatedAt": "2026-01-27T10:00:00Z",
  "createdBy": {
    "id": "user-001",
    "name": "John Doe"
  },
  "updatedBy": {
    "id": "user-001",
    "name": "John Doe"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

### PATCH /tasks/:id/status

Actualiza el estado de una tarea (acción masiva de completar).

**Path Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `id` | `string` (UUID) | Sí | Identificador único de la tarea |

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response** (200 OK):
```json
{
  "id": "01HZ1234567890ABCDEFGHIJKL",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the new feature",
  "status": "completed",
  "dueAt": "2026-01-30T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "updatedAt": "2026-01-27T10:00:00Z",
  "createdBy": {
    "id": "user-001",
    "name": "John Doe"
  },
  "updatedBy": {
    "id": "user-001",
    "name": "John Doe"
  }
}
```

**Nota**: Este endpoint se puede usar para completar tareas individualmente. Para acciones masivas, se pueden hacer múltiples llamadas o implementar un endpoint específico `POST /tasks/batch/complete` en el futuro.

### DELETE /tasks/:id

Elimina una tarea permanentemente.

**Path Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `id` | `string` (UUID) | Sí | Identificador único de la tarea |

**Response** (204 No Content):
```
(empty body)
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

## Autenticación

Todas las peticiones requieren autenticación. El sistema base gestiona la sesión de usuario y todas las peticiones se realizan en un contexto autenticado.

**Headers requeridos**:
```
Authorization: Bearer <token>
```

## Implementación Mock

Durante el desarrollo, el `MockHttpClient` simula estos endpoints:

- Los datos se cargan desde `test/mocks/repositories/tasks.json`
- El mock soporta filtrado por `status` mediante query parameters
- El mock soporta ordenamiento mediante `sort` y `order`
- Las operaciones de mutación (POST, PUT, PATCH, DELETE) actualizan el estado en memoria

**Referencia**: Ver `src/app/core/services/mock-http-client.ts` para detalles de implementación.
