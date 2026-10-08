# TC-013 — Dado un archivo de 0 bytes, Cuando el usuario lo elige para enviar, Entonces se muestra un mensaje claro y no se inicia la transferencia

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-011 · parent=US-001 -->
**Perspectiva:** Error
**Tipo de prueba:** Unit, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-011 (Salidas del sistema)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | vacio.bin [propuesto] | 0 bytes |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Elegir vacio.bin (0 B) | Se muestra un mensaje indicando que el archivo está vacío |
| 2 | Usuario | Observar la pantalla | No hay QR ni entrada en el historial |

## Resultado esperado final

Mensaje claro y sin transferencia iniciada.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
