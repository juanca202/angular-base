# Informe de Auditoría de Cumplimiento — 2026-09-12

**Fecha**: 2026-09-12
**Repositorio**: angular-base-project (raíz principal, sin submódulos)
**Alcance**: 32 criterios de cumplimiento en 5 estándares Active (Architecture, Coding Style, DevOps, Frontend, Testing) — ninguno en Draft/Deprecated/Superseded — más las reglas atómicas de AGENTS.md raíz (stack, TypeScript, Angular, Accesibilidad, Componentes, State Management, Templates, Servicios).
**Método**: `grep`/`find` sobre el código y manifiestos (`package.json`, `tsconfig*.json`, `angular.json`, `.dependency-cruiser.js`); runner `node scripts/arch/verify.mjs` ejecutado completo (18 criterios evaluados). No se corrió el build ni la suite completa de tests.
**Veredicto**: APPROVED_WITH_NOTES (revalidado 2026-09-12 01:25)

## Resumen

| Prioridad | Cumplido ✅ | Parcial ⚠️ | Incumplido ❌ | No verificable ❔ |
|-----------|:----------:|:---------:|:------------:|:-----------------:|
| 🔴 Alta   | 8          | 0         | 1            | 2                 |
| 🟡 Media  | 24         | 3         | 4            | 1                 |
| ⚪ Baja   | 6          | 0         | 0            | 1                 |

La base automatizada del proyecto es sólida: las 18 fitness functions registradas en `scripts/arch/verify.mjs` pasan limpio, y la mayoría de las reglas de AGENTS.md sobre Angular moderno (signals, `inject()`, control de flujo nativo, sin `any`) se cumplen al 100%. El bloqueo del veredicto viene de un hueco de configuración fundamental (TypeScript sin `strict`) y de tres normas de dominio con implementación real divergente de lo documentado (MSW, patrón Repository, patrón Manager) — ninguna tiene aún una fitness function que la hubiera detectado antes.

---

## 🔴 Prioridad alta

### AGENTS.md §TypeScript Best Practices — Tipado estricto no configurado

**Criterio:** N/A (regla de AGENTS.md)
**Fuente:** AGENTS.md §TypeScript Best Practices
**Decisión de origen:** N/A
**Enfoque:** N/A
**Regla auditada:** "Use strict type checking"
**Estado:** ❌ Incumplido

