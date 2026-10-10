# Informe del spike WI-001: Viabilidad del protocolo de transferencia por secuencia de QR

<!-- spike:verdict=VIABLE_WITH_REWORK · timebox=2d/2d · branch=spike/WI-001-protocolo-transferencia-qr · head=4beacdf · generated=2026-10-09 -->
**Spike:** [WI-001: Viabilidad del protocolo de transferencia por secuencia de QR](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/README.md)
**Veredicto:** ⚠️ Viable con trabajo
**Subtipo:** técnico
**Timebox:** 2 días · consumido: 2 días (prototipo en Node el 2026-10-08 y protocolo definitivo en la aplicación hasta el 2026-10-09)
**Rama de referencia:** `spike/WI-001-protocolo-transferencia-qr` @ `be67801` (prototipo en Node); el protocolo definitivo quedó integrado en `main` (`bd5a5c5`, `4696af6`, `2ed55d0`, `4beacdf`)
**Fecha:** 2026-10-09
**Autor:** juanca202 / Claude

## Resumen ejecutivo

El experimento fue construir y verificar el protocolo: primero un prototipo en Node con una cámara simulada (2026-10-08) y después su versión definitiva en la aplicación (formato versión 3), que es lo que finalmente se implementó. El protocolo reconstruye archivos idénticos byte a byte con desorden, duplicados, pérdidas, fragmentos corruptos y de otra transferencia, y distingue los cinco resultados de FR-013; sus 50 pruebas unitarias pasan. El hallazgo H-01 (el receptor podía quedarse con una transferencia ajena) se resolvió activando la primera transferencia con metadatos legibles y permitiendo cancelar (FR-023). Lo que dependía de la cámara real (capacidad por QR, lectura, APIs) lo midieron WI-002 y WI-003; sigue sin validarse de extremo a extremo la transferencia de 1 MB y la lectura de QR de 1600 B. El diseño implementado está en la sección 2.7 del SRS-001.

## Qué se probó

**Fase 1 (2026-10-08): prototipo en Node** en `spike/` (rama del spike): `protocol.mjs` (fragmentación y receptor, sin dependencias de UI), `qrsim.mjs` (QR con `qrcode`, degradación sintética y lectura con `jsqr`) y dos scripts de experimento. Los QR se generan y leen de verdad, pero la «cámara» es una simulación (desenfoque, ruido gaussiano por píxel y menor contraste).

**Fase 2 (2026-10-08 y 2026-10-09): protocolo definitivo en la aplicación** (`src/app/shared/utils/qr-protocol/`), con formato versión 3 y los cambios que dejaron las pruebas con dispositivos:

| Aspecto | Prototipo (fase 1) | Implementado (fase 2) |
|---------|--------------------|-----------------------|
| Fragmento | Versión, identificador, posición, total, CRC32 y carga | Igual, más tipo (metadatos o datos) y longitud de la carga; cabecera de 12 B y CRC32 de 4 B |
| Metadatos | Fragmento 0 solo con metadatos | Fragmento 0 con SHA-256, tamaños, codificación, nombre, tipo **y los primeros datos** hasta llenarlo |
| Compresión | Diferida | Deflate nativo, solo si reduce el tamaño |
| Tamaño por defecto | 400 B | 1600 B (200 a 1600 B elegibles) |
| Transferencia ajena (H-01) | Primer fragmento válido; sin protección | Primera transferencia con metadatos legibles; el usuario puede cancelar (FR-023) |
| Límite | 65 535 fragmentos sin validar | 65 535 fragmentos validados con el tamaño original (FR-024) |

