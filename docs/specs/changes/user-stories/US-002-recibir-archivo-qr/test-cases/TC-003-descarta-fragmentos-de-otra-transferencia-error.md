# TC-003 — Dado un receptor con una transferencia activa confirmada, Cuando llegan fragmentos de otra transferencia, Entonces se descartan sin afectar el resultado

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
| 1 | Sistema | Activar una transferencia A | Queda fijada |
| 2 | Sistema | Entregar fragmentos de una transferencia B | Se descartan como ajenos |
| 3 | Sistema | Completar A | Se reconstruye A intacta |

## Resultado esperado final

Los fragmentos ajenos no alteran el resultado.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
