# TC-038 — Dado una recepción completada, Cuando se guarda el archivo, Entonces se solicita almacenamiento persistente

<!-- tc:status=Ready · testType=Integration · criterion=AC-025 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Integration
**Prioridad:** Baja
**Criterio de aceptación:** AC-025 (Fiabilidad)
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
| 1 | Sistema | Completar una recepción | Se guarda el archivo |
| 2 | Sistema | Observar las llamadas a `navigator.storage.persist` | Se solicitó el almacenamiento persistente |

## Resultado esperado final

Se solicita almacenamiento persistente al guardar.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
