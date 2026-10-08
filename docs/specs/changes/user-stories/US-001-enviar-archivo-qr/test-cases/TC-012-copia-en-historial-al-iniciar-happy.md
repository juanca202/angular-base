# TC-012 — Dado un archivo elegido para enviar, Cuando se inicia el envío, Entonces se guarda una copia en el almacenamiento privado y figura en el historial

<!-- tc:status=Ready · testType=Integration, E2E · criterion=AC-010 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Integration, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-010 (Procesamiento de datos)
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
| 1 | Usuario | Elegir prueba-100KB.bin | Comienza la emisión |
| 2 | Usuario | Cancelar y abrir el historial | Aparece una entrada «enviado» con el archivo y su contenido |

## Resultado esperado final

El historial contiene la copia del archivo enviado.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
