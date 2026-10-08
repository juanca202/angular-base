# Guion de validación manual del envío (US-001)

Pruebas con dispositivos reales que la automatización no cubre. Las ejecuta una persona; los resultados se anotan en la hoja de registro del final y se trasladan al `progress.md` de [TK-006](../TK-006-validacion-manual-y-e2e-envio.md).

Casos de prueba que cubre: [TC-018](../test-cases/TC-018-envio-modo-avion-movil-happy.md) (modo avión), [TC-022](../test-cases/TC-022-serie-10-lecturas-para-tamano-mayor-limite.md) (serie de lecturas por tamaño) y [TC-023](../test-cases/TC-023-1mb-en-15-minutos-happy.md) (1 MB en 15 minutos). Como la recepción de la aplicación (US-002) aún no está implementada, el dispositivo **receptor** usa el prototipo del spike (`spike/web/`, rama `spike/WI-002-medicion-qr-android`); la guía completa de ese prototipo es `spike/GUIA-MEDICION.md` en esa rama (referencia de lectura).

## 0. Preparación

1. Sirve la aplicación por HTTPS a los móviles (la cámara y la instalación como PWA lo exigen). Con la compilación de producción: `npx ng build`, sirve `dist/angular-base/browser` con respaldo a `index.html` y expónlo con un túnel (`cloudflared tunnel --url http://localhost:<puerto>`).
2. **Emisor** (móvil A, Chrome para Android): abre la URL `https://…/enviar` con red y, desde el menú ⋮, **Instalar aplicación**. Deja la pantalla al 50 % de brillo.
3. **Receptor** (móvil B, Chrome para Android): abre el prototipo del spike, pestaña **Capacidad → Receptor**.
4. Condiciones constantes: móviles apoyados, luz de interior, receptor a unos 30 cm del emisor. Anota cualquier cambio.
5. Archivos de prueba deterministas: `prueba-100KB.bin` (102 400 B) y `prueba-1MB.bin` (1 048 576 B) con todos los bytes a `0x07`.

## 1. Serie de lecturas por tamaño de fragmento (TC-022)

Objetivo: decidir si un tamaño de fragmento mayor que 400 B puede adoptarse por defecto (criterio: 9 aciertos o más de 10 lecturas secuenciales a unos 30 cm con corrección M).

1. En el emisor, muestra un QR **estático** del tamaño candidato (con corrección M).
2. En el receptor, realiza **10 intentos de lectura secuenciales** (apunta, pulsa, espera hasta 3 s).
3. Anota los aciertos. Repite para cada tamaño candidato (por ejemplo 400, 800 y 1200 B).
4. Un tamaño distinto de 400 B solo se adopta con **≥ 9 de 10**; si no, se mantiene 400 B.

## 2. Envío de 1 MB cronometrado (TC-023)

1. Emisor: `/enviar` → elige `prueba-1MB.bin`. Confirma que se muestran nombre, tipo, tamaño, total de QR y tiempo por vuelta, y que el QR cambia solo.
2. Receptor: inicia la lectura y **cronometra** desde que empieza hasta que la recepción se completa.
3. Compara el SHA-256 del archivo recibido con el del original.
4. Repite **10 veces** si el tiempo lo permite. Objetivo (DEBERÍA, no bloquea): ≤ 15 min con hash idéntico.
5. Si no se llega a 15 min, deja el resultado documentado: con 400 B por fragmento y 8 fps, el modelo del spike estima unos 23 minutos con 90 % de lectura por vuelta. La decisión (ajustar tamaño de fragmento o velocidad) se toma con la historia.

## 3. Modo avión (TC-018)

1. Con la aplicación instalada en el emisor, activa **modo avión** y apaga el wifi.
2. Abre la aplicación instalada desde el icono: debe abrir.
3. Envía `prueba-100KB.bin`: la emisión debe empezar y el receptor debe poder completar la lectura.
4. Con el móvil por USB, `chrome://inspect` → pestaña Network: debe haber **0 peticiones** durante el envío.

## Hoja de registro

| Fecha | Prueba | Dispositivo emisor / receptor | Condiciones | Resultado | Notas |
| ----- | ------ | ----------------------------- | ----------- | --------- | ----- |
|       | TC-022 · 400 B |  |  |  /10 |  |
|       | TC-022 · 800 B |  |  |  /10 |  |
|       | TC-022 · 1200 B |  |  |  /10 |  |
|       | TC-023 · 1 MB (intento 1) |  |  |  min  s · hash ✔/✘ |  |
|       | TC-018 · modo avión |  |  | Abre ✔/✘ · Emite ✔/✘ · Peticiones: |  |
