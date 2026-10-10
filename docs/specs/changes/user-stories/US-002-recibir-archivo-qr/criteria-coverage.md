# Reporte de cobertura — US-002-recibir-archivo-qr

**Fecha:** 2026-10-08 18:15
**Rama:** feature/US-002-recibir-archivo-qr
**Commit:** 9fcd1a5
**Trabajo:** [US-002](README.md)
**Veredicto:** ⚠️ Aprobado con observaciones

## Resumen

Los 25 criterios tienen caso de prueba y ninguno queda sin cobertura: 17 están cubiertos y 8 parcialmente. Los parciales se deben a tres causas: los casos manuales con móviles (AC-016, AC-022, AC-023, AC-024) no se ejecutaron por decisión del usuario; hay tipos de prueba declarados sin automatizar (TC-007, TC-027 Visual Test, TC-033 E2E); y el icono de archivo no se ha podido verificar visualmente (AC-010).

**Pruebas:** resultados tomados de la caché fresca de `quality-check` (commit 9fcd1a5, 2026-10-08). unit `PASS` · e2e `PASS`.

**Cobertura de criterios de aceptación**

| Total | ✅ Cubierto | ⚠️ Parcial | ❌ Sin cobertura |
| ----- | ---------- | ---------- | --------------- |
| 25    | 17         | 8          | 0               |

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción | Estado | Observaciones |
| -------- | ----------- | ------ | ------------- |
| AC-001 | Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente los QR sin que el usuario tome fotografías individuales. | ✅ Cubierto | Cámara simulada (TC-001 la prevé): el `BarcodeDetector` lo sustituye la prueba; la lectura con óptica real queda en AC-022 y AC-023. |
| AC-002 | El receptor DEBE descartar los fragmentos que pertenezcan a otra transferencia o que estén corruptos o inválidos. | ✅ Cubierto |  |
| AC-003 | El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición. | ✅ Cubierto | Además lo ejercita el E2E de desorden, duplicados y corruptos. |
| AC-004 | El receptor DEBE ignorar los fragmentos ya recibidos, sin alterar el resultado. | ✅ Cubierto |  |
| AC-005 | Durante la recepción, el sistema DEBE mostrar el nombre y tamaño total del archivo, el tiempo estimado restante, los fragmentos recibidos del total y una barra de progreso con el porcentaje recibido; en móvil DEBE mostrar al menos nombre, tamaño, tiempo y porcentaje. | ⚠️ Parcial | TC-007 (E2E) sin escenario propio: el mínimo en móvil solo se comprueba en la prueba de componente (clase que oculta el recuento de fragmentos), y el E2E a 360 px mide el desbordamiento pero no el contenido. Tamaño total y tiempo estimado solo se comprueban en la prueba de componente; el E2E cubre porcentaje, fragmentos y aviso. |
| AC-006 | Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada. | ✅ Cubierto | TC-008 `Integration`: la suite efectiva es `unit` (sin suite de integración en el repo). |
| AC-007 | El receptor DEBE informar el resultado: «completada» (todos los fragmentos y verificación satisfactoria); «incompleta» (el usuario pulsa «Terminar lectura» y faltan fragmentos); «datos inválidos» (todos los fragmentos pero falla la verificación); «no reconstruible» (no se puede ensamblar, p. ej. metadatos inconsistentes). | ✅ Cubierto |  |
| AC-008 | El usuario DEBE poder cancelar la recepción en cualquier momento, sin confirmación; la cancelación DEBE detener el proceso, descartar los datos parciales y liberar la cámara. | ✅ Cubierto |  |
| AC-009 | Al completarse la recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta, y NO DEBE sobrescribir un archivo existente con el mismo nombre. | ✅ Cubierto | TC-014 y TC-015 `Integration`: la suite efectiva es `unit` con un doble de `PrivateStorage`; el guardado real en el almacenamiento privado lo comprueba el E2E. |
| AC-010 | Al completarse la recepción, el sistema DEBE mostrar una previsualización (la imagen si lo es; en otro caso, un icono con el nombre) con el historial directamente debajo, y DEBE abrir el archivo al hacer clic en ella (mostrándolo si el tipo es visualizable y, si no, descargándolo). | ⚠️ Parcial | La apertura de una imagen en pestaña nueva solo se prueba en unitarias (el E2E comprueba la descarga de SVG y HTML). El icono de archivo (`ft-icon`) no se dibuja en el entorno de pruebas, así que su aspecto no está verificado en ninguna prueba. |
| AC-011 | Tras «incompleta», el receptor DEBE permitir seguir escaneando conservando los fragmentos válidos ya recibidos; tras «datos inválidos» o «no reconstruible» DEBE permitir reintentar desde cero. Los fragmentos parciales NO DEBEN persistirse. | ✅ Cubierto |  |
| AC-012 | El sistema DEBE mostrar un mensaje claro y NO DEBE iniciar la recepción cuando no haya cámara o permiso para usarla o el navegador no sea compatible, y DEBE avisar si la cuota de almacenamiento se agota al guardar. | ✅ Cubierto | TC-022 `Integration`: la suite efectiva es `unit`; el E2E lo comprueba además con la cuota simulada. |
| AC-013 | El archivo recibido DEBE ser idéntico byte a byte al original, comprobado con una verificación de integridad. | ✅ Cubierto | TC-023 `Integration` se materializa con el E2E (archivo guardado comparado byte a byte). |
| AC-014 | La previsualización y apertura del archivo recibido NO DEBEN ejecutar contenido activo (p. ej. scripts incrustados en SVG o HTML). | ✅ Cubierto |  |
| AC-015 | Durante la recepción, el sistema NO DEBE enviar contenido ni metadatos fuera del dispositivo ni realizar peticiones de red de ningún tipo, incluida telemetría. | ✅ Cubierto | El E2E no cuenta las peticiones a `/images/` (sprites de iconos, recursos estáticos de la app). |
| AC-016 | Tras la primera carga con red, la recepción DEBE funcionar completamente sin conexión a Internet. | ⚠️ Parcial | TC-026 `Manual` no ejecutado: se integra sin validación manual por decisión del usuario (`progress.md`, TK-007). El E2E sin conexión corre contra `ng serve`, sin service worker, así que no valida el funcionamiento de la app instalada. |
| AC-017 | Las pantallas de recepción y resultado, incluidos sus estados de error, DEBEN ser operables sin desplazamiento horizontal desde 360 px hasta 1280 px o más de ancho. | ⚠️ Parcial | TC-027 `Visual Test` sin automatizar: no hay comparación visual; el E2E mide el desbordamiento a 360, 768, 1280 y 1600 px. |
| AC-018 | Tras un resultado «incompleta», «datos inválidos» o «no reconstruible», el sistema NO DEBE guardar el archivo ni registrarlo en el historial. | ✅ Cubierto | TC-028 `Integration`: la suite efectiva es `unit`; el E2E comprueba además que el almacenamiento queda vacío. |
| AC-019 | Tras leer el fragmento de metadatos de una transferencia, el receptor DEBE mostrar su nombre y tamaño y pedir confirmación antes de darla por activa; hasta confirmar, NO DEBE completar ni guardar ningún archivo, y al descartarla DEBE ignorar sus fragmentos. | ✅ Cubierto | Cobertura apoyada en TC-031 `Manual`, no ejecutado en móvil (decisión del usuario); el escenario de la secuencia ajena sí lo reproduce un E2E con cámara simulada. |
| AC-020 | Mientras espera la confirmación, el receptor DEBE mostrar los fragmentos ya leídos, y el aviso de confirmación DEBE permanecer visible. | ✅ Cubierto |  |
| AC-021 | El receptor NO DEBE iniciar una lectura nueva mientras otra está en curso. | ⚠️ Parcial | TC-033 (E2E) sin automatizar: la pantalla inicia la lectura al entrar y no tiene un botón que pulsar varias veces; la regla se prueba en `QrCameraReader` y `ReceiveManager`. |
| AC-022 | El receptor DEBE funcionar en Chrome para Android (probado en Chrome 154 sobre Android 10); en navegadores sin `BarcodeDetector` DEBE leer con un lector en JavaScript. | ⚠️ Parcial | TC-034 `Manual` (Chrome para Android real) no ejecutado por decisión del usuario. TC-035 `Integration`: la suite efectiva es `unit` (con `jsQR` simulado) más un E2E con QR reales leídos por `jsQR`; el navegador real sin `BarcodeDetector` (Firefox, Safari) no se ha probado. |
| AC-023 | El receptor DEBE leer un QR de 400 B con corrección M a unos 30 cm en al menos 9 de 10 intentos secuenciales. | ⚠️ Parcial | Único TC `Manual`, no ejecutado (decisión del usuario): la lectura con óptica real no está verificada en ninguna prueba. |
| AC-024 | El receptor DEBERÍA completar una transferencia de 1 MB en 15 minutos o menos; este objetivo no está validado con cámara y se verifica con transferencias reales. | ⚠️ Parcial | Único TC `Manual`, no ejecutado (decisión del usuario): el tiempo de 1 MB no está medido. El criterio es DEBERÍA. |
| AC-025 | El sistema DEBERÍA solicitar almacenamiento persistente al guardar un archivo recibido para reducir el riesgo de que el navegador lo borre. | ✅ Cubierto | TC-038 `Integration`: la suite efectiva es `unit` con doble de `PrivateStorage`; el E2E comprueba la llamada a `persist()`. |