| `IT-XX` | Planificado | Ejecutado | Desviación |
|---------|-------------|-----------|------------|
| IT-01 | Proyecto desde angular-base y dispositivos | Fase 1 en Node con archivos aleatorios de 20 KB a 1 MB; fase 2 en este repositorio (basado en angular-base) | La fase 1 no usó dispositivos |
| IT-02 | Comparar librerías en Chrome Android | `qrcode` y `jsqr` en Node; la comparación en Android la hicieron [WI-002](spike-report-WI-002-medicion-qr-android.md) y [WI-003](spike-report-WI-003-lectura-qr-android.md) | Resuelto en otros spikes |
| IT-03 | Emisor y receptor mínimos con protocolo versionado | Hecho en Node y luego en la aplicación (versión 3), sin dependencias de UI | Ninguna |
| IT-04 | Capacidad, velocidad, desorden, duplicados y corruptos | Capacidad en simulación, modelo de tiempo e integridad con 1 MB en la fase 1; 50 pruebas unitarias del protocolo en la fase 2 | La velocidad real la midió WI-002 solo en parte |
| IT-05 | Offline, tráfico de red y APIs de Chrome Android | APIs registradas en WI-002; sin red cubierto por NFR-001 y NFR-002 en las historias | La captura de tráfico con la app instalada sigue pendiente de validar con dispositivo |
| IT-06 | Informe | Este documento, actualizado con lo implementado | Ninguna |

## Resultados por pregunta

| `Q-XX` | Criterio de éxito | Resultado observado | Resultado | Evidencia |
|--------|-------------------|---------------------|-----------|-----------|
| Q-01 | Capacidad por QR leída sin errores en el 100 % de las pruebas de ajuste | Sin degradación, 200 a 2200 B (versiones 9 a 39) se leen al 100 % desde 4 px por módulo. Con degradación simulada suave y 6 px por módulo: 800 B → 100 % (L) y 88 % (M); 1200 B → 88 % (L) y 63 % (M); 1800 B o más → 0 %. No hay capacidad con 100 % bajo degradación, pero la simulación no es una cámara | ⚠️ Parcial: 400 B validado en [WI-002](spike-report-WI-002-medicion-qr-android.md); 1600 B (por defecto) sin validar con cámara | [EV-01](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-01-capacidad-por-qr.json) |
| Q-02 | 1 MB en ≤ 15 min con hash idéntico en ≥ 9 de 10 intentos reales | No hay intentos reales. Modelo (fragmentos de 800 B, 1312 fragmentos): con 90 % de lectura por vuelta, 10,6 min a 8 fps y 16,7 min a 5 fps; con 70 %, 19,2 min a 8 fps. Con fragmentos de 1200 B y 90 %: 6,5 min a 8 fps | ⏸️ No concluyente: sin transferencia completa de 1 MB con cámara (NFR-010) | [EV-02](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-02-protocolo-y-modelo.json) |
| Q-03 | Hash idéntico en el 100 % de las transferencias completadas | Prototipo: 10 transferencias de 1 MB con 30 % de pérdida, 5 % de fragmentos corruptos, duplicados y 20 fragmentos ajenos por vuelta: 9 idénticas; la 10.ª terminó «completada» con el archivo equivocado (H-01). Implementado: el receptor activa la primera transferencia con metadatos legibles e ignora las demás; las 50 pruebas unitarias del protocolo pasan (desorden, duplicados, corrupción, ajenos, compresión, límites) | ✅ Cumple (con H-01 resuelto por FR-023) | [EV-02](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-02-protocolo-y-modelo.json) |
| Q-04 | Fórmula documentada con error reportado | Vueltas esperadas ≈ ln(N) / −ln(1−p) + 0,5; error medio −6 % frente a la simulación (rango −2 % a −12 %). El error frente al tiempo real no se midió, y depende de p, que solo se obtiene con cámara | ✅ Cumple como estimación: tiempo por vuelta = QR × intervalo y tiempo restante por ritmo medido (SRS 2.7); error frente al tiempo real sin medir | [EV-02](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-02-protocolo-y-modelo.json) |
| Q-05 | Una combinación de librerías que cumpla Q-01 a Q-03 en Chrome Android | `qrcode` genera y `jsqr` lee carga binaria correctamente en Node (decodificación de 2 ms a 61 ms por fotograma según tamaño). No se probó en Chrome Android ni se evaluaron APIs de cámara, almacenamiento, descarga o compartir | ✅ Cumple: `qrcode` genera y `zxing-wasm` lee en Chrome Android; `jsqr` y `BarcodeDetector` descartados ([WI-003](spike-report-WI-003-lectura-qr-android.md)) | [EV-01](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-01-capacidad-por-qr.json) |
| Q-06 | Cero peticiones de red con la app instalada y sin red | El protocolo no usa red; la captura de tráfico con la app instalada sigue pendiente (NFR-001, NFR-002) | ⏸️ No concluyente | — |

