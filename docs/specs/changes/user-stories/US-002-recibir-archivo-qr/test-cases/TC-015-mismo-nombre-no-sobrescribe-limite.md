# TC-015 — Dado un archivo con el mismo nombre ya guardado, Cuando se recibe otro con ese nombre, Entonces ambos quedan como entradas distintas

<!-- tc:status=Ready · testType=Integration · criterion=AC-009 · parent=US-002 -->
**Perspectiva:** Límite
**Tipo de prueba:** Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-009 (Procesamiento de datos)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | informe.pdf (×2) [propuesto] | Contenidos distintos |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Recibir informe.pdf | Primera entrada |
| 2 | Sistema | Recibir otro informe.pdf | El primero no se sobrescribe |
| 3 | Sistema | Listar el almacenamiento | Dos entradas distintas |

## Resultado esperado final

Dos recepciones con el mismo nombre dejan dos entradas.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
