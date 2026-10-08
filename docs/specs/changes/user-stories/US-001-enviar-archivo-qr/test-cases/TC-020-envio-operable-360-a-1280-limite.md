# TC-020 — Dado la pantalla de envío y sus estados de error, Cuando se muestra a 360 px y a 1280 px de ancho, Entonces no hay desplazamiento horizontal y todo es operable

<!-- tc:status=Ready · testType=E2E, Visual Test · criterion=AC-015 · parent=US-001 -->
**Perspectiva:** Límite
**Tipo de prueba:** E2E, Visual Test
**Prioridad:** Media
**Criterio de aceptación:** AC-015 (Usabilidad)
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
| 1 | Sistema | Fijar el viewport a 360 px y recorrer emisión y un estado de error | Sin desplazamiento horizontal |
| 2 | Sistema | Repetir a 1280 px | Sin desplazamiento horizontal; todo operable |

## Resultado esperado final

Las pantallas de envío y sus errores caben sin scroll horizontal de 360 a 1280 px.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
