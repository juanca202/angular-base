# Reporte de cobertura — US-001-enviar-archivo-qr

**Fecha:** 2026-10-08 17:10
**Rama:** feature/US-001-enviar-archivo-qr
**Commit:** a551fb3
**Trabajo:** [US-001](README.md)
**Veredicto:** ⚠️ Aprobado con observaciones

## Resumen

Los 19 criterios tienen caso de prueba y artefacto, y ninguno falla. Tres quedan parciales: AC-013 (la prueba de recarga sin conexión está omitida), AC-015 (el tipo Visual Test declarado no tiene artefacto) y AC-017 (solo validación manual, aún sin ejecutar). Las pruebas manuales con móviles (TC-018, TC-022, TC-023) siguen pendientes (TK-006, IT-03).

**Pruebas:** caché fresca de `quality-check` (commit a551fb3, 2026-10-08). unit `PASS` (211) · e2e `PASS` (18 pasan, 1 omitida).

**Cobertura de criterios de aceptación**

| Total | Cubiertos | Parciales | No cubiertos |
| ----- | --------- | --------- | ------------ |
| 19    | 16        | 3         | 0            |

## Cobertura por criterio

| Criterio | Descripción | Estado | Observaciones |
| -------- | ----------- | ------ | ------------- |
| AC-001 | Selector de archivos; cerrarlo sin elegir no inicia nada | ✅ Cubierto | |
| AC-002 | No permite más de un archivo | ✅ Cubierto | Se valida que el selector es de un solo archivo |
| AC-003 | Secuencia de QR e información del archivo, sin progreso; «calculando…» | ✅ Cubierto | |
| AC-004 | Fragmentos con identificador, posición, total y CRC | ✅ Cubierto | |
| AC-005 | Nombre y tipo viajan con el contenido | ✅ Cubierto | |
| AC-006 | Archivos mayores que un QR en múltiples QR | ✅ Cubierto | La fila Integration se resuelve con la prueba unitaria que fragmenta y reensambla; no hay suite de integración |
| AC-007 | Velocidad automática, sin intervención | ✅ Cubierto | |
| AC-008 | Repetición en bucle hasta cancelar | ✅ Cubierto | |
| AC-009 | Cancelar sin confirmación; conserva la copia | ✅ Cubierto | |
| AC-010 | Copia en el almacenamiento privado al iniciar | ✅ Cubierto | La fila Integration se resuelve con la prueba de `PrivateStorage` en la suite unit |
| AC-011 | Mensaje claro y no inicia (vacío, sin espacio, cuota, navegador) | ✅ Cubierto | TC-014 (Integration) se cubre con la suite unit |
| AC-012 | Sin peticiones de red durante el envío | ✅ Cubierto | |
| AC-013 | Funciona sin conexión tras la primera carga | ⚠️ Parcial | `send-offline.spec.ts:65` (recarga sin conexión con service worker) está omitida; TC-018 manual pendiente |
| AC-014 | Protocolo separado de la interfaz y versionado | ✅ Cubierto | |
| AC-015 | Operable sin desplazamiento horizontal de 360 px a 1280 px | ⚠️ Parcial | TC-020 declara E2E y Visual Test; no existe prueba visual |
| AC-016 | Fragmentos de 400 B con corrección M por defecto | ✅ Cubierto | TC-022 (serie de 10 lecturas) es manual y está pendiente; no afecta al valor por defecto |
| AC-017 | 1 MB en 15 minutos o menos | ⚠️ Parcial | Solo TC-023 (manual), sin ejecutar con cámara |
| AC-018 | Mensaje claro si excede el máximo de fragmentos | ✅ Cubierto | |
| AC-019 | SHA-256 en los metadatos | ✅ Cubierto | |

## Matriz de trazabilidad

| Criterio | TC | Tipo | Evidencia | Ejecución | Resultado |
| -------- | -- | ---- | --------- | --------- | --------- |
| AC-001 | TC-001 | E2E | [`send-flow.spec.ts:25`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-001 | TC-002 | E2E | [`send-flow.spec.ts:35`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-002 | TC-003 | E2E | [`send-flow.spec.ts:25`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-003 | TC-004 | E2E | [`send-flow.spec.ts:42`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-003 | TC-005 | E2E | [`send-flow.spec.ts:55`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-004 | TC-006 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-005 | TC-007 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-006 | TC-008 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-006 | TC-008 | Integration | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-007 | TC-009 | E2E | [`send-flow.spec.ts:62`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-008 | TC-010 | E2E | [`send-flow.spec.ts:62`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-009 | TC-011 | E2E | [`send-flow.spec.ts:96`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-010 | TC-012 | Integration | [`private-storage.spec.ts`](../../../../../src/app/core/services/private-storage.spec.ts) | quality-check | ✅ PASS |
| AC-010 | TC-012 | E2E | [`send-flow.spec.ts:78`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-011 | TC-013 | Unit | [`send-page.spec.ts`](../../../../../src/app/features/send/components/send-page.spec.ts) | quality-check | ✅ PASS |
| AC-011 | TC-013 | E2E | [`send-flow.spec.ts:123`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-011 | TC-014 | Integration | [`private-storage.spec.ts`](../../../../../src/app/core/services/private-storage.spec.ts) | quality-check | ✅ PASS |
| AC-011 | TC-015 | E2E | [`send-flow.spec.ts:149`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-012 | TC-016 | E2E | [`send-offline.spec.ts:29`](../../../../../e2e/send-offline.spec.ts) | quality-check | ✅ PASS |
| AC-013 | TC-017 | E2E | [`send-offline.spec.ts:29`](../../../../../e2e/send-offline.spec.ts) | quality-check | ✅ PASS |
| AC-013 | TC-017 | E2E | [`send-offline.spec.ts:65`](../../../../../e2e/send-offline.spec.ts) | — | ⏭️ NOT_RUN (omitida) |
| AC-013 | TC-018 | Manual | [TC-018](test-cases/TC-018-envio-modo-avion-movil-happy.md) | Manual | — N/A |
| AC-014 | TC-019 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-015 | TC-020 | E2E | [`send-flow.spec.ts:162`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-015 | TC-020 | Visual Test | — | — | ❌ UNCOVERED |
| AC-016 | TC-021 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-016 | TC-022 | Manual | [TC-022](test-cases/TC-022-serie-10-lecturas-para-tamano-mayor-limite.md) | Manual | — N/A |
| AC-017 | TC-023 | Manual | [TC-023](test-cases/TC-023-1mb-en-15-minutos-happy.md) | Manual | — N/A |
| AC-018 | TC-024 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |
| AC-018 | TC-024 | E2E | [`send-flow.spec.ts:130`](../../../../../e2e/send-flow.spec.ts) | quality-check | ✅ PASS |
| AC-019 | TC-025 | Unit | [`fragment-file.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-file.spec.ts) | quality-check | ✅ PASS |

## Observaciones y pendientes

- Las tres pruebas manuales con móviles (TC-018, TC-022 y TC-023) no se han ejecutado; el guion está en [guion-validacion-envio.md](assets/guion-validacion-envio.md) y el seguimiento en la tarea TK-006 (IT-03), que sigue en curso.
- El e2e se ejecutó en el puerto 4300 porque el 4200 lo ocupaba otro proyecto.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=4d9bc4efdf5073a19e42c00424a450a0911542d6 · spec=8fb6cf5624f2592026997e7996b7a3c573e59172 · generated=2026-10-08 -->
