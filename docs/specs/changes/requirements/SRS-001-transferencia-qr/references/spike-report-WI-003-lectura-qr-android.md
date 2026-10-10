# Informe del spike WI-003: Lectura fiable de QR binarios con la cámara de Chrome en Android

<!-- spike:verdict=VIABLE_WITH_REWORK · timebox=none/none · branch=none · head=4beacdf · generated=2026-10-09 -->
**Spike:** [WI-003: Lectura fiable de QR binarios con la cámara de Chrome en Android](../../../../archived/work-items/WI-003-spike-lectura-qr-android/README.md)
**Veredicto:** ⚠️ Viable con trabajo
**Subtipo:** técnico
**Timebox:** Sin timebox formal · consumido: dos rondas de pruebas (2026-10-08 y 2026-10-09)
**Rama de referencia:** ninguna; la solución quedó integrada en `main` (commits `d1ca6f8` y `4beacdf`)
**Fecha:** 2026-10-09
**Autor:** juanca202 / Claude

## Resumen ejecutivo

La lectura con `BarcodeDetector` y `jsQR` no sirve para esta aplicación en el móvil de pruebas: el detector nativo devuelve el texto vacío con carga binaria y, después, falla siempre con `Barcode detection service unavailable`; `jsQR` solo leyó 13 QR en 651 cuadros. `zxing-wasm` lee los bytes exactos sin depender de ningún servicio del dispositivo. Decisión: leer solo con `zxing-wasm` (SRS-001: NFR-008, NFR-012, NFR-013). Queda sin medir con cámara real la tasa de lectura de QR de 1600 B y los cuadros por segundo.

## Qué se probó

Aplicación real (no un prototipo) con un laptop como emisor y un móvil Android con Chrome como receptor, con el panel `?debug`.

| `IT-XX` | Planificado | Ejecutado | Desviación |
|---------|-------------|-----------|------------|
| IT-01 | Prueba de extremo a extremo con panel `?debug` | Hecho (2026-10-08) | Ninguna |
| IT-02 | `BarcodeDetector` con QR binario de 400 B | 0 de 400 B en `rawValue`; `InvalidStateError` con el elemento `<video>` | Ninguna |
| IT-03 | `jsQR` y detector nativo en la secuencia | `jsQR` ~10 cuadros/s, 135 ms por cuadro, 13 QR en 651 cuadros; el detector nativo rechazaba cada `detect` | La densidad de esa ronda era 800 B |
| IT-04 | Lectura con `zxing-wasm` | Lee los bytes exactos; `.wasm` de unos 940 KB | No se midió la tasa con 1600 B |
| IT-05 | Informe | Este documento | Registro retrospectivo |

## Resultados por pregunta

| `Q-XX` | Criterio de éxito | Resultado observado | Resultado | Evidencia |
|--------|-------------------|---------------------|-----------|-----------|
| Q-01 | Bytes exactos del QR sin errores | `rawValue` vacío con QR binario (0 de 400 B); `InvalidStateError` con `<video>`; luego `NotSupportedError: Barcode detection service unavailable` en cada `detect`; `getSupportedFormats()` no lo resolvió | ❌ No cumple | Notas de las pruebas (2026-10-08 y 2026-10-09) |
| Q-02 | Lectura estable sin detector nativo | 13 QR en 651 cuadros (~10 cuadros/s, 135 ms por cuadro) | ❌ No cumple | Notas de las pruebas (2026-10-09) |
| Q-03 | Lee la secuencia sin servicios del dispositivo | Lee los bytes exactos; funciona sin servicios de Google Play | ✅ Cumple (tasa con 1600 B sin medir) | Commits `d1ca6f8`, `4beacdf` |

## Hallazgos

### Discrepancia con el WI-002

El [WI-002](spike-report-WI-002-medicion-qr-android.md) registró que `BarcodeDetector` leía carga binaria (51 fragmentos únicos válidos en una prueba). La prueba posterior con la aplicación real devolvió el texto vacío. No se determinó la causa de la diferencia; la decisión no depende de ella porque el detector nativo ni siquiera está disponible en el móvil de pruebas.

### Cuadro y detector

`BarcodeDetector.detect` lanzaba `InvalidStateError` al recibir el elemento `<video>`; recibiendo el cuadro ya capturado dejaba de lanzarlo.

## Diagnóstico

El detector nativo depende de un servicio del dispositivo (ligado a los servicios de Google Play) que no está disponible en el móvil de pruebas; `jsQR` es demasiado lento para la secuencia (135 ms por cuadro). Son limitaciones del enfoque, no del prototipo.

## Consideraciones para la implementación definitiva

1. **Decisiones tomadas:** leer solo con `zxing-wasm` (lector `QRCode`); descartar `BarcodeDetector` y `jsQR`, también como reserva; el `.wasm` se sirve con la aplicación, se precachea con el service worker y se carga al empezar la recepción (NFR-012, NFR-013).
2. **Deuda que no debe heredarse:** la lectura por el hilo principal con `jsQR` y el detector nativo.
3. **Riesgos detectados:** 940 KB adicionales de `.wasm`; tasa de lectura con QR de 1600 B (149 módulos por lado) sin medir; si no es estable, bajar la densidad por defecto (R-10, R-11 del SRS-001).
4. **Dependencias confirmadas:** `zxing-wasm`.
5. **Estimación orientativa:** ya implementado.

## Impacto en el artefacto / próximo paso

Incorporado al [SRS-001](../README.md) (stack, NFR-008, NFR-012, NFR-013, R-10, R-11) y a la [US-002](../../../../changes/user-stories/US-002-recibir-archivo-qr/README.md). Pendiente: serie de 10 lecturas a unos 30 cm con QR de 1600 B con cámara real.
