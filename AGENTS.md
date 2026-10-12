# Fuentes de contexto

- @.agents/MEMORY.md — Preferencias del proyecto
- @docs/adr/README.md — Índice de decisiones arquitectónicas de este repositorio
- @docs/standards/README.md — Índice de estándares de arquitectura de este repositorio
- @README.md — Acerca de este repositorio

# Reglas generales

<!-- Normas de trabajo para agentes que no son preferencias (MEMORY), decisiones de arquitectura (ADR/estándares) ni stack: convenciones de código, comandos del repo, restricciones operativas. Ejemplo: "Seguir el estilo del código vecino; no reformatear líneas que no formen parte del cambio." -->

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Framework | Angular 22 (standalone, signals, application builder) |
| Lenguaje | TypeScript ~6 |
| UI / design system | `@factor_ec/ui` + `@factor_ec/utils` (p. ej. `ft-icon`, `MessageService`, `AuthProvider`); Angular Material |
| Estilos | Tailwind CSS v4 + PostCSS (`@tailwindcss/postcss`) |
| Reactividad | RxJS 7; estado local con signals de Angular |
| HTTP / datos | `HttpClient` + patrón Repository (`getApiUrl`, `async-resources`) |
| Mocks HTTP | MSW (Mock Service Worker) en `src/mocks/` |
| PWA | `@angular/service-worker` |
| Unit testing | Vitest + Testing Library (`@angular/build:unit-test`); helpers en `test/` |
| E2E | Playwright (`e2e/`; `npm run e2e`) |
| Lint / formato | ESLint (angular-eslint, typescript-eslint, reglas en `scripts/eslint-rules/`) + Prettier |
| Commits | GitFlow + Conventional Commits (commitlint) + Husky |
| Arquitectura (gate) | `npm run arch` — dependency-cruiser + fitness functions en `scripts/arch/` |
| Empaquetado | npm (`packageManager`: npm@11) |
| i18n | `$localize` / `@angular/localize` (opt-in `environment.i18n`) + scripts `extract-i18n` / `i18n` |

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
