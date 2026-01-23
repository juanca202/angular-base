# Implementation Plan: Administración de Tareas

**Branch**: `002-task-management` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-task-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementar una funcionalidad de administración de tareas que permita a los usuarios visualizar, crear, completar y eliminar tareas organizadas en tres estados (Pendientes, Congeladas, Completadas). La implementación seguirá el patrón Repository establecido en ADR-006, utilizando MockHttpClient para simular el backend durante el desarrollo. La interfaz seguirá los wireframes proporcionados y utilizará el patrón de manejo de estados de las plantillas existentes (entity-list) para mantener consistencia.

## Technical Context

**Language/Version**: TypeScript 5.9+ / Angular 21.0+  
**Primary Dependencies**: Angular Core, Angular Material (MDC), Tailwind CSS, @factor_ec/ui  
**Storage**: REST APIs (Repository Pattern) - see [ADR-006](../../adr/ADR-006-repository-pattern-rest.md)  
**Testing**: Vitest (unit/integration), Playwright (E2E) - see [ADR-007](../../adr/ADR-007-testing-strategy.md)  
**Target Platform**: Web (PWA), browsers modernos  
**Project Type**: Frontend web application (Angular SPA)  
**Performance Goals**: Visualización de tareas en <2 segundos, operaciones masivas (hasta 10 tareas) en <3 segundos  
**Constraints**: El frontend no aplica lógica de ordenamiento ni filtrado local; todo se delega al servidor mediante parámetros de query  
**Scale/Scope**: Soporte para hasta 50 tareas seleccionadas simultáneamente sin degradación de rendimiento

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Angular Base Project Constitution:

- ✅ **Layer Architecture**: Feature follows Core → Shared/Cross → Features dependency rules (ADR-001)
  - Repository en `features/tasks/repositories/`
  - Manager en `features/tasks/managers/`
  - Componentes en `features/tasks/components/`
  - Modelos en `features/tasks/models/`
- ✅ **Angular Style Guide**: Components are standalone, use OnPush, inject(), signals (ADR-002)
  - Todos los componentes serán standalone
  - Uso de signals para gestión de estado reactivo
  - ChangeDetectionStrategy.OnPush para optimización
- ✅ **CSS Strategy**: Tailwind CSS prioritized, BEM with `ft-` prefix for custom styles (ADR-003)
  - Estilos seguirán el patrón de entity-list existente
  - Uso de clases Tailwind para layout y utilidades
- ✅ **Testing**: Tests follow AAA pattern, ≥80% coverage for critical paths, signals treated as state (ADR-007)
  - Tests unitarios para componentes, repository y manager
  - Tests E2E para flujos principales de usuario
- ✅ **Code Quality**: ESLint, Prettier, Conventional Commits enforced (ADR-009)
  - Código seguirá las reglas de linting existentes
- ✅ **Repository Pattern**: API communication uses Repository pattern (ADR-006)
  - TaskRepository seguirá el patrón establecido con MockHttpClient
  - Uso de getMutations() y getResource() helpers
- ✅ **Documentation**: ADR created if architectural decision needed, spec in `docs/specs/`
  - Especificación completa en `docs/specs/002-task-management/`
  - Contratos de API en `docs/contracts/tasks/`

**Reference**: See `.specify/memory/constitution.md` for full principles.

## Project Structure

### Documentation (this feature)

```text
docs/specs/002-task-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Note**: Specs MUST be located in `docs/specs/` per project constitution. ADRs are in `docs/adr/`.

### Source Code (Angular Structure)

```text
src/app/
├── core/                # Infrastructure global (services, guards, interceptors, models)
│   ├── services/
│   │   ├── mock-http-client.ts  # Ya existe, se utilizará para mocks
│   │   └── base-repository.ts    # Ya existe, base para repositories
│   ├── utils/
│   │   └── async-resources.ts    # Ya existe, helpers getMutations/getResource
│   └── models/
│       └── http-api-response.ts  # Ya existe, modelo de respuesta API
├── shared/              # Componentes UI reutilizables
│   └── components/      # Componentes compartidos si se necesitan
├── cross/               # Capacidades transversales de dominio
│   └── tasks/           # NO se usa - las tareas son específicas de feature
└── features/            # Funcionalidad específica por feature
    └── tasks/           # Nueva feature de administración de tareas
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
        │   └── task-form/
        │       ├── task-form.ts
        │       ├── task-form.html
        │       ├── task-form.css
        │       └── task-form.spec.ts
        ├── managers/
        │   └── task-manager.ts   # Coordina diálogos y acciones de tareas
        ├── repositories/
        │   └── task-repository.ts # Acceso a datos mediante API REST (mock)
        ├── models/
        │   ├── task.ts            # Modelo Task y tipos relacionados
        │   └── task-status.ts     # Enums y constantes de estado
        └── tasks-routes.ts        # Rutas de la feature

test/
├── mocks/
│   └── repositories/
│       └── tasks.json    # Datos mock para desarrollo (ya existe, actualizar)
```

**Structure Decision**: La feature se organiza siguiendo el patrón establecido en `features/templates/`, con separación clara entre componentes de presentación, lógica de negocio (manager) y acceso a datos (repository). Esto cumple con ADR-001 (Separación de Responsabilidades) y permite reutilización de patrones existentes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No se identificaron violaciones a la constitución del proyecto. La implementación sigue los patrones establecidos y reutiliza infraestructura existente.
