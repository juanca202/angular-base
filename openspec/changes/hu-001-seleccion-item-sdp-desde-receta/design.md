## Context

La pantalla de recetas actualmente muestra todas las recetas asociadas a un ítem específico, sin embargo, no permite cambiar de item directamente desde ahi. Los desarrolladores necesitan cambiar de contexto entre diferentes ítems del mismo SDP mientras trabajan en recetas, pero actualmente deben navegar fuera de la pantalla para seleccionar un ítem diferente y luego volver.

El proyecto sigue una arquitectura modular con componentes standalone, signals para gestión de estado, y patrones establecidos como Repository (ADR-006) para acceso a datos y Manager (ADR-015) para orquestación de flujos complejos. La aplicación consume servicios REST desde el platform backend, y los endpoints necesarios para obtener y crear ítems ya existen en la API.

**Restricciones técnicas:**
- Componentes standalone con `ChangeDetectionStrategy.OnPush`
- Signals para gestión de estado reactiva
- Patrón Repository para acceso a datos
- Patrón Manager para orquestación de flujos complejos
- Angular Material (MDC) para componentes de UI
- Tailwind CSS para estilos
- Los APIs aún no están disponibles, se deben usar mocks temporalmente

## Goals / Non-Goals

**Goals:**
- Permitir seleccionar y cambiar entre ítems de SDP desde la pantalla de recetas sin navegar fuera
- Mostrar ítems propios del usuario (seleccionables) e ítems de otros desarrolladores (solo lectura)
- Filtrar visualización entre "mis ítems" e "ítems de otros desarrolladores"
- Crear nuevos ítems directamente desde el selector con nombre genérico editable
- Filtrar automáticamente las recetas cuando se selecciona un ítem
- Persistir el ítem seleccionado en la URL para permitir deep linking y navegación del navegador
- Mantener la arquitectura existente y seguir los patrones establecidos (Repository, Manager)

**Non-Goals:**
- Modificar la estructura de datos del backend (los endpoints ya existen)
- Cambiar la arquitectura general de la aplicación
- Implementar funcionalidades de edición completa de ítems (solo creación rápida)
- Modificar otras pantallas o features fuera del contexto de recetas
- Implementar funcionalidades de asignación de ítems a desarrolladores (ya existe en backend)

## Decisions

### 1. Ubicación del Componente Selector

**Decisión:** Crear el componente `RequirementItemPicker` en `src/app/features/requirements/components/requirement-item-picker/`

**Alternativas consideradas:**
- `src/app/shared/components/` - Rechazado porque no es reutilizable fuera del contexto de recetas
- `src/app/cross/requirements/components/` - Rechazado porque no es una funcionalidad transversal

**Rationale:** El selector está específicamente diseñado para usarse en la pantalla de recetas y su comportamiento está acoplado a ese contexto.

### 2. Gestión de Estado del Ítem Seleccionado

**Decisión:** Usar un signal en el componente de lista de recetas para mantener el ítem seleccionado, sincronizado con query parameters de la URL.

**Alternativas consideradas:**
- Servicio global de estado - Rechazado porque el estado es específico del contexto de recetas
- Manager dedicado - Considerado pero rechazado porque el estado es simple y no requiere orquestación compleja
- LocalStorage - Rechazado porque la persistencia en URL es más apropiada para deep linking

**Rationale:** Los signals proporcionan reactividad nativa y el uso de query parameters permite deep linking y navegación del navegador (back/forward). El estado es local al componente de recetas, por lo que no requiere un servicio global.

### 3. Patrón de Acceso a Datos

**Decisión:** Crear `RequirementItemRepository` en `src/app/cross/requirements/repositories/` siguiendo el patrón Repository existente (ADR-006).

**Alternativas consideradas:**
- Servicio directo - Rechazado porque viola el patrón establecido
- Manager con acceso directo a HTTP - Rechazado porque mezcla responsabilidades

**Rationale:** El patrón Repository está establecido en el proyecto (ADR-006) y proporciona una abstracción consistente para acceso a datos. Los ítems de requerimiento son parte del dominio transversal de requirements, por lo que el repository pertenece a `cross/requirements/`.

### 4. Orquestación de Creación de Ítems

**Decisión:** Crear `RequirementItemManager` en `src/app/features/recipes/managers/` para orquestar el flujo de creación de nuevos ítems.

**Alternativas consideradas:**
- Lógica en el componente - Rechazado porque viola el principio de componentes ligeros
- Lógica en el repository - Rechazado porque el repository solo debe manejar acceso a datos
- Manager en `cross/requirements/` - Rechazado porque la creación desde el selector es específica del contexto de recetas

