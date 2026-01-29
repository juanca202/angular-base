## Why

Los desarrolladores necesitan poder cambiar de contexto entre diferentes ítems de SDP (Solicitud de Desarrollo de Producto) mientras trabajan en la pantalla de recetas, sin tener que navegar fuera de esta pantalla. Actualmente, para trabajar en un ítem diferente, deben salir de la pantalla de recetas, buscar el ítem en otra parte de la aplicación y luego volver. Esto interrumpe el flujo de trabajo y reduce la productividad. Esta funcionalidad es crítica ahora porque forma parte del epic que permite crear recetas para productos que se van a cotizar, y es un bloqueador para que los desarrolladores puedan trabajar eficientemente en múltiples ítems del mismo SDP.

## What Changes

- **Nuevo componente selector de ítems**: Se agregará un componente selector en la pantalla de recetas que permite seleccionar entre los ítems del SDP actual
- **Visualización de ítems propios y de otros desarrolladores**: El selector mostrará los ítems asignados al usuario actual (seleccionables) y los ítems asignados a otros desarrolladores del mismo SDP (solo lectura, informativos)
- **Filtrado de ítems**: Se permitirá filtrar la visualización entre "mis ítems" e "ítems de otros desarrolladores", siempre dentro del mismo SDP
- **Creación rápida de nuevos ítems**: Se permitirá crear nuevos ítems directamente desde el selector, con nombre genérico prellenado y editable, sin salir de la pantalla de recetas
- **Filtrado automático de recetas**: Al seleccionar un ítem, la lista de recetas se filtrará automáticamente para mostrar solo las recetas asociadas a ese ítem
- **Persistencia de estado en URL**: El ítem seleccionado se persistirá en la URL como query parameter para permitir deep linking y navegación del navegador

## Capabilities

### New Capabilities

- `requirement-item-picker`: Capacidad para seleccionar y cambiar entre ítems de SDP desde la pantalla de recetas, incluyendo visualización de ítems propios y de otros desarrolladores con filtrado, creación rápida de nuevos ítems con nombre genérico editable, y filtrado automático de recetas basado en la selección del ítem.

### Modified Capabilities

<!-- No hay capacidades existentes cuyos requisitos cambien - esta es una nueva funcionalidad -->

## Impact

**Código afectado**:
- `src/app/features/requirements/components/` - Nuevo componente `requirement-item-picker` para la selección de ítems
- `src/app/features/requirements/repositories/` - Nuevo `requirement-item-repository` para acceso a datos de RequirementItem siguiendo el patrón Repository existente
- `src/app/features/requirements/models/` - Nuevos modelos TypeScript para RequirementItem y tipos relacionados

**APIs afectadas**:
- `GET /requirement-items?requirementId={id}` - Endpoint existente de API Platform para obtener ítems del SDP (ya existe, no requiere cambios)
- `POST /requirement-items` - Endpoint existente de API Platform para crear nuevos ítems (ya existe, no requiere cambios)
- `GET /requirement-items/:id/recipes` - Endpoint existente para obtener recetas de un ítem específico (ya existe, no requiere cambios)

**Dependencias**:
- Angular Material (MDC) - Para componentes de UI del selector (MatSelect, MatDialog para creación)
- @factor_ec/ui - Para componentes de UI consistentes con el resto de la aplicación
- Patrón Repository existente (ADR-006) - Para acceso a datos
- Patrón Manager existente (ADR-015) - Para orquestación de flujos complejos

**Sistemas**:
- Los APIs todavia no están disponibles hay que usar mocks de momento