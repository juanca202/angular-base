# Verificaciones automatizadas — angular-base (rama main, sin artefacto de trabajo)

**Veredicto:** ✅ Aprobado — cero fallos y cero omisiones en los checks bloqueantes.
**Fecha:** 2026-11-16 21:47
**Rama:** main
**Commit:** 66c4c3f (working tree con cambios sin commitear)
**Modo:** default
**Estándar de testing:** [docs/standards/testing.md](../standards/testing.md) — `unit-testing` y `e2e-testing` (este eleva E2E a bloqueante con su **DEBE**); `http-api-mocks-msw` no es una suite ejecutable. Sin suites configuradas adicionales.

## Resumen

Se ejecutaron tipado, linter, validaciones de arquitectura, pruebas unitarias con cobertura, build y E2E. La primera corrida falló en el linter (8 errores preexistentes de `project-rules/require-layer-path-alias`), que se corrigieron con autorización; la segunda quedó incompleta porque faltaba el navegador de Playwright, que se instaló (`npx playwright install chromium`). En esta tercera corrida completa todo pasa. Persiste el warning de presupuesto del bundle inicial, que no bloquea.

## Verificaciones

Leyenda de estados: `✅` Aprobado · `❌` Fallido · `⏭️` Omitido · `⏸️` Pendiente · `—` No aplica · `ℹ️` Informativo.

| # | Check | Comando | Categoría | Estado | Detalle | Duración |
| - | ----- | ------- | --------- | ------ | ------- | -------- |
| 1 | tipado | `npx tsc -p tsconfig.app.json --noEmit` · `npx tsc -p tsconfig.spec.json --noEmit` | Bloqueante | ✅ Aprobado | 0 errores | 163s |
| 2 | linter | `npm run lint` | Bloqueante | ✅ Aprobado | 0 errores, 0 warnings (tras corregir 8 errores) | 126s |
| 3 | arquitectura | `npm run arch` | Bloqueante | ✅ Aprobado | 5 estándares, 19 criterios, 0 violaciones | 146s |
| 4 | unit tests | `npm test -- --watch=false` | Bloqueante | ✅ Aprobado | 220 passed, 0 failed (22 archivos) | 45s |
| 5 | coverage | `npm test -- --watch=false` (`coverage: true` en [angular.json](../../angular.json)) | Bloqueante | ✅ Aprobado | statements 94.15 %, branches 86.32 %, functions 91.44 %, lines 95.44 % (umbral 80 %) | 45s |
| 6 | build | `npm run build` | Bloqueante | ✅ Aprobado | OK; warning de presupuesto: bundle inicial 510.90 kB > 500 kB | 27s |
| 7 | e2e | `npm run e2e` | Bloqueante | ✅ Aprobado | 1 passed | 27s |

### Detalle de checks fallidos

Sin checks fallidos.

### Correcciones aplicadas en esta corrida

- **linter** — 8 errores de `project-rules/require-layer-path-alias` (imports relativos donde hay alias `@/`), preexistentes desde el commit 60f8d16. Corregidos sin artefacto de trabajo (rama `main`), cambiando los imports al alias en [datagrid.ts](../../src/app/shared/components/datagrid/datagrid.ts), [datagrid.spec.ts](../../src/app/shared/components/datagrid/datagrid.spec.ts), [filters.spec.ts (componente)](../../src/app/shared/components/filters/filters.spec.ts), [filters.ts (modelo)](../../src/app/shared/models/filters.ts) y [filters.spec.ts (modelo)](../../src/app/shared/models/filters/filters.spec.ts).
- **e2e** — en la segunda corrida no pudo lanzar el navegador (`Executable doesn't exist at /opt/ms-playwright/chromium_headless_shell-1234/...`). Se instaló con `npx playwright install chromium`; no hubo cambios de código.

## Próximas acciones

1. Revisar el presupuesto del bundle inicial (510.90 kB frente a 500 kB de aviso en [angular.json](../../angular.json)); no bloquea.

<!-- quality-check:verdict=APPROVED · fingerprint=a51c6402ac664ab48711551121440f1d793b6ac6 · generated=2026-11-16 -->
