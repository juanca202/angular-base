# WF-001: Inicio e historial

<!-- wireframe:review-status=approved -->
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../README.md)
**Tipo de solución:** Aplicación web — responsiva
**Estado de revisión:** Aprobado

## Objetivo de la pantalla

Pantalla simple con cabecera «QRTransfer», dos tarjetas con icono (Enviar / Recibir, con su descripción; en escritorio una junto a la otra, en móvil una bajo la otra) y, debajo, «Actividad reciente»: el historial de transferencias con filtros. Enviar y Recibir abren su flujo como hoja inferior sobre esta pantalla, que queda atenuada detrás; en escritorio la hoja es un diálogo centrado.

**Requisitos relacionados:** FR-001, FR-007, FR-016, FR-018, FR-019, FR-022, NFR-002, NFR-006

## Estructura

Vista de escritorio (ancho):

![Wireframe de Inicio e historial](WF-001-inicio-historial.svg)

Vista móvil (retrato, responsiva):

![Wireframe móvil](WF-001-inicio-historial-movil.svg)

## Componentes clave

- Tarjeta Enviar (`mat-card`; icono, «Enviar» y «Transfiere archivos mediante QR»): abre el selector de archivos del dispositivo; al elegir un archivo pasa a WF-002.
- Tarjeta Recibir (`mat-card`; icono, «Recibir» y «Escanea código QR para recibir datos»): abre WF-004.
- «Actividad reciente»: filas con icono de dirección, nombre, movimiento, tamaño y antigüedad, con filtro Todos / Recibidos / Enviados (`mat-button-toggle-group` con un `mat-button-toggle` por opción, selección única, «Todos» por defecto).
- Menú ⋮ por fila: Exportar y Eliminar.

## Estados de la pantalla

- Historial vacío: Mensaje «Aún no hay transferencias» en lugar de la tabla.

## Historial de revisión

| Fecha | Observación del usuario | Resuelto en |
| ----- | ----------------------- | ----------- |
| 2026-10-08 | Versión inicial generada | — |
| 2026-10-08 | La app debe ser responsiva | Añadida variante móvil `WF-001-inicio-historial-movil.svg`; NFR-006 |
| 2026-10-08 | Interfaz sencilla: 2 botones con icono, historial debajo con filtros; Enviar abre el file picker | SVG de escritorio y móvil rehechos; requisitos relacionados ajustados |
| 2026-10-09 | Estructura de referencia (imagen del usuario): cabecera de marca, tarjetas Enviar/Recibir, «Actividad reciente» y flujos como hoja inferior | SVG de escritorio y móvil rehechos; el menú ⋮ de cada fila conserva Exportar/Eliminar (FR-016, FR-019) |
| 2026-10-09 | Nombre «QRTransfer»; tarjetas Enviar/Recibir en horizontal en escritorio y en vertical en móvil | SVG de escritorio y móvil rehechos |
| 2026-10-09 | Indicar los componentes de Angular Material: `mat-card` en las tarjetas y `mat-button-toggle` en los filtros | Componentes clave actualizados; filtro dibujado como control segmentado en los SVG de escritorio y móvil |
