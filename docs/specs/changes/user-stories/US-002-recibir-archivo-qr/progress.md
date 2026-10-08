# Progreso

## US-002-recibir-archivo-qr

<!-- work:id=US-002-recibir-archivo-qr · status=In Progress -->
**Estado:** In Progress
**Tipo:** historia de usuario
**Fecha de creación:** 2026-10-08 15:35
**Ultima actualizacion:** 2026-10-08 15:40

## Unidades

### TK-001: Decodificador y reensamblador del protocolo de fragmentación

<!-- unit:id=TK-001 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 16:00
**Finalizado:** 2026-10-08 16:10
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/shared/utils/qr-protocol/reception-result.ts
+ src/app/shared/utils/qr-protocol/parse-fragment.ts
+ src/app/shared/utils/qr-protocol/parse-fragment.spec.ts
+ src/app/shared/utils/qr-protocol/fragment-assembler.ts
+ src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts
~ src/app/shared/utils/qr-protocol/index.ts
```

**Notas:**
- La rama de US-002 incorporó `feature/US-001-enviar-archivo-qr` mediante un merge (`f349803`) para disponer del protocolo y del almacenamiento privado, que aún no están en `main`; los conflictos de `package.json` y `package-lock.json` se resolvieron conservando `jsqr` y `qrcode`. Al integrar, US-001 debe entrar primero.
- Pruebas del módulo `qr-protocol`: 38 de 38 en verde (incluye las de US-001); lint y typecheck sin errores.

**Decisiones adicionales:**
- `FragmentAssembler` fija la transferencia con el primer fragmento válido (o con el identificador del constructor) y descarta los de otra transferencia; expone `accept`, `progress`, `metadata`, `finish` y `reset` para que el gestor (TK-004) lo use por transferencia candidata.
- «No reconstruible» cubre metadatos mal formados o cuyo tamaño no coincide con la suma de los datos; «datos inválidos» es el fallo del SHA-256 con todos los fragmentos presentes.
- Un fragmento cuyo total difiere del ya fijado se descarta como inválido.

**Cobertura de test cases:**
- TC-002, TC-003, TC-004, TC-005, TC-010 (lógica), TC-011, TC-012 y TC-023 se cubren con pruebas unitarias del módulo; sus pasos de interfaz se cubren en TK-004 a TK-007.

### TK-002: Guardado del archivo recibido en el almacenamiento privado

<!-- unit:id=TK-002 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 16:15
**Finalizado:** 2026-10-08 16:20
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/features/receive/services/received-file-saver.ts
+ src/app/features/receive/services/received-file-saver.spec.ts
```

**Notas:**
- Pruebas del archivo: 5 de 5 en verde; lint y typecheck sin errores.
- La cuota agotada se propaga como `StorageQuotaError` sin registrar nada; conservar el archivo en memoria para ofrecer su descarga es responsabilidad del gestor y la pantalla (TK-004 y TK-006).

**Decisiones adicionales:**
- No se renombra el archivo para evitar sobrescrituras: `PrivateStorage` guarda cada copia con un identificador propio, así que un archivo con el mismo nombre convive con el existente como un registro distinto y conserva su nombre original para mostrarlo y exportarlo.
- La solicitud de almacenamiento persistente es de mejor esfuerzo: se hace tras guardar, no se ejecuta si el guardado falla y su rechazo no afecta al resultado.

**Cobertura de test cases:**
- TC-014, TC-015, TC-022 y TC-038 se cubren con pruebas unitarias sobre un doble de `PrivateStorage`; la prueba de integración con el OPFS real queda en las pruebas de `PrivateStorage` (US-001) y en TK-007.

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

<!-- unit:id=TK-004 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 16:25
**Finalizado:** 2026-10-08 16:40
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/features/receive/models/receive-state.ts
+ src/app/features/receive/services/receive-manager.ts
+ src/app/features/receive/services/receive-manager.spec.ts
```

**Notas:**
- Pruebas del archivo: 28 de 28 en verde (49 de 49 en `features/receive`); lint y typecheck sin errores.
- La API para la pantalla (TK-005 y TK-006) son las señales `phase`, `progress`, `pending`, `result` y `cameraError`, y los métodos `start`, `confirm`, `discard`, `finishReading`, `continueScanning`, `retry` y `cancel`.

**Decisiones adicionales:**
- Cada transferencia vista por la cámara tiene su propio `FragmentAssembler`, para que una secuencia ajena en cuadro no se mezcle con la del usuario; la primera con metadatos legibles se ofrece para confirmar, al confirmar se descartan las demás y al descartar se ofrece la siguiente.
- Antes de confirmar se muestra el avance de la transferencia pendiente (o de la más avanzada si aún no hay metadatos) y nunca se completa ni se guarda.
- Se añade el resultado `save-failed` (archivo verificado pero error de guardado distinto de la cuota) además de los cuatro del criterio y `storage-full`, para no dejar la pantalla sin estado si el guardado falla por otra causa; TK-006 debe mostrarlo con un mensaje genérico.
- El tiempo restante se estima con el ritmo de fragmentos distintos recibidos desde el primero; hasta tener dos fragmentos es `null`.
- La cámara se libera siempre antes de reconstruir y guardar, y también al terminar la lectura a mano.

**Cobertura de test cases:**
- TC-006 y TC-007 (presentación), TC-013 (cancelar en interfaz), TC-016 a TC-019 (interfaz), TC-020, TC-021, TC-029 a TC-033 (pasos de pantalla) se cubren aquí solo en la lógica del gestor; su parte visible queda en TK-005 y TK-006.

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
