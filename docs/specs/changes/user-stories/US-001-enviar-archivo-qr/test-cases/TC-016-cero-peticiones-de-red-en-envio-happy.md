# TC-016 — Dado la app cargada y una captura de tráfico de red activa, Cuando se envía un archivo completo, Entonces no se produce ninguna petición de red durante el envío

<!-- tc:status=Ready · testType=E2E · criterion=AC-012 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-012 (Seguridad)
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
| 1 | Sistema | Activar captura de peticiones tras la carga | La captura está activa |
| 2 | Usuario | Enviar prueba-100KB.bin y cancelar tras una vuelta | Comienza y termina la emisión |
| 3 | Sistema | Revisar las peticiones capturadas | No hay ninguna, ni telemetría |

## Resultado esperado final

Cero peticiones de red durante el envío.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
