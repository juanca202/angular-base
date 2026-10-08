# TC-024 — Dado un archivo que requiere más fragmentos de los que admite el protocolo, Cuando el usuario lo elige para enviar, Entonces se informa con un mensaje claro y no se inicia la transferencia

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-018 · parent=US-001 -->
**Perspectiva:** Límite
**Tipo de prueba:** Unit, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-018 (Salidas del sistema)
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
| 1 | Sistema | Configurar un archivo cuyo fragmentado supere el máximo del protocolo (65 535) | El cálculo excede el límite |
| 2 | Usuario | Elegirlo para enviar | Mensaje claro; no hay emisión |

## Resultado esperado final

Mensaje claro y sin transferencia.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Para evitar un archivo real de ~26 MB, simular el tamaño a nivel de la función que calcula los fragmentos.
