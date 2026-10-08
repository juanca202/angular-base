# TC-035 — Dado un navegador sin `BarcodeDetector`, Cuando se inicia la recepción, Entonces se leen los QR con el lector en JavaScript

<!-- tc:status=Ready · testType=Integration · criterion=AC-022 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Integration
**Prioridad:** Media
**Criterio de aceptación:** AC-022 (Compatibilidad)
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
| 1 | Sistema | Quitar `BarcodeDetector` del entorno | La API no existe |
| 2 | Sistema | Iniciar la recepción con QR de prueba | Se usa el lector de reserva y se leen los fragmentos |

## Resultado esperado final

Sin `BarcodeDetector` la lectura sigue funcionando.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
