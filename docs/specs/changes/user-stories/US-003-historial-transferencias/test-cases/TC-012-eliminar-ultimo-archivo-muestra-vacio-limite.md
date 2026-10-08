# TC-012 — Dado un historial con una sola entrada, Cuando se elimina y se confirma, Entonces el historial queda vacío y se muestra el estado vacío

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-003 -->
**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-004 (Casos de uso)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Historial con una única entrada.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | «notas.txt» [propuesto], 2 KB | Única entrada |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Eliminar «notas.txt» y confirmar | La fila desaparece |
| 2 | Usuario | Revisar la pantalla | Se muestra «Aún no hay transferencias» |

## Resultado esperado final

El historial queda vacío con su mensaje y el espacio liberado.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario).
