# TC-021 — Dado un envío con parámetros por defecto, Cuando se fragmenta y se codifica, Entonces cada fragmento lleva 400 B de datos con corrección M

<!-- tc:status=Ready · testType=Unit · criterion=AC-016 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-016 (Procesamiento de datos)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Protocolo y codificación de QR ejecutables sin cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Fragmentar prueba-100KB.bin sin configurar parámetros | Los fragmentos de datos tienen 400 B |
| 2 | Sistema | Codificar un fragmento en QR | El nivel de corrección es M |

## Resultado esperado final

El tamaño por defecto es 400 B de datos por QR con corrección M.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
