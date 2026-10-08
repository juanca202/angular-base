# TC-006 — Dado una recepción en curso confirmada, Cuando avanza la lectura, Entonces se muestran nombre, tamaño, tiempo restante, fragmentos recibidos del total y barra con porcentaje

<!-- tc:status=Ready · testType=E2E · criterion=AC-005 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-005 (Salidas del sistema)
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
| 1 | Usuario | Iniciar la recepción y confirmar la transferencia | Comienza el progreso |
| 2 | Usuario | Observar la pantalla | Se ven nombre, tamaño total, tiempo restante, recibidos/total y barra con % |

## Resultado esperado final

La pantalla de recepción informa del progreso completo.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
