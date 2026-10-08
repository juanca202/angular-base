# TC-002 — Dado el selector de archivos abierto, Cuando el usuario lo cierra sin elegir ningún archivo, Entonces no se inicia ninguna transferencia

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-001 -->
**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-001 (Interacción de usuario)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| N/A | N/A | Sin datos específicos |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar «Enviar» | Se abre el selector |
| 2 | Usuario | Cerrar el selector sin elegir | Se vuelve a la pantalla de inicio sin QR ni transferencia |

## Resultado esperado final

No se muestra ninguna secuencia de QR y no se crea ninguna entrada en el historial.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
