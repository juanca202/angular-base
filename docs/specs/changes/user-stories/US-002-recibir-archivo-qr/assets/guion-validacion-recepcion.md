# Guion de validación manual de la recepción (US-002)

Pruebas con dispositivos reales que la automatización no cubre. Las ejecuta una persona; los resultados se anotan en la hoja de registro del final y se trasladan al `progress.md` de [TK-007](../TK-007-validacion-manual-y-e2e-recepcion.md).

Casos de prueba que cubre: [TC-001](../test-cases/TC-001-recibir-lee-qr-sin-fotos-happy.md) y [TC-034](../test-cases/TC-034-funciona-en-chrome-android-happy.md) (lectura continua en Chrome para Android), [TC-035](../test-cases/TC-035-lector-de-reserva-sin-barcodedetector-error.md) (lector de reserva en un navegador sin `BarcodeDetector`), [TC-036](../test-cases/TC-036-lectura-400b-m-30cm-9-de-10-happy.md) (9 de 10 lecturas), [TC-037](../test-cases/TC-037-recepcion-1mb-en-15-minutos-happy.md) (1 MB en 15 minutos) y [TC-026](../test-cases/TC-026-recepcion-modo-avion-movil-happy.md) (modo avión). Lo demás de la recepción (confirmación, resultados, cancelar, guardado, previsualización segura, cero peticiones y ancho de pantalla) lo cubren los E2E de [`e2e/receive-flow.spec.ts`](../../../../../../e2e/receive-flow.spec.ts) y [`e2e/receive-offline.spec.ts`](../../../../../../e2e/receive-offline.spec.ts) con una cámara simulada.

> Los E2E simulan la cámara: no prueban la óptica, el enfoque, el brillo ni el rendimiento reales. Eso es lo que verifica este guion. En esta versión el **emisor es la aplicación** (`/enviar`, US-001), así que ambos extremos usan la misma app.

## 0. Preparación

1. Sirve la aplicación por HTTPS a los móviles (la cámara y la instalación como PWA lo exigen). Con la compilación de producción: `npx ng build`, sirve `dist/angular-base/browser` con respaldo a `index.html` y expónlo con un túnel (`cloudflared tunnel --url http://localhost:<puerto>`).
2. **Emisor** (móvil A o una pantalla): abre `https://…/enviar` con red. Brillo de pantalla al 50 %.
3. **Receptor** (móvil B, Chrome para Android; probado: Chrome 154 sobre Android 10): abre `https://…/recibir` con red y, desde el menú ⋮, **Instalar aplicación**.
4. Condiciones constantes: móviles apoyados, luz de interior, receptor a unos 30 cm del emisor. Anota cualquier cambio.
5. Archivos de prueba deterministas: `prueba-100KB.bin` (102 400 B) y `prueba-1MB.bin` (1 048 576 B) con todos los bytes a `0x07`. SHA-256 de referencia: calcúlalo del original con `shasum -a 256`.

## 1. Lectura continua en Chrome para Android (TC-001, TC-034)

1. Receptor: abre la app instalada, pulsa **Recibir** en el inicio. Se activa la cámara y **no hay que pulsar nada más** para leer.
2. Emisor: `/enviar` → elige `prueba-100KB.bin`.
3. Receptor: debe mostrar el aviso «¿Recibir «prueba-100KB.bin» (100.0 KB)?» con el avance ya visible. Pulsa **Confirmar**.
4. Espera a «completada»: debe verse la previsualización con el historial debajo.
5. Exporta el archivo desde el historial y compara su SHA-256 con el del original: debe ser **idéntico**.

## 2. Serie de lecturas de un QR de 400 B (TC-036)

Criterio: 9 aciertos o más de 10 lecturas secuenciales a unos 30 cm con corrección M.

1. Emisor: muestra un QR de la secuencia en una pantalla fija (pausa la secuencia con una captura o usa un archivo de un solo fragmento de datos).
2. Receptor: en `/recibir`, realiza **10 intentos secuenciales**: apunta, espera hasta 3 s a que se lea y vuelve a empezar.
3. Anota los aciertos.

## 3. Recepción de 1 MB cronometrada (TC-037)

1. Emisor: `/enviar` → elige `prueba-1MB.bin`.
2. Receptor: `/recibir`; **cronometra** desde que aparece el aviso de confirmación hasta «completada».
3. Compara el SHA-256 del archivo recibido con el del original.
4. Repite **10 veces** si el tiempo lo permite. Objetivo (DEBERÍA, no bloquea): ≤ 15 min con hash idéntico.
5. Si no se llega a 15 min, deja el resultado documentado: con 400 B por fragmento y 8 fps, el modelo del spike estima unos 23 minutos con 90 % de lectura por vuelta. La decisión (tamaño de fragmento o velocidad) se toma con la historia.

## 4. Modo avión (TC-026)

1. Con la aplicación instalada en el receptor y ya abierta una vez con red, activa **modo avión** y apaga el wifi.
2. Abre la aplicación instalada desde el icono: debe abrir.
3. Recibe `prueba-100KB.bin` desde el emisor: debe completarse y guardarse.
4. Con el móvil por USB, `chrome://inspect` → pestaña Network: debe haber **0 peticiones** durante la recepción (los iconos pueden salir de la caché de la aplicación).

## 5. Lector de reserva en un navegador sin BarcodeDetector (TC-035)

El E2E de la reserva usa imágenes de QR reales en una cámara simulada; aquí se comprueba con una cámara de verdad.

1. Receptor: abre `/recibir` en un navegador sin `BarcodeDetector` (Firefox para Android o Safari en iOS; compatibilidad **sin probar** hasta ahora).
2. Emisor: `/enviar` → `prueba-100KB.bin`.
3. Anota si se lee la secuencia, cuánto tarda y si se completa con hash idéntico.

## Hoja de registro

| Fecha | Prueba | Dispositivo emisor / receptor | Condiciones | Resultado | Notas |
| ----- | ------ | ----------------------------- | ----------- | --------- | ----- |
|       | TC-001 · TC-034 · lectura continua |  |  | Lee solo ✔/✘ · Hash idéntico ✔/✘ |  |
|       | TC-036 · QR de 400 B, M, 30 cm |  |  |  /10 |  |
|       | TC-037 · 1 MB (intento 1) |  |  |  min  s · hash ✔/✘ |  |
|       | TC-026 · modo avión |  |  | Abre ✔/✘ · Recibe ✔/✘ · Peticiones: |  |
|       | TC-035 · lector de reserva |  |  | Lee ✔/✘ · Tiempo: |  |
