# TC-032 — Dado fragmentos leídos antes de confirmar, Cuando aparece el aviso de confirmación, Entonces se muestran los fragmentos leídos y el aviso permanece visible

<!-- tc:status=Ready · testType=E2E · criterion=AC-020 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-020 (Salidas del sistema)
**Artefacto padre:** US-002
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
| 1 | Sistema | Leer fragmentos de una transferencia sin confirmar | Aparece el aviso |
| 2 | Usuario | Desplazar la pantalla y observar | El aviso sigue visible y se ven los fragmentos leídos |

## Resultado esperado final

El avance previo a confirmar y el aviso son visibles.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
