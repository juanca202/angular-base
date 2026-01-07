# Research: Administrador de Requirements

**Date**: 2026-01-06  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Technical Research

### Stack Tecnológico Confirmado

- **Angular 21.0+**: Framework principal con componentes standalone
- **TypeScript 5.9+**: Lenguaje con modo estricto
- **Angular Material (MDC)**: Componentes UI base
- **Tailwind CSS**: Utilidades CSS para layout
- **@factor_ec/ui**: Componentes UI adicionales (IconComponent, ProgressComponent, etc.)

### Patrones Arquitectónicos

#### Repository Pattern (ADR-006)
- Uso de `getResource()` para operaciones GET (listar SDPs, obtener detalles)
- Uso de `getMutations()` para operaciones POST/PUT/DELETE (agregar/eliminar recetas)
- Gestión automática de estado con signals (loading, error, value)
- Manejo automático de errores con MessageService

#### Component Architecture
- Componentes standalone con `ChangeDetectionStrategy.OnPush`
- Inyección de dependencias con `inject()` en lugar de constructores
- Estado reactivo con Angular Signals a través del Repository pattern
- Flujos de control nativos (`@if`, `@for`, `@switch`)

### Estructura de Datos Identificada

Los modelos de datos están definidos como DTOs en `docs/contracts/requirements/`:

1. **Requirement** (antes SDP)
   - Representa un Requirement (Solicitud de Desarrollo de Producto)
   - Relación 1:N con RequirementItems
   - Fuente: `docs/contracts/requirements/requirement.md`

2. **RequirementItem** (antes Item)
   - Pertenece a un Requirement
   - Relación 1:N con Recipes
   - Fuente: `docs/contracts/requirements/requirement-item.md`

3. **Recipe**
   - Pertenece a un RequirementItem
   - Define requisitos/instrucciones para producción
   - Fuente: `docs/contracts/requirements/recipe.md`

### Endpoints de API Esperados

Basado en el patrón Repository y los requisitos funcionales:

- `GET /api/v1/requirements` - Listar todas las Requirements
- `GET /api/v1/requirements/:id` - Obtener detalle de una Requirement
- `GET /api/v1/requirements/:id/items` - Obtener RequirementItems de una Requirement (o incluidos en el detalle)
- `GET /api/v1/requirement-items/:id` - Obtener detalle de un RequirementItem
- `GET /api/v1/requirement-items/:id/recipes` - Obtener Recipes de un RequirementItem (o incluidos en el detalle)
- `POST /api/v1/requirement-items/:id/recipes` - Agregar Recipe a un RequirementItem
- `DELETE /api/v1/requirement-items/:itemId/recipes/:recipeId` - Eliminar Recipe de un RequirementItem

### Consideraciones de Rendimiento

- **Paginación**: Para listas grandes de Requirements (>100), considerar paginación
- **Lazy Loading**: Cargar detalles de Requirements e ítems bajo demanda
- **Virtual Scrolling**: Para listas grandes de RequirementItems (>100) dentro de una Requirement
- **Caching**: Considerar cachear datos de Requirements e ítems frecuentemente accedidos

### Consideraciones de UX

- **Estados de carga**: Mostrar spinners durante carga de datos
- **Mensajes de error**: Mostrar mensajes claros cuando no hay datos o hay errores
- **Navegación**: Flujo claro: Lista → Detalle Requirement → Detalle RequirementItem → Gestión Recipes
- **Feedback visual**: Confirmación visual al agregar/eliminar Recipes

### Testing Strategy

- **Unit Tests**: Componentes, repositories, managers con Vitest
- **Integration Tests**: Interacciones componente-repository
- **E2E Tests**: Flujos completos de usuario con Playwright
- **Cobertura objetivo**: ≥80% para rutas críticas

### Referencias

- [ADR-001: Separación de Responsabilidades](../../adr/ADR-001-separation-of-responsibilities.md)
- [ADR-002: Guía de Estilo de Angular](../../adr/ADR-002-angular-style-guide.md)
- [ADR-006: Patrón Repository para REST](../../adr/ADR-006-repository-pattern-rest.md)
- [ADR-007: Estrategia de Testing](../../adr/ADR-007-testing-strategy.md)
- [Feature Template Example](../../../src/app/features/templates/) - Referencia de estructura
- [Contratos Source](../../contracts/requirements/) - DTOs definidos en contracts

