# TC-027 — Dado las pantallas de recepción y resultado con sus errores, Cuando se muestran a 360 px y a 1280 px, Entonces no hay desplazamiento horizontal

<!-- tc:status=Ready · testType=E2E, Visual Test · criterion=AC-017 · parent=US-002 -->
**Perspectiva:** Límite
**Tipo de prueba:** E2E, Visual Test
**Prioridad:** Media
**Criterio de aceptación:** AC-017 (Usabilidad)
**Artefacto padre:** US-002
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
| 1 | Sistema | Fijar 360 px y recorrer recepción, resultado y un error | Sin desplazamiento horizontal |
| 2 | Sistema | Repetir a 1280 px | Sin desplazamiento horizontal |

## Resultado esperado final

Las pantallas caben sin scroll horizontal de 360 a 1280 px.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
