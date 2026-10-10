# WI-003: Lectura fiable de QR binarios con la cámara de Chrome en Android

<!-- wi:status=Ready · type=spike -->
**Estado:** Ready
**Tipo:** spike
**Subtipo:** técnico
**Repositorio:** laboratorio-1
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../../changes/requirements/SRS-001-transferencia-qr/README.md) (FR-007, NFR-008, NFR-012, NFR-013), [US-002](../../../changes/user-stories/US-002-recibir-archivo-qr/README.md)
**Timebox:** Sin timebox formal: registro retrospectivo de pruebas hechas durante la implementación (2026-10-08 y 2026-10-09)
**Resolución:** Replanificado (US-002)

## Pregunta de investigación

¿Qué mecanismo de lectura (`BarcodeDetector`, `jsQR` o `zxing-wasm`) obtiene de forma fiable los bytes exactos de un QR binario con la cámara de un móvil Android con Chrome?

## Contexto

El [WI-002](../WI-002-spike-medicion-qr-android/README.md) validó la lectura de QR de 400 B con `jsQR` y vio que `BarcodeDetector` leía carga binaria. Al probar la aplicación real de extremo a extremo (laptop como emisor y móvil como receptor) el receptor no leía ningún QR. Este spike registra las pruebas que explicaron el fallo y llevaron a leer solo con `zxing-wasm`.

## Hipótesis

Creemos que `BarcodeDetector` con `jsQR` como reserva basta para leer los QR binarios del protocolo en Chrome para Android, porque el spike WI-002 los leyó con ambos.

## Preguntas a responder

- **Q-01 (Compatibilidad):** ¿Entrega `BarcodeDetector` los bytes exactos de un QR binario en el móvil de pruebas?
  - **Éxito:** el texto devuelto (`rawValue`) tiene los mismos bytes que el QR generado por el emisor, sin errores en llamadas sucesivas.
  - **Fallo:** devuelve texto vacío o rechaza las llamadas.
- **Q-02 (Rendimiento):** ¿Lee `jsQR` los QR de la secuencia con una tasa útil?
  - **Éxito:** lee de forma estable los fragmentos de la secuencia sin depender del detector nativo.
  - **Fallo:** lee una fracción mínima de los cuadros procesados.
- **Q-03 (Compatibilidad):** ¿Lee `zxing-wasm` los bytes exactos del QR sin depender de servicios del dispositivo ni del navegador?
  - **Éxito:** la secuencia se lee y el archivo se reconstruye en el móvil de pruebas.
  - **Fallo:** no lee los bytes exactos o requiere un servicio del dispositivo.

## Fuera de alcance

- Medir la tasa de lectura y los cuadros por segundo de `zxing-wasm` con QR de 1600 B con cámara real (queda como riesgo R-10 y R-11 del SRS-001).
- Safari/iOS y Firefox.
- El código producido **no se integra como prototipo**: no hubo rama `spike/`; las pruebas se hicieron sobre la implementación de la US-002 y su resultado quedó en `main`.

## Dependencias

- Móvil Android con Chrome 154 y cámara — receptor real.
- Laptop como emisor.
- Librerías `jsQR`, `zxing-wasm` y la API `BarcodeDetector` — mecanismos a comparar.

## Referencias

- **Spike previo:** [WI-002](../../../changes/requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md).
- **Diseño:** [WF-004](../../../changes/requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md).

## Enfoque del experimento

- [x] **IT-01** — Probar la aplicación de extremo a extremo con un laptop emisor y un móvil receptor, con el panel `?debug` (FR-027) para ubicar la etapa donde se pierde el QR.
- [x] **IT-02** — Medir con `BarcodeDetector` la lectura de un QR binario de 400 B generado como lo hace el emisor.
- [x] **IT-03** — Medir `jsQR` y el detector nativo en la secuencia (cuadros procesados y QR leídos).
- [x] **IT-04** — Sustituir el lector por `zxing-wasm` (lector `QRCode`) y repetir la lectura.
- [x] **IT-05** — Redactar `spike-report.md`.

## Entregable

- [`spike-report.md`](../../../changes/requirements/SRS-001-transferencia-qr/references/spike-report-WI-003-lectura-qr-android.md) con veredicto y marca oculta `spike:verdict`.
- Sin evidencia en `assets/`: las cifras proceden de las notas de las pruebas con dispositivos, incorporadas al informe.
- Sin rama de referencia: ver *Fuera de alcance*.

## Observaciones

- Las pruebas se registraron a posteriori; no hay mediciones en bruto, solo las cifras citadas en el informe.
