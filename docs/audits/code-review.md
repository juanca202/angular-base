# Code Review — Migración de fitness functions a ESLint y limpieza de compuertas de calidad

**Fecha:** 2026-09-11 23:45
**Rama:** main
**Commit:** 130352e (working tree con cambios sin commitear)
**Alcance del diff:** rama vs base, incluidos los cambios sin commitear — 28 archivos (21 modificados, 7 nuevos), +677/−418 líneas aprox.
**Modo:** default
**Base del diff:** origin/main @ 130352e (mismo commit que HEAD — no hay divergencia, todo el diff es trabajo sin commitear)
**Veredicto:** ✅ Aprobado — cero hallazgos bloqueantes; un hallazgo menor no bloqueante.

## Resumen

Se revisó la migración de varios criterios de cumplimiento (CR-004, CR-009, CR-013 a CR-016, CR-001/CR-002 de coding-style, CR-002 de frontend, CR-008 de testing) de scripts propios a reglas de ESLint, el rediseño de `scripts/arch/checks/*.mjs` para auditar configuración en vez de re-ejecutar herramientas que ya son compuertas independientes (`npm run lint`, `npm test`), la salida coloreada del runner de arquitectura, y la limpieza de ~35 usos de `any` en specs y mocks de prueba. El diseño es sólido y está verificado en profundidad (tipado, linter, arquitectura, tests, build y una comprobación empírica adicional sobre el umbral de cobertura, ver Feedback adicional). Un solo hallazgo menor, no bloqueante: un import relativo en `error.ts` que rompe la convención de path alias del resto del repo.

## Intención detectada

Sin `US-XXX`/`WI-XXX`/artefacto de especificación ni PR: el commit base y el `HEAD` coinciden (todo el trabajo está sin commitear sobre `main`), así que no hay rango de commits que leer. La intención se reconstruye de la conversación de la sesión: (1) migrar a ESLint los criterios de arquitectura que son expresables como reglas de lint, evitando que `npm run arch` duplique el trabajo de compuertas de calidad independientes (`npm run lint`, `npm test`) — auditando que la regla/umbral esté cableado en vez de re-ejecutar la herramienta; (2) colorear PASS/WARN/FAIL en el runner, propagando el color a través de subprocesos con pipe; (3) corregir `npm run lint` a cero errores, incluyendo un problema de configuración de TypeScript (`$localize` sin tipar globalmente tras quitar un import que, sin saberlo, sostenía esa declaración ambiental) descubierto durante la validación. Es una base más débil que un artefacto formal, pero está bien sustentada por el propio historial de la conversación y por las verificaciones ejecutadas en cada paso.

## Hallazgos

Leyenda de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Sin hallazgos.

### Análisis semántico (intención)

✅ Sin hallazgos. Cada pieza del diff traza a uno de los tres objetivos de la sesión; no hay scope creep. El caso más sutil —si CR-005 (cobertura) sigue verificando de verdad su propio enunciado ("cobertura ≥ 80%") tras dejar de ejecutar la suite— se investigó a fondo y se confirma correcto: ver Feedback adicional.

### Arquitectura y diseño

✅ Sin hallazgos bloqueantes. Un hallazgo menor:

- 🟡 `[ISO-25010: Mantenibilidad]` Import relativo rompe la convención de path alias — **Qué:** `src/app/core/components/error/error.ts:11` importa `environment` como `'../../../../environments/environment'`; verifiqué que es el **único** caso en todo `src/app` — los otros cinco archivos que importan `environment` (`app.config.ts`, `client-interceptor.ts`, `async-resources.ts`, `app-manager.ts`, `session.ts`) usan `@/environments/environment`. **Por qué:** rompe la consistencia que el resto del repo mantiene sin excepciones, y es invisible para la regla `project-rules/require-layer-path-alias` porque `environments/` no es una de las tres capas declaradas (`core`/`shared`/`features`) que esa regla vigila — así que `npm run lint` queda en verde pese a la regresión. **Impacto:** bajo hoy (el import resuelve igual), pero si `error.ts` alguna vez se reubica, esta importación se rompe en silencio mientras el resto del repo, protegido por el alias, no se entera. **Sugerencia:** revertir a `import { environment } from '@/environments/environment';`, igual que el resto de callers. No forma parte de la migración de esta rama — no lo corrijo por mi cuenta a falta de que confirmes que quieres tocar este archivo.

### Dimensiones no evaluadas

Ninguna.

### Feedback adicional

- **Buen trabajo:** el patrón `requireRuleSeverity(config, ruleId, minSeverity, { contains, label })` en `scripts/arch/lib/eslint-config.mjs` es limpio y evita repetir la lógica de severidad en cada check; los cinco archivos `checks/*.mjs` lo reutilizan de forma consistente.
- **Verificación empírica adicional (no un hallazgo, una confirmación):** el punto más delicado del diff es que `testing.mjs` (CR-005) dejó de ejecutar `ng test --coverage` y solo audita que `angular.json` declare `coverageThresholds ≥ 80`. Para confirmar que esto no abre un agujero, subí el umbral a 100% temporalmente y corrí `ng test`: **falla duro (`exit 1`) con `ERROR: Coverage for … does not meet global threshold`**. Es decir, `@angular/build:unit-test` sí hace cumplir `coverageThresholds` como gate real, no solo como reporte — exactamente la garantía que el comentario del código afirma. Esto pone a CR-005 en pie de igualdad con CR-004 (que audita que la regla ESLint esté en `error`, confiando en que `npm run lint` la aplique): en ambos casos, la compuerta de arch verifica que la *política* esté bien cableada, y una compuerta *distinta y ya existente* (`npm test` / `npm run lint`) es la que de verdad detecta la violación. No es una regresión, es el mismo patrón aplicado con consistencia.
- **Nitpick 💡:** `eslint.config.mjs` ya tiene 12 bloques de configuración con comentarios de trazabilidad por CR/ADR — sigue siendo legible, pero si crece con más CRs podría valer la pena partirlo en módulos por dominio (`eslint/architecture.mjs`, `eslint/frontend.mjs`…) e importarlos en el archivo raíz. No urge.
- Los reemplazos de `any` por `unknown`/tipos concretos (`ActivatedRouteSnapshot`, `VersionEvent`, `WritableSignal<boolean>`, `vi.mocked(...)`) están bien dirigidos: usan el tipo real de la librería en vez de un cast genérico, y en dos casos (`app-manager.spec.ts`) el tipado más estricto de hecho **encontró** payloads de prueba que no coincidían con la forma real de `VersionEvent` — typing real pagando su costo, no solo silenciando el linter.

## Próximas acciones

1. (Opcional, no bloqueante) Revertir `src/app/core/components/error/error.ts:11` al path alias `@/environments/environment` para mantener la consistencia del resto del repo.

## Justificaciones aceptadas

Ninguna.

<!-- code-review:verdict=APPROVED · mode=default · fingerprint=d637737e174639e1d74941145e7d89e07bfcd7e2 · base=130352e · generated=2026-09-12 -->
