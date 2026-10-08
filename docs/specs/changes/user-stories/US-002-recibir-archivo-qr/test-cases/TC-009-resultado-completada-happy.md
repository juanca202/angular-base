# TC-009 — Dado todos los fragmentos válidos recibidos, Cuando la verificación de integridad es satisfactoria, Entonces el resultado es «completada»

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-007 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-007 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Entregar todos los fragmentos válidos | Verificación satisfactoria |
| 2 | Usuario | Ver el resultado | Se muestra «completada» |

## Resultado esperado final

Se informa «completada».

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
