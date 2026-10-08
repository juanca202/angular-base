# TC-011 — Dado una emisión en curso, Cuando el usuario cancela, Entonces se detiene la secuencia sin pedir confirmación y la copia guardada se conserva

<!-- tc:status=Ready · testType=E2E · criterion=AC-009 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-009 (Casos de uso)
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
| 2 | Usuario | Pulsar cancelar | Se detiene inmediatamente, sin diálogo de confirmación |
| 3 | Usuario | Abrir el historial | La copia del archivo enviado sigue presente |

## Resultado esperado final

La emisión se detiene, se liberan sus recursos y el historial conserva la copia.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
