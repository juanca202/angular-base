# Implementation Plan: Administrador de Requirements

**Branch**: `001-requirements` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `docs/specs/001-sdp-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Esta feature implementa un administrador centralizado para gestionar Requirements (Solicitudes de Producción), permitiendo a los usuarios listar Requirements, visualizar sus detalles, explorar RequirementItems y gestionar Recipes asociadas. La implementación seguirá la arquitectura de capas del proyecto (Core, Shared, Cross, Features) usando el patrón Repository para comunicación con APIs, componentes standalone de Angular con signals para estado reactivo, y Tailwind CSS para estilos. Los modelos de datos están definidos en los DTOs ubicados en `docs/contracts/`.

## Technical Context

**Language/Version**: TypeScript 5.9+ / Angular 21.0+  
**Primary Dependencies**: Angular Core, Angular Material (MDC), Tailwind CSS, @factor_ec/ui  
**Storage**: REST APIs (Repository Pattern) - see [ADR-006](../../adr/ADR-006-repository-pattern-rest.md)  
**Testing**: Vitest (unit/integration), Playwright (E2E) - see [ADR-007](../../adr/ADR-007-testing-strategy.md)  
**Target Platform**: Web (PWA), browsers modernos  
**Project Type**: Frontend web application (Angular SPA)  
**Performance Goals**: Lista de SDPs carga en <3s, detalles de SDP en <2s, detalles de ítem en <2s, operaciones de gestión de recetas en <5s  
**Constraints**: PWA offline-capable, manejo de hasta 1000 ítems por SDP sin degradación, hasta 50 recetas por ítem sin degradación  
**Scale/Scope**: Administradores de producción y personal operativo, ~10-15 componentes, 3-4 servicios/repositories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Angular Base Project Constitution:

- ✅ **Layer Architecture**: Feature follows Core → Shared/Cross → Features dependency rules (ADR-001)
  - Feature ubicada en `src/app/features/requirements/`
  - Repository en `features/requirements/repositories/`
  - Modelos DTOs referenciados desde `docs/contracts/requirements/` (RequirementDTO, RequirementItemDTO, RecipeDTO)
  - Componentes en `features/requirements/components/`
  - Puede usar Shared para componentes UI reutilizables
  - Puede usar Core para servicios globales (HttpClient, MessageService)
  
- ✅ **Angular Style Guide**: Components are standalone, use OnPush, inject(), signals (ADR-002)
  - Todos los componentes serán standalone
  - ChangeDetectionStrategy.OnPush para todos los componentes
  - Uso de `inject()` en lugar de constructores
  - Signals para estado reactivo (a través de Repository pattern)
  
- ✅ **CSS Strategy**: Tailwind CSS prioritized, BEM with `ft-` prefix for custom styles (ADR-003)
  - Priorizar utilidades de Tailwind para layout y espaciado
  - BEM con prefijo `ft-` solo para estilos específicos de componentes
  - No usar `ngClass` o `ngStyle`, usar bindings `[class]` y `[style]`
  
- ✅ **Testing**: Tests follow AAA pattern, ≥80% coverage for critical paths, signals treated as state (ADR-007)
  - Tests unitarios con Vitest siguiendo patrón AAA
  - Tests E2E con Playwright para flujos de usuario
  - Cobertura ≥80% para rutas críticas
  - Signals tratados como estado, no como funciones
  
- ✅ **Code Quality**: ESLint, Prettier, Conventional Commits enforced (ADR-009)
  - Commits seguirán Conventional Commits
  - ESLint y Prettier configurados
  
- ✅ **Repository Pattern**: API communication uses Repository pattern (ADR-006)
  - `RequirementRepository` con métodos `find()`, `findBy()`, `mutations()`
  - Uso de `getResource()` para GET requests
  - Uso de `getMutations()` para POST, PUT, DELETE
  - Gestión automática de estado con signals
  - Modelos basados en DTOs: RequirementDTO, RequirementItemDTO, RecipeDTO
  
- ✅ **Documentation**: ADR created if architectural decision needed, spec in `docs/specs/`
  - Spec ya creado en `docs/specs/001-sdp-manager/spec.md`
  - ADR solo si hay decisiones arquitectónicas significativas nuevas

**Reference**: See `.specify/memory/constitution.md` for full principles.

## Project Structure

### Documentation (this feature)

```text
docs/specs/001-sdp-manager/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Note**: Los DTOs están definidos en `docs/contracts/requirements/`:
- RequirementDTO
- RequirementItemDTO
- RecipeDTO

**Note**: Specs MUST be located in `docs/specs/` per project constitution. ADRs are in `docs/adr/`.

### Source Code (Angular Structure)

```text
src/app/
├── core/                # Infrastructure global (services, guards, interceptors, models)
│   ├── services/
│   │   ├── http-client.ts (HttpClient wrapper)
│   │   └── message-service.ts (MessageService for notifications)
│   └── utils/
│       └── async-repository.ts (getResource, getMutations helpers)
│
├── shared/              # Componentes UI reutilizables (si se necesitan)
│   └── components/
│       └── [reusable components if needed]
│
└── features/            # Funcionalidad específica por feature
    └── requirements/
        ├── components/
        │   ├── requirement-list/
        │   │   ├── requirement-list.ts
        │   │   ├── requirement-list.html
        │   │   ├── requirement-list.css
        │   │   └── requirement-list.spec.ts
        │   ├── requirement-detail/
        │   │   ├── requirement-detail.ts
        │   │   ├── requirement-detail.html
        │   │   ├── requirement-detail.css
        │   │   └── requirement-detail.spec.ts
        │   ├── requirement-item-detail/
        │   │   ├── requirement-item-detail.ts
        │   │   ├── requirement-item-detail.html
        │   │   ├── requirement-item-detail.css
        │   │   └── requirement-item-detail.spec.ts
        │   └── recipe-management/
        │       ├── recipe-management.ts
        │       ├── recipe-management.html
        │       ├── recipe-management.css
        │       └── recipe-management.spec.ts
        ├── repositories/
        │   ├── requirement-repository.ts
        │   └── requirement-repository.spec.ts
        ├── managers/
        │   └── requirement-manager.ts (orquestación de acciones si es necesario)
        └── requirements-routes.ts

docs/contracts/requirements/  # DTOs (fuente de verdad)
├── requirement.md                  # Requirement
├── requirement-item.md             # RequirementItem
└── recipe.md                       # Recipe

test/                    # Tests unitarios e integración
├── helpers/
└── mocks/
    └── repositories/
        └── sdps.json (mock data para tests)

e2e/                     # Tests E2E con Playwright
└── sdp-manager.spec.ts
```

**Structure Decision**: La feature sigue la arquitectura de capas definida en ADR-001. Todos los componentes están en `features/requirements/components/`, el repository en `features/requirements/repositories/`. Los modelos de datos están definidos como DTOs en `docs/contracts/requirements/` (RequirementDTO, RequirementItemDTO, RecipeDTO) y serán referenciados desde allí. La feature puede usar componentes de Shared si son reutilizables, y servicios de Core para infraestructura global. No depende de otras Features.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No hay violaciones de la constitución. La implementación sigue todos los principios establecidos:
- Arquitectura de capas respetada
- Patrón Repository para APIs
- Componentes standalone con OnPush
- Signals para estado reactivo
- Tailwind CSS para estilos
- Testing con Vitest y Playwright

