# WF-002: Enviar: QR e información del archivo

<!-- wireframe:review-status=approved -->
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../README.md)
**Tipo de solución:** Aplicación web — responsiva
**Estado de revisión:** Aprobado

## Objetivo de la pantalla

Tras elegir el archivo, mostrar sobre el inicio (atenuado) una hoja inferior con la información del archivo en la cabecera (icono, nombre, tipo, tamaño, QR totales y tiempo estimado por vuelta, y menú ⋮) y, debajo, el área con la secuencia de QR en bucle, la barra de posición y, como único texto, «Toca el QR para iniciar o reiniciar la vuelta». El emisor no sabe cuánto ha recibido el otro dispositivo (no hay canal de retorno), por lo que no muestra progreso de transmisión.

**Requisitos relacionados:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-014, FR-017, FR-018, FR-026, FR-028, FR-031, FR-032, FR-033

## Estructura

Vista de escritorio (ancho):

![Wireframe de Enviar: QR e información](WF-002-enviar-seleccion.svg)

Vista móvil (retrato, responsiva):

![Wireframe móvil](WF-002-enviar-seleccion-movil.svg)

## Componentes clave

- Contenedor: en móvil la hoja inferior es un `mat-bottomsheet` (MatBottomSheet) y en escritorio, un diálogo centrado con `mat-dialog` (MatDialog); el contenido es el mismo y el inicio queda atenuado detrás.
- Área del QR: muestra el primer QR fijo al elegir el archivo. Es pulsable: el primer toque inicia la secuencia en bucle (velocidad automática) y los siguientes reinician la vuelta; en ambos casos mantiene el primer QR unos 3 s para que el receptor pueda capturarlo (FR-005, FR-026).
- Barra de posición (FR-028): bajo el QR, barra horizontal con una marca vertical que indica qué QR de la vuelta se muestra y, debajo, «QR n de N». Se puede tocar o arrastrar (o usar el teclado) para elegir desde qué QR continúa la secuencia; el QR elegido se retiene unos 3 s.
- Un solo QR en pantalla.
- Menú ⋮ junto al nombre del archivo, siempre con las opciones desplegadas y la elegida marcada con ✓ (FR-031, FR-032).
- Opción de densidad (FR-032), en el menú ⋮ junto al nombre del archivo: «Densidad» con 200, 400, 800, 1200 y 1600 B por QR (1600 por defecto, FR-032); cambiarlo reinicia la transferencia y se avisa en el aviso de la hoja.
- Las opciones de densidad y velocidad muestran la última elección del usuario, recordada entre visitas (FR-033).
- Opción de velocidad (FR-031), en el menú ⋮ junto al nombre del archivo: «Velocidad» con 4, 6, 8, 10 y 12 QR por segundo (8 por defecto).
- Cabecera de la hoja: icono de envío, nombre, tipo, tamaño, QR totales y tiempo estimado por vuelta.
- Cierre de la hoja (sin opción «Cancelar»; FR-014): al tocar fuera de ella o arrastrarla se detiene la transmisión (única forma de terminar la secuencia en el emisor) y se liberan los recursos.


## Historial de revisión

| Fecha | Observación del usuario | Resuelto en |
| ----- | ----------------------- | ----------- |
| 2026-10-08 | Versión inicial generada | — |
| 2026-10-08 | La app debe ser responsiva | Añadida variante móvil `WF-002-enviar-seleccion-movil.svg`; NFR-006 |
| 2026-10-08 | Fusionar selección y transmisión: el QR aparece al elegir el archivo, con la información y el tiempo estimado debajo | SVG de escritorio y móvil rehechos; requisitos relacionados ajustados |
| 2026-10-08 | El emisor no puede saber cuánto se ha transmitido: solo QR e información del archivo | Quitados barra de avance, vuelta actual y texto sobre el receptor; FR-006 ajustado |
| 2026-10-08 | Tocar el QR reinicia la vuelta reteniendo el primero unos 3 s (decisión tras pruebas con dispositivos) | Texto de ayuda añadido bajo el QR en SVG de escritorio y móvil; FR-026 |
| 2026-10-08 | La secuencia no debe iniciar sola: empieza con el primer toque en el QR, con la misma espera | Textos de ayuda actualizados en SVG de escritorio y móvil; FR-005 y FR-026 |
| 2026-10-08 | Barra con marca de posición en el emisor, interactiva, para elegir desde qué QR continuar | Barra añadida en SVG de escritorio y móvil; FR-028 |
| 2026-10-09 | Poder elegir la velocidad de la secuencia | Selector añadido en la descripción; FR-031 |
| 2026-10-09 | Poder elegir el tamaño de fragmento (densidad) | Selector añadido en la descripción; FR-032 |
| 2026-10-09 | Recordar la velocidad y la densidad entre cargas de la página | Texto añadido en la descripción; FR-033 |
| 2026-10-09 | Mostrar dos QR a la vez, uno secuencial y otro desde el final | Descripción actualizada (el wireframe muestra un QR); FR-035 |
| 2026-10-09 | Los dos QR no funcionaron en las pruebas con dispositivos: quitar la opción y dejar un solo QR | Descripción actualizada; FR-035 retirado (spike [WI-004](../references/spike-report-WI-004-dos-qr-a-la-vez.md)) |
| 2026-10-09 | Estructura de referencia (imagen del usuario): hoja inferior con cabecera del archivo (icono, nombre, datos, ⋮) y el QR con su barra debajo | SVG de escritorio y móvil rehechos; sin cambios de requisitos: la imagen muestra un botón «Transmitir» que no se incorporó (FR-005, FR-026 inician con el toque en el QR) |
| 2026-10-09 | Densidad y velocidad pasan al menú ⋮; texto inferior solo «Toca el QR para iniciar o reiniciar la vuelta»; sin la línea «toca o arrastra la barra» | SVG de escritorio y móvil rehechos (el menú se dibuja desplegado). La barra sigue siendo interactiva (FR-028) y conserva «QR n de N» |
| 2026-10-09 | El menú ⋮ debe mostrar las opciones desplegadas con la seleccionada marcada, y no tener «Cancelar» | SVG de escritorio y móvil rehechos; el cierre de la hoja detiene la transmisión (FR-014) |
| 2026-10-09 | Revisión de alineación SRS ↔ wireframes | La densidad marcada en el menú es 1600 B (valor por defecto de FR-032); FR-002, FR-006, FR-013, FR-014, FR-020, FR-031–FR-033 y la sección 11 del SRS actualizados |
| 2026-10-09 | Los modales de enviar y recibir deben ser `mat-bottomsheet` en móvil y `mat-dialog` en escritorio | Componentes clave actualizados con el contenedor por tamaño de pantalla; sin cambios en los SVG |
