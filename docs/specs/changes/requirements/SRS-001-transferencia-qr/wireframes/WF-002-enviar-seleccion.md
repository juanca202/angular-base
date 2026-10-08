# WF-002: Enviar: QR e información del archivo

<!-- wireframe:review-status=approved -->
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../README.md)
**Tipo de solución:** Aplicación web — responsiva
**Estado de revisión:** Aprobado

## Objetivo de la pantalla

Tras elegir el archivo, mostrar únicamente el área con la secuencia de QR en bucle y, debajo, la información del archivo y el tiempo estimado. El emisor no sabe cuánto ha recibido el otro dispositivo (no hay canal de retorno), por lo que no muestra progreso de transmisión.

**Requisitos relacionados:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-014, FR-017, FR-018

## Estructura

Vista de escritorio (ancho):

![Wireframe de Enviar: QR e información](./WF-002-enviar-seleccion.svg)

Vista móvil (retrato, responsiva):

![Wireframe móvil](./WF-002-enviar-seleccion-movil.svg)

## Componentes clave

- Área del QR: secuencia en bucle, velocidad automática.
- Información del archivo: nombre, tipo, tamaño, QR totales y tiempo estimado por vuelta.
- Botón Cancelar: detiene la transmisión (única forma de terminar la secuencia en el emisor) y libera recursos.


## Historial de revisión

| Fecha | Observación del usuario | Resuelto en |
| ----- | ----------------------- | ----------- |
| 2026-10-08 | Versión inicial generada | — |
| 2026-10-08 | La app debe ser responsiva | Añadida variante móvil `WF-002-enviar-seleccion-movil.svg`; NFR-006 |
| 2026-10-08 | Fusionar selección y transmisión: el QR aparece al elegir el archivo, con la información y el tiempo estimado debajo | SVG de escritorio y móvil rehechos; requisitos relacionados ajustados |
| 2026-10-08 | El emisor no puede saber cuánto se ha transmitido: solo QR e información del archivo | Quitados barra de avance, vuelta actual y texto sobre el receptor; FR-006 ajustado |
