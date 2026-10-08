# TC-001 — Dado la pantalla de inicio, Cuando el usuario pulsa «Enviar» y elige un archivo, Entonces se inicia la transferencia con ese único archivo

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario)
**Artefacto padre:** US-001
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
| 1 | Usuario | Pulsar «Enviar» | Se abre el selector de archivos del dispositivo |
| 2 | Usuario | Elegir prueba-100KB.bin | Se inicia la transferencia y aparece la pantalla de emisión |

## Resultado esperado final

El selector de archivos se abre y, tras elegir un archivo de cualquier tipo, comienza la emisión.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
