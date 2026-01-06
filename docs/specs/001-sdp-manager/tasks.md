# Tasks: Administrador de Requirements

**Input**: Design documents from `docs/specs/001-requirements/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/  
**Location**: `docs/specs/001-requirements/tasks.md` (per project constitution)

**Tests**: Tests are included following ADR-007 testing strategy (Vitest for unit/integration, Playwright for E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Angular Base Project)

- **Angular structure**: `src/app/` with layers: `core/`, `shared/`, `cross/`, `features/`
- **Tests**: `test/` for unit/integration, `e2e/` for E2E tests
- **Feature location**: `src/app/features/requirements/`
- **Layer dependencies**: Features → (Shared, Cross) → Core (see ADR-001)
- **DTOs**: Defined in `docs/contracts/dtos/requirements/` (RequirementDTO, RequirementItemDTO, RecipeDTO)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the requirements feature

- [x] T001 Create feature directory structure in src/app/features/requirements/
- [x] T002 [P] Create components directory structure: requirement-list/, requirement-detail/, requirement-item-detail/, recipe-management/
- [x] T003 [P] Create repositories directory in src/app/features/requirements/repositories/
- [x] T004 [P] Create managers directory in src/app/features/requirements/managers/ (if needed)
- [x] T005 Create requirements-routes.ts file in src/app/features/requirements/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create RequirementRepository class in src/app/features/requirements/repositories/requirement-repository.ts extending BaseRepository
- [x] T007 [P] Create RecipeRepository class in src/app/features/requirements/repositories/recipe-repository.ts extending BaseRepository
- [x] T008 [P] Create RequirementItemRepository class in src/app/features/requirements/repositories/requirement-item-repository.ts extending BaseRepository (or integrate in RequirementRepository)
- [x] T009 [P] Create mock data file for tests in test/mocks/repositories/requirements.json
- [x] T010 Configure routes in src/app/features/requirements/requirements-routes.ts with base route structure

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Listar y Visualizar Requirements (Priority: P1) 🎯 MVP

**Goal**: Permitir a los usuarios ver una lista de todas las Requirements disponibles y seleccionar una para ver sus detalles completos con RequirementItems asociados.

**Independent Test**: Verificar que cuando existen Requirements en el sistema, el usuario puede acceder a la lista, seleccionar una Requirement y ver su información básica de identificación junto con sus RequirementItems asociados. Puede probarse independientemente sin necesidad de otras funcionalidades.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Unit test for RequirementRepository.findBy() in test/features/requirements/repositories/requirement-repository.spec.ts (Vitest, AAA pattern)
- [ ] T012 [P] [US1] Unit test for RequirementRepository.find() in test/features/requirements/repositories/requirement-repository.spec.ts (Vitest, AAA pattern)
- [ ] T013 [P] [US1] Unit test for RequirementListComponent in test/features/requirements/components/requirement-list/requirement-list.spec.ts (Vitest, AAA pattern)
- [ ] T014 [P] [US1] Unit test for RequirementDetailComponent in test/features/requirements/components/requirement-detail/requirement-detail.spec.ts (Vitest, AAA pattern)
- [ ] T015 [P] [US1] E2E test for listing and viewing Requirements in e2e/requirements.spec.ts (Playwright)

### Implementation for User Story 1

- [x] T016 [US1] Implement RequirementRepository.findBy() method using getResource() in src/app/features/requirements/repositories/requirement-repository.ts (GET /api/v1/requirements)
- [x] T017 [US1] Implement RequirementRepository.find() method using getResource() in src/app/features/requirements/repositories/requirement-repository.ts (GET /api/v1/requirements/:id)
- [x] T018 [US1] Create RequirementListComponent in src/app/features/requirements/components/requirement-list/requirement-list.ts (standalone, OnPush, inject())
- [x] T019 [US1] Create RequirementListComponent template in src/app/features/requirements/components/requirement-list/requirement-list.html (Tailwind CSS, signals binding)
- [x] T020 [US1] Create RequirementListComponent styles in src/app/features/requirements/components/requirement-list/requirement-list.css (Tailwind prioritized, BEM ft- prefix if needed)
- [x] T021 [US1] Implement loading state handling in RequirementListComponent (show ProgressComponent while loading)
- [x] T022 [US1] Implement error state handling in RequirementListComponent (show error message)
- [x] T023 [US1] Implement empty state handling in RequirementListComponent (show message when no Requirements)
- [x] T024 [US1] Create RequirementDetailComponent in src/app/features/requirements/components/requirement-detail/requirement-detail.ts (standalone, OnPush, inject())
- [x] T025 [US1] Create RequirementDetailComponent template in src/app/features/requirements/components/requirement-detail/requirement-detail.html (display RequirementDTO fields and RequirementItems)
- [x] T026 [US1] Create RequirementDetailComponent styles in src/app/features/requirements/components/requirement-detail/requirement-detail.css (Tailwind prioritized, BEM ft- prefix if needed)
- [x] T027 [US1] Implement navigation from RequirementListComponent to RequirementDetailComponent in src/app/features/requirements/components/requirement-list/requirement-list.ts
- [x] T028 [US1] Add route for RequirementListComponent in src/app/features/requirements/requirements-routes.ts
- [x] T029 [US1] Add route for RequirementDetailComponent in src/app/features/requirements/requirements-routes.ts
- [x] T030 [US1] Integrate routes in app.routes.ts (lazy load requirements-routes)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can list Requirements and view their details with RequirementItems.

---

## Phase 4: User Story 2 - Visualizar Recipes de un RequirementItem (Priority: P2)

**Goal**: Permitir a los usuarios ver las Recipes asociadas a cada RequirementItem de una Requirement para entender qué Recipes están configuradas para la producción.

**Independent Test**: Verificar que cuando un usuario visualiza un RequirementItem de una Requirement, se muestran todas las Recipes asociadas a ese RequirementItem. Puede probarse independientemente sin necesidad de gestionar Recipes (US3).

### Tests for User Story 2

- [ ] T031 [P] [US2] Unit test for RecipeRepository.findByRequirementItem() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T032 [P] [US2] Unit test for RequirementItemRepository.find() in test/features/requirements/repositories/requirement-item-repository.spec.ts (Vitest, AAA pattern)
- [ ] T033 [P] [US2] Unit test for RequirementItemDetailComponent in test/features/requirements/components/requirement-item-detail/requirement-item-detail.spec.ts (Vitest, AAA pattern)
- [ ] T034 [P] [US2] E2E test for viewing RequirementItem details with Recipes in e2e/requirements.spec.ts (Playwright)

### Implementation for User Story 2

- [ ] T035 [US2] Implement RequirementItemRepository.find() method using getResource() in src/app/features/requirements/repositories/requirement-item-repository.ts (GET /api/v1/requirement-items/:id)
- [ ] T036 [US2] Implement RecipeRepository.findByRequirementItem() method using getResource() in src/app/features/requirements/repositories/recipe-repository.ts (GET /api/v1/requirement-items/:requirementItemId/recipes)
- [ ] T037 [US2] Create RequirementItemDetailComponent in src/app/features/requirements/components/requirement-item-detail/requirement-item-detail.ts (standalone, OnPush, inject())
- [ ] T038 [US2] Create RequirementItemDetailComponent template in src/app/features/requirements/components/requirement-item-detail/requirement-item-detail.html (display RequirementItemDTO fields and Recipes list)
- [ ] T039 [US2] Create RequirementItemDetailComponent styles in src/app/features/requirements/components/requirement-item-detail/requirement-item-detail.css (Tailwind prioritized, BEM ft- prefix if needed)
- [ ] T040 [US2] Implement loading state handling in RequirementItemDetailComponent (show ProgressComponent while loading)
- [ ] T041 [US2] Implement error state handling in RequirementItemDetailComponent (show error message)
- [ ] T042 [US2] Implement empty state handling for Recipes in RequirementItemDetailComponent (show message when no Recipes)
- [ ] T043 [US2] Implement navigation from RequirementDetailComponent to RequirementItemDetailComponent in src/app/features/requirements/components/requirement-detail/requirement-detail.ts
- [ ] T044 [US2] Add route for RequirementItemDetailComponent in src/app/features/requirements/requirements-routes.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can list Requirements, view details, and see RequirementItems with their associated Recipes.

---

## Phase 5: User Story 3 - Gestionar Recipes de un RequirementItem (Priority: P3)

**Goal**: Permitir a los usuarios agregar y eliminar Recipes de los RequirementItems de una Requirement para configurar correctamente las Recipes requeridas para la producción.

**Independent Test**: Verificar que cuando un usuario agrega una Recipe a un RequirementItem, la Recipe aparece en la lista, y cuando elimina una Recipe, esta desaparece de la lista. Puede probarse independientemente verificando las mutaciones.

### Tests for User Story 3

- [ ] T045 [P] [US3] Unit test for RecipeRepository.mutations().create() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T046 [P] [US3] Unit test for RecipeRepository.mutations().delete() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T047 [P] [US3] Unit test for RecipeManagementComponent in test/features/requirements/components/recipe-management/recipe-management.spec.ts (Vitest, AAA pattern)
- [ ] T048 [P] [US3] E2E test for adding and removing Recipes in e2e/requirements.spec.ts (Playwright)

### Implementation for User Story 3

- [ ] T049 [US3] Implement RecipeRepository.mutations() method using getMutations() in src/app/features/requirements/repositories/recipe-repository.ts (POST /api/v1/requirement-items/:requirementItemId/recipes, DELETE /api/v1/requirement-items/:requirementItemId/recipes/:recipeId)
- [ ] T050 [US3] Create RecipeManagementComponent in src/app/features/requirements/components/recipe-management/recipe-management.ts (standalone, OnPush, inject())
- [ ] T051 [US3] Create RecipeManagementComponent template in src/app/features/requirements/components/recipe-management/recipe-management.html (form to add Recipe, list with delete action)
- [ ] T052 [US3] Create RecipeManagementComponent styles in src/app/features/requirements/components/recipe-management/recipe-management.css (Tailwind prioritized, BEM ft- prefix if needed)
- [ ] T053 [US3] Implement form for adding Recipe in RecipeManagementComponent using reactive forms (RecipeRequestCreate)
- [ ] T054 [US3] Implement validation for Recipe form in RecipeManagementComponent (required fields, positive numbers)
- [ ] T055 [US3] Implement add Recipe functionality in RecipeManagementComponent (call mutations.create(), refresh list)
- [ ] T056 [US3] Implement delete Recipe functionality in RecipeManagementComponent (call mutations.delete(), refresh list)
- [ ] T057 [US3] Implement duplicate Recipe prevention in RecipeManagementComponent (check existing Recipes before adding)
- [ ] T058 [US3] Implement error handling for Recipe mutations in RecipeManagementComponent (show error messages)
- [ ] T059 [US3] Integrate RecipeManagementComponent into RequirementItemDetailComponent in src/app/features/requirements/components/requirement-item-detail/requirement-item-detail.html

**Checkpoint**: All user stories should now be independently functional. Users can list Requirements, view details, see RequirementItems with Recipes, and manage Recipes (add/delete).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Add JSDoc/TSDoc comments to all components in src/app/features/requirements/components/
- [ ] T061 [P] Add JSDoc/TSDoc comments to all repositories in src/app/features/requirements/repositories/
- [ ] T062 [P] Verify all components use ChangeDetectionStrategy.OnPush
- [ ] T063 [P] Verify all components use inject() instead of constructors
- [ ] T064 [P] Verify all components use signals for reactive state
- [ ] T065 [P] Verify Tailwind CSS is prioritized over custom CSS classes
- [ ] T066 [P] Verify BEM ft- prefix is used only for component-specific styles
- [ ] T067 [P] Run ESLint and fix any issues in src/app/features/requirements/
- [ ] T068 [P] Run Prettier and format code in src/app/features/requirements/
- [ ] T069 Verify all ngOnDestroy() methods call destroy() on resources
- [ ] T070 Verify error handling is consistent across all components
- [ ] T071 Verify loading states are handled consistently
- [ ] T072 Verify empty states are handled consistently
- [ ] T073 Run test coverage check (≥80% for critical paths)
- [ ] T074 Update documentation in docs/specs/001-requirements/ if needed
- [ ] T075 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for navigation flow but can be tested independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 for RequirementItemDetailComponent but can be tested independently

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Repository methods before components
- Components before routes
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for RequirementRepository.findBy() in test/features/requirements/repositories/requirement-repository.spec.ts"
Task: "Unit test for RequirementRepository.find() in test/features/requirements/repositories/requirement-repository.spec.ts"
Task: "Unit test for RequirementListComponent in test/features/requirements/components/requirement-list/requirement-list.spec.ts"
Task: "Unit test for RequirementDetailComponent in test/features/requirements/components/requirement-detail/requirement-detail.spec.ts"
Task: "E2E test for listing and viewing Requirements in e2e/requirements.spec.ts"

# Launch all components for User Story 1 together (after repository):
Task: "Create RequirementListComponent in src/app/features/requirements/components/requirement-list/requirement-list.ts"
Task: "Create RequirementDetailComponent in src/app/features/requirements/components/requirement-detail/requirement-detail.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2 (can start after US1 navigation is ready)
   - Developer C: User Story 3 (can start after US2 component is ready)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- DTOs are defined in `docs/contracts/dtos/requirements/` - import types from there
- Follow ADR-001 layer separation: Features → (Shared, Cross) → Core
- Follow ADR-002 Angular Style Guide: standalone, OnPush, inject(), signals
- Follow ADR-003 CSS Strategy: Tailwind prioritized, BEM ft- prefix
- Follow ADR-006 Repository Pattern: getResource(), getMutations()
- Follow ADR-007 Testing Strategy: Vitest (AAA pattern), Playwright (E2E), ≥80% coverage
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

