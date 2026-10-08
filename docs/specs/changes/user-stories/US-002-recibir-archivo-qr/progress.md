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

<!-- unit:id=TK-005 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 16:45
**Finalizado:** 2026-10-08 17:05
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ angular.json
~ src/app/app.routes.ts
+ src/app/shared/utils/format.ts
+ src/app/shared/utils/format.spec.ts
+ src/app/features/receive/components/receive-page.ts
+ src/app/features/receive/components/receive-page.html
+ src/app/features/receive/components/receive-page.spec.ts
+ src/app/features/receive/components/camera-view.ts
+ src/app/features/receive/components/receive-progress.ts
+ src/app/features/receive/components/transfer-confirmation.ts
```

**Notas:**
- Pruebas de los archivos afectados: 18 de 18 en verde (pantalla) y las de `format`; lint y typecheck sin errores; `ng build` compila con la ruta `/recibir` en un chunk diferido.
- El resultado de la recepción (fase `result`) aún no tiene vista: se añade en TK-006, sobre esta misma pantalla.
- «Cancelar» navega a `/`, que existirá cuando se implemente la pantalla de inicio de US-003; hasta entonces cae en la página de error 404.
- El aviso de presupuesto del bundle inicial (513,98 kB sobre 500 kB) no viene de esta unidad: `receive-page` es un chunk diferido. No se ha comprobado qué lo hace crecer respecto a la medición de TK-003 (501,71 kB); el cambio entre ambas mediciones incluye el merge de US-001.
- No se ha comprobado la regla de axe `video-caption` sobre el `<video>` de la cámara (está `muted`); queda para los E2E de TK-007.

**Decisiones adicionales:**
- La barra de progreso es un `<progress>` nativo (accesible y sin estilos en línea) en lugar de una barra con ancho calculado.
- Los formateadores de tamaño y duración se extraen a `shared/utils/format.ts`; `send-page` mantiene sus copias locales para no tocar la unidad de US-001 (consolidar queda como mejora pendiente).
- La vista de cámara permanece en el DOM, oculta, cuando hay un error de cámara, para que «Reintentar» pueda volver a asociar el flujo al mismo `<video>`.
- Se añade `jsqr` a `allowedCommonJsDependencies` de `angular.json`, igual que `qrcode` en US-001, para silenciar el aviso de módulo no ESM.

**Cobertura de test cases:**
- TC-006 y TC-007: la presentación se prueba con pruebas de componente sobre un gestor simulado (no E2E); el ancho de 360 px a 1280 px de AC-017 no se puede comprobar en el entorno de pruebas unitarias y queda para TK-007.
- TC-020 y TC-021 (E2E) se cubren aquí solo con pruebas de componente por código de error de cámara; los E2E quedan en TK-007.
- TC-029, TC-032 y TC-033 se cubren con pruebas de componente; la parte con cámara real queda en TK-007.

### TK-006: Pantalla de resultado y previsualización segura

<!-- unit:id=TK-006 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 18:00
**Finalizado:** 2026-10-08 18:40
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ src/app/features/home/components/home-page.ts
~ src/app/features/home/components/home-page.html
+ src/app/features/home/components/history-panel.ts
+ src/app/features/home/components/history-panel.html
~ src/app/features/receive/components/receive-page.ts
~ src/app/features/receive/components/receive-page.html
~ src/app/features/receive/components/receive-page.spec.ts
~ src/app/features/receive/components/receive-progress.ts
~ src/app/features/receive/components/transfer-confirmation.ts
+ src/app/features/receive/components/file-preview.ts
+ src/app/features/receive/components/file-preview.spec.ts
+ src/app/features/receive/components/result-card.ts
+ src/app/features/receive/components/result-card.spec.ts
+ src/app/features/receive/services/safe-file-opener.ts
+ src/app/features/receive/services/safe-file-opener.spec.ts
~ src/app/features/receive/services/receive-manager.spec.ts
~ src/app/shared/utils/format.ts
~ src/app/shared/utils/format.spec.ts
```

