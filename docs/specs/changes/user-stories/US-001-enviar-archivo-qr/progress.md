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

<!-- unit:id=TK-002 · status=Pending -->
**Estado:** Pending

### TK-003: Emisor de QR: generación, bucle y velocidad fija de 8 fps

<!-- unit:id=TK-003 · status=Pending -->
**Estado:** Pending

### TK-004: Pantalla de envío: selección de archivo, emisión y estados de error

<!-- unit:id=TK-004 · status=Pending -->
**Estado:** Pending

### TK-005: PWA instalable sin red y estrategia de actualización

<!-- unit:id=TK-005 · status=Pending -->
**Estado:** Pending

### TK-006: Validación con móviles y escenarios E2E del envío

<!-- unit:id=TK-006 · status=Pending -->
**Estado:** Pending