**Evidencias:**
- ✔ El proyecto sí activa varios flags puntuales: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` (`tsconfig.json`), y `strictInjectionParameters`/`strictInputAccessModifiers` (`angularCompilerOptions`, específicos de Angular).
- ✖ Ninguno de `tsconfig.json`, `tsconfig.app.json` ni `tsconfig.spec.json` define `"strict": true` ni activa individualmente `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization` o `strictBindCallApply` — el modo estricto de TypeScript está apagado por completo.

**Incumplimientos:**
- `tsconfig.json` — falta `"strict": true` (o el conjunto equivalente de flags `strict*`).

**Acción sugerida:**
Agregar `"strict": true` a `compilerOptions` en `tsconfig.json` y resolver los errores de tipado que aparezcan (probablemente concentrados en `strictNullChecks`). Es un cambio de alcance considerable en un proyecto ya con código — conviene planificarlo como su propio WI y, si el volumen de errores es alto, activar los flags `strict*` uno por uno en vez de todos a la vez.

---

## 🟡 Prioridad media

### testing/CR-010 — Mocks de APIs HTTP con MSW

**Criterio:** testing/CR-010 (requisito `testing/http-api-mocks-msw`, estándar «Testing Standards»)
**Fuente:** docs/standards/testing.md → requisito «Mocks de APIs HTTP con MSW» → CR-010
**Decisión de origen:** ADR-007 (docs/adr/ADR-007-http-api-mocks-msw.md)
**Enfoque:** bloqueante
**Regla auditada (RFC 2119):** "Las pruebas unitarias/integración que mockeen APIs HTTP **DEBEN** usar MSW"
**Estado:** ❌ Incumplido

**Evidencias:**
- ✔ La infraestructura de MSW existe: `src/mocks/{node,browser,handlers}.ts`, dependencia `msw` instalada (`package.json`).
- ✖ `src/app/core/services/session.spec.ts` es la única prueba unitaria del repo que mockea una llamada HTTP real (`Session` llama a `HttpClient.get(getApiUrl('settings'))`), y lo hace con `provideHttpClientTesting()` / `HttpTestingController` (el mock nativo de Angular), no con MSW.
- ✖ `src/mocks/handlers.ts` es un placeholder vacío — cero handlers reales registrados; la infraestructura de MSW nunca se llegó a usar.

**Incumplimientos:**
- `src/app/core/services/session.spec.ts` — mockea HTTP con `HttpTestingController` en vez de MSW.
- `src/mocks/handlers.ts` — sin handlers, la migración a MSW nunca se completó.

**Acción sugerida:**
Migrar `session.spec.ts` a interceptar `getApiUrl('settings')` vía un handler de `src/mocks/handlers.ts` (`http.get(...)`) y `setupServer`/`setupWorker` de MSW en vez de `provideHttpClientTesting()`. Registrar ahí el primer handler real destraba el placeholder para el resto de features que lleguen a necesitar HTTP.

### architecture/CR-010 — Patrón Repository para REST API

**Criterio:** architecture/CR-010 (requisito `architecture/rest-repository-pattern`, estándar «Architecture Standards»)
**Fuente:** docs/standards/architecture.md → requisito «Patrón Repository para REST API» → CR-010
**Decisión de origen:** ADR-010 (docs/adr/ADR-010-repository-pattern-rest-api.md)
**Enfoque:** bloqueante
**Regla auditada (RFC 2119):** "Cada entidad con acceso REST **DEBE** exponerse mediante una clase `{Entity}Repository` con convenciones `mutations`/`find*`"
**Estado:** ❌ Incumplido

**Evidencias:**
- ✔ Existe `BaseRepository` (`src/app/core/services/base-repository.ts`), la clase base pensada para este patrón (ADR-010).
- ✖ `BaseRepository` no tiene ninguna subclase en todo el repo (`grep "extends BaseRepository"` no encuentra nada) — no existe ningún `{Entity}Repository` concreto.
- ✖ `src/app/core/services/session.ts:102-103` llama `this.httpClient.get<Settings>(getApiUrl('settings'), ...)` directamente, exponiendo el acceso REST a la entidad `settings` sin pasar por un `SettingsRepository`.

**Incumplimientos:**
- `src/app/core/services/session.ts:102` — acceso REST a `settings` sin una clase `SettingsRepository`.

**Acción sugerida:**
Extraer la llamada HTTP de `Session` a una clase `SettingsRepository extends BaseRepository` con un método `find*` (p. ej. `findSettings()`), e inyectarla en `Session`. Esto además destraba testing/CR-010 (el nuevo repository se puede probar con MSW en vez de `HttpTestingController`).

### architecture/CR-011 — Patrón Manager para orquestación

**Criterio:** architecture/CR-011 (requisito `architecture/manager-orchestration-pattern`, estándar «Architecture Standards»)
**Fuente:** docs/standards/architecture.md → requisito «Patrón Manager para orquestación» → CR-011
**Decisión de origen:** ADR-011 (docs/adr/ADR-011-manager-pattern-orchestration.md)
**Enfoque:** bloqueante
**Regla auditada (RFC 2119):** "Los flujos complejos... **DEBEN** coordinarse con un Manager; **NO DEBE** usarse Manager para acceso a datos ni presentación pura"
**Estado:** ⚠️ Parcialmente cumplido

**Evidencias:**
- ✔ `AppManager` (`src/app/core/services/app-manager.ts`) coordina `AuthProvider`, `Session`, `SwUpdate`, `Storage` y `MessageService` en flujos multi-servicio reales (`init`, `install`, `checkForUpdates`) — uso correcto del patrón.
- ✖ `LayoutManager` (`src/app/core/services/layout-manager.ts`) solo tiene dos métodos: `getRandomNumber` (utilidad pura sin estado ni orquestación) y `setOverlapped` (manipulación directa de `classList` sobre un `HTMLElement` — presentación pura de UI). Ninguno de los dos es un "flujo complejo" ni orquesta servicios; encaja en la prohibición explícita del criterio ("NO DEBE usarse Manager para... presentación pura").

**Incumplimientos:**
- `src/app/core/services/layout-manager.ts` — clase `Manager` para presentación pura (toggle de clase CSS) y una utilidad sin estado, no para orquestación.

**Acción sugerida:**
Renombrar/mover `LayoutManager` fuera de la convención Manager: `getRandomNumber` como función pura en `shared/utils/` (o eliminarla si no se usa fuera de tests), y `setOverlapped` como una directiva o función de `shared/utils/` sin sufijo `Manager`, ya que no orquesta nada.

### devops/CR-001 — Branching con GitFlow

**Criterio:** devops/CR-001 (requisito `devops/gitflow-branching`, estándar «DevOps Standards»)
**Fuente:** docs/standards/devops.md → requisito «Branching con GitFlow» → CR-001
**Decisión de origen:** ADR-008 (docs/adr/ADR-008-gitflow-conventional-commits.md)
**Enfoque:** bloqueante
**Regla auditada (RFC 2119):** "El trabajo en el repo **DEBE** usar GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)"
**Estado:** ⚠️ Parcialmente cumplido

**Evidencias:**
- ✔ `main`, `develop`, `feature/harness-improvements` siguen la convención declarada.
- ✖ `codex/analyze-project-architecture-and-best-practices` y `codex/revise-and-optimize-existing-adrs` (locales y en `origin/`) no encajan en ningún prefijo permitido (`feature/`, `release/`, `hotfix/`); el estándar no documenta una excepción para ramas generadas por agentes.

**Incumplimientos:**
- Rama `codex/analyze-project-architecture-and-best-practices` — prefijo fuera de convención.
- Rama `codex/revise-and-optimize-existing-adrs` — prefijo fuera de convención.

**Acción sugerida:**
Si estas ramas son de un flujo de agentes que se quiere seguir usando, documentar la excepción en `### Excepciones` del requisito `gitflow-branching` (vía `arch-manage`) en vez de dejarlo fuera de norma; si no, renombrarlas o eliminarlas una vez fusionado su contenido.

