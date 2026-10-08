# Progreso

## US-002-recibir-archivo-qr

<!-- work:id=US-002-recibir-archivo-qr · status=In Progress -->
**Estado:** In Progress
**Tipo:** historia de usuario
**Fecha de creación:** 2026-10-08 15:35
**Ultima actualizacion:** 2026-10-08 15:40

## Unidades

### TK-001: Decodificador y reensamblador del protocolo de fragmentación

<!-- unit:id=TK-001 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-001 de US-001 (protocolo), aún sin implementar.

### TK-002: Guardado del archivo recibido en el almacenamiento privado

<!-- unit:id=TK-002 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-002 de US-001 (almacenamiento privado), aún sin implementar.

### TK-003: Lector de QR con cámara: lectura continua y lector de reserva

<!-- unit:id=TK-003 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 15:35
**Finalizado:** 2026-10-08 15:40
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ package.json
~ package-lock.json
+ src/app/features/receive/models/camera-error.ts
+ src/app/features/receive/services/qr-decoder.ts
+ src/app/features/receive/services/qr-decoder.spec.ts
+ src/app/features/receive/services/qr-camera-reader.ts
+ src/app/features/receive/services/qr-camera-reader.spec.ts
```

**Notas:**
- Pruebas de los archivos afectados: 16 de 16 en verde; lint y typecheck sin errores; `ng build` compila.
- El aviso de presupuesto del bundle inicial (501,71 kB sobre 500 kB) lo emite el build; `jsqr` aún no se importa desde ninguna ruta, así que no lo causa esta unidad.

**Decisiones adicionales:**
- `BarcodeDetector` devuelve texto; se convierte a bytes con el código de cada carácter (latin1), como validó el spike WI-002.
- El lector se expone como `start(video, onQr)` / `stop()` con la señal `active`; una sola lectura a la vez, y errores tipados `CameraError` con código `no-camera`, `permission-denied` o `unsupported`.
- La captura de fotograma para `jsQR` es un método público (`grabFrame`) para poder sustituirlo en pruebas, porque el entorno de pruebas unitarias no tiene canvas.

**Cobertura de test cases:**
- TC-020, TC-021 y TC-033 incluyen pasos E2E: aquí solo se cubre la parte unitaria; los E2E se escriben en TK-007.
- TC-035 está pensado como integración y se cubre con pruebas unitarias con `jsQR` simulado; la lectura real con `jsQR` se podrá probar cuando exista el generador de QR de US-001.
- TC-001, TC-034 y TC-036 requieren cámara real: pruebas manuales en TK-007.

### TK-004: Gestor de la recepción: estados, confirmación y resultados

<!-- unit:id=TK-004 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-001 y TK-002.

### TK-005: Pantalla de recepción: cámara, progreso y confirmación

<!-- unit:id=TK-005 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-004.

### TK-006: Pantalla de resultado y previsualización segura

<!-- unit:id=TK-006 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-004 y de tareas de US-003.

### TK-007: Validación con móviles y escenarios E2E de la recepción

<!-- unit:id=TK-007 · status=Pending -->
**Estado:** Pending

**Notas:**
- Excluida de esta ejecución: depende de TK-005, TK-006 y de tareas de US-001.
