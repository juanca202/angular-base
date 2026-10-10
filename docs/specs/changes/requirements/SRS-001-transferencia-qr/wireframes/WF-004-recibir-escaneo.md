# WF-004: Recibir: escaneo e información

<!-- wireframe:review-status=approved -->
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../README.md)
**Tipo de solución:** Aplicación web — responsiva
**Estado de revisión:** Aprobado

## Objetivo de la pantalla

Hoja inferior sobre el inicio (atenuado) con la cabecera del archivo (icono de recepción, nombre, «QR n de N» y menú ⋮), la vista de cámara y, debajo, la fila de datos (peso, tiempo restante, porcentaje), la barra de fragmentos y el botón «Cerrar».

**Requisitos relacionados:** FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-014, FR-022, FR-023, FR-027, FR-029, FR-036

## Estructura

Vista de escritorio (ancho):

![Wireframe de Recibir: escaneo e información](WF-004-recibir-escaneo.svg)

Vista móvil (retrato, responsiva):

![Wireframe móvil](WF-004-recibir-escaneo-movil.svg)

## Componentes clave

- Contenedor: en móvil la hoja inferior es un `mat-bottomsheet` (MatBottomSheet) y en escritorio, un diálogo centrado con `mat-dialog` (MatDialog); el contenido es el mismo y el inicio queda atenuado detrás.
- Vista de cámara sin marco fijo (FR-036): el recuadro aparece sobre el QR solo mientras la cámara lo detecta, alineado con su posición, se mantiene unos 0,4 s si un cuadro falla y desaparece al detener la lectura.
- Información: nombre, tamaño total, tiempo estimado restante, fragmentos recibidos de total.
- Barra de progreso con porcentaje recibido.
- Botón Cerrar (antes «Terminar lectura»): el usuario da por terminada la lectura; si faltan fragmentos, el resultado es «incompleta» (WF-005).
- Sin aviso de confirmación (FR-023): al leer los metadatos la transferencia se activa sola y la información de nombre, tamaño y fragmentos se actualiza de inmediato.
- Fila de datos (FR-011): bajo el nombre del archivo, una fila con reparto uniforme (`justify-between`) con, en este orden, el peso del archivo, el tiempo aproximado restante y el porcentaje de progreso.
- Barra de fragmentos (FR-029): única barra de la pantalla, bajo la fila de datos; con el orden de los QR, los recibidos se pintan en verde y los que faltan quedan en gris, para saber qué tramo buscar en el emisor. Su leyenda incluye «N de M fragmentos» (oculto en pantallas estrechas).
- Panel de diagnóstico (FR-027): línea de contadores visible solo al abrir la pantalla con `?debug`; no forma parte de la interfaz normal.
- Cancelar (en el menú ⋮ de la cabecera de la hoja): descarta lo recibido y libera la cámara, sin confirmación.

## Estados de la pantalla

- Sin permiso de cámara: Mensaje que pide conceder el permiso y botón para reintentar.
- Transferencia activa: tomada la primera cuyos metadatos se leyeron, el receptor ignora los fragmentos de otras durante la recepción (FR-023); al completarse todos los fragmentos se verifica y guarda sin intervención.
- Esperando primer QR: Información y progreso vacíos hasta leer el primer fragmento.

## Historial de revisión

| Fecha | Observación del usuario | Resuelto en |
| ----- | ----------------------- | ----------- |
| 2026-10-08 | Versión inicial generada | — |
| 2026-10-08 | La app debe ser responsiva | Añadida variante móvil `WF-004-recibir-escaneo-movil.svg`; NFR-006 |
| 2026-10-08 | Pantalla de recibir más simple: cámara arriba; abajo tamaño total, tiempo estimado y barra con porcentaje | SVG de escritorio y móvil rehechos; requisitos relacionados ajustados |
| 2026-10-08 | Definir «incompleta» como decisión del usuario al terminar la lectura | Botón «Terminar lectura» añadido en SVG de escritorio y móvil; FR-013. Aprobado |
| 2026-10-08 | Spike WI-002 (H-01, H-09): confirmar nombre y tamaño antes de activar la transferencia y hacer visible el aviso | Aviso añadido en SVG de escritorio y móvil; FR-023. Aprobado |
| 2026-10-08 | El aviso de confirmación no es necesario (pruebas con dispositivos) | Aviso, «Confirmar» y «Descartar» quitados de los SVG de escritorio y móvil; FR-023 reescrito. Aprobado |
| 2026-10-08 | Barra con los fragmentos recibidos para saber dónde buscar | Barra añadida en SVG de escritorio y móvil; FR-029 |
| 2026-10-09 | Dibujar un recuadro sobre el QR solo cuando se detecta, en lugar de un marco siempre visible | Marco punteado fijo quitado de los SVG de escritorio y móvil y sustituido por el recuadro sobre un QR de ejemplo; FR-036 |
| 2026-10-09 | Quitar la primera barra de progreso y dejar solo la de fragmentos, con peso, tiempo y porcentaje arriba en una fila repartida | SVG de escritorio y móvil rehechos; FR-011 |
| 2026-10-09 | Estructura de referencia (imagen del usuario): hoja inferior con cabecera del archivo y cámara con la fila de datos debajo | SVG de escritorio y móvil rehechos; se conserva «Terminar lectura» (FR-013), que la imagen no muestra |
| 2026-10-09 | El botón «Terminar lectura» pasa a llamarse «Cerrar» | SVG de escritorio y móvil rehechos; el comportamiento de FR-013 no cambia |
| 2026-10-09 | Los modales de enviar y recibir deben ser `mat-bottomsheet` en móvil y `mat-dialog` en escritorio | Componentes clave actualizados con el contenedor por tamaño de pantalla; sin cambios en los SVG |
