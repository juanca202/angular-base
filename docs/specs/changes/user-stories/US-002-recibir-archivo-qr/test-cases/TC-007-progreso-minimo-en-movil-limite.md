# TC-007 — Dado una recepción en curso en un viewport de 360 px, Cuando se muestra la pantalla, Entonces se ven al menos nombre, tamaño, tiempo y porcentaje

<!-- tc:status=Ready · testType=E2E · criterion=AC-005 · parent=US-002 -->
**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-005 (Salidas del sistema)
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
| 1 | Sistema | Fijar el viewport a 360 px | Pantalla en formato móvil |
| 2 | Usuario | Iniciar y confirmar una recepción | Se ven al menos nombre, tamaño, tiempo y porcentaje |

## Resultado esperado final

En móvil la información mínima es visible.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
