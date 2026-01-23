# Research: Administración de Tareas

**Feature**: 002-task-management  
**Date**: 2025-01-27  
**Purpose**: Resolver decisiones técnicas y patrones de implementación

## Decisiones Técnicas

### 1. Patrón Repository con MockHttpClient

**Decisión**: Utilizar el patrón Repository establecido en ADR-006 con MockHttpClient para simular el backend durante el desarrollo.

**Rationale**: 
- El proyecto ya tiene un patrón establecido y probado en `features/templates/`
- MockHttpClient permite desarrollo sin dependencia del backend real
- Facilita la transición futura al backend real (solo cambiar HttpClient por MockHttpClient)
- Los datos mock se cargan desde JSON en `test/mocks/repositories/tasks.json`

**Alternativas consideradas**:
- Crear un servicio HTTP personalizado: Rechazado porque duplicaría lógica ya existente
- Usar HttpClient directamente: Rechazado porque el backend aún no existe

**Referencias**:
- ADR-006: Patrón Repository para Servicios REST
- `src/app/features/templates/repositories/entity-repository.ts` (ejemplo de implementación)

### 2. Filtrado por Estado en el Servidor

**Decisión**: El servidor filtra las tareas por estado usando un parámetro de query `status` (ej: `status=pending`). Cada pestaña envía una petición con el estado correspondiente.

**Rationale**:
- Consistente con el patrón de filtrado en servidor ya establecido
- Permite que el servidor maneje la lógica de filtrado eficientemente
- Reduce la carga de datos en el cliente
- Facilita futura paginación y ordenamiento en el servidor

**Alternativas consideradas**:
- Filtrado local en el cliente: Rechazado porque violaría el principio de delegar lógica al servidor
- Una sola petición con todas las tareas: Rechazado porque sería ineficiente con muchos datos

**Implementación**:
```typescript
// Ejemplo de uso en TaskRepository
public findBy(status?: TaskStatus): SignalGet<void, Task[]> {
  return getResource<void, Task[]>(() => {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.httpClient.get<Task[]>(this.baseUrl, { params });
  });
}
```

### 3. Ordenamiento y Filtrado en el Servidor

**Decisión**: El ordenamiento y filtrado se realizan completamente en el servidor. El cliente envía parámetros `sort` (nombre de propiedad) y `order` (asc | desc). En ausencia de estos parámetros, el servidor aplica un ordenamiento por defecto.

**Rationale**:
- Consistente con el principio de delegar lógica al servidor
- Permite ordenamiento eficiente de grandes volúmenes de datos
- Facilita futura paginación
- El frontend no debe aplicar lógica de ordenamiento ni filtrado local

**Alternativas consideradas**:
- Ordenamiento local: Rechazado porque violaría el principio establecido y sería ineficiente
- Ordenamiento híbrido: Rechazado porque añadiría complejidad innecesaria

**Implementación**:
```typescript
// Parámetros de ordenamiento
interface TaskSearchParams {
  status?: TaskStatus;
  sort?: string;  // nombre de la propiedad (ej: 'dueAt', 'createdAt')
  order?: 'asc' | 'desc';
}
```

### 4. Manejo de Estados (Loading, Empty, Error)

**Decisión**: Usar el patrón de plantillas existentes (entity-list) para manejar estados de carga, vacío y error.

**Rationale**:
- Mantiene consistencia visual y de comportamiento en toda la aplicación
- Reutiliza componentes y estilos ya probados (ft-progress, ft-center)
- Reduce tiempo de desarrollo
- Mejora la experiencia de usuario con estados claros

**Patrón a seguir**:
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

**Referencias**:
- `src/app/features/templates/components/entity-list/entity-list.html` (líneas 21-81)

### 5. Selección Múltiple y Modo Selección

**Decisión**: Implementar selección múltiple mediante checkboxes y un modo selección que cambia la barra de acciones cuando hay tareas seleccionadas.