## Hallazgos

### H-01: el receptor puede quedarse con la transferencia equivocada

El receptor fija la transferencia con el **primer fragmento válido** que ve y descarta el resto como ajenos (FR-008). Si lo primero que lee es un QR de otra secuencia (otra pantalla en cuadro, una vuelta anterior de otro envío), completa y verifica **ese** archivo contra sus propios metadatos: el resultado dice «completada» y el hash es consistente, pero no es el archivo que el usuario quería. **Resolución:** el receptor activa la primera transferencia de la que lee metadatos, muestra de inmediato su nombre, tamaño y avance, ignora las demás y el usuario puede cancelar e iniciar de nuevo (FR-008, FR-014, FR-023). Se descartó pedir confirmación tras las pruebas con dispositivos (2026-10-08).

### Supuestos de la simulación

- El ruido gaussiano independiente por píxel penaliza a `jsqr` más cuando los módulos son grandes: con 8 o 10 px por módulo y ruido las lecturas bajaron a casi 0 %, algo que una cámara real no suele producir. Por eso la simulación sirve para comparar protocolos, **no** para fijar capacidades ni velocidades.
- Sin degradación, el límite práctico es el de la especificación del QR en modo binario: 2953 B (L) y 2331 B (M); 2400 B ya no cabe en M.

### Coste del protocolo

Cada fragmento suma 15 B de cabecera y CRC (3,6 % con 400 B, 1,9 % con 800 B). El fragmento de metadatos añade un QR más.

## Diagnóstico

Lo que funcionó: la fragmentación, el reensamblado tolerante a desorden, duplicados, pérdidas y corrupción, la verificación SHA-256 y los resultados de FR-013, primero en el prototipo y después en la aplicación. Lo que quedó abierto no es del protocolo sino de la cámara y la pantalla: la probabilidad de lectura de QR de 1600 B y el tiempo real de 1 MB. Limitación del prototipo: todo corría en Node con ruido sintético. Limitación del enfoque que la implementación hereda: sin canal de retorno, el tiempo crece con las pérdidas y H-01 se mitiga con la cancelación del usuario.

## Consideraciones para la implementación definitiva

1. **Decisiones tomadas e implementadas:** formato versión 3, metadatos con los primeros datos, compresión opcional, 1600 B por defecto, velocidad elegible (8 QR/s por defecto), límite de 65 535 fragmentos y activación automática de la primera transferencia (SRS-001, 2.7).
2. **Deuda del prototipo que no se heredó:** formato sin tipo de fragmento ni longitud, sin límite de fragmentos validado y ruido sintético como sustituto de la cámara.
3. **Riesgos pendientes:** QR de 1600 B desde la pantalla de un laptop con módulos pequeños (R-10); 1 MB en 15 min no validado con cámara (NFR-010, R-06); corrección de errores hacia delante diferida (SRS-001, 2.6).
4. **Dependencias confirmadas:** `qrcode` (generación) y `zxing-wasm` (lectura).
5. **Estimación orientativa:** ya implementado (US-001 y US-002).

## Qué reutilizar de la rama

- `spike/protocol.mjs` — formato de fragmento del prototipo (versión 2); la versión vigente está en `src/app/shared/utils/qr-protocol/`.
- `spike/exp-protocol.mjs` — escenarios de desorden, duplicados, corrupción y fragmentos ajenos, que se trasladaron a las pruebas unitarias.

## Impacto en el artefacto / próximo paso

- Incorporado al [SRS-001](../README.md): sección 2.6 (diseño del protocolo implementado), FR-003, FR-004, FR-008 a FR-010, FR-023, FR-024, FR-030 y NFR-005.
- Pendiente de validar con dispositivos reales: lectura de QR de 1600 B (R-10) y transferencia completa de 1 MB (NFR-010).

## Fuentes

- [qrcode (npm)](https://www.npmjs.com/package/qrcode) y [jsQR (npm)](https://www.npmjs.com/package/jsqr) — librerías usadas en el prototipo.
