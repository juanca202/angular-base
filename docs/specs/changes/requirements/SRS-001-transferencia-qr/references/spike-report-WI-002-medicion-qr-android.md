# Informe del spike WI-002: Medición con móviles Android de la transferencia por secuencia de QR

<!-- spike:verdict=VIABLE_WITH_REWORK · timebox=1d/1d · branch=spike/WI-002-medicion-qr-android · head=22b1ef4 · generated=2026-10-08 -->
**Spike:** [WI-002: Medición con móviles Android de la transferencia por secuencia de QR](../../../../archived/work-items/WI-002-spike-medicion-qr-android/README.md)
**Veredicto:** ⚠️ Viable con trabajo
**Subtipo:** técnico
**Timebox:** 1 día · consumido: 1 día (una sesión)
**Rama de referencia:** `spike/WI-002-medicion-qr-android` @ `22b1ef4` — no integrar
**Fecha:** 2026-10-08
**Autor:** juanca202 / Claude

## Resumen ejecutivo

El enfoque sirve: un móvil Android con Chrome lee QR de 400 B con corrección M a 30 cm en 10 de 10 intentos (mediana de 146 ms), `jsQR` y `BarcodeDetector` leen carga binaria, el protocolo reconstruye el archivo con hash correcto incluso con desorden, duplicados y fragmentos ajenos, y las APIs necesarias están disponibles. **No se llegó a medir una transferencia completa con cámara real, el modo sin red ni la elección entre transferencias en el móvil**, de modo que el veredicto es un juicio sobre un enfoque con riesgo residual acotado, no una confirmación de todos los umbrales. El hallazgo más importante para el diseño: con fragmentos de 400 B el objetivo de 1 MB en 15 minutos no se alcanza con el bucle secuencial salvo a más de 8 fotogramas por segundo; necesita fragmentos de 800 a 1200 B (leídos de forma estable) o un código de fuente (fountain). Recomendación: formalizar las historias con esos criterios de validación pendientes como criterios de aceptación y decidir antes de implementar el tamaño de fragmento y si se incluye corrección de errores. Las lagunas que quedan abiertas se resuelven en cada tarea que las implementa (ver «Lagunas abiertas y dónde se resuelven»).

## Qué se probó

Prototipo PWA estático en `spike/web/` (emisor, receptor, series de capacidad, entorno y registro) servido por túnel HTTPS a un móvil Android 10 con Chrome 154. El segundo móvil no se usó: el emisor fue el portátil.

| `IT-XX` | Planificado | Ejecutado | Desviación |
|---------|-------------|-----------|------------|
| IT-01 | Rama, prototipo PWA y archivos de prueba | Hecho; verificado en Chrome de escritorio con el bucle local (20 KB, binario y base64) | Ninguna |
| IT-02 | Portar el protocolo; comparar librerías de lectura; documentar APIs | Protocolo v2 portado; `jsQR` y `BarcodeDetector` probados en el móvil; APIs del entorno registradas | Solo un dispositivo y una comparación parcial (cada lector en una prueba distinta) |
| IT-03 | Capacidad por QR con N de 200 a 2000 y corrección L y M | N=400 (10 de 10), 800 y 1200 (series inválidas por solapamiento) con M a 30 cm | No se midieron 200, 1600 ni 2000, ni L, ni otras distancias. Cierre anticipado a petición del usuario |
| IT-04 | Confirmación de nombre y tamaño, 10 intentos con secuencia ajena | Implementada y probada en Node y en escritorio | **No probada con cámara ni con una secuencia ajena real** |
| IT-05 | Velocidad, p por fotograma y 10 transferencias de 1 MB | No ejecutado | Sin transferencias completas con cámara. Se usan el modelo del WI-001 y datos externos |
| IT-06 | Sin red con la app instalada | No ejecutado | Las pruebas se hicieron con red. `netRequests: 0`, pero no es una prueba offline |
| IT-07 | Informe | Este documento | Ninguna |

## Resultados por pregunta

