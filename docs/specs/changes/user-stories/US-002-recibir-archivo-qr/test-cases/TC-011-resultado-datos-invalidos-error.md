# TC-011 — Dado todos los fragmentos recibidos pero con contenido alterado, Cuando falla la verificación de integridad, Entonces el resultado es «datos inválidos»

<!-- tc:status=Ready · testType=Unit · criterion=AC-007 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-007 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Receptor ejecutable sin cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Alterar el contenido de un fragmento y recalcular su CRC | El fragmento pasa su verificación propia |
| 2 | Sistema | Entregar todos | El hash global no coincide: «datos inválidos» |

## Resultado esperado final

Se informa «datos inválidos».

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
