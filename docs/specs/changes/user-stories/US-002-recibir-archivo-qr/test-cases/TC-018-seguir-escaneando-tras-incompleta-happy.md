# TC-018 — Dado un resultado «incompleta», Cuando el usuario elige seguir escaneando, Entonces se conservan los fragmentos válidos ya recibidos

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-011 · parent=US-002 -->
**Perspectiva:** Happy Path
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
| 1 | Sistema | Recibir el 50 % y terminar la lectura | Resultado «incompleta» |
| 2 | Usuario | Elegir «Seguir escaneando» y entregar el resto | Se completa sin repetir los ya recibidos |

## Resultado esperado final

El progreso previo se conserva y la transferencia se completa.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