| `Q-XX` | Criterio de éxito | Resultado observado | Resultado | Evidencia |
|--------|-------------------|---------------------|-----------|-----------|
| Q-01 | Capacidad con ≥ 9/10 lecturas de un QR estático a ~30 cm | N=400 B, M: **10/10**, tiempos 126 a 733 ms (mediana 146 ms). N=800: 11 de 17 entradas; N=1200: 16 de 18; ambas **no válidas** como serie (intentos solapados por pulsaciones rápidas) y solo indicativas | ✅ Cumple (para 400 B; máximo no determinado) | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json) |
| Q-02 | 1 MB en ≤ 15 min con hash idéntico, 9 de 10 intentos reales | Sin transferencias completas. El modelo del WI-001 da, con fragmentos de 400 B y 90 % de lectura por vuelta, 36,9 min a 5 fps y 23,2 min a 8 fps; con 1200 B, 11 y 6,5 min | ⏸️ No concluyente | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json), [EV-02](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-02-fuentes-externas.md) |
| Q-03 | Medir p y comparar la fórmula con ≥ 5 transferencias | Sin transferencias completas. Dato aislado: en la primera prueba (`BarcodeDetector`, 5 fps) se detectó un QR en 77 de 158 fotogramas | ⏸️ No concluyente | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json) |
| Q-04 | Una combinación que cumpla Q-01 y Q-02, y lista de APIs | `jsQR` cumple Q-01 en el móvil; `BarcodeDetector` lee carga binaria (51 fragmentos únicos válidos). Q-02 sin medir. APIs disponibles: cámara, service worker, `wakeLock`, compartir archivos, `showSaveFilePicker`, OPFS, `storage.persist` (no activo por defecto) | ⏸️ No concluyente (parcial) | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json) |
| Q-05 | 0 peticiones de red con la app instalada y sin red | El service worker controla la página y 0 peticiones propias de la app, pero con red. No se probó en modo avión | ⏸️ No concluyente | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json) |
| Q-06 | El receptor muestra nombre y tamaño y 0/10 transferencias ajenas completadas sin verlas | La política v2 impide en las pruebas de Node completar una ajena sin confirmación; la v1 reproduce H-01. No se probó con cámara | ⏸️ No concluyente | [EV-01](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json) |

## Hallazgos

Consolidan los de este spike y los del [WI-001](spike-report-WI-001-protocolo-transferencia-qr.md). Cada uno indica dónde se resuelve en la sección «Lagunas abiertas».

### Protocolo y fiabilidad (WI-001)

- **H-01: el receptor puede quedarse con una transferencia ajena.** El protocolo v1 fija la primera transferencia que ve; una secuencia ajena delante termina «completada» con el archivo equivocado (1 de 10 transferencias de 1 MB). La política v2 (confirmar nombre y tamaño) lo evita en pruebas de Node y escritorio; no se probó con cámara.
- **H-02: el protocolo reconstruye bien.** 9 de 10 transferencias de 1 MB idénticas con 30 % de pérdida, 5 % de fragmentos corruptos, duplicados y fragmentos ajenos (la décima fue H-01). Los cuatro resultados de FR-013 (completada, incompleta, datos inválidos, no reconstruible) salen correctos.
- **H-03: coste del protocolo.** 15 B de cabecera y CRC por fragmento (3,6 % con 400 B, 1,9 % con 800 B) más un QR de metadatos. El índice de fragmento ocupa 16 bits: con 800 B el límite es de unos 52 MB.
- **H-04: la fórmula de vueltas esperadas** (ln N / −ln(1−p) + 0,5) coincide con la simulación con un error medio de −6 %; con cámara real no se validó porque no hubo transferencias completas.
- **H-05: la simulación de cámara no sirve para fijar capacidades.** El ruido por píxel penaliza a `jsQR` con módulos grandes; solo sirve para comparar protocolos.

### Cámara y lectores (WI-002)

- **H-06: capacidad por QR.** 400 B con corrección M a 30 cm: 10 de 10 (mediana de lectura 146 ms). 800 B (11 de 17 entradas, mediana 346 ms) y 1200 B (16 de 18, mediana 267 ms) son solo indicativos: las series se solaparon por pulsaciones rápidas. Máximo estable no determinado.
- **H-07: `jsQR` y `BarcodeDetector` leen carga binaria** en Chrome 154 sobre Android 10 (51 fragmentos únicos válidos con `BarcodeDetector`, CRC correcto). `BarcodeDetector` devuelve texto y no existe en Safari ni Firefox; `jsQR` devuelve bytes y es la opción segura.
- **H-08: velocidad de escaneo.** El móvil procesó entre 7 y 60 fotogramas por segundo según el lector y la carga; en la primera prueba detectó un QR en 77 de 158 fotogramas a 5 fps. Sin transferencia completa no se conoce la probabilidad de lectura por vuelta.
- **H-09: el aviso de confirmación (v2) puede pasar desapercibido.** En la primera prueba el avance quedó en 0/0 porque nadie aceptó el aviso, aunque ya había 51 fragmentos recibidos. La interfaz debe mostrar el avance antes de confirmar y hacer visible el aviso.
- **H-10: fallos de montaje, no del protocolo.** Los fallos iniciales (3 de capacidad y las pruebas de recepción sin detecciones) se debieron a que el emisor mostraba otro contenido o el QR no estaba en cuadro.
- **H-11: intentos solapados.** Pulsaciones rápidas lanzan lecturas en paralelo sobre la misma cámara e inflan los tiempos; la interfaz definitiva debe admitir una lectura a la vez.
- **H-12: entorno del dispositivo probado.** Android 10, Chrome 154, 720×1280 a 60 fps con enfoque continuo, zoom hasta 10× y linterna; `wakeLock`, compartir archivos, `showSaveFilePicker`, OPFS y service worker disponibles; `storage.persist` existe pero no está activo por defecto; cuota de ~10 GB.
- **H-13: actualización del service worker.** Con la estrategia «caché primero» el móvil siguió con una versión antigua de la app tras desplegar una nueva. La implementación definitiva necesita una estrategia de actualización explícita.

