# Guion de validación manual del historial (US-003)

Pruebas con un dispositivo real que la automatización no cubre. Las ejecuta una persona; los resultados se anotan en la hoja de registro del final y se trasladan al `progress.md` de la tarea [TK-004](../TK-004-validacion-manual-y-e2e-historial.md).

Casos de prueba que cubre: [TC-007](../test-cases/TC-007-exportar-compartiendo-con-otras-apps-happy.md) (compartir con otras aplicaciones) y [TC-008](../test-cases/TC-008-compartir-cancelado-conserva-historial-error.md) (cancelar compartir).

## 0. Preparación

1. Sirve la aplicación por HTTPS al móvil (compartir archivos y la instalación como PWA lo exigen). Con la compilación de producción: `npx ng build`, sirve `dist/angular-base/browser` y publica el puerto con un túnel HTTPS.
2. Móvil con **Chrome para Android** (probado en Chrome 154 / Android 10). Abre la URL raíz `https://…/`.
3. Crea una entrada en el historial sin sembrar nada: desde **Enviar**, elige `foto.png` (una imagen de unos 20 KB) y vuelve a la pantalla de inicio. El envío guarda una copia y figura como «Enviado».
4. Ten a mano una aplicación que muestre el nombre del archivo recibido (Mensajes, Drive, Gmail o similar).

## 1. Compartir con otra aplicación (TC-007)

1. En la fila de `foto.png`, comprueba que aparece el botón **Compartir** (solo se muestra si el navegador lo ofrece).
2. Pulsa **Compartir**: debe abrirse la hoja de compartir del sistema.
3. Elige una aplicación que muestre el nombre del archivo.
4. Verifica que la aplicación recibe **`foto.png`** con su contenido íntegro (misma imagen).

> Nota: en la pantalla, **Exportar** descarga el archivo y **Compartir** abre la hoja del sistema; el TC-007 habla de «Exportar y elegir compartir», que aquí son dos botones.

## 2. Cancelar compartir (TC-008)

1. Pulsa **Compartir** en la fila de `foto.png`.
2. Cierra la hoja sin elegir ninguna aplicación (botón atrás o toque fuera).
3. Verifica que vuelves al historial **sin mensaje de error bloqueante** y que `foto.png` sigue en la lista.
4. Pulsa **Exportar** y comprueba que la descarga del archivo sigue funcionando (el contenido no se corrompió).

## 3. Iconos de los botones

Observación pendiente de la implementación: los nombres de icono de Enviar, Recibir, Exportar, Compartir y Eliminar no se pudieron verificar contra el sprite de Factor Icons. Anota si algún botón muestra el icono vacío o roto (la acción lleva texto, así que sigue siendo operable).

## Hoja de registro

| Fecha | Prueba | Dispositivo / navegador | Resultado | Notas |
| ----- | ------ | ----------------------- | --------- | ----- |
|       | TC-007 · compartir | | Hoja ✔/✘ · Nombre ✔/✘ · Contenido ✔/✘ | |
|       | TC-008 · cancelar compartir | | Sin error ✔/✘ · Entrada conservada ✔/✘ · Exportar OK ✔/✘ | |
|       | Iconos de los botones | | Enviar ✔/✘ · Recibir ✔/✘ · Exportar ✔/✘ · Compartir ✔/✘ · Eliminar ✔/✘ | |
