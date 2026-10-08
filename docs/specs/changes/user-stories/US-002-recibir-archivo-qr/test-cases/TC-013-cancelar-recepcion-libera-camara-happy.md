# TC-013 — Dado una recepción en curso con fragmentos parciales, Cuando el usuario cancela, Entonces se detiene, se descartan los parciales y se libera la cámara sin confirmar

<!-- tc:status=Ready · testType=E2E · criterion=AC-008 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-008 (Casos de uso)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo). Bucle local o cámara simulada.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Iniciar la recepción y recibir algunos fragmentos | Hay parciales en memoria |
| 2 | Usuario | Pulsar cancelar | Se detiene sin diálogo de confirmación |
| 3 | Usuario | Volver a «Recibir» | No quedan fragmentos previos y la cámara se liberó |

## Resultado esperado final

Proceso detenido, parciales descartados y cámara liberada.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
