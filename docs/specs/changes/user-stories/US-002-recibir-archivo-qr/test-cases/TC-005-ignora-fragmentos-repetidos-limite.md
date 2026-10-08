# TC-005 — Dado fragmentos ya recibidos, Cuando se entregan de nuevo varias veces, Entonces se ignoran sin alterar el resultado

<!-- tc:status=Ready · testType=Unit · criterion=AC-004 · parent=US-002 -->
**Perspectiva:** Límite
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Procesamiento de datos)
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
| 1 | Sistema | Entregar cada fragmento tres veces | Los repetidos se cuentan como duplicados |
| 2 | Sistema | Completar la recepción | El resultado es idéntico |

## Resultado esperado final

Los duplicados no cambian el resultado.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
