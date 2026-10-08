# TC-014 — Dado una recepción completada, Cuando se guarda el archivo, Entonces queda en el almacenamiento privado con nombre y tipo originales sin pedir permisos de carpeta

<!-- tc:status=Ready · testType=Integration · criterion=AC-009 · parent=US-002 -->
**Perspectiva:** Happy Path
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
| Archivo | informe.pdf, application/pdf [propuesto] | 5 KB determinista |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Completar la recepción de informe.pdf | Se guarda automáticamente |
| 2 | Sistema | Leer la entrada del almacenamiento | Nombre y tipo coinciden; no hubo pedido de permisos |

## Resultado esperado final

El archivo queda guardado con nombre y tipo originales.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
