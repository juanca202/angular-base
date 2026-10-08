# TC-004 — Dado todos los fragmentos de un archivo, Cuando se entregan en orden aleatorio, Entonces el archivo se reconstruye idéntico

<!-- tc:status=Ready · testType=Unit · criterion=AC-003 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-003 (Procesamiento de datos)
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
| 1 | Sistema | Barajar los fragmentos de prueba-100KB.bin | Orden aleatorio |
| 2 | Sistema | Entregarlos al receptor | Se reordenan por posición y se reconstruye |

## Resultado esperado final

El archivo resultante es idéntico al original.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
