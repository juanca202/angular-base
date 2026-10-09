# TC-035 — Dado un navegador sin `BarcodeDetector` (o con su servicio no disponible), Cuando se inicia la recepción, Entonces los QR se leen igual con `zxing-wasm`

<!-- tc:status=Ready · testType=Integration · criterion=AC-022 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Integration
**Prioridad:** Media
**Criterio de aceptación:** AC-022 (Compatibilidad)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-09

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Quitar `BarcodeDetector` del entorno, o hacer que `detect` falle con `NotSupportedError` | La API no existe o no está disponible |
| 2 | Sistema | Iniciar la recepción con QR de prueba | Los fragmentos se leen con `zxing-wasm`, sin intentar usar `BarcodeDetector` |

## Resultado esperado final

La lectura funciona igual sin `BarcodeDetector`: el único lector es `zxing-wasm` y el código del receptor no usa `BarcodeDetector` ni `jsQR`.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Reemplaza al caso anterior «lector de reserva»: desde 2026-10-09 no hay lector de reserva, ZXing es el único lector (SRS-001 NFR-012).
