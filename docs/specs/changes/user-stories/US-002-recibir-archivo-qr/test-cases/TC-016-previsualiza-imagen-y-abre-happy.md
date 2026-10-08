# TC-016 — Dado una recepción completada de una imagen, Cuando se muestra el resultado, Entonces se previsualiza la imagen, el clic la abre y el historial queda debajo

<!-- tc:status=Ready · testType=E2E · criterion=AC-010 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-010 (Interacción de usuario)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | foto.png [propuesto] | PNG de 20 KB |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Completar la recepción de foto.png | Se muestra la previsualización de la imagen |
| 2 | Usuario | Hacer clic en ella | Se abre la imagen |
| 3 | Usuario | Mirar debajo | El historial está directamente debajo |

## Resultado esperado final

La imagen se previsualiza y se abre al hacer clic.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
