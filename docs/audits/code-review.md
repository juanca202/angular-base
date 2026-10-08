# Code Review — US-002-recibir-archivo-qr

**Fecha:** 2026-10-08 18:13
**Rama:** feature/US-002-recibir-archivo-qr
**Commit:** 9fcd1a5
**Modo:** default
**Diff:** main @13769f0 — 42 archivos (sin contar docs ni `package-lock.json`), +3947/−130 líneas
**Veredicto:** ✅ Aprobado — cero hallazgos bloqueantes; seis menores y dos sugerencias.

## Resumen

Se revisó el trabajo de US-002 (recepción de un archivo escaneando una secuencia de QR) contra su base: decodificador y reensamblador del protocolo, guardado, lector de cámara, gestor de la recepción, pantallas de recepción y resultado, previsualización segura y E2E. El diseño es coherente con ADR-001 (tras mover el historial a `shared/components`) y ADR-011, y la lógica de negocio vive en el gestor y en un módulo puro, no en los componentes. No hay hallazgos que bloqueen; los menores son de robustez ante fallos poco frecuentes y de mantenibilidad.

## Intención detectada

Tomada de [US-002](../specs/changes/user-stories/US-002-recibir-archivo-qr/README.md) y sus TK-001 a TK-007: leer con la cámara, sin fotos manuales, una secuencia de QR; tolerar duplicados, desorden y lecturas corruptas; pedir confirmar nombre y tamaño antes de activar una transferencia; reconstruir y verificar con SHA-256; guardar solo si la verificación es satisfactoria; informar los cuatro resultados; permitir cancelar, seguir escaneando y reintentar; no ejecutar contenido activo; no hacer peticiones de red.

## Hallazgos

Leyenda de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Limpio.

### Análisis semántico (intención)

✅ Limpio — la implementación resuelve el problema pedido: cada criterio que depende del código tiene su comportamiento (confirmación antes de activar y descarte que ignora fragmentos, guardado solo tras verificar, cancelar sin confirmar, previsualización sin ejecutar scripts, cero peticiones). Los criterios de rendimiento medidos con cámara real (AC-023, AC-024) no son verificables en el código y quedan para la validación manual.

### Arquitectura y diseño

- 🟡 `[ISO-25010: Fiabilidad]` Un fallo inesperado al arrancar la cámara deja la pantalla inerte — **Qué:** si `video.play()` o cualquier paso de `QrCameraReader.start` falla con algo que no es un `CameraError`, `ReceiveManager.openCamera` lo relanza y `ReceivePage` lo descarta con `void this.start()`. **Por qué:** nada lo captura ni se muestra un mensaje. **Impacto:** el usuario ve «Esperando el primer QR…» con «Terminar lectura» deshabilitado; solo puede cancelar. La causa más probable (autoplay) ya se corrigió con `[muted]="true"`. **Sugerencia:** en `openCamera`, convertir cualquier error no tipado en un error de cámara mostrable (o un código `unknown`) en lugar de relanzarlo.
- 🟡 `[ISO-25010: Fiabilidad]` `complete()` no cubre el fallo de `assembler.finish()` — **Qué:** si `crypto.subtle.digest` lanza, la fase queda en `finishing` para siempre. **Por qué:** solo se protege el guardado, no la reconstrucción. **Impacto:** bajo (la cámara ya exige contexto seguro, donde `crypto.subtle` existe), pero un fallo dejaría la pantalla bloqueada con los botones deshabilitados. **Sugerencia:** envolver `finish()` y resolver como `unreconstructable`.
- 🟡 `[ISO-25010: Mantenibilidad]` Efectos secundarios dentro de un `computed` — **Qué:** `FilePreview.imageUrl` crea y revoca URLs de objeto dentro de `computed()`. **Por qué:** un `computed` debe ser puro; hoy funciona porque se lee siempre desde la plantilla. **Impacto:** si cambia cómo se consume, se podría perder una URL o crearla de más. **Sugerencia:** `effect` con `onCleanup` (o `linkedSignal`) para el ciclo de vida de la URL.
- 🟡 `[ISO-25010: Mantenibilidad]` Método público solo por pruebas — **Qué:** `QrDecoder.grabFrame` es público únicamente para poder sustituirlo en las pruebas. **Por qué:** amplía la API del servicio. **Impacto:** menor. **Sugerencia:** extraer la captura de fotograma a un colaborador inyectable.
- 🟡 `[ISO-25010: Mantenibilidad]` `ReceiveManager` conserva la referencia al `<video>` — **Qué:** `cancel()` no pone `this.video` a `null`. **Por qué:** mantiene vivo un nodo del DOM tras salir de la pantalla. **Impacto:** fuga menor mientras la app siga abierta. **Sugerencia:** limpiarla en `cancel()`.
- 🟡 `[ISO-25010: Mantenibilidad]` Pruebas negativas con esperas fijas — **Qué:** varios E2E negativos usan `waitForTimeout(800–1000)`. **Por qué:** una espera fija es más lenta y puede ser frágil en CI cargado. **Impacto:** menor. **Sugerencia:** esperar a una condición observable donde exista (p. ej. un contador de lecturas consumidas del simulador).
- 💡 `[ISO-25010: Eficiencia en el desempeño]` `jsQR` sobre fotogramas a resolución completa — **Qué:** el lector de reserva decodifica el fotograma entero cada 50 ms. **Por qué:** a 720p o más puede ocupar bastante el hilo principal y no mejora la lectura de un QR de ~300 px. **Sugerencia:** reducir el canvas de captura (p. ej. a 640 px de ancho) y medirlo con el móvil de la validación manual.
- 💡 `[ISO-25010: Seguridad]` El nombre del archivo lo decide el emisor — **Qué:** el nombre recibido se muestra, se guarda y se exporta sin filtrar caracteres de control o de dirección de texto. **Por qué:** permite nombres engañosos (extensiones invertidas). **Impacto:** bajo; la exportación la hace el navegador y no se ejecuta nada. **Sugerencia:** valorar normalizar esos caracteres al mostrar, decisión que hoy está fijada por US-003 (exportar el nombre tal cual).

### Dimensiones no evaluadas

Ninguna.

### Feedback adicional

- Bien resuelto: la separación en un módulo puro (`parseFragment`, `FragmentAssembler`) probado contra el formato real de `fragmentFile`; un ensamblador por transferencia candidata, que evita mezclar una secuencia ajena con la propia; y la regla de apertura segura (solo tipos pasivos en pestaña nueva con `noopener`, el resto se descarga), que cierra el vector de scripts en SVG y HTML. Los E2E con cámara simulada y con QR reales para `jsQR` aportan evidencia que las pruebas unitarias no dan.
- El corte de arquitectura detectado por `quality-check` (una feature importando otra) se resolvió moviendo el historial a `shared/components`; la dirección de dependencias queda según ADR-001.

## Próximas acciones

1. Sin acciones bloqueantes.
2. Valorar los hallazgos menores en una tarea de endurecimiento: errores inesperados de la cámara y de `finish()`, y el ciclo de vida de la URL de la previsualización.
3. Medir con el móvil de la validación manual si conviene reducir la resolución de captura del lector de reserva.

## Justificaciones aceptadas

Ninguna.

<!-- code-review:verdict=APPROVED · mode=default · fingerprint=a6e59f7141dc3bff835e28bc11681282ac3ca0d9 · base=13769f0 · generated=2026-10-08 -->
