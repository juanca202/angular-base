# TC-007 — Dado un archivo del historial en Chrome para Android, Cuando se exporta compartiéndolo, Entonces se abre el selector de aplicaciones con el archivo y su nombre original

<!-- tc:status=Ready · testType=Manual · criterion=AC-003 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Manual
**Prioridad:** Alta
**Criterio de aceptación:** AC-003 (Salidas del sistema)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Chrome para Android (probado en Chrome 154 / Android 10) con la app instalada o abierta; compartir archivos disponible. Manual por requerir el selector nativo del dispositivo.
- Historial con «foto.png».

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | foto.png [propuesto], 20 KB | Imagen conocida |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar Exportar en la fila de «foto.png» y elegir compartir | Se abre la hoja de compartir del sistema |
| 2 | Usuario | Compartir con una aplicación que muestre el nombre del archivo | La aplicación recibe «foto.png» con el contenido íntegro |

## Resultado esperado final

El archivo se comparte con su nombre original.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario). Fuera de Chrome para Android no hay garantía (NFR-008).
