# i18n opt-in flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the i18n strategy from ADR-014 opt-in via a new `environment.i18n` boolean flag, defaulting to `false` in this base project's own environments, so projects created by merging this template start without i18n but can activate it later.

**Architecture:** Add `i18n?: boolean` to the `Environment` interface, set it explicitly to `false` in both environment files, and guard the translation-loading half of `AppManager.setLocale()` behind that flag. Locale resolution (`LOCALE_ID`, the HTTP `Accept-Language` interceptor) stays unconditional — only the `import()` + `loadTranslations()` calls become conditional.

**Tech Stack:** Angular 21, `@angular/localize`, Vitest.

## Global Constraints

- Locale resolution/storage in `AppManager.setLocale()` must behave identically regardless of the flag — only translation loading is gated.
- No changes to `project-create` skill, `language-picker` component, or the pre-existing missing try/catch around the main-file `import()` in `setLocale()` (out of scope per design doc).
- `docs/adr/ADR-014-internationalization-strategy.md` must document the flag and a short activation checklist.

---

### Task 1: Add `i18n` flag to `Environment` model and set default `false`

**Files:**
- Modify: `src/app/core/models/environment.ts`
- Modify: `src/environments/environment.ts`
- Modify: `src/environments/environment.development.ts`

**Interfaces:**
- Produces: `Environment.i18n?: boolean` — consumed by Task 2 (`AppManager.setLocale()`).

- [ ] **Step 1: Add the field to the `Environment` interface**

In `src/app/core/models/environment.ts`, add `i18n?: boolean;` next to the other optional flags:

```typescript
import { Language } from './language';

/**
 * Environment variables model
 */
export interface Environment {
  appId: string;
  appName: string;
  defaultLocale: string;
  languages: Language[];
  sessionPrefix: string;
  apiRestBaseUrl: string;
  i18n?: boolean;
  iconSettings?: {
    path: string;
    collection: string;
  };
  googleTagManager?: {
    trackingCode: string;
  };
}
```

- [ ] **Step 2: Set the default value in both environment files**

In `src/environments/environment.ts`:

```typescript
import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  appId: 'abp',
  appName: 'ABP',
  defaultLocale: 'en',
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ],
  sessionPrefix: '',
  apiRestBaseUrl: '',
  i18n: false,
  iconSettings: {
    path: 'images',
    collection: 'factoricons-regular'
  }
};
```

Apply the identical `i18n: false` addition to `src/environments/environment.development.ts` (same shape, same insertion point after `apiRestBaseUrl`).

- [ ] **Step 3: Verify the project still type-checks**

Run: `npx tsc -p tsconfig.json --noEmit`
Expected: no new errors (the field is optional, so any code not yet aware of it still compiles).

- [ ] **Step 4: Commit**

```bash
git add src/app/core/models/environment.ts src/environments/environment.ts src/environments/environment.development.ts
git commit -m "feat(i18n): add opt-in environment.i18n flag, default false"
```

---

### Task 2: Gate translation loading in `AppManager.setLocale()` behind the flag

**Files:**
- Modify: `src/app/core/services/app-manager.ts:121-144`
- Test: `src/app/core/services/app-manager.spec.ts`

