# TC-003 — Dado un historial mixto, Cuando se elige el filtro Recibidos, Entonces solo se muestran las transferencias recibidas

<!-- tc:status=Ready · testType=E2E · criterion=AC-002 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Interacción de usuario)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Historial mixto sembrado.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Historial | Historial sembrado [propuesto]: recibido «foto.png» (20 KB, hace 3 días), enviado «informe.pdf» (150 KB, hace 2 días), recibido «notas.txt» (2 KB, hace 1 día), enviado «datos.bin» (100 KB, hace 1 hora) | Dos recibidas y dos enviadas |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Pulsar el filtro «Recibidos» | Se muestran solo foto.png y notas.txt, del más reciente al más antiguo |

## Resultado esperado final

La lista contiene únicamente las transferencias recibidas.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario).
