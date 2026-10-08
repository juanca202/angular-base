# TC-029 — Dado fragmentos de una transferencia leídos incluido el de metadatos, Cuando aún no se ha confirmado, Entonces el receptor muestra nombre y tamaño y no completa ni guarda nada hasta confirmar

<!-- tc:status=Ready · testType=Unit · criterion=AC-019 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-019 (Interacción de usuario)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Receptor ejecutable sin cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Entregar el fragmento de metadatos y datos | Se muestra nombre y tamaño en espera de confirmación |
| 2 | Sistema | Entregar todos los fragmentos sin confirmar | No se completa ni se guarda |
| 3 | Usuario | Confirmar | Se completa la transferencia |

## Resultado esperado final

Nada se completa ni guarda antes de confirmar.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