### coding-style/CR-003 — Documentación con TSDoc

**Criterio:** coding-style/CR-003 (requisito `coding-style/tsdoc-documentation`, estándar «Coding Style Standards»)
**Fuente:** docs/standards/coding-style.md → requisito «Documentación con TSDoc» → CR-003
**Decisión de origen:** ADR-004 (docs/adr/ADR-004-tsdoc-documentation-during-development.md)
**Enfoque:** bloqueante
**Regla auditada (RFC 2119):** "El código no trivial **DEBE** documentarse en formato TSDoc"
**Estado:** ⚠️ Parcialmente cumplido

**Evidencias:**
- ✔ `session.ts` (13 bloques TSDoc) y `base-repository.ts` (3 bloques) documentan bien su superficie pública.
- ✖ `layout-manager.ts` no tiene ningún bloque TSDoc pese a tener lógica no trivial (`setOverlapped`).
- ✖ `app-manager.ts` tiene un solo bloque TSDoc pese a exponer ~8 métodos públicos/privados con lógica de orquestación (`init`, `install`, `checkForUpdates`, `setLocale`, etc.).

**Incumplimientos:**
- `src/app/core/services/layout-manager.ts` — sin documentación TSDoc.
- `src/app/core/services/app-manager.ts` — documentación TSDoc insuficiente para su superficie pública.

**Acción sugerida:**
Añadir TSDoc a los métodos públicos de `layout-manager.ts` y completar la documentación de `app-manager.ts`, siguiendo el nivel de detalle ya usado en `session.ts`.

### AGENTS.md §Services — Preferencia por `@Service` no adoptada

