# TC-010 — Dado un archivo del historial, Cuando se elimina y se confirma, Entonces desaparece del historial y el espacio usado disminuye en su tamaño

<!-- tc:status=Ready · testType=Integration, E2E · criterion=AC-004 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Integration, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Casos de uso)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Historial sembrado; se anota el espacio usado (`navigator.storage.estimate().usage`) antes.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Historial | Historial sembrado [propuesto]: recibido «foto.png» (20 KB, hace 3 días), enviado «informe.pdf» (150 KB, hace 2 días), recibido «notas.txt» (2 KB, hace 1 día), enviado «datos.bin» (100 KB, hace 1 hora) | «datos.bin» de 100 KB a eliminar |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar Eliminar en «datos.bin» | Se pide confirmación |
| 2 | Usuario | Confirmar | La fila desaparece |
| 3 | Sistema | Consultar de nuevo el espacio usado | Disminuye aproximadamente en 100 KB |

## Resultado esperado final

El archivo ya no figura en el historial y su espacio fue liberado.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario). El navegador puede redondear la estimación de uso; comparar con tolerancia.