**Rationale**:
- Requisito funcional explícito de la especificación
- Mejora la eficiencia del usuario para operaciones en lote
- Patrón común en aplicaciones de administración

**Implementación**:
- Estado de selección gestionado en el componente task-list
- Signal para rastrear tareas seleccionadas: `selectedTasks = signal<Set<string>>(new Set())`
- Modo selección activo cuando `selectedTasks().size > 0`
- Barra de acciones condicional basada en el modo selección

### 6. Cálculo de Información Temporal

**Decisión**: Calcular la información temporal (tiempo restante o vencido) en el cliente basándose en `dueAt` y la fecha actual.

**Rationale**:
- `dueAt` es opcional, por lo que el cálculo debe ser flexible
- Permite formateo legible para humanos ("Vence en 2 días", "Vencida hace 3 días")
- El cálculo es simple y no requiere lógica de servidor
- Puede implementarse como un pipe o función helper

**Implementación**:
- Función helper o pipe para calcular diferencia de fechas
- Formato legible: "Vence mañana", "Vence en X días", "Vencida hace X días"
- Resaltado visual (rojo) cuando la tarea está vencida

### 7. Estructura de Componentes

**Decisión**: Separar en componentes task-list (listado principal), task-item (item individual) y task-form (formulario de creación/edición).

**Rationale**:
- Separación de responsabilidades (SRP)
- Facilita testing individual
- Permite reutilización de task-item en otros contextos
- Sigue el patrón establecido en entity-list, entity-detail, entity-form

**Componentes**:
- `task-list`: Contenedor principal con pestañas, barra de acciones, lista de tareas
- `task-item`: Item individual con checkbox, título, información temporal
- `task-form`: Formulario para crear/editar tareas (si se requiere en el futuro)

### 8. Manager Pattern

**Decisión**: Implementar TaskManager siguiendo el patrón de EntityManager para coordinar diálogos y acciones complejas.

**Rationale**:
- Mantiene consistencia con el patrón establecido
- Centraliza lógica de presentación (diálogos, confirmaciones)
- Facilita testing y mantenimiento
- Separa concerns entre componentes y lógica de negocio

**Responsabilidades del Manager**:
- Abrir diálogo de creación de tarea
- Confirmar eliminación de tareas
- Coordinar acciones masivas (completar/eliminar múltiples)
- Gestionar menús contextuales si se requieren

## Referencias de Código Existente

### Repository Pattern
- `src/app/features/templates/repositories/entity-repository.ts`
- `src/app/core/services/mock-http-client.ts`
- `src/app/core/utils/async-resources.ts`

### Manager Pattern
- `src/app/features/templates/managers/entity-manager.ts`

### Component Pattern
- `src/app/features/templates/components/entity-list/entity-list.ts`
- `src/app/features/templates/components/entity-list/entity-list.html`

### Models
- `src/app/features/templates/models/entity.ts`

## Tecnologías y Dependencias

- **Angular 21.0+**: Framework base
- **TypeScript 5.9+**: Lenguaje
- **Angular Material (MDC)**: Componentes UI
- **Tailwind CSS**: Utilidades CSS
- **@factor_ec/ui**: Componentes UI personalizados (IconComponent, ProgressComponent)
- **Signals**: Gestión de estado reactivo
- **RxJS**: Para operaciones asíncronas (ya integrado en helpers)

## Consideraciones de Rendimiento

- **Lazy Loading**: La feature se carga bajo demanda mediante routing
- **OnPush Change Detection**: Todos los componentes usan OnPush para optimización
- **Signals**: Gestión de estado reactivo eficiente
- **Virtual Scrolling**: Considerar si hay muchas tareas (>100) en el futuro

## Próximos Pasos

1. Crear modelos de datos (Task, TaskStatus, etc.)
2. Implementar TaskRepository con MockHttpClient
3. Crear componentes task-list y task-item
4. Implementar TaskManager para acciones complejas
5. Integrar con rutas de la aplicación
6. Crear tests unitarios y E2E
