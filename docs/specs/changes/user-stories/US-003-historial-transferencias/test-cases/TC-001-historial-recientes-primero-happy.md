# TC-001 — Dado un historial con envíos y recepciones, Cuando se abre la pantalla de inicio, Entonces se listan ambos tipos con su contenido del más reciente al más antiguo

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Salidas del sistema)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Historial con 4 entradas (ver datos de prueba).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Historial | Historial sembrado [propuesto]: recibido «foto.png» (20 KB, hace 3 días), enviado «informe.pdf» (150 KB, hace 2 días), recibido «notas.txt» (2 KB, hace 1 día), enviado «datos.bin» (100 KB, hace 1 hora) | Cuatro entradas de ambos tipos |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Abrir la pantalla de inicio | Se muestra el historial bajo los botones Enviar y Recibir |
| 2 | Usuario | Revisar el orden y el detalle de cada fila | Orden: datos.bin, notas.txt, informe.pdf, foto.png; cada fila muestra nombre, tipo (enviado/recibido) y su contenido o tamaño |

## Resultado esperado final

El historial lista las 4 transferencias, enviadas y recibidas, de la más reciente a la más antigua.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario).
