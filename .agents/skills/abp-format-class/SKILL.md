---
name: abp-format-class
description: Reorders and cleans Angular TypeScript class files—import grouping (Angular, third-party, project aliases), class member layout (DI, properties, template queries when applicable, methods), lifecycle-first methods when hooks exist, alphabetical tie-breaking, visibility fixes, and unused import/DI removal. Applies to any class (services, pipes, guards, utilities); adds component/directive-specific rules (viewChild/contentChild, template API visibility, mandatory OnPush on components, @Component metadata, template checklist) when the file is a component or directive. Aligns with the Angular Style Guide. Use when formatting or refactoring a .ts class, unifying structure, or before review.
---

# Format Angular class (`abp-format-class`)

## When to use

When formatting, refactoring, or reviewing any `*.ts` file that declares a **class** (components, directives, services, pipes, guards, plain helpers in Angular apps). Apply the **base rules** always; apply the **component/directive addendum** only when the class is decorated with `@Component` or `@Directive`.

## Priority when rules conflict

The [Angular Style Guide](https://angular.dev/style-guide) says: **if these rules clash with style already used in a file, prefer consistency within that file**. Mixing conventions in one file is worse than a small deviation from the guide.

## Alignment with Angular style (reference)

Recommendations draw from the [Angular coding style guide](https://angular.dev/style-guide) and linked guides ([Components](https://angular.dev/guide/components/overview), [Templates](https://angular.dev/guide/templates/overview)). Use the **component/directive** subsection below when relevant.

### Names and files (when touching structure)

- **File names**: kebab-case (`user-profile.ts` for `UserProfile`).
- **Tests**: same base name + `.spec.ts`.
- **Component triad**: same base for `.ts`, `.html`, `.css` when applicable; extra style files use descriptive suffixes.
- **One concept per file**: generally one class per file; small related classes only if they represent a single concept.

### Project layout (context)

- UI code under `src`; bootstrap in `src/main.ts`.
- Keep TS, template, and styles **in the same folder**; tests next to code under test.
- Organize by **feature areas**, not only by technical type at the top level.
- Project-specific conventions or overrides may be recorded in `.agents/MEMORY.md`; read it before asking the user when a repo-only rule is needed.

### Dependency injection

- **Prefer `inject()`** over constructor parameters ([Dependency injection](https://angular.dev/style-guide#dependency-injection)), unless migrating or an agreed exception.

---

## Import order and paths

1. **`@angular/...`** — one block; **alphabetical** by import path; multiple symbols from the same module sorted alphabetically.
2. **Blank line**
3. **Third-party packages** — everything that is not `@angular/*` or a project alias (e.g. `rxjs`). **Alphabetical** within the block.
4. **Blank line**
5. **Project imports** — use **tsconfig path aliases** (e.g. `@/core/...`, `@/shared/...`). Avoid long `../../../` chains for app code.
6. Remove **unused** imports.

Use `import type { ... }` when a symbol is type-only.

---

## Class body order (all classes)

### 1. Dependency injection (DI)

- **`inject()`**: all `readonly name = inject(Token)` assignments at the top of the class body, **alphabetically by property name**.
- **`constructor(...)`**: immediately **after** the `inject()` block if present; parameters **alphabetical** by name when practical.

Remove unused injected dependencies.

### 2. Properties

Everything that is **not** a template/content query and **not** a method:

- In **components/directives**: `input()`, `output()`, `model()` and equivalents (prefer **`readonly`** per the guide).
- Internal state: `private` / `protected` fields, `signal` / `computed`, constants, etc.

**Alphabetical** by property name (inputs/outputs/models are normal properties for ordering).

**Visibility (general)**:

- Prefer **`private`** for members only used inside the class.
- Use **`protected`** when subclasses need access.
- Avoid **`public`** unless the member is part of a deliberate public API.

**Component/directive only** (see addendum): use **`protected`** for members read **only** from the template and not meant as external API; **`computed()`** used only in the template often stays **`protected`**.

### 3. Template and content queries (components and directives only)

Skip this block for services, pipes, guards, and other classes **without** `viewChild` / `contentChild` / etc.

When present:

- `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` as field declarations.
- **Alphabetical** by the query property name. Prefer **`readonly`** where appropriate.

### 4. Methods

1. **`constructor`** — already covered under DI; omit if only `inject()` is used.
2. **Lifecycle hooks** — only when the class implements them; **Angular lifecycle order**:
   - `ngOnChanges` → `ngOnInit` → `ngDoCheck` → `ngAfterContentInit` → `ngAfterContentChecked` → `ngAfterViewInit` → `ngAfterViewChecked` → `ngOnDestroy`
   - Include only hooks that exist. Implement the matching interfaces (`OnInit`, `OnDestroy`, …). Keep hook bodies thin; delegate to well-named methods when logic grows.
3. **All other methods** — **alphabetical** by method name.

Match project rules (`OnPush`, `readonly`, etc.) where they apply.

---

## `@Component` metadata

When the file defines a **component** (`@Component`):

- **Change detection**: every component **must** set `changeDetection: ChangeDetectionStrategy.OnPush` in the `@Component` decorator. Import `ChangeDetectionStrategy` from `@angular/core` (same import block as other Angular symbols). If a file is missing it, add it when formatting or reviewing.
- Keep `selector`, `template` / `templateUrl`, `styleUrls` / `styles`, `imports`, `host`, etc. When there is no semantic requirement, prefer keys in **alphabetical** order (`changeDetection` included).

---

## Component/directive addendum

Apply **in addition** to the universal sections above.

### Presentation focus

Component/Directive logic should lean toward UI; reusable validation or transforms belong in functions or other modules/classes.

### Templates (when editing the paired `.html`)

- Prefer `[class...]` / `[style...]` over `NgClass` / `NgStyle`.
- Avoid overly complex templates; move logic to TypeScript, often with `computed()`.
- Name event handlers by **action** (`saveUserData()`), not generic triggers (`handleClick()`), except for complex delegates like `handleKeydown`.

### Lifecycle

- Keep hooks simple; call clearly named methods from them.
- Implement lifecycle **interfaces** for every hook used.

### Selectors, inputs, outputs

- Component selectors: [Choosing a selector](https://angular.dev/guide/components/selectors#choosing-a-selector).
- Input/output naming: [inputs](https://angular.dev/guide/components/inputs#choosing-input-names), [outputs](https://angular.dev/guide/components/outputs#choosing-event-names).
- Directives: shared app prefix; attribute selectors in **camelCase** (e.g. `[mrTooltip]`).

### Readonly and template-only visibility

- **`readonly`**: on `input()`, `output()`, `model()`, and template queries when Angular assigns them and they should not be reassigned.
- **`protected`**: for members used **only** in the template and not as external API ([protected for template-only members](https://angular.dev/style-guide#use-protected-on-class-members-that-are-only-used-by-a-components-template)).

---

## Alphabetical tie-breaking

When no other rule applies, use **alphabetical** order; stay consistent with neighboring files in the repo.

---

## Cleanup checklist

**Every class**

- [ ] Imports: Angular → blank → third party → blank → project aliases only.
- [ ] No unused imports or unused DI.
- [ ] Class: DI → properties → (queries if component/directive) → constructor → lifecycle hooks (if any) → other methods (alpha).
- [ ] Visibility: `private` / `protected` / `public` match actual use; no unnecessary `public`.

**Component or directive**

- [ ] **Component only**: `changeDetection: ChangeDetectionStrategy.OnPush` on every `@Component`.
- [ ] `readonly` on `input()`, `output()`, `model()`, and template queries where appropriate.
- [ ] `protected` (not `public`) for template-only members outside the public API.
- [ ] Lifecycle interfaces implemented; heavy logic in named methods.
- [ ] `@Component` / `@Directive` metadata consistent and ordered when practical.

---

## Reference

- [Angular Style Guide](https://angular.dev/style-guide)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) (general TypeScript outside Angular-specific rules)
- Project aliases: `tsconfig.json` → `compilerOptions.paths`
