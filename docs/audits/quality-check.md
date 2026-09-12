# Verificaciones automatizadas — angular-base-project

**Fecha:** 2026-09-11 23:34
**Rama:** main
**Commit:** 130352e (working tree con cambios sin commitear)
**Modo:** default — pruebas tomadas de la corrida del 2026-09-11 23:30 (caché fresca, mismo fingerprint)
**Estándar de testing:** docs/standards/testing.md — sin suites configuradas adicionales (unit-testing y e2e-testing corresponden a las fijas/e2e; e2e-testing eleva E2E de condicional a bloqueante con su **DEBE**)
**Veredicto:** ✅ Aprobado

## Resumen

Nada cambió en el código desde la corrida anterior (mismo fingerprint), así que unit tests, cobertura, E2E y arquitectura se tomaron de `.sdd-devkit/test-run.json` sin volver a ejecutarse. Se re-ejecutaron tipado, linter y build, que no están cubiertos por esa caché. Todo sigue en verde — cero fallos, cero omisiones. Persiste el mismo warning de presupuesto de bundle en el build (no bloqueante). Sonar sigue sin configurar (sin fila, no aplica).

## Verificaciones

Leyenda de estados: `✅` Aprobado · `❌` Fallido · `⏭️` Omitido · `⏸️` Pendiente · `—` No aplica · `ℹ️` Informativo.

| # | Check | Comando | Categoría | Estado | Detalle | Duración |
| - | ----- | ------- | --------- | ------ | ------- | -------- |
| 1 | tipado | `tsc -b --noEmit` (tsconfig.app.json + tsconfig.spec.json) | Bloqueante | ✅ Aprobado | 0 errores | ~2s |
| 2 | linter | `npm run lint` (eslint .) | Bloqueante | ✅ Aprobado | 0 errors, 0 warnings | ~2s |
| 3 | arquitectura | `node scripts/arch/verify.mjs` | Bloqueante | ✅ Aprobado | 18 criterios, 0 violaciones (5 estándares) | caché |
| 4 | unit tests | `npm test` (Vitest) | Bloqueante | ✅ Aprobado | 148 passed, 0 failed (17 archivos) | caché |
| 5 | coverage | `npm test` (misma corrida, v8) | Bloqueante | ✅ Aprobado | Statements 95.23%, Branches 85.29%, Functions 92.56%, Lines 96.15% (umbral 80%) | caché |
| 6 | build | `npm run build` (ng build) | Bloqueante | ✅ Aprobado | OK — bundle inicial 501.67 kB | 1.25s |
| 7 | e2e | `npx playwright test` | Bloqueante (el estándar de testing lo exige con **DEBE**) | ✅ Aprobado | 1 passed | caché |

### Detalle de checks fallidos

Sin checks fallidos.

## Próximas acciones

1. El build emitió un warning informativo: el bundle inicial (501.67 kB) excede el presupuesto configurado (500.00 kB) por 1.67 kB. No bloquea el veredicto, pero conviene revisar el presupuesto en `angular.json` o recortar el bundle.
2. Considerar configurar Sonar (`sonar-project.properties`) si se quiere análisis estático informativo en este cierre — hoy no está configurado y el check queda fuera del informe (no aplica).

<!-- quality-check:verdict=APPROVED · fingerprint=d637737e174639e1d74941145e7d89e07bfcd7e2 · generated=2026-09-12 -->