**Notas:**
- Antes de implementar se hizo un merge de `main` en la rama (`59b8f40`): US-003 ya estaba integrada, así que se reutilizan su lista de historial y su exportación en lugar de versiones provisionales.
- Pruebas de `features` y `shared/utils`: 200 de 200 en verde; lint y typecheck sin errores; `ng build` compila.
- Comprobación manual con un script de Playwright desechable (no se conserva; los E2E definitivos son de TK-007) y la cámara simulada de Chromium: la pantalla de lectura y la tarjeta de «incompleta» no tienen desplazamiento horizontal a 360 px ni a 1280 px. Los demás resultados (completada, datos inválidos, no reconstruible, almacenamiento lleno) no se comprobaron en navegador a esos anchos.
- No se ejecutó axe sobre estas pantallas; queda para TK-007.
- En esa comprobación los iconos (`ft-icon`) no se dibujaron y los botones salieron sin tema de Material; es igual en toda la aplicación (la pantalla de inicio usa los mismos), así que no se trató aquí.
- El aviso de presupuesto del bundle inicial sube a 525,92 kB (500 kB de límite); `receive-page` es un chunk diferido, así que no es el origen, y el aviso ya venía de US-001 y US-003.
- Se corrigió una prueba intermitente de `receive-manager.spec.ts` (TK-004): esperaba el SHA-256 por tiempo simulado, y bajo carga fallaba; ahora espera por estado.

- Retrabajo de cierre (`quality-check`): la validación de arquitectura `architecture/CR-002` (`no-feature-to-feature`) falló porque `receive-page` importaba `HistoryPanel` de `features/home`. Se movieron `HistoryPanel` y `HistoryList` a `shared/components/history-panel/` y `shared/components/history-list/` y se actualizaron los imports de `home-page` y `receive-page`; sin cambios de comportamiento (376 pruebas siguen en verde).

**Decisiones adicionales:**
- Se extrae el historial de la pantalla de inicio (filtro, lista y acciones) al componente `HistoryPanel` (primero en `features/home`, luego en `shared/components` por la regla de capas) para reutilizarlo bajo el resultado de la recepción sin duplicar su lógica; `HomePage` solo conserva los botones Enviar y Recibir y sus 15 pruebas siguen en verde sin cambios.
- Apertura segura: solo se muestran en una pestaña nueva (con `noopener`) las imágenes ráster, el PDF y el texto plano; SVG, HTML y cualquier otro tipo se descargan, porque una URL de blob abierta como documento comparte el origen de la aplicación y ejecutaría sus scripts. La previsualización de un SVG se dibuja como `<img>`, donde nunca se ejecutan scripts.
- «Descargar archivo» (almacenamiento lleno o fallo de guardado) usa `FileExport.download` de US-003.
- En fase de resultado se oculta «Cancelar» y se ofrece «Volver al inicio»; la vista de cámara sigue en el DOM, oculta, para poder seguir escaneando o reintentar.
- Si «incompleta» se declara sin haber leído ningún fragmento, la tarjeta dice que no se leyó ninguno en lugar de «0 de 0».
- La fórmula de `formatSize` se reutiliza de `shared/utils/format-size.ts` (US-003); `format.ts` queda solo con `formatSeconds`.

**Cobertura de test cases:**
- TC-016, TC-017 y TC-024 (E2E o con navegador) se cubren con pruebas de componente y de servicio; la ejecución real de un SVG con script en el navegador queda para TK-007.
- TC-009 a TC-012, TC-018, TC-019, TC-022 y TC-028 se cubren con pruebas de componente sobre un gestor simulado; sus E2E quedan en TK-007.
- TC-027 (360 a 1280 px) se comprobó a mano con Playwright solo en lectura y en «incompleta»; el E2E definitivo es de TK-007.

### TK-007: Validación con móviles y escenarios E2E de la recepción

