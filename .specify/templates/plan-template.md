# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9+ / Angular 21.0+  
**Primary Dependencies**: Angular Core, Angular Material (MDC), Tailwind CSS, @factor_ec/ui  
**Storage**: REST APIs (Repository Pattern) - see [ADR-006](./docs/adr/ADR-006-repository-pattern.md)  
**Testing**: Vitest (unit/integration), Playwright (E2E) - see [ADR-014](./docs/adr/ADR-014-testing-strategy.md)  
**Target Platform**: Web (PWA), browsers modernos  
**Project Type**: Frontend web application (Angular SPA)  
**Performance Goals**: [domain-specific, e.g., <200ms initial load, 60fps interactions, or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., PWA offline-capable, <2MB bundle size, or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 50+ components, or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verify compliance with Angular Base Project Constitution:

- ✅ **Layer Architecture**: Feature follows Core → Shared/Cross → Features dependency rules (ADR-001)
- ✅ **Angular Style Guide**: Components are standalone, use OnPush, inject(), signals (ADR-002)
- ✅ **CSS Strategy**: Tailwind CSS prioritized, BEM with `ft-` prefix for custom styles (ADR-005)
- ✅ **Testing**: Tests follow AAA pattern, ≥80% coverage for critical paths, signals treated as state (ADR-014)
- ✅ **Code Quality**: ESLint, Prettier, Conventional Commits enforced (ADR-010)
- ✅ **Repository Pattern**: API communication uses Repository pattern (ADR-006)
- ✅ **Documentation**: ADR created if architectural decision needed, spec in `docs/specs/`

**Reference**: See `.specify/memory/constitution.md` for full principles.

## Project Structure

### Documentation (this feature)

```text
docs/specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Note**: Specs MUST be located in `docs/specs/` per project constitution. ADRs are in `docs/adr/`.

### Source Code (Angular Structure)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature following Angular Base Project architecture (Core, Shared, Cross, Features).
  See ADR-001 for layer separation rules.
-->

```text
src/app/
├── core/                # Infrastructure global (services, guards, interceptors, models)
│   ├── services/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── utils/
├── shared/              # Componentes UI reutilizables
│   ├── components/
│   ├── directives/
│   └── pipes/
├── cross/               # Capacidades transversales de dominio
│   └── [domain]/
│       ├── services/
│       ├── repositories/
│       └── models/
└── features/            # Funcionalidad específica por feature
    └── [feature-name]/
        ├── components/
        ├── services/
        ├── repositories/
        ├── models/
        └── [feature-name]-routes.ts

test/                    # Tests unitarios e integración
├── helpers/
└── mocks/

e2e/                     # Tests E2E con Playwright
└── *.spec.ts
```

**Structure Decision**: [Document the selected structure following ADR-001 layer separation rules]

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