**Criterio:** N/A (regla de AGENTS.md)
**Fuente:** AGENTS.md §Services
**Decisión de origen:** N/A
**Enfoque:** N/A
**Regla auditada:** "Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)"
**Estado:** ❌ Incumplido

**Evidencias:**
- ✔ `@Service` existe y es válido en la versión de Angular instalada (`@angular/core@22.1.0`, confirmado en sus tipos).
- ✖ Los tres servicios singleton del repo (`app-manager.ts`, `session.ts`, `layout-manager.ts`) usan `@Injectable({ providedIn: 'root' })`; ninguno usa `@Service`.

**Incumplimientos:**
- `src/app/core/services/app-manager.ts`, `session.ts`, `layout-manager.ts` — usan `@Injectable({ providedIn: 'root' })` en vez de `@Service`.

**Acción sugerida:**
Migrar los tres a `@Service` la próxima vez que se toquen (es un `Prefer`, no bloqueante para el código existente, pero conviene no seguir agregando `@Injectable({providedIn:'root'})` nuevos).

---

## ⚪ Prioridad baja

Sin hallazgos (los criterios de esta prioridad están todos ✅ Cumplidos, ver Resumen; la única entrada ❔ de esta fila está detallada en «Reglas no verificables»).

---

## Fitness functions

### Existentes

| Criterio (CR) | Enfoque | Fitness function / herramienta | Comando ejecutado | ¿Registrada? | Resultado |
|---------------|---------|-------------------------------|-------------------|--------------|-----------|
| architecture/CR-001 | bloqueante | script propio (existencia de carpetas) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-002 | bloqueante | dependency-cruiser | `npx depcruise --config .dependency-cruiser.js --output-type err src/app` | sí | ✅ PASS |
| architecture/CR-004 | bloqueante | ESLint `project-rules/require-layer-path-alias` (auditoría de config) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-009 | bloqueante | ESLint `no-restricted-syntax` (auditoría de config) + lectura de `async-resources.ts` | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-013 | bloqueante | ESLint `project-rules/manager-naming` (auditoría de config) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-014 | bloqueante | ESLint `project-rules/mapper-location` (auditoría de config) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-015 | bloqueante | ESLint `project-rules/mapper-naming` (auditoría de config) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| architecture/CR-016 | bloqueante | ESLint `no-restricted-syntax`/`no-restricted-globals` (auditoría de config) | `node scripts/arch/verify.mjs architecture` | sí | ✅ PASS |
| coding-style/CR-001 | warning | ESLint `@typescript-eslint/explicit-member-accessibility` (auditoría de config) | `node scripts/arch/verify.mjs coding-style` | sí | ✅ PASS |
| coding-style/CR-002 | warning | ESLint `@typescript-eslint/prefer-readonly` (auditoría de config) | `node scripts/arch/verify.mjs coding-style` | sí | ✅ PASS |
| devops/CR-002 | bloqueante | commitlint (ejecución real con mensajes de control) | `node scripts/arch/verify.mjs devops` | sí | ✅ PASS |
| devops/CR-003 | bloqueante | script propio (deps + hook Husky) | `node scripts/arch/verify.mjs devops` | sí | ✅ PASS |
| frontend/CR-002 | bloqueante | ESLint `@angular-eslint/template/no-inline-styles` (auditoría de config) | `node scripts/arch/verify.mjs frontend` | sí | ✅ PASS |
| frontend/CR-003 | bloqueante | script propio (escaneo CSS crudo) | `node scripts/arch/verify.mjs frontend` | sí | ✅ PASS |
| testing/CR-002 | bloqueante | script propio (colocation de specs) | `node scripts/arch/verify.mjs testing` | sí | ✅ PASS |
| testing/CR-005 | bloqueante | script propio (umbral en `angular.json`, no re-ejecuta la suite) | `node scripts/arch/verify.mjs testing` | sí | ✅ PASS |
| testing/CR-007 | bloqueante | script propio (stack Playwright en `package.json`) | `node scripts/arch/verify.mjs testing` | sí | ✅ PASS |
| testing/CR-008 | bloqueante | ESLint `no-restricted-imports` (auditoría de config) + script propio | `node scripts/arch/verify.mjs testing` | sí | ✅ PASS |

