# TC-010 — Dado una secuencia en emisión, Cuando se completan tres vueltas sin cancelar, Entonces el emisor sigue mostrando la secuencia desde el inicio

<!-- tc:status=Ready · testType=E2E · criterion=AC-008 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-008 (Flujos de proceso)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1KB.bin [propuesto] | Binario determinista de 1 KB (1 024 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Elegir prueba-1KB.bin (pocos QR) | Comienza la emisión |
| 2 | Usuario | Esperar tres vueltas completas | La secuencia vuelve a empezar cada vez y sigue mostrándose |

## Resultado esperado final

Tras tres vueltas el emisor continúa en bucle hasta que el usuario cancele.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
