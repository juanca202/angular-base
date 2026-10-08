# TC-008 — Dado un archivo mayor que la capacidad de un QR, Cuando se fragmenta, Entonces se generan múltiples QR que reconstruyen el archivo

<!-- tc:status=Ready · testType=Unit, Integration · criterion=AC-006 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-006 (Casos de uso)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Protocolo ejecutable sin interfaz ni cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Fragmentar prueba-100KB.bin con fragmentos de 400 B | Se generan más de 250 fragmentos |
| 2 | Sistema | Reensamblarlos en el receptor | El archivo resultante es idéntico al original |

## Resultado esperado final

El archivo se reconstruye idéntico a partir de múltiples QR.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
