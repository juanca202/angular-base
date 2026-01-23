# Quick Start: Administración de Tareas

**Feature**: 002-task-management  
**Date**: 2025-01-27

## Resumen de la Implementación

Esta feature implementa un sistema de administración de tareas que permite a los usuarios visualizar, crear, completar y eliminar tareas organizadas en tres estados: Pendientes, Congeladas y Completadas.

## Arquitectura

### Capas y Responsabilidades

1. **Repository Layer** (`TaskRepository`):
   - Encapsula acceso a datos mediante API REST
   - Utiliza `MockHttpClient` durante desarrollo
   - Sigue el patrón establecido en ADR-006

2. **Manager Layer** (`TaskManager`):
   - Coordina acciones complejas (diálogos, confirmaciones)
   - Gestiona operaciones masivas (completar/eliminar múltiples)
   - Sigue el patrón de `EntityManager`

3. **Component Layer**:
   - `TaskList`: Componente principal con pestañas y listado
   - `TaskItem`: Item individual de tarea
   - `TaskForm`: Formulario de creación (si se requiere)

### Flujo de Datos

```
Component → Manager → Repository → MockHttpClient/HttpClient → API
```

## Estructura de Archivos

```
src/app/features/tasks/
├── components/
│   ├── task-list/
│   │   ├── task-list.ts
│   │   ├── task-list.html
│   │   ├── task-list.css
│   │   └── task-list.spec.ts
│   ├── task-item/
│   │   ├── task-item.ts
│   │   ├── task-item.html
│   │   ├── task-item.css
│   │   └── task-item.spec.ts
│   └── task-form/ (opcional)
├── managers/
│   └── task-manager.ts
├── repositories/
│   └── task-repository.ts
├── models/
│   ├── task.ts
│   └── task-status.ts
└── tasks-routes.ts
```

## Puntos Clave de Implementación

### 1. Repository con MockHttpClient

```typescript
@Injectable({ providedIn: 'root' })
export class TaskRepository extends BaseRepository {
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('tasks');

  constructor() {
    super();
    this.httpClient.loadCollection('tasks', tasksMock);
  }

  public findBy(status?: TaskStatus): SignalGet<void, Task[]> {
    return getResource<void, Task[]>(() => {
      let params = new HttpParams();
      if (status) {
        params = params.set('status', status);
      }
      return this.httpClient.get<Task[]>(this.baseUrl, { params });
    });
  }

  public mutations() {
    return getMutations({
      create: (task: TaskRequestCreate) => /* ... */,
      update: (task: TaskRequestUpdate) => /* ... */,
      delete: (id: string) => /* ... */
    });
  }
}
```

### 2. Selección Múltiple

```typescript
// En TaskList component
selectedTasks = signal<Set<string>>(new Set());
isSelectionMode = computed(() => this.selectedTasks().size > 0);

toggleSelection(taskId: string): void {
  const current = this.selectedTasks();
  const updated = new Set(current);
  if (updated.has(taskId)) {
    updated.delete(taskId);
  } else {
    updated.add(taskId);
  }
  this.selectedTasks.set(updated);
}
```

### 3. Modo Selección y Barra de Acciones

```html
<!-- Barra de acciones condicional -->
@if (isSelectionMode()) {
  <div class="ft-actions">
    <button (click)="completeSelected()">Completar</button>
    <button (click)="deleteSelected()">Eliminar</button>
  </div>
} @else {
  <div class="ft-actions">
    <button (click)="openCreateDialog()">+ Nueva Tarea</button>
  </div>
}
```

### 4. Información Temporal

```typescript
// Helper function o pipe
export function formatTaskDueDate(dueAt: Date | null): string {
  if (!dueAt) return '';
  
  const now = new Date();
  const due = new Date(dueAt);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Vencida hace ${Math.abs(diffDays)} días`;
  } else if (diffDays === 0) {
    return 'Vence hoy';
  } else if (diffDays === 1) {
    return 'Vence mañana';
  } else {
    return `Vence en ${diffDays} días`;
  }
}
```

### 5. Manejo de Estados (Loading, Empty, Error)

Seguir el patrón de `entity-list.html`:

```html
@if (!tasks.error() && (!tasks.loading() || tasks.value()?.length)) {
  <!-- Lista de tareas -->
} @else if (tasks.loading()) {
  <div class="ft-center">
    <ft-progress class="ft-progress--3" />
    <div i18n>Loading...</div>
  </div>
} @else if (tasks.error()) {
  <div class="ft-center">
    <ft-icon name="warning" collection="factoricons-slim" class="text-4xl" />
    <p class="text-gray-500 mb-4">{{ tasks.error() }}</p>
    <button i18n type="button" matButton="filled" (click)="tasks.reload()">Retry</button>
  </div>
} @else if (!tasks.value()?.length) {
  <div class="ft-center" i18n>No records</div>
}
```

## Integración con Rutas

```typescript
// tasks-routes.ts
import { Routes } from '@angular/router';
import { TaskList } from './components/task-list/task-list';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TaskList
  }
];
```

```typescript
// app.routes.ts (actualizar)
import { TASKS_ROUTES } from '@/features/tasks/tasks-routes';

export const routes: Routes = [
  // ... otras rutas
  {
    path: 'tasks',
    loadChildren: () => import('@/features/tasks/tasks-routes').then(m => m.TASKS_ROUTES)
  }
];
```

## Testing

### Unit Tests

- **TaskRepository**: Mockear MockHttpClient, verificar llamadas HTTP
- **TaskManager**: Mockear diálogos y repository, verificar flujos
- **TaskList**: Mockear repository y manager, verificar renderizado y eventos
- **TaskItem**: Verificar renderizado y eventos de selección

### E2E Tests

- Navegación entre pestañas
- Crear nueva tarea
- Seleccionar múltiples tareas
- Completar tareas seleccionadas
- Eliminar tareas seleccionadas
- Estados de carga y error

## Datos Mock

Actualizar `test/mocks/repositories/tasks.json` con:
- Tareas en diferentes estados (pending, frozen, completed)
- Tareas con y sin fecha de vencimiento
- Tareas vencidas y por vencer
- Variedad de títulos y descripciones

## Próximos Pasos

1. ✅ Crear modelos de datos (Task, TaskStatus)
2. ✅ Implementar TaskRepository
3. ⏳ Crear componentes TaskList y TaskItem
4. ⏳ Implementar TaskManager
5. ⏳ Integrar con rutas
6. ⏳ Crear tests
7. ⏳ Actualizar datos mock

## Referencias

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/task-api.md](./contracts/task-api.md)
- **ADR-006**: [Repository Pattern](../../adr/ADR-006-repository-pattern-rest.md)
- **Ejemplo**: `src/app/features/templates/`