<!-- unit:id=TK-007 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 19:00
**Finalizado:** 2026-10-08 20:30
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ e2e/receive-flow.spec.ts
+ e2e/receive-offline.spec.ts
+ e2e/support/receive-helpers.ts
~ src/app/features/receive/components/camera-view.ts
+ docs/specs/changes/user-stories/US-002-recibir-archivo-qr/assets/guion-validacion-recepcion.md
```

**Notas:**
- IT-01 a IT-03 hechas: 23 escenarios E2E (21 de flujo y 2 de recepción sin conexión) que pasan contra `ng serve` con una cámara simulada (el `BarcodeDetector` lee los fragmentos que encola la prueba; el escenario del lector de reserva dibuja QR reales en el vídeo y los lee `jsQR`). Se ejecutaron dos veces seguidas: 46 de 46 en verde. Cubren la recepción completa e idéntica byte a byte, desorden, repetidos y corruptos, no completar hasta confirmar, descartar, secuencia ajena en cuadro, incompleta con «Seguir escaneando», datos inválidos con «Reintentar», no reconstruible, cuota agotada con descarga, cancelar con cámara liberada, errores de cámara, SVG y HTML con script sin ejecutarse, mismo nombre sin sobrescribir, almacenamiento persistente, ausencia de desplazamiento horizontal a 360, 768, 1280 y 1600 px y cero peticiones sin conexión.
- IT-04 hecha: guion manual con hoja de registro en `assets/guion-validacion-recepcion.md`.
- DECISIÓN DEL USUARIO: se integra la historia sin ejecutar IT-05 (pruebas manuales con móviles); TC-001, TC-026, TC-034, TC-035 (en un navegador real), TC-036 y TC-037 quedan sin validar en un dispositivo real. La tarea se marca `Done` por esa decisión, con IT-05 sin completar.
- PENDIENTE (IT-05): ejecutar con móviles Android reales la lectura continua en Chrome para Android, la serie de 10 lecturas de un QR de 400 B, la recepción de 1 MB cronometrada, el modo avión y el lector de reserva, y registrar los resultados aquí. No se puede hacer desde el agente: requiere dos dispositivos con cámara y un túnel HTTPS. Queda como deuda de validación.
- Los E2E se ejecutaron con un servidor propio en el puerto 4301 y una configuración temporal de Playwright (no se conserva): `npm run e2e` reutiliza el servidor que ya haya en el puerto 4200, que en este equipo era de otro árbol de trabajo y no tenía la ruta `/recibir`. No se ha ejecutado `npm run e2e` con la configuración del repositorio.
- Los iconos (`/images/*.svg`) se piden la primera vez que se dibujan un icono; el E2E sin conexión no cuenta esas peticiones, porque son recursos estáticos de la propia app (en producción los sirve la caché del service worker) y no peticiones de la recepción. No se verificó con el service worker de producción.
- No se ejecutó axe sobre las pantallas de recepción y resultado: `@axe-core/playwright` no está instalado en el proyecto.
- Hallazgo corregido: con la cámara simulada, `video.play()` fallaba por la política de reproducción automática porque `muted` en la plantilla no fija la propiedad `muted` del vídeo; `CameraView` ahora usa `[muted]="true"`. Es un riesgo real también en dispositivos (p. ej. iOS).
- Riesgo sin tratar: si `video.play()` falla por otro motivo, `QrCameraReader.start` lanza el error original (no un `CameraError`) y la pantalla lo deja sin gestionar.

**Decisiones adicionales:**
- Los E2E importan el protocolo de la aplicación (`fragmentFile`, `crc32`) para fabricar los fragmentos, de modo que prueban contra el formato real y no contra una copia.
- Las pruebas del archivo `receive-flow.spec.ts` se agrupan por criterio; la ejecución de 1 MB en 15 minutos y la lectura con óptica real quedan solo en el guion manual.

**Cobertura de test cases:**
- TC-001, TC-034, TC-036, TC-037 y TC-026: manuales con móviles (IT-05, pendiente). TC-001 se cubre además con cámara simulada.
- TC-035: cubierto con imágenes de QR reales y `jsQR` en cámara simulada; la prueba en un navegador real sin `BarcodeDetector` (Firefox, Safari) queda en el guion manual.
- TC-020, TC-021, TC-024, TC-025, TC-027, TC-031 y TC-038: cubiertos por el E2E (TC-027 a 360, 768, 1280 y 1600 px).