Runner completo: `node scripts/arch/verify.mjs` → **18 criterios, 18 PASS, 0 WARN, 0 FAIL**, 5 estándares.

> Nota de diseño encontrada y confirmada durante esta sesión: los chequeos que delegan en una regla de ESLint (marcados «auditoría de config» arriba) **no re-ejecutan ESLint sobre el código** — auditan que la regla siga registrada en la severidad correcta en `eslint.config.mjs`. La detección de violaciones reales en el código es responsabilidad de `npm run lint`, una compuerta separada. Ambas compuertas se verificaron limpias en esta auditoría (`npm run lint` → 0 errores).

### Sugeridas

**testing/CR-010 — Mocks de APIs HTTP con MSW**
- **Qué medir:** que ninguna prueba unitaria mockee HTTP con `HttpTestingController`/`provideHttpClientTesting` cuando exista un handler MSW disponible.
- **Herramienta sugerida:** regla ESLint propia (`no-restricted-imports` sobre `@angular/common/http/testing` sería un primer paso simple, aunque no distingue "mockea HTTP" de otros usos del testing harness) o un script de `grep` en `scripts/arch/checks/testing.mjs`.
- **Esbozo:** chequeo propio: `grep -rl "HttpTestingController\|provideHttpClientTesting" src/app --include=*.spec.ts` → si hay resultados, FAIL con las rutas.

**testing/CR-011 — Sin librería de mock HTTP competidora**
- **Qué medir:** que `package.json` no declare `nock`/`miragejs`/similares, y que ningún spec bajo `e2e/` dependa de `msw`.
- **Herramienta sugerida:** script propio (lectura de `package.json` + `grep` en `e2e/`).
- **Esbozo:** chequeo propio en `checks/testing.mjs`, análogo al ya existente para CR-007 (forbidden deps).

**frontend — Iconos unificados con `ft-icon` (sin criterio aún, ver Decisiones sin criterio)**
- **Qué medir:** que ninguna plantilla use `mat-icon`, una fuente `material-icons` o SVG de icono inline como sustituto de `<ft-icon />`.
- **Herramienta sugerida:** script propio (`grep` en `*.html`).
- **Esbozo:** `grep -rl "mat-icon\|material-icons" src/app --include=*.html` → FAIL con las rutas si hay resultados.

**coding-style — Formateo con Prettier (sin criterio aún, ver Decisiones sin criterio)**
- **Qué medir:** que todo el código fuente pase `prettier --check`.
- **Herramienta sugerida:** Prettier (ya instalado).
- **Esbozo:** `npx prettier --check .` (respetando `.prettierignore`) como chequeo bloqueante.

**AGENTS.md §Accessibility — AXE / WCAG AA**
- **Qué medir:** que las páginas no tengan violaciones de accesibilidad detectables automáticamente.
- **Herramienta sugerida:** `@axe-core/playwright`, integrado en `e2e/` (ya hay Playwright instalado).
- **Esbozo:** en cada spec de `e2e/`, tras navegar, `await new AxeBuilder({ page }).analyze()` y fallar si `results.violations.length > 0`.

### Criterios no aptos para fitness function

- architecture/CR-003, CR-007, CR-011, CR-017 — dependen de juicio sobre intención/diseño (qué es "lógica de negocio", qué es un "flujo complejo"), no de un patrón sintáctico determinista.
- coding-style/CR-004 — regla de proceso (cuándo se escribió la documentación), no observable en una foto del código.
- devops/CR-001 — la validez de un prefijo de rama fuera de convención es una decisión de proceso/equipo, no un patrón puramente sintáctico.
- testing/CR-003, CR-004, CR-006, CR-009 — calidad/estructura de las pruebas y priorización de producto; requieren criterio humano.

## Reglas no verificables por inspección estática

