# Progreso

## US-001-enviar-archivo-qr

<!-- work:id=US-001 · status=In Progress -->
**Estado:** In Progress
**Tipo:** historia de usuario
**Fecha de creación:** 2026-10-08
**Ultima actualizacion:** 2026-10-08

## Unidades

### TK-001: Protocolo de fragmentación versionado para la secuencia de QR

<!-- unit:id=TK-001 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/shared/utils/qr-protocol/constants.ts
+ src/app/shared/utils/qr-protocol/crc32.ts
+ src/app/shared/utils/qr-protocol/crc32.spec.ts
+ src/app/shared/utils/qr-protocol/fragment-file.ts
+ src/app/shared/utils/qr-protocol/fragment-file.spec.ts
+ src/app/shared/utils/qr-protocol/index.ts
```

**Notas:**
- Formato v1 (big-endian): versión(1) · tipo(1) · id de transferencia(4) · posición(2) · total(2) · longitud(2) · carga · CRC32(4) sobre todo lo anterior. Posición 0 = metadatos (SHA-256, tamaño, nombre y tipo); 1..n = datos. Máximo 65 535 fragmentos (≈ 26,2 MB con 400 B).
- Las pruebas decodifican con un receptor mínimo definido dentro del propio spec; el receptor real pertenece a US-002.

**Decisiones adicionales:**
- Además de `fragmentFile`, se exporta `countFragments(tamaño, dataSize)`, que valida el límite solo con el tamaño (la pantalla de envío puede rechazar un archivo sin leerlo; ver TC-024).
- El archivo se recibe como `{ name, type, bytes }` (sin `File`) para mantener el módulo libre de DOM.
- Errores tipados vía `QrProtocolError` con `code`: `too-many-fragments`, `metadata-too-large` (nombre+tipo no caben en un fragmento) e `invalid-data-size`.
- El archivo vacío no se rechaza aquí: lo valida `send-file-validator` de TK-004.

**Cobertura de test cases:**
- TC-021: en TK-001 solo se prueba el tamaño por defecto de 400 B; la corrección M se verifica en TK-003 (codificador QR).
- TC-008: el reensamblado se prueba en unitaria con un receptor de prueba; el receptor real llega con US-002.

### TK-002: Servicio de almacenamiento privado para la copia del archivo enviado

<!-- unit:id=TK-002 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/core/models/stored-transfer.ts
+ src/app/core/services/private-storage.ts
+ src/app/core/services/private-storage.spec.ts
+ src/app/core/services/storage-quota-error.ts
```

**Notas:**
- Las copias viven en OPFS bajo `transfers/`: un archivo `<id>` con el contenido y un `<id>.json` con el registro.
- `save` estima la cuota antes de escribir y, si una escritura falla, elimina contenido y registro; un `QuotaExceededError` se convierte en `StorageQuotaError`.
- `list` devuelve los registros sin ordenar; ordenar y filtrar corresponde al historial (US-003).

**Decisiones adicionales:**
- Además del plan, el servicio expone `read(id)`, que devuelve un `File` con el nombre y tipo originales, para la exportación y la previsualización.
- `requestPersistence` no vuelve a pedir persistencia si `persisted()` ya es verdadero.
- No se incluye eliminación: la añade la tarea de historial de US-003 si la necesita.

**Cobertura de test cases:**
- TC-014 (cuota agotada): cubierto con un doble de OPFS en unitaria, no con almacenamiento real.
- TC-012 (copia en el historial al iniciar el envío): la parte de guardado queda cubierta aquí; el flujo completo llega con la pantalla de envío (TK-004).

### TK-003: Emisor de QR: generación, bucle y velocidad fija de 8 fps

<!-- unit:id=TK-003 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ package.json
~ package-lock.json
+ src/app/features/send/models/send-progress.ts
+ src/app/features/send/services/qr-encoder.ts
+ src/app/features/send/services/qr-encoder.spec.ts
+ src/app/features/send/managers/send-sequence-manager.ts
+ src/app/features/send/managers/send-sequence-manager.spec.ts
```

**Notas:**
- Dependencias añadidas: `qrcode` (^1.5.4) y `@types/qrcode` (dev). Con corrección M, 412 B (cabecera + 400 B) dan un QR versión 15 de 77 módulos.
- Cadencia de 8 fps (125 ms) medida contra el instante de inicio para no acumular deriva; los QR se codifican bajo demanda, no todos de antemano, para no retener miles de matrices en memoria.
- El tiempo por vuelta se muestra como no disponible (`null`, «calculando…» en la interfaz) hasta emitir 2 QR; después es total × 125 ms.

**Decisiones adicionales:**
- El manager vive en `features/send/managers/` (no en `services/`, como decía la tarea), según la ubicación que fija el ADR-011 para los managers de feature.
- El manager expone `currentQr` (matriz a dibujar) y `progress` (activa, índice, total, vuelta, tiempo estimado); el dibujo en canvas es de la pantalla de envío (TK-004).

**Cobertura de test cases:**
- TC-021 (corrección M y 400 B): cubierto en unitaria con el codificador real (versión/tamaño del QR); la lectura con cámara queda para TK-006.
- TC-009 y TC-010 (velocidad automática, bucle tras tres vueltas): cubiertos en unitaria con temporizadores simulados, no con la pantalla completa.

### TK-004: Pantalla de envío: selección de archivo, emisión y estados de error

<!-- unit:id=TK-004 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ angular.json
~ src/app/app.routes.ts
+ src/app/features/send/components/qr-canvas.ts
+ src/app/features/send/components/qr-canvas.spec.ts
+ src/app/features/send/components/send-page.ts
+ src/app/features/send/components/send-page.html
+ src/app/features/send/components/send-page.spec.ts
+ src/app/features/send/services/send-file-validator.ts
```

