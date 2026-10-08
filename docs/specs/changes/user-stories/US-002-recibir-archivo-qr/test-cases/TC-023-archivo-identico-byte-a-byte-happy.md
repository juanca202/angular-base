# TC-023 — Dado un archivo recibido completo, Cuando se compara con el original, Entonces es idéntico byte a byte

<!-- tc:status=Ready · testType=Unit, Integration · criterion=AC-013 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-013 (Fiabilidad)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Protocolo y receptor ejecutables sin cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1MB.bin [propuesto] | Binario determinista de 1 MB (1 048 576 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Transferir prueba-1MB.bin por el protocolo | Recepción completada |
| 2 | Sistema | Comparar byte a byte con el original | Sin diferencias |

## Resultado esperado final

El archivo recibido es idéntico al original.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