- AGENTS.md §Accessibility — "MUST pass all AXE checks" — no hay ninguna herramienta de accesibilidad (axe-core, Lighthouse CI, etc.) instalada en el repo; no se puede confirmar ni refutar por inspección del código. Evidencia que lo confirmaría: una corrida de axe-core (o equivalente) sobre las rutas de la app, en CI o local.
- AGENTS.md §Accessibility — "MUST follow all WCAG AA minimums" — mismo motivo; requiere una auditoría de accesibilidad real (automatizada o manual), no solo lectura de código.
- coding-style/CR-004 — "la documentación TSDoc DEBE incluirse en el mismo ciclo... NO DEBE aplazarse" — es una regla sobre el proceso de desarrollo (cuándo se escribió cada bloque TSDoc respecto al cambio que documenta), no algo que una foto del repo pueda confirmar. Evidencia que lo confirmaría: revisar el historial de PRs para ver si la documentación llegó en el mismo commit/PR que el código que documenta.
- AGENTS.md §TypeScript Best Practices — "Prefer type inference when the type is obvious" — juicio de estilo caso por caso; no hay un patrón sintáctico objetivo que separe una anotación de tipo "innecesaria" de una deliberada.

## Decisiones sin criterio (trazabilidad)

- ADR-013 (`docs/adr/ADR-013-unified-ft-icon-component.md`) — `Accepted`, `emits: []`. Su estándar (`docs/standards/frontend.md`, requisito «Iconos unificados con `ft-icon`») ya tiene el enunciado normativo completo en RFC 2119 ("Todo icono... DEBE renderizarse con `<ft-icon />`"; "NO DEBE usarse `mat-icon`...") pero cero filas `CR-XXX` en la tabla de criterios → sugerir emitir el/los criterio(s) vía `arch-manage`.
- ADR-014 (`docs/adr/ADR-014-prettier-code-formatting.md`) — `Accepted`, `emits: []`. Su estándar (`docs/standards/coding-style.md`, requisito «Formateo con Prettier») también tiene enunciado normativo completo ("Los archivos... DEBEN formatearse con Prettier"; "El cumplimiento DEBE verificarse con `prettier --check`") sin ningún `CR-XXX` asociado → sugerir emitir el criterio vía `arch-manage` (tiene, además, una fitness function trivial: `prettier --check .`, ver sección de sugeridas).

## Observaciones

- **Dependencia referenciada sin declarar directamente (resuelto durante esta auditoría):** `AGENTS.md § Stack tecnológico` lista `$localize` / `@angular/localize` como parte del stack, y el código lo usa activamente (`error.ts`, `app-manager.ts`, `async-resources.ts`, `notification.ts`, y los `types` de `tsconfig.app.json`/`tsconfig.spec.json`). Solo estaba presente como dependencia transitiva de `@angular/cli`. Con aprobación del usuario, se instaló como dependencia directa (`npm install @angular/localize@22.1.0`, ahora `"@angular/localize": "^22.1.0"` en `package.json`); se reverificó `npm run lint` y `tsc -b --noEmit` tras la instalación, ambos limpios.
- **CR-004 (architecture) tiene doble cobertura documental:** el runner solo imprime la fitness function como "regla activa"; la verificación de que el código *hoy* cumple la regla (0 imports relativos con alias disponible) se confirmó por separado con `npm run lint` durante esta auditoría, no por el runner — coherente con el diseño de compuertas separadas ya documentado en el propio repo.

## Revalidaciones

### Revalidación — 2026-09-12 01:25

**Veredicto resultante**: APPROVED_WITH_NOTES

**Cambios evidenciados:**

