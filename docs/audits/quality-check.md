# Verificaciones automatizadas — US-002-recibir-archivo-qr

**Fecha:** 2026-10-08 18:12
**Rama:** feature/US-002-recibir-archivo-qr
**Commit:** 9fcd1a5
**Modo:** default
**Veredicto:** ✅ Aprobado
**Estándar de testing:** [`docs/standards/testing.md`](../standards/testing.md) (unit-testing, e2e-testing, http-api-mocks-msw; sin más clases de prueba que las fijas y e2e)

## Resumen

Se ejecutaron tipado, linter, validaciones de arquitectura, pruebas unitarias, cobertura, build y e2e. Todo pasa. La primera corrida falló por la regla `architecture/CR-002` (una feature importaba otra); se corrigió moviendo el historial a `shared/components` y se repitió la corrida completa.

## Verificaciones

Leyenda de estados: `✅` Correcto · `❌` Falla · `⏭️` Omitido · `⏸️` Pendiente · `—` No aplica · `ℹ️` Informativo.

| # | Check | Comando | Categoría | Estado | Detalle | Duración |
| - | ----- | ------- | --------- | ------ | ------- | -------- |
| 1 | tipado | `npx tsc --noEmit -p tsconfig.app.json` y `-p tsconfig.spec.json` | Bloqueante | ✅ Correcto | 0 errores | 2 s |
| 2 | linter | `npx eslint .` | Bloqueante | ✅ Correcto | 0 errores, 0 avisos | 2 s |
| 3 | arquitectura | `npm run arch` | Bloqueante | ✅ Correcto | 19 criterios, 0 violaciones | 2 s |
| 4 | pruebas unitarias | `npm test -- --no-watch` | Bloqueante | ✅ Correcto | 376 pasan, 0 fallan (41 archivos) | 6 s |
| 5 | cobertura | `npm test -- --no-watch` (umbral 80 % en `angular.json`) | Bloqueante | ✅ Correcto | sentencias 96,02 %, ramas 89,13 %, funciones 94,67 %, líneas 96,16 % | 6 s |
| 6 | build | `npm run build` | Bloqueante | ✅ Correcto | build correcto; aviso de presupuesto del bundle inicial (525,92 kB sobre 500 kB) | 2 s |
| 7 | e2e | `npx playwright test` (servidor propio en el puerto 4301) | Condicional | ✅ Correcto | 54 pasan, 1 omitida | 21 s |

### Detalle de checks fallidos

Sin checks fallidos.

Notas de la corrida:

- Primera corrida: `architecture/CR-002` (`no-feature-to-feature`) falló porque `features/receive/components/receive-page.ts` importaba `features/home/components/history-panel.ts`. Corrección autorizada: `HistoryPanel` y `HistoryList` pasaron a `shared/components` (commit `9fcd1a5`); la corrida completa se repitió y quedó en verde.
- Los e2e se ejecutaron contra `ng serve` en el puerto 4301 con una configuración temporal de Playwright (ya borrada): el puerto 4200, que usa la configuración del repositorio, lo ocupaba otro proyecto. No se ejecutó `npm run e2e` tal cual.
- El e2e omitido es `envío sin conexión › tras la primera carga con red, la app recargada sin conexión sigue enviando`, que ya venía omitido por US-001.
- El aviso de presupuesto del bundle inicial no bloquea (el límite de error es 1 MB) y no procede de la historia: la pantalla de recepción es un chunk diferido.

## Próximas acciones

1. Sin acciones bloqueantes.
2. Revisar el presupuesto del bundle inicial (525,92 kB frente a 500 kB de aviso).
3. Sonar no está configurado en el repositorio.

<!-- quality-check:verdict=APPROVED · fingerprint=a6e59f7141dc3bff835e28bc11681282ac3ca0d9 · generated=2026-10-08 -->
