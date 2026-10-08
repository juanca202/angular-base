# TC-019 — Dado un resultado «datos inválidos» o «no reconstruible», Cuando el usuario elige reintentar, Entonces la recepción empieza de cero y los parciales no persisten

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-011 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Unit, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-011 (Flujos de proceso)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Provocar «datos inválidos» | Resultado de error |
| 2 | Usuario | Elegir «Reintentar» | El contador vuelve a 0 |
| 3 | Usuario | Recargar la app | No hay fragmentos persistidos |

## Resultado esperado final

Se reinicia desde cero y no queda nada persistido.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
