# TC-006 — Dado un archivo del historial, Cuando se exporta por descarga, Entonces se obtiene un archivo con su nombre original y contenido idéntico

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-003 (Salidas del sistema)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Historial con «informe.pdf» (150 KB).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | informe.pdf [propuesto], 150 KB | Contenido conocido (hash SHA-256 anotado antes) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar Exportar en la fila de «informe.pdf» y elegir descargar | El navegador inicia la descarga |
| 2 | Usuario | Revisar el archivo descargado | Se llama «informe.pdf» y su SHA-256 coincide con el original |

## Resultado esperado final

El archivo descargado conserva nombre y contenido originales.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario).
