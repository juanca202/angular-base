# TC-031 — Dado una secuencia ajena visible junto a la propia, Cuando se leen con el móvil, Entonces no se completa el archivo equivocado sin que el usuario haya visto nombre y tamaño

<!-- tc:status=Ready · testType=Manual · criterion=AC-019 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** Manual
**Prioridad:** Alta
**Criterio de aceptación:** AC-019 (Interacción de usuario)
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
| 1 | Usuario | Mostrar dos secuencias a la vez ante la cámara (propia y ajena) | Ambas visibles |
| 2 | Usuario | Recibir y revisar el aviso de nombre y tamaño | Se muestra el aviso antes de fijar |
| 3 | Usuario | Repetir 10 veces | 0 de 10 completan un archivo ajeno sin verlo |

## Resultado esperado final

En 10 intentos, ninguno completa un archivo ajeno sin confirmación.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Repetir 3 veces con la política antigua (primera transferencia) para contrastar H-01.
