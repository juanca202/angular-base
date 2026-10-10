# WF-005: Resultado de la recepción y previsualización

<!-- wireframe:review-status=approved -->
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../README.md)
**Tipo de solución:** Aplicación web — responsiva
**Estado de revisión:** Aprobado

## Objetivo de la pantalla

Al recibir todo el archivo, mostrar en una hoja inferior sobre el inicio una marca de éxito, el mensaje «Archivo <nombre> recibido exitosamente.», la previsualización (la imagen, o un icono de archivo con su nombre; al hacer clic se abre el archivo) y solo dos botones: «Abrir» y «Descargar». La hoja se cierra al tocar fuera de ella o al arrastrarla, y deja visible el historial actualizado en el inicio. Si la transferencia no termina bien, informar el resultado en la misma hoja.

**Requisitos relacionados:** FR-012, FR-013, FR-014, FR-015, FR-016, FR-020, FR-021, FR-022, NFR-007

## Estructura

Vista de escritorio (ancho):

![Wireframe de Resultado de la recepción](WF-005-resultado-recepcion.svg)

Vista móvil (retrato, responsiva):

![Wireframe móvil](WF-005-resultado-recepcion-movil.svg)

## Componentes clave

- Contenedor: en móvil la hoja inferior es un `mat-bottomsheet` (MatBottomSheet) y en escritorio, un diálogo centrado con `mat-dialog` (MatDialog); el contenido es el mismo y el inicio queda atenuado detrás.
- Previsualización: si el archivo es imagen, se muestra la imagen; si es otro tipo, un icono de archivo con su nombre.
- Clic en la previsualización: abre el archivo.
- Botones Abrir y Descargar: únicas acciones de la hoja. Al cerrarla se vuelve al inicio, donde el historial (con filtros y Exportar / Eliminar, como en WF-001) incluye el archivo recién recibido.

## Estados de la pantalla

- Error (incompleta, datos inválidos, no reconstruible, almacenamiento lleno): tarjeta de resultado con su acción (Seguir escaneando / Reintentar); el historial queda en el inicio; no se guarda ningún archivo — [escritorio](WF-005-resultado-recepcion-error.svg), [móvil](WF-005-resultado-recepcion-error-movil.svg).
- Error «almacenamiento lleno» (FR-013, FR-022): tarjeta que informa que la cuota se agotó, no se guardó ni registró nada y ofrece descargar el archivo recién recibido y Reintentar.

## Historial de revisión

| Fecha | Observación del usuario | Resuelto en |
| ----- | ----------------------- | ----------- |
| 2026-10-08 | Versión inicial generada | — |
| 2026-10-08 | La app debe ser responsiva | Añadida variante móvil `WF-005-resultado-recepcion-movil.svg`; NFR-006 |
| 2026-10-08 | Al terminar mostrar previsualización (imagen, o icono con nombre; clic abre el archivo) y debajo el historial | SVG rehechos (éxito y error, escritorio y móvil); FR-020 nuevo |
| 2026-10-08 | Cuota agotada al guardar una recepción completa: error con opción de descargar el archivo | Variante añadida en los SVG de error (escritorio y móvil); FR-013 y FR-022. Aprobado |
| 2026-10-09 | Estructura de referencia (imagen del usuario): hoja de éxito con marca, mensaje, previsualización y «Aceptar» | SVG de escritorio y móvil rehechos (éxito y error); FR-020 conserva «Ver archivo» y «Descargar» |
| 2026-10-09 | La hoja de éxito solo tiene «Abrir» y «Descargar» (sin «Aceptar») | SVG de escritorio y móvil rehechos |
| 2026-10-09 | La hoja de resultado debe ser `mat-bottomsheet` en móvil y `mat-dialog` en escritorio | Componentes clave actualizados con el contenedor por tamaño de pantalla; sin cambios en los SVG |