**Interfaces:**
- Consumes: `Environment.i18n?: boolean` from Task 1, via the already-imported `environment` object (`import { environment } from '@/environments/environment';`, `app-manager.ts:14`).
- Produces: no new public API — `AppManager.init()` / `getLocale()` behavior unchanged when `environment.i18n` is `true`; translation loading is skipped when `false`.

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('init', ...)` block in `src/app/core/services/app-manager.spec.ts` (after the `'should be callable'` test):

```typescript
    it('should not attempt to load translations when environment.i18n is false', async () => {
      // Arrange
      const originalI18n = environment.i18n;
      environment.i18n = false;
      (mockStorage.get as any).mockReturnValue(null);

      // Act
      await appManager.init();

      // Assert
      expect(appManager.getLocale()).toBeDefined();

      // Cleanup
      environment.i18n = originalI18n;
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/core/services/app-manager.spec.ts -t "should not attempt to load translations"`
Expected: FAIL — with today's unconditional code, `init()` still reaches the un-guarded `import('../../../../public/i18n/${locale}.js')` on line 140, which either throws (no `try/catch` on that import) or hangs resolving a real file; the test times out or rejects instead of resolving cleanly.

- [ ] **Step 3: Implement the guard**

In `src/app/core/services/app-manager.ts`, replace the body of `private async setLocale()`:

```typescript
  private async setLocale(): Promise<string> {
    const systemLocale = isPlatformBrowser(this.platformId)
      ? this.languages().find((l) => l.code === navigator.language.split('-')[0])?.code
      : null;
    const userLocale = this.languages().find(
      (l) => l.code === this.storage.get(this.localeKey, 'local')
    )?.code;
    const locale = userLocale || systemLocale || environment.defaultLocale;
    this.storage.set(this.localeKey, locale, 'local');

    if (environment.i18n) {
      // Load base translations
      try {
        const localeBaseTranslations = await import(`../../../../public/i18n/${locale}-base.js`);
        loadTranslations(localeBaseTranslations.default);
      } catch (error) {
        console.error(`Error loading base translations for ${locale}:`, error);
      }

      // Load translation file
      const localeTranslations = await import(`../../../../public/i18n/${locale}.js`);
      loadTranslations(localeTranslations.default);
    }

    return locale;
  }
```

Only the two dynamic-import/`loadTranslations()` blocks move inside `if (environment.i18n) { ... }`. Nothing else in the method changes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/core/services/app-manager.spec.ts -t "should not attempt to load translations"`
Expected: PASS

- [ ] **Step 5: Run the full spec file to confirm no regressions**

Run: `npx vitest run src/app/core/services/app-manager.spec.ts`
Expected: all tests PASS (with `environment.i18n` at its default `false` from Task 1, the other `init()`-invoking tests in this file now skip the dynamic import entirely instead of relying on a real filesystem import, which is a stability improvement, not a behavior change for what they assert).

- [ ] **Step 6: Commit**

```bash
git add src/app/core/services/app-manager.ts src/app/core/services/app-manager.spec.ts
git commit -m "feat(i18n): skip translation loading when environment.i18n is false"
```

---

### Task 3: Document the opt-in flag in ADR-014

**Files:**
- Modify: `docs/adr/ADR-014-internationalization-strategy.md`

- [ ] **Step 1: Add a flag bullet to the `## Decisión` list**

Add as a new numbered point at the end of the `## Decisión` list (after the current point 6, "Detección de locale..."):

```markdown
7. **Adopción opt-in por proyecto**: el flag `environment.i18n` (boolean) controla si `AppManager` carga traducciones en runtime. Los proyectos nuevos creados a partir de este proyecto base inician con `i18n: false`; el resto de la infraestructura (`public/i18n/*`, `generate-i18n.js`, scripts npm, interceptor HTTP, regla ESLint) permanece siempre presente y se activa poniendo el flag en `true`.
```

- [ ] **Step 2: Add an activation checklist section**

Insert a new section right after `## Decisión` and before `## Reglas de código`:

```markdown
## Activar i18n en un proyecto

1. Poner `i18n: true` en todos los `src/environments/environment*.ts` del proyecto.
2. Marcar el texto visible de la UI con `i18n` (templates) o `$localize` (TypeScript) — ver [Reglas de código](#reglas-de-código).
3. Ejecutar `npm run extract-i18n` y `npm run i18n -- {lang}` para generar los archivos de idioma.
4. Confirmar que este ADR-014 sigue presente en `docs/adr/` del proyecto; si se hubiera perdido en el merge, restaurarlo o documentarlo de nuevo con el skill `adr-manage`.
```

- [ ] **Step 3: Update the metadata date**

Change `**Última Actualización:** 14/07/2026` to today's date (already `14/07/2026` from the prior edit — update only if this task runs on a later date).

- [ ] **Step 4: Commit**

```bash
git add docs/adr/ADR-014-internationalization-strategy.md
git commit -m "docs(adr-014): document environment.i18n opt-in flag and activation checklist"
```

---

### Task 4: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite**

Run: `npm run test:coverage`
Expected: all tests PASS, no new failures.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: build succeeds with no new TypeScript errors.

- [ ] **Step 3: Manually verify activation still works**

Temporarily set `i18n: true` in `src/environments/environment.development.ts`, run `npm start`, confirm in the browser console/network tab that translations load and the language picker (`features/settings/components/language-picker`) still switches language as before. Revert the temporary change afterward (`i18n: false`) — do not commit it.