### Tiempo de transferencia y datos externos

- **H-14: el objetivo de 1 MB en 15 minutos depende del tamaño de fragmento.** Con 400 B y 90 % de lectura por vuelta: 36,9 min a 5 fps y 23,2 min a 8 fps; con 1200 B: 11 y 6,5 min. Con el bucle secuencial solo se alcanza con fragmentos grandes o más de 8 fps.
- **H-15: los códigos de fuente (fountain) eliminan la espera de la vuelta completa.** Fuentes externas ([EV-02](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-02-fuentes-externas.md)) declaran 128 a 190 KB/s con ellos, cifras de un solo proyecto y de baja fiabilidad. Hoy la corrección de errores está fuera de alcance en el SRS-001.
- **H-16: capacidad teórica.** 2953 B (L) y 2331 B (M) en modo binario, coherente con lo medido por `qrcode`.
- **H-17: compatibilidad de lector.** `BarcodeDetector` solo en Chromium; Safari (iOS incluido) lo trae desactivado y Firefox no lo soporta.

## Lagunas abiertas y dónde se resuelven

**Regla:** este informe no abre más spikes. Toda laguna pendiente, y cualquier otra que aparezca al implementar, **se resuelve dentro de la tarea (`TK-XXX` o `WI-XXX`) que la implementa**, con un criterio de aceptación verificable (prueba automatizada o prueba manual con el guion de la rama) y registrando la decisión en el `progress.md` de esa tarea. Si una laguna bloquea la estimación de una historia, se escala a `/work-plan` como `WI-XXX`.

| Laguna | Origen | Dónde se resuelve |
|--------|--------|-------------------|
| Tamaño de fragmento por defecto (400 B validado; 800 a 2000 B sin serie válida) | H-06, H-14 | TK de protocolo de [US-001](../../../user-stories/US-001-enviar-archivo-qr/README.md): prueba manual con serie de 10 intentos secuenciales |
| Regla de velocidad automática (fps) | H-08, H-14 | TK de emisión de la US-001 |
| 1 MB en 15 minutos con hash idéntico (Q-02, Q-03) | H-14 | Criterio de aceptación de la US-001 y la [US-002](../../../user-stories/US-002-recibir-archivo-qr/README.md), verificado con transferencias reales |
| Modo sin red con la app instalada (Q-05) | H-12 | AC de funcionamiento sin conexión de la US-001 y la US-002; prueba manual en modo avión |
| Elección de transferencia con una secuencia ajena (Q-06, H-01) | H-01, H-09 | Criterio nuevo en la US-002 (`/work-define`): mostrar nombre y tamaño y pedir confirmación; prueba con cámara |
| Avance visible y aviso de confirmación antes de aceptar | H-09 | Criterio de la US-002 (progreso) y TK de interfaz de recepción |
| Una lectura a la vez y estados de cámara | H-11 | TK de interfaz de recepción |
| Corrección de errores o códigos de fuente | H-14, H-15 | Decisión del equipo antes de planificar; si se adopta, ADR con `arch-manage` y cambio del SRS-001 |
| Compatibilidad con iOS y Firefox, y lector de reserva | H-07, H-17 | NFR de compatibilidad del SRS-001 y TK del lector con `jsQR` |
| Persistencia del almacenamiento y cuota | H-12 | TK de almacenamiento de la [US-003](../../../user-stories/US-003-historial-transferencias/README.md) y AC de errores de cuota |
| Límite de fragmentos y tamaño máximo de archivo | H-03 | TK de protocolo (validación) y criterio de aviso en la US-001 |
| Estrategia de actualización del service worker | H-13 | TK de PWA de la US-001 y la US-002 |

