# Progreso

## WI-002-spike-medicion-qr-android

<!-- work:id=WI-002 · status=Done -->
**Estado:** Done
**Tipo:** tarea de mantenimiento (spike)
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08

## Unidades

### WI-002: Medición con móviles Android de la transferencia por secuencia de QR

<!-- unit:id=WI-002 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ docs/specs/changes/work-items/WI-002-spike-medicion-qr-android/spike-report.md
+ spike/package.json
+ spike/.gitignore
+ spike/vendor-entry.js
+ spike/GUIA-MEDICION.md
+ spike/web/index.html
+ spike/web/app.js
+ spike/web/protocol.js
+ spike/web/vendor.js
+ spike/web/sw.js
+ spike/web/manifest.webmanifest
+ spike/web/icon.svg
+ docs/specs/changes/work-items/WI-002-spike-medicion-qr-android/assets/EV-01-mediciones-android-1.json
+ docs/specs/changes/work-items/WI-002-spike-medicion-qr-android/assets/EV-02-fuentes-externas.md
~ docs/specs/changes/work-items/WI-002-spike-medicion-qr-android/README.md
+ docs/specs/changes/work-items/WI-002-spike-medicion-qr-android/progress.md
```

**Notas:**
- IT-01 hecho: prototipo PWA estático (emisor, receptor, capacidad, entorno, registro) verificado en Chrome de escritorio con el modo «bucle local» (sin cámara): 20 KB en binario y en base64 llegan con hash correcto, 0 peticiones de red, service worker activo.
- IT-02 parcial: protocolo v2 portado al navegador y probado; el lector alternativo `BarcodeDetector` está integrado pero no se ha podido comparar (headless sin cámara). El resto de la comparación necesita los móviles.
- IT-03 a IT-07 pendientes de las mediciones con los dos móviles Android; guion en `spike/GUIA-MEDICION.md`.
- Primera tanda de mediciones (un móvil Android 10, Chrome 154; evidencia en `assets/EV-01-mediciones-android-1.json`): ninguna transferencia completa y ninguna serie de capacidad. Solo se usó `BarcodeDetector` con carga binaria. Lo aprovechable: `BarcodeDetector` lee QR con carga binaria en ese móvil (77 de 158 fotogramas con detección y 51 fragmentos únicos válidos a 5 fps en 21 s) y las APIs del entorno. Las lecturas no se completaron porque el aviso de confirmación (v2) no se llegó a aceptar (`confirmedAtMs` nulo); a 20 fps y en otra prueba de 150 s no hubo ninguna detección.
- Cambios tras esa tanda: el fragmento de metadatos lleva los parámetros del emisor (fragmento, corrección, fps, tamaño en píxeles), el registro del receptor guarda `seen` (todas las transferencias vistas, también las no confirmadas) y `pendingShownAtMs`, el aviso de confirmación se queda fijo arriba y vibra, y el service worker pasa a «red primero» (v2) para que los móviles reciban la versión nueva. Verificado de nuevo en Chrome de escritorio con el bucle local.
- Segunda tanda (mismo móvil): 3 intentos de capacidad con N=400, corrección M, 30 cm; los 3 fallaron con `detectedButWrong: true` (se leyó un QR válido pero con contenido distinto al esperado). Causa no determinada: pudo ser que el emisor siguiera mostrando la secuencia de la pestaña Enviar o que el N del emisor no coincidiera. No es evidencia de que 400 B no se lea. El registro de capacidad ahora guarda longitud leída, primeros bytes y si parece un fragmento del protocolo para distinguirlo.
- Tercera tanda (mismo móvil, lector jsQR): serie de capacidad N=400 B, corrección M, 30 cm: **10 de 10 lecturas correctas** (tiempo de lectura 126 a 733 ms; mediana 146 ms; la primera, 733 ms, incluye el enfoque). Cumple el criterio de éxito de Q-01 para esa capacidad (≥ 9/10). Los 3 fallos anteriores con el mismo N quedaron sin explicar (probable configuración del emisor) y no cuentan en esta serie.
- Cuarta tanda (mismo móvil, jsQR, corrección M, 30 cm): N=800 B → 11 lecturas correctas de 17 entradas (5 fallos sin detección al inicio, 1 lectura de otro contenido al final; mediana de lectura 346 ms); N=1200 B → 16 de 18 (mediana 267 ms). **Serie no válida:** las entradas llegaron en ráfagas de 0,15 a 0,5 s con tiempos de lectura de hasta 2,5 s, lo que indica intentos solapados (pulsaciones rápidas sobre el botón sin protección). Los tiempos están inflados y no se puede tratar como 10 intentos secuenciales. Indicio: 800 y 1200 B se leen con jsQR a 30 cm; sin confirmar.
- Cambio: el botón de intento ahora está protegido (un intento a la vez) y el registro guarda `serie` e `intento`. Las series de 800 B en adelante deben repetirse.
- Búsqueda de datos externos (a petición del usuario): resumen con fuentes y fiabilidad en `assets/EV-02-fuentes-externas.md`. Aportan contexto (capacidad teórica, rendimiento publicado de QR animados, soporte de BarcodeDetector) pero no sustituyen las mediciones propias.
- Cierre anticipado a petición del usuario («basarte en lo que ya tienes»): veredicto VIABLE_WITH_REWORK, con Q-02, Q-03, Q-04, Q-05 y Q-06 no concluyentes y Q-01 cumplida para 400 B. Es un juicio sobre el enfoque, no una confirmación de todos los umbrales; las validaciones pendientes pasan a criterios de aceptación.
- Timebox: 1 día (consumido). Inicio: 2026-10-08.

**Decisiones adicionales:**
- Se implementó la política de H-01 de forma que el receptor solo fija la transferencia tras confirmar nombre y tamaño (v2), con la política antigua (v1) como opción para contrastar.
- El prototipo es una PWA estática sin Angular, para no tocar el código de producción y poder servirla por túnel HTTPS a los móviles.
