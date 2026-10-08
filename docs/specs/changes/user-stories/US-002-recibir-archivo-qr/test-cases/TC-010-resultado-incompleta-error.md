# TC-010 — Dado una recepción con fragmentos faltantes, Cuando el usuario pulsa «Terminar lectura», Entonces el resultado es «incompleta»

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-007 · parent=US-002 -->
**Perspectiva:** Error
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
| 1 | Sistema | Entregar el 50 % de los fragmentos | Faltan fragmentos |
| 2 | Usuario | Pulsar «Terminar lectura» | Se muestra «incompleta» |

## Resultado esperado final

Se informa «incompleta».

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
