# TC-017 — Dado la app cargada una vez con red, Cuando se desactiva la red y se envía un archivo, Entonces el envío funciona completamente

<!-- tc:status=Ready · testType=E2E · criterion=AC-013 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-013 (Fiabilidad)
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
| 1 | Sistema | Cargar la app con red y registrar el service worker | La app queda cacheada |
| 2 | Sistema | Pasar a modo sin conexión y recargar | La app abre |
| 3 | Usuario | Enviar prueba-100KB.bin | La emisión comienza normalmente |

## Resultado esperado final

El envío funciona sin conexión.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