## Diagnóstico

Lo que funcionó: lectura estable de QR de 400 B, protocolo íntegro, APIs presentes, PWA instalable con service worker. Lo que impide concluir del todo: no hay una transferencia completa medida con cámara, así que no se conoce la probabilidad de lectura por vuelta con fragmentos grandes, que decide el tiempo de 1 MB. Limitaciones del prototipo: un solo dispositivo, emisor en portátil, serie de capacidad parcial. Limitaciones del enfoque que heredaría la implementación definitiva: con bucle secuencial, el tiempo crece con las pérdidas; el receptor depende de que el usuario compruebe nombre y tamaño (H-01).

## Consideraciones para la implementación definitiva

1. **Decisiones que hay que tomar antes de implementar:**
   - Tamaño de fragmento por defecto: 400 B con M está validado; 800 a 1200 B hay que validarlo en una serie válida antes de fijarlo.
   - Corrección de errores o códigos de fuente: hoy fuera de alcance en el SRS-001. Es la mejora de mayor efecto sobre el tiempo; decidir si entra en esta versión.
   - Velocidad: mantener ≥ 5 fps solo si el tamaño de fragmento lo permite; la velocidad «automática» necesita una regla (p. ej. fija por defecto y ajustable por el emisor).
   - Elección de transferencia (H-01): el receptor muestra nombre y tamaño y pide confirmación antes de seguir (política v2).
2. **Deuda del prototipo que NO debe heredarse:** pestañas de medición, registro en `localStorage`, sin manejo de errores de cámara, protocolo sin plan de migración más allá del byte de versión, series de capacidad sin protección de solapamiento (corregida solo en el prototipo).
3. **Riesgos detectados:** objetivo de 1 MB en 15 min no garantizado con 400 B (mitigación: fragmentos mayores o códigos de fuente); cámara y brillo de pantalla dominan la fiabilidad; `BarcodeDetector` inexistente en Safari y Firefox (mitigación: `jsQR`); `storage.persist` desactivado por defecto (pedirlo).
4. **Dependencias confirmadas:** `jsQR` (lectura) y `qrcode` (generación) con carga binaria; `BarcodeDetector` opcional en Chromium.
5. **Estimación orientativa:** sin cambios respecto a US-001 (8) y US-002 (13); sumar el trabajo de corrección de errores si se decide.
6. **NFR propuestos para el SRS-001 (a validar en las historias):**
   - Compatibilidad: probado en Chrome 154 sobre Android 10; iOS y Firefox sin probar y sin `BarcodeDetector`.
   - Rendimiento: lectura de un QR de 400 B con corrección M a 30 cm en 9 de 10 intentos o más (medido: 10 de 10). Objetivo de 1 MB en 15 min: **no validado**, queda como criterio de aceptación a verificar.
7. **Validaciones pendientes que pasan a criterios de aceptación o pruebas de la historia:** transferencia completa con cámara, modo sin red, y elección de transferencia con una secuencia ajena real.

## Qué reutilizar de la rama

- `spike/web/protocol.js` — protocolo v2 con confirmación de nombre y tamaño, y receptor; referencia de lectura.
- `spike/web/app.js` — lógica de lectura con `jsQR` y `BarcodeDetector`, y series de capacidad; no copiar tal cual.
- `spike/GUIA-MEDICION.md` — guion de medición reutilizable para pruebas manuales de aceptación.

## Impacto en el artefacto / próximo paso

- Formalizar las historias con `/work-define`: actualizar [US-001](../../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../../user-stories/US-002-recibir-archivo-qr/README.md) con los criterios de este informe (tamaño de fragmento, confirmación de nombre y tamaño, criterios de verificación pendientes) y los NFR en el SRS-001.
- Registrar la decisión sobre corrección de errores o códigos de fuente (ADR con `arch-manage` si se adopta).
- `Resolución` de este WI: la fija el skill que cree el artefacto definitivo.

## Fuentes

- [Datos externos consultados (EV-02)](../../../../archived/work-items/WI-002-spike-medicion-qr-android/assets/EV-02-fuentes-externas.md)
- [Decimen Optical Transfer](https://github.com/tongatron/decimen-optical-transfer) — rendimiento publicado de QR animados con códigos de fuente.
- [MDN: BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) — soporte por navegador.
