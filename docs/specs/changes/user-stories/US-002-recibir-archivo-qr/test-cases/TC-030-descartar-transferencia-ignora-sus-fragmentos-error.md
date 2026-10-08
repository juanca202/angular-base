# TC-030 — Dado una transferencia ajena pendiente de confirmar, Cuando el usuario la descarta, Entonces se ignoran sus fragmentos y se sigue con la propia

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-019 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Unit, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-019 (Interacción de usuario)
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
| 1 | Sistema | Entregar primero fragmentos de otra transferencia | Aparece nombre y tamaño de la ajena |
| 2 | Usuario | Descartarla | Sus fragmentos se ignoran |
| 3 | Sistema | Entregar la propia y confirmar | Se completa la propia |

## Resultado esperado final

La transferencia ajena se ignora y la propia se completa.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