**Rationale:** El patrón Manager (ADR-015) es apropiado para orquestar flujos complejos que involucran diálogos, validaciones y múltiples operaciones. La creación desde el selector es específica del contexto de recetas, por lo que el manager pertenece a la feature de recipes.

### 5. Generación de Nombres Genéricos para Nuevos Ítems

**Decisión:** El Manager generará nombres genéricos siguiendo el formato `"Item {número secuencial}"` basado en la cantidad de ítems existentes en el SDP.

**Alternativas consideradas:**
- Nombre vacío por defecto - Rechazado porque requiere más pasos del usuario
- Nombre basado en fecha/hora - Rechazado porque no es descriptivo
- Nombre basado en el último ítem creado - Rechazado porque puede generar conflictos

**Rationale:** Un nombre genérico con número secuencial es descriptivo, evita conflictos y permite al usuario identificar fácilmente el ítem antes de editarlo.

### 7. Mock de Datos Temporal

**Decisión:** Crear un mock del `RequirementItemRepository` que retorne datos de prueba mientras los APIs no estén disponibles.

**Alternativas consideradas:**
- Esperar a que los APIs estén disponibles - Rechazado porque bloquea el desarrollo frontend
- Usar datos hardcodeados en el componente - Rechazado porque viola la separación de responsabilidades

**Rationale:** El uso de mocks permite desarrollar y probar la funcionalidad frontend de forma independiente. El patrón Repository facilita el cambio entre mock y implementación real sin modificar los componentes.

## Risks / Trade-offs

**[Risk] Performance al cargar muchos ítems**
- **Mitigation:** El backend ya implementa paginación. Si es necesario, implementar virtual scrolling en el selector usando `@angular/cdk/scrolling` o limitar la cantidad de ítems mostrados inicialmente.

**[Risk] Conflicto de nombres genéricos si múltiples usuarios crean ítems simultáneamente**
- **Mitigation:** El backend debería manejar esto, pero como medida adicional, el Manager puede incluir timestamp o ID único en el nombre genérico si se detectan conflictos.

**[Risk] Cambio de APIs cuando estén disponibles**
- **Mitigation:** El patrón Repository abstrae los detalles de implementación. Solo será necesario actualizar el repository, no los componentes ni managers.

**[Trade-off] Estado local vs servicio global**
- **Decisión:** Estado local en el componente de recetas
- **Razón:** El estado es específico del contexto de recetas. Si en el futuro se necesita compartir este estado, se puede refactorizar a un servicio.

**[Trade-off] Manager en feature vs cross**
- **Decisión:** Manager en `features/requirements/`
- **Razón:** La creación desde el selector es específica del contexto de recetas. Si se necesita crear ítems desde otros contextos, se puede crear un manager adicional en `cross/requirements/`.

## Migration Plan

**Fase 1: Implementación con Mocks**
1. Crear `RequirementItemRepository` con implementación mock
2. Crear modelos TypeScript para `RequirementItem`
3. Crear componente `RequirementItemPicker`
4. Integrar el selector en el componente de lista de recetas
5. Implementar filtrado de recetas basado en ítem seleccionado
6. Implementar sincronización con query parameters

**Fase 2: Creación de Ítems**
1. Crear `RequirementItemManager` con lógica de creación
2. Implementar diálogo de creación con nombre editable
3. Integrar con el selector para mostrar el nuevo ítem inmediatamente

**Fase 3: Integración con APIs Reales**
1. Reemplazar implementación mock del repository con llamadas reales a API
2. Actualizar manejo de errores y estados de carga
3. Probar sincronización con backend

**Rollback Strategy:**
- Si hay problemas críticos, se puede ocultar el selector mediante feature flag
- El código está aislado en componentes y servicios específicos, facilitando la remoción si es necesario

## Open Questions

1. **Convención de nombres genéricos:** ¿Existe una convención establecida para nombres genéricos de ítems? Si no, ¿debe definirse en coordinación con el equipo de backend?

2. **Filtrado de recetas:** ¿El filtrado debe ser automático al seleccionar un ítem o debe haber un botón explícito de "aplicar filtro"?

3. **Estados de carga:** ¿Cómo debe comportarse el selector mientras se cargan los ítems? ¿Mostrar skeleton, spinner, o estado vacío?

4. **Validación de creación:** ¿Qué validaciones adicionales deben aplicarse al crear un nuevo ítem desde el selector? ¿Debe validarse que el usuario tenga permisos para crear ítems en el SDP?

5. **Persistencia de filtro:** ¿Debe persistirse también el filtro seleccionado ("mis ítems" vs "otros desarrolladores") en la URL o solo el ítem seleccionado?
