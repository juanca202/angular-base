# TC-012 — Dado fragmentos con metadatos inconsistentes, Cuando no se puede ensamblar el archivo, Entonces el resultado es «no reconstruible»

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
| 1 | Sistema | Corromper el fragmento de metadatos conservando su CRC válido | Metadatos ilegibles |
| 2 | Sistema | Entregar todos | Se informa «no reconstruible» |

## Resultado esperado final

Se informa «no reconstruible».

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
