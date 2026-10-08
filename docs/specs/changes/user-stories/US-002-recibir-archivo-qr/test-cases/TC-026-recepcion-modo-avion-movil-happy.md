# TC-026 — Dado la app instalada en el móvil, Cuando se activa el modo avión y se recibe un archivo, Entonces la recepción funciona sin red

<!-- tc:status=Ready · testType=Manual · criterion=AC-016 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Manual
**Prioridad:** Media
**Criterio de aceptación:** AC-016 (Fiabilidad)
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
| 1 | Usuario | Instalar la app con red | App instalada |
| 2 | Usuario | Activar modo avión y abrir la app | La app abre |
| 3 | Usuario | Recibir prueba-100KB.bin | Recepción completada |

## Resultado esperado final

La recepción funciona en modo avión.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Registrar netRequests del Registro (debe ser 0).
