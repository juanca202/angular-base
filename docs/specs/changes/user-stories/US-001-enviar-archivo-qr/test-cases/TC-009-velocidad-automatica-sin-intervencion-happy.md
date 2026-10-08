# TC-009 — Dado un archivo en emisión, Cuando pasan varios segundos, Entonces los QR cambian secuencialmente sin intervención del usuario

<!-- tc:status=Ready · testType=E2E · criterion=AC-007 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-007 (Salidas del sistema)
**Artefacto padre:** US-001
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
| 1 | Usuario | Elegir prueba-100KB.bin | Comienza la emisión |
| 2 | Usuario | No interactuar durante 10 s | El QR cambia de forma continua a velocidad automática |

## Resultado esperado final

La secuencia avanza sola; el usuario no define la velocidad.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