- `AGENTS.md §TypeScript Best Practices` — `✅` RESOLVED: `tsconfig.json` ahora activa `"strict": true`. `tsc -b --noEmit` (los tres `tsconfig`) queda limpio sin errores nuevos.
- `testing/CR-010` (Mocks de APIs HTTP con MSW) — `✅` RESOLVED: `src/app/core/services/session.spec.ts` migrado de `HttpTestingController`/`provideHttpClientTesting` a MSW (`server.use(http.get(...))`); se registró el primer handler real en `src/mocks/handlers.ts` (`GET` a `settings`). Suite completa: 148/148 tests, 18/18 archivos.
- `architecture/CR-010` (Patrón Repository para REST API) — `✅` RESOLVED (corrección de evidencia, no cambio de código): `docs/standards/architecture.md`, excepciones de `rest-repository-pattern`, ya exime explícitamente "código de infraestructura puntual en Core (p. ej. carga de settings de sesión)" de requerir un `{Entity}Repository` dedicado mientras no modele una entidad de dominio con CRUD completo. Esa excepción es anterior a la auditoría original (ya estaba en `HEAD` antes del informe del 2026-09-12) y `session.ts:100` (lectura `GET`, sin CRUD) encaja en ella; el hallazgo original no la tuvo en cuenta. No se creó `SettingsRepository` — no era necesario bajo el estándar vigente.
- `architecture/CR-011` (Patrón Manager para orquestación) — `✅` RESOLVED: `src/app/core/services/layout-manager.ts` (y su spec) eliminados — era código muerto, solo referenciado por su propio spec. `getRandomNumber` y `setOverlapped` se movieron a `src/app/shared/utils/random.ts` y `src/app/shared/utils/overlap.ts` como funciones puras, con sus pruebas preservadas (`random.spec.ts`, `overlap.spec.ts`). Se corrigió además la referencia obsoleta a `LayoutManager` en las excepciones del requisito `manager-orchestration-pattern` (`docs/standards/architecture.md`).
- `devops/CR-001` (Branching con GitFlow) — `✅` RESOLVED: `codex/analyze-project-architecture-and-best-practices` y `codex/revise-and-optimize-existing-adrs` verificadas como 100% fusionadas a `main` (sin commits propios: `git log main..<rama>` vacío) y eliminadas local y remotamente (`origin`), con aprobación explícita del usuario.
- `coding-style/CR-003` (Documentación con TSDoc) — `✅` RESOLVED: `layout-manager.ts` eliminado (ver `architecture/CR-011` arriba); `app-manager.ts` documentado por completo (TSDoc en sus 10 métodos públicos/privados).
- `AGENTS.md §Services` / `coding-style/CR-005` (decorador `@Service`) — `✅` RESOLVED: `Session` y `AppManager` migrados de `@Injectable({ providedIn: 'root' })` a `@Service()`; `LayoutManager` (el tercer servicio señalado) fue eliminado (ver arriba). La regla ESLint `project-rules/prefer-service-decorator` (severidad `warn`) no reporta ninguna ocurrencia — `npm run lint` sigue en 0 errores y 0 warnings. Nota: este criterio ya vive formalmente como `coding-style/CR-005` (ADR-015), emitido como seguimiento de esta misma auditoría; el hallazgo original lo registró solo como regla de `AGENTS.md` porque el criterio aún no existía al redactarse el informe.
- Fitness functions (runner `node scripts/arch/verify.mjs`) — sin cambios en la lista de criterios cubiertos; pasa de 18/18 a **19/19 PASS** (se sumó `coding-style/CR-005`, registrada junto con ADR-015 tras la auditoría original). `npx depcruise --config .dependency-cruiser.js --output-type err src/app` sigue en 0 violaciones.
- Verificación de dependencias (Fase 3.5) — sin novedad: no se introdujo ninguna dependencia nueva (MSW ya estaba instalado); nada que instalar ni señalar.
- Sin cambios en: `AGENTS.md §Accessibility` (AXE/WCAG, x2) y `AGENTS.md §TypeScript Best Practices` ("Prefer type inference") — siguen `❔` No verificable, sin evidencia nueva. `coding-style/CR-004` (TSDoc en el mismo ciclo de desarrollo) sigue `❔` No verificable — regla de proceso, no observable en una foto del código. `ADR-013` y `ADR-014` siguen con `emits: []` (Decisiones sin criterio) — sin cambios, siguen pendientes de emitir sus criterios vía `arch-manage`.

<!-- arch-audit:verdict=APPROVED_WITH_NOTES · generated=2026-09-12 -->

