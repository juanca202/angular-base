# TC-002 — Dado un receptor con una transferencia activa, Cuando llegan fragmentos con la verificación propia inválida, Entonces se descartan sin afectar el resultado

<!-- tc:status=Ready · testType=Unit · criterion=AC-002 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Procesamiento de datos)
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
| 1 | Sistema | Alterar un byte de varios fragmentos | Fragmentos con CRC inválido |
| 2 | Sistema | Entregarlos junto con los válidos | Los corruptos se cuentan y se descartan; el archivo se reconstruye igual |

## Resultado esperado final

Los fragmentos corruptos se descartan y el resultado no cambia.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