**Notas:**
- Ruta `/enviar` con carga diferida (chunk de unos 36 kB). Al entrar intenta abrir el selector; si el navegador lo bloquea por falta de gesto del usuario, queda el botón «Elegir archivo».
- Tras cancelar, la pantalla vuelve al estado de elegir archivo: la pantalla de inicio (a donde debería volver) pertenece a US-003 y aún no existe.
- El mensaje de cuota agotada se muestra tanto si falla la estimación previa como la escritura (ambos lanzan `StorageQuotaError`).

**Decisiones adicionales:**
- Se añadió `allowedCommonJsDependencies: ["qrcode"]` en `angular.json` para silenciar el aviso de que `qrcode` no es ESM.
- Los textos están en español con `$localize`/`i18n`, el idioma de la especificación.
- La tarea no pidió validador de compatibilidad más allá de OPFS y `crypto.subtle`; el chequeo de otras APIs queda para TK-005/TK-006 si hace falta.
- El presupuesto inicial del build ya se excedía antes de esta tarea (501,74 kB frente a 500 kB); ahora son 506,49 kB por el código de enrutado y de `$localize`; sigue siendo solo un aviso.

**Cobertura de test cases:**
- TC-013, TC-014, TC-015, TC-018 y TC-024 (errores de archivo vacío, cuota, navegador y límite de fragmentos): cubiertos en unitaria con Testing Library; los E2E y el modo avión llegan con TK-006.
- TC-020 (360–1280 px sin desplazamiento horizontal): la maquetación usa solo utilidades Tailwind responsivas; no hay prueba automática de ancho todavía, queda para el E2E de TK-006.

### TK-005: PWA instalable sin red y estrategia de actualización

<!-- unit:id=TK-005 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
~ angular.json
~ ngsw-config.json
~ src/app/app.config.ts
~ src/app/core/services/app-manager.ts
~ src/app/core/services/app-manager.spec.ts
~ src/app/core/components/error/error.ts
~ src/app/core/components/error/error.html
~ src/app/core/components/error/error.spec.ts
+ src/app/core/services/app-update.ts
+ src/app/core/services/app-update.spec.ts
+ e2e/send-offline.spec.ts
```

**Notas:**
- Al ejecutar el E2E se vio que la app no arrancaba en el navegador (ya en `main`): faltaba `@angular/localize/init` como polyfill (`$localize is not defined`) y `AppManager` inyectaba `AuthProvider`, que `app.config.ts` no provee (`NG0201`). Se corrigieron ambos.
- IT-03: sin `HttpClient`, `fetch`, `XMLHttpRequest` ni `sendBeacon` en el módulo de envío, el protocolo ni el almacenamiento; `index.html` no carga recursos externos. El E2E confirma cero peticiones durante el envío y la cancelación.
- E2E: los dos primeros escenarios corren contra `ng serve`; el tercero (recarga sin conexión con service worker) exige la compilación de producción servida y la variable `PWA_URL`, y se omite sin ella. Pasaron los tres (el tercero contra un servidor estático con respaldo a `index.html`).

**Decisiones adicionales:**
- Se quitó `AuthProvider` de `AppManager` (y con él la carga de ajustes de `Session` al iniciar) y del componente de error, por decisión del usuario: la app no tiene inicio de sesión. En la página de error, 403 y 404 ofrecen «Go home» (antes 403 ofrecía «Logout») y `unknown` sigue ofreciendo «Reload». `Session` y `main-layout` siguen inyectando `AuthProvider`, pero nada de lo que se carga al arrancar los instancia; quedan para una limpieza aparte.
- `AppUpdate` busca versión al volver la app a primer plano, recarga ante un service worker irrecuperable y activa la versión nueva solo cuando el usuario pulsa «Reload» en el aviso (nunca en mitad de un envío). `AppManager` delega esa acción en `AppUpdate.activate()` en lugar de recargar directamente.
- `ngsw-config.json`: `updateMode: prefetch` en el grupo de la app, `/icons/**` precargados y `mockServiceWorker.js` excluido de la caché.
- Los mocks `AuthProvider`/`Session` siguen declarados como proveedores en `app-manager.spec.ts` y `error.spec.ts` aunque ya no se usan; no estorban.
- Por error se ejecutó la suite completa una vez (211 pruebas en verde) en lugar de solo los archivos afectados.

**Cobertura de test cases:**
- TC-016 (cero peticiones de red), TC-017 (envío sin conexión): cubiertos por el E2E de esta tarea.
- TC-018 (modo avión en móvil): queda como prueba manual en TK-006.

### TK-006: Validación con móviles y escenarios E2E del envío

<!-- unit:id=TK-006 · status=Pending -->
**Estado:** Pending
