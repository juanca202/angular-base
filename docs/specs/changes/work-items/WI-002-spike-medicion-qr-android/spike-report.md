# Informe del spike WI-002: Medición con móviles Android de la transferencia por secuencia de QR

<!-- spike:verdict=VIABLE_WITH_REWORK · timebox=1d/1d · branch=spike/WI-002-medicion-qr-android · head=22b1ef4 · generated=2026-10-08 -->
**Spike:** [WI-002: Medición con móviles Android de la transferencia por secuencia de QR](README.md)
**Veredicto:** ⚠️ Viable con trabajo
**Subtipo:** técnico
**Timebox:** 1 día · consumido: 1 día (una sesión)
**Rama de referencia:** `spike/WI-002-medicion-qr-android` @ `22b1ef4` — no integrar
**Fecha:** 2026-10-08
**Autor:** juanca202 / Claude

## Resumen ejecutivo

El enfoque sirve: un móvil Android con Chrome lee QR de 400 B con corrección M a 30 cm en 10 de 10 intentos (mediana de 146 ms), `jsQR` y `BarcodeDetector` leen carga binaria, el protocolo reconstruye el archivo con hash correcto incluso con desorden, duplicados y fragmentos ajenos, y las APIs necesarias están disponibles. **No se llegó a medir una transferencia completa con cámara real, el modo sin red ni la elección entre transferencias en el móvil**, de modo que el veredicto es un juicio sobre un enfoque con riesgo residual acotado, no una confirmación de todos los umbrales. El hallazgo más importante para el diseño: con fragmentos de 400 B el objetivo de 1 MB en 15 minutos no se alcanza con el bucle secuencial salvo a más de 8 fotogramas por segundo; necesita fragmentos de 800 a 1200 B (leídos de forma estable) o un código de fuente (fountain). Recomendación: formalizar las historias con esos criterios de validación pendientes como criterios de aceptación y decidir antes de implementar el tamaño de fragmento y si se incluye corrección de errores.

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
| Q-01 | Capacidad con ≥ 9/10 lecturas de un QR estático a ~30 cm | N=400 B, M: **10/10**, tiempos 126 a 733 ms (mediana 146 ms). N=800: 11 de 17 entradas; N=1200: 16 de 18; ambas **no válidas** como serie (intentos solapados por pulsaciones rápidas) y solo indicativas | ✅ Cumple (para 400 B; máximo no determinado) | [EV-01](assets/EV-01-mediciones-android-1.json) |
| Q-02 | 1 MB en ≤ 15 min con hash idéntico, 9 de 10 intentos reales | Sin transferencias completas. El modelo del WI-001 da, con fragmentos de 400 B y 90 % de lectura por vuelta, 36,9 min a 5 fps y 23,2 min a 8 fps; con 1200 B, 11 y 6,5 min | ⏸️ No concluyente | [EV-01](assets/EV-01-mediciones-android-1.json), [EV-02](assets/EV-02-fuentes-externas.md) |
| Q-03 | Medir p y comparar la fórmula con ≥ 5 transferencias | Sin transferencias completas. Dato aislado: en la primera prueba (`BarcodeDetector`, 5 fps) se detectó un QR en 77 de 158 fotogramas | ⏸️ No concluyente | [EV-01](assets/EV-01-mediciones-android-1.json) |
| Q-04 | Una combinación que cumpla Q-01 y Q-02, y lista de APIs | `jsQR` cumple Q-01 en el móvil; `BarcodeDetector` lee carga binaria (51 fragmentos únicos válidos). Q-02 sin medir. APIs disponibles: cámara, service worker, `wakeLock`, compartir archivos, `showSaveFilePicker`, OPFS, `storage.persist` (no activo por defecto) | ⏸️ No concluyente (parcial) | [EV-01](assets/EV-01-mediciones-android-1.json) |
| Q-05 | 0 peticiones de red con la app instalada y sin red | El service worker controla la página y 0 peticiones propias de la app, pero con red. No se probó en modo avión | ⏸️ No concluyente | [EV-01](assets/EV-01-mediciones-android-1.json) |
| Q-06 | El receptor muestra nombre y tamaño y 0/10 transferencias ajenas completadas sin verlas | La política v2 impide en las pruebas de Node completar una ajena sin confirmación; la v1 reproduce H-01. No se probó con cámara | ⏸️ No concluyente | [EV-01](assets/EV-01-mediciones-android-1.json) |

## Hallazgos

### Tiempo de transferencia y tamaño de fragmento

Con el bucle secuencial, el tiempo depende del número de fragmentos y de cuántas vueltas hagan falta. Con 400 B por fragmento, 1 MB son unos 2623 fragmentos: a 5 fps cada vuelta dura 8,7 min, y con un 90 % de lectura por vuelta se necesitan unas 4 vueltas. Con 1200 B son 875 fragmentos y unos 11 min a 5 fps. Los datos externos ([EV-02](assets/EV-02-fuentes-externas.md)) indican que los códigos de fuente eliminan la espera de la vuelta completa, pero son cifras de un solo proyecto.

### Lectura de series de capacidad

Con N=800 y 1200 B hay lecturas correctas con tiempos de hasta 2,5 s, pero las entradas llegaron en ráfagas de 0,15 a 0,5 s: pulsaciones rápidas lanzaron intentos solapados. Se corrigió el botón (un intento a la vez); las series de 800 B en adelante hay que repetirlas.

### Fallos de configuración

Las primeras pruebas (3 de capacidad y las de recepción) fallaron por el montaje (el emisor mostraba otro contenido o el QR no estaba en cuadro), no por el protocolo. Conviene que la interfaz definitiva muestre qué se ve y qué falta.

### Lectura binaria con `BarcodeDetector`

`BarcodeDetector` devuelve el contenido como texto, y aun así los fragmentos binarios llegaron intactos en ese móvil (CRC válido). No se ha comprobado en otros modelos; `jsQR` devuelve bytes directamente y es la opción más segura.

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

- Formalizar las historias con `/work-define`: actualizar [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) con los criterios de este informe (tamaño de fragmento, confirmación de nombre y tamaño, criterios de verificación pendientes) y los NFR en el SRS-001.
- Registrar la decisión sobre corrección de errores o códigos de fuente (ADR con `arch-manage` si se adopta).
- `Resolución` de este WI: la fija el skill que cree el artefacto definitivo.

## Fuentes

- [Datos externos consultados (EV-02)](assets/EV-02-fuentes-externas.md)
- [Decimen Optical Transfer](https://github.com/tongatron/decimen-optical-transfer) — rendimiento publicado de QR animados con códigos de fuente.
- [MDN: BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) — soporte por navegador.
