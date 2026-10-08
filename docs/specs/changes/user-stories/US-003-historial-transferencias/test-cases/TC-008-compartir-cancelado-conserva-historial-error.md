# TC-008 — Dado que se abrió la hoja de compartir, Cuando el usuario la cierra sin elegir aplicación, Entonces el historial y el archivo permanecen intactos

<!-- tc:status=Ready · testType=Manual · criterion=AC-003 · parent=US-003 -->
**Perspectiva:** Error
**Tipo de prueba:** Manual
**Prioridad:** Media
**Criterio de aceptación:** AC-003 (Salidas del sistema)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Chrome para Android; compartir disponible.
- Historial con «foto.png».

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | foto.png [propuesto], 20 KB | — |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar Exportar en «foto.png» y elegir compartir | Se abre la hoja de compartir |
| 2 | Usuario | Cerrar la hoja sin elegir aplicación | Se vuelve al historial sin error bloqueante |

## Resultado esperado final

La entrada «foto.png» sigue en el historial con su contenido; no se eliminó ni se corrompió.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario). Supuesto: el mensaje (si lo hay) ante cancelación no está especificado.
