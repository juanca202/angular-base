# TC-008 — Dado todos los fragmentos recibidos, Cuando se completa la lectura, Entonces se reconstruye y verifica sin acción del usuario y se libera la cámara

<!-- tc:status=Ready · testType=Integration, E2E · criterion=AC-006 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Integration, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-006 (Procesamiento de datos)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo). Bucle local o cámara simulada.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Entregar todos los fragmentos de prueba-100KB.bin | La recepción llega al 100 % |
| 2 | Sistema | Observar sin intervenir | Se verifica automáticamente y se libera la cámara |
| 3 | Usuario | Comprobar el indicador de cámara | La cámara ya no está activa |

## Resultado esperado final

El resultado aparece sin acción del usuario y la cámara se libera.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
