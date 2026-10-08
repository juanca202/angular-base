# TC-022 — Dado una recepción completada y una cuota agotada, Cuando se intenta guardar, Entonces se avisa del problema y no se registra en el historial

<!-- tc:status=Ready · testType=Integration · criterion=AC-012 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-012 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1MB.bin [propuesto] | Binario determinista de 1 MB (1 048 576 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Simular cuota agotada | No cabe el archivo |
| 2 | Sistema | Completar la recepción | Se avisa con un mensaje claro; no hay entrada en el historial |

## Resultado esperado final

Aviso de espacio y sin entrada en el historial.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). La cuota se simula con un doble del almacenamiento.
