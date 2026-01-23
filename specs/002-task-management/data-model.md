# Data Model: Administración de Tareas

**Feature**: 002-task-management  
**Date**: 2025-01-27

## Entidades

### Task (Tarea)

Representa una tarea asignada a un usuario.

**Fuente**: `docs/contracts/tasks/task.md`

#### Atributos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | `string` (UUID v7) | Sí | Identificador único de la tarea |
| `title` | `string` | Sí | Título de la tarea (máximo 50 caracteres) |
| `description` | `string` | No | Descripción de la tarea (máximo 250 caracteres) |
| `status` | `TaskStatus` | Sí | Estado de la tarea: `pending`, `frozen`, `completed` |
| `dueAt` | `Date \| null` | No | Fecha de vencimiento de la tarea |
| `createdAt` | `Date` | Sí | Fecha de creación |
| `updatedAt` | `Date` | Sí | Fecha de última actualización |
| `createdBy` | `User` | Sí | Usuario que creó la tarea |
| `updatedBy` | `User` | Sí | Usuario que actualizó la tarea por última vez |

#### Validaciones

- **title**: 
  - Obligatorio
  - Máximo 50 caracteres
- **description**: 
  - Opcional
  - Máximo 250 caracteres cuando está presente
- **status**: 
  - Obligatorio
  - Debe ser uno de: `pending`, `frozen`, `completed`
- **dueAt**: 
  - Opcional
  - Si está presente, debe ser una fecha válida

#### Relaciones

- **createdBy**: Referencia a entidad `User` (definida en `docs/contracts/core/user.md`)
- **updatedBy**: Referencia a entidad `User` (definida en `docs/contracts/core/user.md`)

#### Estados y Transiciones

**Estados posibles**:
- `pending`: Tarea por realizar
- `frozen`: Tarea en pausa temporal (standby)
- `completed`: Tarea finalizada

**Transiciones permitidas**:
- `pending` → `completed`: Al completar una tarea
- `pending` → `frozen`: (No implementado en esta fase, pero posible en el futuro)
- `frozen` → `pending`: (No implementado en esta fase, pero posible en el futuro)
- `frozen` → `completed`: (No implementado en esta fase, pero posible en el futuro)
- Cualquier estado → eliminación: La tarea se elimina permanentemente

**Nota**: Las transiciones entre estados se realizan mediante acciones explícitas del usuario (completar, eliminar). No hay transiciones automáticas.

## Tipos y Enumeraciones

### TaskStatus

```typescript
export type TaskStatus = 'pending' | 'frozen' | 'completed';
```

**Valores**:
- `pending`: Pendiente - tarea por realizar
- `frozen`: Congelada - tarea en pausa temporal
- `completed`: Completada - tarea finalizada

### TaskRequestCreate

```typescript
export type TaskRequestCreate = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
```

Tipo para crear una nueva tarea. Omite campos generados automáticamente por el sistema.

### TaskRequestUpdate

```typescript
export type TaskRequestUpdate = Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueAt'>> & {
  id: string;
};
```

Tipo para actualizar una tarea existente. Solo permite actualizar campos específicos.

### TaskSearchParams

```typescript
export interface TaskSearchParams {
  status?: TaskStatus;
  sort?: string;  // nombre de la propiedad (ej: 'dueAt', 'createdAt', 'title')
  order?: 'asc' | 'desc';
}
```

Parámetros para buscar y filtrar tareas. Usado en el método `findBy()` del repository.

## Modelo de Datos Mock

El archivo `test/mocks/repositories/tasks.json` contiene datos de ejemplo que siguen esta estructura:

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

**Nota**: El archivo mock ya existe y debe actualizarse para incluir más tareas de ejemplo con diferentes estados y fechas de vencimiento para testing completo.

## Consideraciones de Implementación

### Cálculo de Información Temporal

La información temporal se calcula en el cliente basándose en `dueAt` y la fecha actual:

- Si `dueAt` es `null` o `undefined`: No se muestra información temporal
- Si `dueAt` es una fecha futura: "Vence en X días" o "Vence mañana"
- Si `dueAt` es una fecha pasada: "Vencida hace X días" (resaltado en rojo)
- Si `dueAt` es hoy: "Vence hoy"

### Identificación Unica

- Las tareas se identifican mediante UUID v7
- El ID se genera automáticamente por el servidor al crear una tarea
- El ID es inmutable una vez creado

### Auditoría

- `createdAt` y `updatedAt` se gestionan automáticamente por el servidor
- `createdBy` y `updatedBy` se establecen basándose en el usuario autenticado
- Estas propiedades son de solo lectura desde el cliente

## Mapeo con Contrato de API

El modelo de datos se alinea con el contrato definido en `docs/contracts/tasks/task.md`:

- Todos los campos del contrato están representados en el modelo
- Las validaciones del contrato se aplican en el modelo
- Los tipos TypeScript reflejan las restricciones del contrato