## Matriz de trazabilidad

Vista auditable: una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado. Las filas con `—` en la columna TC son pruebas halladas en el repositorio que no corresponden a un tipo declarado por el TC (mapeo inferido).

| Criterio | TC | Tipo | Evidencia | Ejecución | Resultado |
| -------- | -- | ---- | --------- | --------- | --------- |
| AC-001 | [TC-001](test-cases/TC-001-recibir-lee-qr-sin-fotos-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-002 | [TC-002](test-cases/TC-002-descarta-fragmentos-corruptos-error.md) | Unit | [`src/app/shared/utils/qr-protocol/parse-fragment.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/parse-fragment.spec.ts); [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts) | quality-check | ✅ Correcto |
| AC-002 | [TC-003](test-cases/TC-003-descarta-fragmentos-de-otra-transferencia-error.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts) | quality-check | ✅ Correcto |
| AC-003 | [TC-004](test-cases/TC-004-acepta-fragmentos-en-desorden-happy.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts) | quality-check | ✅ Correcto |
| AC-004 | [TC-005](test-cases/TC-005-ignora-fragmentos-repetidos-limite.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts) | quality-check | ✅ Correcto |
| AC-005 | [TC-006](test-cases/TC-006-progreso-con-nombre-tamano-tiempo-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-005 | — | Unit | [`src/app/features/receive/components/receive-page.spec.ts`](../../../../../src/app/features/receive/components/receive-page.spec.ts) | quality-check | ✅ Correcto |
| AC-005 | [TC-007](test-cases/TC-007-progreso-minimo-en-movil-limite.md) | E2E | — | — | ❌ Sin cobertura |
| AC-006 | [TC-008](test-cases/TC-008-reconstruye-verifica-y-libera-camara-happy.md) | Integration | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-006 | [TC-008](test-cases/TC-008-reconstruye-verifica-y-libera-camara-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-009](test-cases/TC-009-resultado-completada-happy.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts); [`src/app/features/receive/components/receive-page.spec.ts`](../../../../../src/app/features/receive/components/receive-page.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-009](test-cases/TC-009-resultado-completada-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-010](test-cases/TC-010-resultado-incompleta-error.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts); [`src/app/features/receive/components/result-card.spec.ts`](../../../../../src/app/features/receive/components/result-card.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-010](test-cases/TC-010-resultado-incompleta-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-011](test-cases/TC-011-resultado-datos-invalidos-error.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts); [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-007 | [TC-012](test-cases/TC-012-resultado-no-reconstruible-error.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts); [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-008 | [TC-013](test-cases/TC-013-cancelar-recepcion-libera-camara-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-009 | [TC-014](test-cases/TC-014-guarda-con-nombre-y-tipo-originales-happy.md) | Integration | [`src/app/features/receive/services/received-file-saver.spec.ts`](../../../../../src/app/features/receive/services/received-file-saver.spec.ts) | quality-check | ✅ Correcto |
| AC-009 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-009 | [TC-015](test-cases/TC-015-mismo-nombre-no-sobrescribe-limite.md) | Integration | [`src/app/features/receive/services/received-file-saver.spec.ts`](../../../../../src/app/features/receive/services/received-file-saver.spec.ts) | quality-check | ✅ Correcto |
| AC-009 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-010 | [TC-016](test-cases/TC-016-previsualiza-imagen-y-abre-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-010 | — | Unit | [`src/app/features/receive/components/file-preview.spec.ts`](../../../../../src/app/features/receive/components/file-preview.spec.ts); [`src/app/features/receive/services/safe-file-opener.spec.ts`](../../../../../src/app/features/receive/services/safe-file-opener.spec.ts) | quality-check | ✅ Correcto |
| AC-010 | [TC-017](test-cases/TC-017-previsualiza-otro-tipo-con-icono-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-010 | — | Unit | [`src/app/features/receive/components/file-preview.spec.ts`](../../../../../src/app/features/receive/components/file-preview.spec.ts) | quality-check | ✅ Correcto |
| AC-011 | [TC-018](test-cases/TC-018-seguir-escaneando-tras-incompleta-happy.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-011 | [TC-018](test-cases/TC-018-seguir-escaneando-tras-incompleta-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-011 | [TC-019](test-cases/TC-019-reintentar-desde-cero-tras-error-error.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-011 | [TC-019](test-cases/TC-019-reintentar-desde-cero-tras-error-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-012 | [TC-020](test-cases/TC-020-sin-camara-o-permiso-denegado-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-012 | [TC-021](test-cases/TC-021-navegador-incompatible-recibir-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-012 | [TC-022](test-cases/TC-022-cuota-agotada-al-guardar-recepcion-error.md) | Integration | [`src/app/features/receive/services/received-file-saver.spec.ts`](../../../../../src/app/features/receive/services/received-file-saver.spec.ts); [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts); [`src/app/features/receive/components/result-card.spec.ts`](../../../../../src/app/features/receive/components/result-card.spec.ts) | quality-check | ✅ Correcto |
| AC-012 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-013 | [TC-023](test-cases/TC-023-archivo-identico-byte-a-byte-happy.md) | Unit | [`src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts`](../../../../../src/app/shared/utils/qr-protocol/fragment-assembler.spec.ts) | quality-check | ✅ Correcto |
| AC-013 | [TC-023](test-cases/TC-023-archivo-identico-byte-a-byte-happy.md) | Integration | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-014 | [TC-024](test-cases/TC-024-svg-con-script-no-se-ejecuta-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts); [`src/app/features/receive/services/safe-file-opener.spec.ts`](../../../../../src/app/features/receive/services/safe-file-opener.spec.ts) | quality-check | ✅ Correcto |
| AC-015 | [TC-025](test-cases/TC-025-cero-peticiones-de-red-en-recepcion-happy.md) | E2E | [`e2e/receive-offline.spec.ts`](../../../../../e2e/receive-offline.spec.ts) | quality-check | ✅ Correcto |
| AC-016 | [TC-026](test-cases/TC-026-recepcion-modo-avion-movil-happy.md) | Manual | [`test-cases/TC-026-recepcion-modo-avion-movil-happy.md`](test-cases/TC-026-recepcion-modo-avion-movil-happy.md) | Manual | — No aplica |
| AC-016 | — | E2E | [`e2e/receive-offline.spec.ts`](../../../../../e2e/receive-offline.spec.ts) | quality-check | ✅ Correcto |
| AC-017 | [TC-027](test-cases/TC-027-recibir-operable-360-a-1280-limite.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-017 | [TC-027](test-cases/TC-027-recibir-operable-360-a-1280-limite.md) | Visual Test | — | — | ❌ Sin cobertura |
| AC-018 | [TC-028](test-cases/TC-028-error-no-guarda-ni-registra-error.md) | Integration | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-018 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-019 | [TC-029](test-cases/TC-029-no-activa-hasta-confirmar-nombre-y-tamano-happy.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-019 | [TC-030](test-cases/TC-030-descartar-transferencia-ignora-sus-fragmentos-error.md) | Unit | [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-019 | [TC-030](test-cases/TC-030-descartar-transferencia-ignora-sus-fragmentos-error.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-019 | [TC-031](test-cases/TC-031-secuencia-ajena-en-cuadro-movil-error.md) | Manual | [`test-cases/TC-031-secuencia-ajena-en-cuadro-movil-error.md`](test-cases/TC-031-secuencia-ajena-en-cuadro-movil-error.md) | Manual | — No aplica |
| AC-019 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-020 | [TC-032](test-cases/TC-032-avance-y-aviso-visibles-antes-de-confirmar-happy.md) | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-021 | [TC-033](test-cases/TC-033-no-inicia-lectura-mientras-hay-otra-error.md) | Unit | [`src/app/features/receive/services/qr-camera-reader.spec.ts`](../../../../../src/app/features/receive/services/qr-camera-reader.spec.ts); [`src/app/features/receive/services/receive-manager.spec.ts`](../../../../../src/app/features/receive/services/receive-manager.spec.ts) | quality-check | ✅ Correcto |
| AC-021 | [TC-033](test-cases/TC-033-no-inicia-lectura-mientras-hay-otra-error.md) | E2E | — | — | ❌ Sin cobertura |
| AC-022 | [TC-034](test-cases/TC-034-funciona-en-chrome-android-happy.md) | Manual | [`test-cases/TC-034-funciona-en-chrome-android-happy.md`](test-cases/TC-034-funciona-en-chrome-android-happy.md) | Manual | — No aplica |
| AC-022 | [TC-035](test-cases/TC-035-lectura-con-zxing-sin-barcodedetector-error.md) | Integration | [`src/app/features/receive/services/qr-decoder.spec.ts`](../../../../../src/app/features/receive/services/qr-decoder.spec.ts) | quality-check | ✅ Correcto |
| AC-022 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |
| AC-023 | [TC-036](test-cases/TC-036-lectura-400b-m-30cm-9-de-10-happy.md) | Manual | [`test-cases/TC-036-lectura-400b-m-30cm-9-de-10-happy.md`](test-cases/TC-036-lectura-400b-m-30cm-9-de-10-happy.md) | Manual | — No aplica |
| AC-024 | [TC-037](test-cases/TC-037-recepcion-1mb-en-15-minutos-happy.md) | Manual | [`test-cases/TC-037-recepcion-1mb-en-15-minutos-happy.md`](test-cases/TC-037-recepcion-1mb-en-15-minutos-happy.md) | Manual | — No aplica |
| AC-025 | [TC-038](test-cases/TC-038-solicita-almacenamiento-persistente-happy.md) | Integration | [`src/app/features/receive/services/received-file-saver.spec.ts`](../../../../../src/app/features/receive/services/received-file-saver.spec.ts) | quality-check | ✅ Correcto |
| AC-025 | — | E2E | [`e2e/receive-flow.spec.ts`](../../../../../e2e/receive-flow.spec.ts) | quality-check | ✅ Correcto |

## Observaciones y pendientes

- **Validación manual no ejecutada:** TC-026, TC-031, TC-034, TC-036 y TC-037 (móviles Android reales) no se ejecutaron: el usuario decidió integrar la historia sin esa validación (ver `progress.md`, TK-007). La guía para hacerlo está en [`assets/guion-validacion-recepcion.md`](assets/guion-validacion-recepcion.md).
- **Iconos:** el icono de archivo de la previsualización y el de aviso de las tarjetas (`ft-icon`) no se dibujaron en el entorno de pruebas; es igual en la pantalla de inicio, así que parece un problema del sprite de iconos y no de esta historia, pero no está verificado.
- **Pruebas de la suite `coverage`:** pasan (sentencias 96,02 %, umbral 80 %); no se mapean a ningún criterio.
- **E2E de otra historia omitido:** una prueba de `send-offline.spec.ts` (US-001) figura como omitida; no afecta a esta historia.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=a6e59f7141dc3bff835e28bc11681282ac3ca0d9 · spec=3f7f2e397d7285f9be861a8a21cdedfc8785a9b3 · generated=2026-10-08 -->
