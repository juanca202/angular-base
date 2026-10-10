# TK-003: Lector de QR con cámara: lectura continua con ZXing

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un servicio que active la cámara trasera y lea QR de forma continua sin que el usuario tome fotografías, entregando los bytes de cada QR detectado. Lee los bytes de cada QR solo con `zxing-wasm` (WebAssembly), en un Web Worker, sin usar `BarcodeDetector` ni `jsQR`, y devuelve también dónde está el QR para dibujar su recuadro. Admite una sola lectura a la vez, libera la cámara al detenerse, e informa con errores tipados cuando no hay cámara, el permiso está denegado o el navegador no es compatible, sin iniciar la lectura en esos casos.

## Dependencias

- `navigator.mediaDevices.getUserMedia` — acceso a la cámara
- `zxing-wasm` (lector `QRCode`) — único lector de QR; se añade a `package.json` y su `.wasm` se sirve con la aplicación (`/zxing/`) y se precachea en el service worker
- Web Worker — la lectura corre fuera del hilo principal
- Decorador `@Service` de Angular — servicio con ciclo de vida de la cámara

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Referencia de lectura:** `spike/web/app.js` en la rama `spike/WI-002-medicion-qr-android` (lectura del spike con `jsQR` y `BarcodeDetector`, ya descartados; nunca para mergear ni copiar tal cual)
- **Referencia de pruebas manuales:** `spike/GUIA-MEDICION.md` en la misma rama
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-015: decorador `@Service` para singletons](../../../../adr/ADR-015-service-decorator-for-singletons.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)
- **Diseño:** no aplica (servicio sin interfaz; la vista de cámara está en la tarea de la pantalla de recepción)

## Archivos afectados

```text
laboratorio-1/
├── ~ package.json                                  # añade la dependencia zxing-wasm
├── ~ angular.json                                  # copia zxing_reader.wasm a /zxing/
├── ~ ngsw-config.json                              # precachea /zxing/**
└── src/app/features/receive/
    ├── models/
    │   └── + camera-error.ts                       # sin cámara, permiso denegado, no compatible
    └── services/
        ├── + qr-camera-reader.ts                   # cámara, bucle de lectura y liberación
        ├── + qr-camera-reader.spec.ts
        ├── + qr-decoder.ts                         # captura, worker y posición del QR
        ├── + qr-decoder.spec.ts
        ├── + qr-frame-reader.ts                    # lectura con zxing-wasm
        ├── + qr-frame-reader.spec.ts
        └── + qr.worker.ts                          # lector en un Web Worker
```

## Plan de implementación

- [x] **IT-01** — Definir los errores tipados de cámara (sin cámara, permiso denegado, navegador no compatible)
- [x] **IT-02** — Implementar el decodificador con `zxing-wasm` (en un Web Worker, o en la página si no hay workers), devolviendo los bytes del QR y su posición en el cuadro
- [x] **IT-03** — Implementar la lectura continua con la cámara trasera que emite cada QR leído sin intervención del usuario
- [x] **IT-04** — Impedir iniciar una lectura nueva mientras otra está en curso
- [x] **IT-05** — Liberar la cámara al detener, cancelar o completar la lectura
- [x] **IT-06** — Probar con dobles de la cámara y del lector: lectura en el worker y en la página, posición del QR, errores tipados, una sola lectura a la vez y liberación
- [x] **IT-07** — Documentar con TSDoc
- [x] **IT-08** — Servir el `.wasm` de ZXing con la aplicación, precachearlo y cargarlo al empezar la recepción, antes del primer cuadro (NFR-013)
