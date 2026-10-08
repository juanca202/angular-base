# TC-023 — Dado un archivo de 1 MB, Cuando se transfiere con cámara real entre dos dispositivos, Entonces la transferencia se completa en 15 minutos o menos

<!-- tc:status=Ready · testType=Manual · criterion=AC-017 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Manual
**Prioridad:** Media
**Criterio de aceptación:** AC-017 (Eficiencia de rendimiento)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Móvil Android con Chrome y túnel HTTPS a la app en desarrollo; segundo dispositivo o pantalla como emisor (guion `spike/GUIA-MEDICION.md` de la rama `spike/WI-002-medicion-qr-android`).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1MB.bin [propuesto] | Binario determinista de 1 MB (1 048 576 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Enviar prueba-1MB.bin desde el emisor | Comienza la emisión |
| 2 | Usuario | Recibir con el móvil y cronometrar | Se completa la recepción |
| 3 | Usuario | Registrar el tiempo | ≤ 15 min con hash idéntico |

## Resultado esperado final

1 MB se transfiere en 15 minutos o menos (objetivo DEBERÍA).

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Objetivo no validado en el spike (modelo: 36,9 min a 5 fps con 400 B). Repetir 10 veces con la mejor combinación.
