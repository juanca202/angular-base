# Tasks: Administrador de Requirements

**Input**: Design documents from `docs/specs/001-sdp-manager/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/  
**Location**: `docs/specs/001-sdp-manager/tasks.md` (per project constitution)

**Tests**: Tests are included per ADR-007. All tests follow AAA pattern with Vitest (unit/integration) and Playwright (E2E).

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
- Paths follow Angular Base Project structure per plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the requirements feature

- [x] T001 Create feature directory structure in src/app/features/requirements/
- [x] T002 [P] Create components directory structure: requirement-list/, requirement-detail/, requirement-item-detail/, files/, notes/
- [x] T003 [P] Create repositories directory in src/app/features/requirements/repositories/
- [x] T004 [P] Create managers directory in src/app/features/requirements/managers/
- [x] T005 Create requirements-routes.ts in src/app/features/requirements/requirements-routes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Mock Data Setup

- [ ] T006 [P] Create mock data file for Requirements in test/mocks/repositories/requirements.json (per NFR-002, must cover all acceptance scenarios: empty, single, multiple items, different categories)
- [ ] T007 [P] Create mock data file for RequirementItems in test/mocks/repositories/requirement-items.json (per NFR-002, must cover all acceptance scenarios: with/without recipes, different categories)

### Repository Implementations (All Endpoints per NFR-004)

- [ ] T008 [P] Create RequirementRepository in src/app/features/requirements/repositories/requirement-repository.ts with findBy() method using getResource() (GET /requirements with params, MockHttpClient per NFR-001)
- [ ] T009 [P] Implement RequirementRepository.find() method using getResource() in src/app/features/requirements/repositories/requirement-repository.ts (GET /requirements/:id, MockHttpClient per NFR-001)
- [ ] T010 [P] Implement RequirementRepository.getFiles() method using getResource() in src/app/features/requirements/repositories/requirement-repository.ts (GET /requirements/:id/files, MockHttpClient per NFR-004)
- [ ] T011 [P] Implement RequirementRepository.mutations().addFile() method using getMutations() in src/app/features/requirements/repositories/requirement-repository.ts (POST /requirements/:id/files, MockHttpClient per NFR-004)
- [ ] T012 [P] Create RequirementItemRepository in src/app/features/requirements/repositories/requirement-item-repository.ts with findBy() method using getResource() (GET /requirement-items with params, MockHttpClient per NFR-001)
- [ ] T013 [P] Implement RequirementItemRepository.find() method using getResource() in src/app/features/requirements/repositories/requirement-item-repository.ts (GET /requirement-items/:id, MockHttpClient per NFR-001)
- [ ] T014 [P] Implement RequirementItemRepository.getFiles() method using getResource() in src/app/features/requirements/repositories/requirement-item-repository.ts (GET /requirement-items/:id/files, MockHttpClient per NFR-004)
- [ ] T015 [P] Implement RequirementItemRepository.mutations().addFile() method using getMutations() in src/app/features/requirements/repositories/requirement-item-repository.ts (POST /requirement-items/:id/files, MockHttpClient per NFR-004)
- [ ] T016 [P] Create RecipeRepository in src/app/features/requirements/repositories/recipe-repository.ts with findByRequirementItem() method using getResource() (GET /requirement-items/:id/recipes, MockHttpClient per NFR-001)
- [ ] T017 [P] Implement RecipeRepository.getNotes() method using getResource() in src/app/features/requirements/repositories/recipe-repository.ts (GET /recipes/:id/notes, MockHttpClient per NFR-004)
- [ ] T018 [P] Implement RecipeRepository.mutations().addNote() method using getMutations() in src/app/features/requirements/repositories/recipe-repository.ts (POST /recipes/:id/notes, MockHttpClient per NFR-004)
- [ ] T019 [P] Implement RecipeRepository.getFlowers() method using getResource() in src/app/features/requirements/repositories/recipe-repository.ts (GET /recipes/:id/flowers, MockHttpClient per NFR-004)
- [ ] T020 [P] Implement RecipeRepository.mutations().addFlower() method using getMutations() in src/app/features/requirements/repositories/recipe-repository.ts (POST /recipes/:id/flowers, MockHttpClient per NFR-004)
- [ ] T021 [P] Implement RecipeRepository.getDryGoods() method using getResource() in src/app/features/requirements/repositories/recipe-repository.ts (GET /recipes/:id/dry-goods, MockHttpClient per NFR-004)
- [ ] T022 [P] Implement RecipeRepository.mutations().addDryGood() method using getMutations() in src/app/features/requirements/repositories/recipe-repository.ts (POST /recipes/:id/dry-goods, MockHttpClient per NFR-004)
- [ ] T023 [P] Implement RecipeRepository.getCases() method using getResource() in src/app/features/requirements/repositories/recipe-repository.ts (GET /recipes/:id/cases, MockHttpClient per NFR-004)
- [ ] T024 [P] Implement RecipeRepository.mutations().addCase() method using getMutations() in src/app/features/requirements/repositories/recipe-repository.ts (POST /recipes/:id/cases, MockHttpClient per NFR-004)
- [ ] T025 [P] Create RecipeGroupRepository in src/app/features/requirements/repositories/recipe-group-repository.ts with findByRequirementItem() method using getResource() (GET /recipe-groups?requirementItemId=:id, MockHttpClient per NFR-004)
- [ ] T026 [P] Implement RecipeGroupRepository.mutations().create() method using getMutations() in src/app/features/requirements/repositories/recipe-group-repository.ts (POST /recipe-groups, MockHttpClient per NFR-004)
- [ ] T027 [P] Implement RecipeGroupRepository.mutations().addRecipe() method using getMutations() in src/app/features/requirements/repositories/recipe-group-repository.ts (POST /recipe-groups/:id/recipes, MockHttpClient per NFR-004)
- [ ] T028 [P] Implement RecipeGroupRepository.mutations().moveRecipe() method using getMutations() in src/app/features/requirements/repositories/recipe-group-repository.ts (PUT /recipe-groups/:id/recipes/:recipeId, MockHttpClient per NFR-004)

### Entity Manager Setup

- [ ] T029 Create RequirementItemManager in src/app/features/requirements/managers/requirement-item-manager.ts (orchestrates dialog opening per ADR-014, ADR-015)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Listar y Visualizar Requirements (Priority: P1) 🎯 MVP

**Goal**: Users can view a list of all Requirements and select one to see its details and associated RequirementItems. This is the base functionality that enables access to Requirement information.

**Independent Test**: Can be tested independently by verifying that when Requirements exist in the system, the user can access the list and select a Requirement to see its basic identification information and associated RequirementItems.

### Tests for User Story 1

- [ ] T030 [P] [US1] Unit test for RequirementRepository.findBy() in test/features/requirements/repositories/requirement-repository.spec.ts (Vitest, AAA pattern)
- [ ] T031 [P] [US1] Unit test for RequirementRepository.find() in test/features/requirements/repositories/requirement-repository.spec.ts (Vitest, AAA pattern)
- [ ] T032 [P] [US1] Unit test for RequirementListComponent in test/features/requirements/components/requirement-list/requirement-list.spec.ts (Vitest, AAA pattern)
- [ ] T033 [P] [US1] Unit test for RequirementDetailComponent in test/features/requirements/components/requirement-detail/requirement-detail.spec.ts (Vitest, AAA pattern)
- [ ] T034 [P] [US1] E2E test for listing and viewing Requirements in e2e/requirements.spec.ts (Playwright, covers acceptance scenarios 1-5)

### Implementation for User Story 1

- [ ] T035 [US1] Create RequirementListComponent in src/app/features/requirements/components/requirement-list/requirement-list.ts (standalone, OnPush, inject(), per ADR-002)
- [ ] T036 [US1] Implement RequirementListComponent to load and display Requirements list using RequirementRepository.findBy() (per FR-001, NFR-005: TypeScript only, expose signals/properties/methods for HTML)
- [ ] T037 [US1] Implement RequirementListComponent to handle Requirement selection and navigation to detail view (per FR-002)
- [ ] T038 [US1] Create RequirementDetailComponent in src/app/features/requirements/components/requirement-detail/requirement-detail.ts (standalone, OnPush, inject(), per ADR-002)
- [ ] T039 [US1] Implement RequirementDetailComponent to load and display Requirement details using RequirementRepository.find() (per FR-002, NFR-005: TypeScript only)
- [ ] T040 [US1] Implement RequirementDetailComponent to load and display RequirementItems using RequirementItemRepository.findByRequirement() (per FR-003, NFR-005: TypeScript only)
- [ ] T041 [US1] Implement category filter functionality in RequirementDetailComponent (combo "all categories" per FR-003.1, NFR-005: TypeScript only)
- [ ] T042 [US1] Implement visual state differentiation for RequirementItems (with/without recipes per FR-003.2, NFR-005: TypeScript only)
- [ ] T043 [US1] Implement empty state handling in RequirementListComponent (per FR-009, NFR-005: TypeScript only)
- [ ] T044 [US1] Implement empty state handling in RequirementDetailComponent (per FR-009, NFR-005: TypeScript only)
- [ ] T045 [US1] Configure route for /requirements in src/app/features/requirements/requirements-routes.ts
- [ ] T046 [US1] Register requirements routes in src/app/app.routes.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can list Requirements, view details, filter RequirementItems by category, and see visual states.

---

## Phase 4: User Story 2 - Visualizar Recipes de un RequirementItem (Priority: P2)

**Goal**: Users can view the Recipes associated with each RequirementItem of a Requirement to understand what Recipes are configured for production.

**Independent Test**: Can be tested independently by verifying that when a user clicks the "detail" button of a RequirementItem, a modal dialog opens showing all Recipes associated with that RequirementItem.

### Tests for User Story 2

- [ ] T047 [P] [US2] Unit test for RequirementItemRepository.find() in test/features/requirements/repositories/requirement-item-repository.spec.ts (Vitest, AAA pattern)
- [ ] T048 [P] [US2] Unit test for RecipeRepository.findByRequirementItem() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T049 [P] [US2] Unit test for RequirementItemDetail component in test/features/requirements/components/requirement-item-detail/requirement-item-detail.spec.ts (Vitest, AAA pattern)
- [ ] T050 [P] [US2] E2E test for viewing RequirementItem details and Recipes in e2e/requirements.spec.ts (Playwright, covers acceptance scenarios 1-3)

### Implementation for User Story 2

- [ ] T051 [US2] Create RequirementItemDetail component in src/app/features/requirements/components/requirement-item-detail/requirement-item-detail.ts (standalone, OnPush, inject(), full-screen dialog per ADR-014, NFR-005: TypeScript only)
- [ ] T052 [US2] Configure RequirementItemDetail as full-screen dialog (ft-dialog--full) per ADR-014 in RequirementItemDetail
- [ ] T053 [US2] Implement RequirementItemDetail to load and display RequirementItem details using RequirementItemRepository.find() (per FR-004.1, NFR-005: TypeScript only)
- [ ] T054 [US2] Implement RequirementItemDetail to load and display Recipes using RecipeRepository.findByRequirementItem() (per FR-005, NFR-005: TypeScript only)
- [ ] T055 [US2] Implement empty state for Recipes in RequirementItemDetail (per FR-009, NFR-005: TypeScript only)
- [ ] T056 [US2] Implement dialog close functionality in RequirementItemDetail (per acceptance scenario 3, NFR-005: TypeScript only)
- [ ] T057 [US2] Integrate RequirementItemManager to open RequirementItemDetail from RequirementDetailComponent (per FR-011, ADR-014, ADR-015)
- [ ] T058 [US2] Create placeholder notes component (Notes class) in src/app/features/requirements/components/notes/notes.ts (standalone, OnPush, inject(), dialog component per FR-005.1, NFR-005: TypeScript only)
- [ ] T059 [US2] Create files component (Files class) in src/app/features/requirements/components/files/files.ts (standalone, OnPush, inject(), dialog component per FR-010, NFR-005: TypeScript only)
- [ ] T060 [US2] Implement files component to load and display Files using RequirementItemRepository.getFiles() (per FR-010, NFR-005: TypeScript only)
- [ ] T061 [US2] Integrate notes and files components opening from RequirementItemDetail via RequirementItemManager (per FR-011, ADR-014, ADR-015)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can list Requirements, view details, filter RequirementItems, and open RequirementItemDetail to see Recipes.

---

## Phase 5: User Story 3 - Gestionar Recipes de un RequirementItem (Priority: P3)

**Goal**: Users can add and remove Recipes from RequirementItems of a Requirement to correctly configure the Recipes required for production.

**Independent Test**: Can be tested independently by verifying that when a user adds a Recipe to a RequirementItem, the Recipe appears in the RequirementItem's Recipe list, and when they delete a Recipe, it disappears from the list.

### Tests for User Story 3

- [ ] T062 [P] [US3] Unit test for RecipeRepository.mutations().create() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T063 [P] [US3] Unit test for RecipeRepository.mutations().delete() in test/features/requirements/repositories/recipe-repository.spec.ts (Vitest, AAA pattern)
- [ ] T064 [P] [US3] Unit test for Recipe management functionality in RequirementItemDetail in test/features/requirements/components/requirement-item-detail/requirement-item-detail.spec.ts (Vitest, AAA pattern)
- [ ] T065 [P] [US3] E2E test for adding and removing Recipes in e2e/requirements.spec.ts (Playwright, covers acceptance scenarios 1-3)

### Implementation for User Story 3

- [ ] T066 [US3] Implement form for adding Recipe in RequirementItemDetail using reactive forms (RecipeRequestCreate per FR-006, NFR-005: TypeScript only)
- [ ] T067 [US3] Implement validation for Recipe form in RequirementItemDetail (required fields, positive numbers per FR-006, NFR-005: TypeScript only)
- [ ] T068 [US3] Implement add Recipe functionality in RequirementItemDetail (call RecipeRepository.mutations().create(), refresh list per FR-006, NFR-005: TypeScript only)
- [ ] T069 [US3] Implement delete Recipe functionality in RequirementItemDetail (call RecipeRepository.mutations().delete(), refresh list per FR-007, NFR-005: TypeScript only)
- [ ] T070 [US3] Implement duplicate Recipe prevention in RequirementItemDetail (check existing Recipes before adding per FR-008, NFR-005: TypeScript only)
- [ ] T071 [US3] Implement error handling for Recipe mutations in RequirementItemDetail (show error messages per FR-009, NFR-005: TypeScript only)
- [ ] T072 [US3] Expose all necessary signals, properties, and methods in RequirementItemDetail for HTML consumption (per NFR-005)

**Checkpoint**: All user stories should now be independently functional. Users can list Requirements, view details, filter RequirementItems, open RequirementItemDetail to see Recipes, and add/remove Recipes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure completeness

### Edge Case Validation

- [ ] T073 [P] Validate edge case EC-001: Handle Requirements with >100 RequirementItems (performance validation per SC-007). Requires E2E tests with large test data and performance metrics: render time ≤3s, interaction response ≤500ms, FPS ≥30 during scroll.
- [ ] T074 [P] Validate edge case EC-002: Handle RequirementItems with >50 Recipes (performance validation per SC-008). Validate metrics: dialog render time ≤2s, interaction response ≤500ms, FPS ≥30 during list interaction. Requires E2E tests with large test data.
- [ ] T075 [P] Validate edge case EC-003: Handle deletion of last Recipe from RequirementItem (per EC-003, show appropriate empty state)
- [ ] T076 [P] Validate edge case EC-004: Handle network errors and service unavailability (show error messages, allow retry per EC-004)
- [ ] T077 [P] Validate edge case EC-005: Handle concurrent modifications (conflict resolution, validated via E2E tests per EC-005)

### Mock Data Coverage Validation

- [ ] T078 [P] Validate mock data coverage against all acceptance scenarios (per NFR-002): empty Requirements, single Requirement, multiple Requirements, RequirementItems with/without Recipes, different categories

### Code Quality & Documentation

- [ ] T079 [P] Run ESLint and Prettier on all new files (per ADR-009)
- [ ] T080 [P] Run test coverage validation: npm run test:coverage (ensure ≥80% coverage for critical paths per ADR-007)
- [ ] T081 [P] Add JSDoc/TSDoc comments to all public methods and classes (per ADR-009)
- [ ] T082 [P] Verify all components expose necessary public API for HTML consumption (signals, properties, methods per NFR-005)

### Integration & Routes

- [ ] T083 Verify all routes are properly configured and accessible
- [ ] T084 Verify all dialogs open correctly via entity managers (per ADR-014, ADR-015)

### Performance Validation

- [ ] T085 Validate SC-001: Requirements list loads in <3s (performance testing)
- [ ] T086 Validate SC-002: Requirement details load in <2s (performance testing)
- [ ] T087 Validate SC-003: RequirementItem details load in <2s (performance testing)
- [ ] T088 Validate SC-004: Add Recipe completes in <5s (performance testing)
- [ ] T089 Validate SC-005: Delete Recipe completes in <3s (performance testing)

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for RequirementDetailComponent integration
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 for RequirementItemDetail

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Repositories before components
- Components before integration
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Story 1 can start
- All tests for a user story marked [P] can run in parallel
- Different repository methods marked [P] can run in parallel
- User Stories 2 and 3 can start after their dependencies are met

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for RequirementRepository.findBy() in test/features/requirements/repositories/requirement-repository.spec.ts"
Task: "Unit test for RequirementRepository.find() in test/features/requirements/repositories/requirement-repository.spec.ts"
Task: "Unit test for RequirementListComponent in test/features/requirements/components/requirement-list/requirement-list.spec.ts"
Task: "Unit test for RequirementDetailComponent in test/features/requirements/components/requirement-detail/requirement-detail.spec.ts"
Task: "E2E test for listing and viewing Requirements in e2e/requirements.spec.ts"

# Launch all repository implementations together (Phase 2):
Task: "Create RequirementRepository in src/app/features/requirements/repositories/requirement-repository.ts"
Task: "Create RequirementItemRepository in src/app/features/requirements/repositories/requirement-item-repository.ts"
Task: "Create RecipeRepository in src/app/features/requirements/repositories/recipe-repository.ts"
Task: "Create RecipeGroupRepository in src/app/features/requirements/repositories/recipe-group-repository.ts"
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
   - Developer A: User Story 1 (can start immediately)
   - Developer B: User Story 2 (starts after US1 RequirementDetailComponent is ready)
   - Developer C: User Story 3 (starts after US2 RequirementItemDetail is ready)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **NFR-005**: All components are TypeScript-only (no HTML templates). Components must expose signals, public properties, and public methods for HTML consumption.
- **NFR-004**: All repository endpoints from contracts must be implemented, even if not directly used by user stories
- **ADR-014**: All dialogs must open via entity managers, not directly from components
- **ADR-015**: Entity managers orchestrate dialog opening and entity interactions
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
