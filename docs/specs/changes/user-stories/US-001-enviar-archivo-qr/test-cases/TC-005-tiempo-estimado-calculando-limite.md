# TC-005 — Dado un archivo recién elegido sin datos suficientes para estimar, Cuando la pantalla de emisión aparece por primera vez, Entonces el tiempo estimado se muestra como «calculando…»

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-001 -->
**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-003 (Salidas del sistema)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1MB.bin [propuesto] | Binario determinista de 1 MB (1 048 576 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Elegir prueba-1MB.bin | Se muestra la pantalla de emisión |
| 2 | Usuario | Observar el tiempo estimado justo al aparecer | Muestra «calculando…» hasta tener datos |

## Resultado esperado final

Mientras no hay datos suficientes el tiempo estimado se muestra como «calculando…».

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
