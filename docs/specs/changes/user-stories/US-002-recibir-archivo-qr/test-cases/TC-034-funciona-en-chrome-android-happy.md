# TC-034 — Dado Chrome para Android, Cuando se abre la app y se recibe un archivo, Entonces la recepción funciona

<!-- tc:status=Ready · testType=Manual · criterion=AC-022 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Manual
**Prioridad:** Alta
**Criterio de aceptación:** AC-022 (Compatibilidad)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Móvil Android con Chrome y túnel HTTPS a la app en desarrollo; segundo dispositivo o pantalla como emisor (guion `spike/GUIA-MEDICION.md` de la rama `spike/WI-002-medicion-qr-android`).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Abrir la app en Chrome para Android (probado: Chrome 154, Android 10) | La app abre |
| 2 | Usuario | Recibir prueba-100KB.bin | Recepción completada |

## Resultado esperado final

La recepción funciona en Chrome para Android.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
