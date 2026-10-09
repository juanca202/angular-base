# TC-039 — Dado que la cámara ve un QR, Cuando el receptor lo detecta, Entonces dibuja un recuadro sobre él y no muestra ningún recuadro fijo cuando no hay QR

<!-- tc:status=Ready · testType=Unit, Manual · criterion=AC-026 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, Manual
**Prioridad:** Media
**Criterio de aceptación:** AC-026 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-09

## Precondiciones

- Vista de cámara de la pantalla de recepción con la cámara activa (doble del lector de QR en la prueba unitaria; móvil Android con Chrome en la prueba manual).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Posición del QR | Caja de ejemplo (100, 120, 90 × 80) en un cuadro de 640 × 480 [propuesto] | Coordenadas en píxeles del cuadro de vídeo |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Mostrar la cámara sin ningún QR en cuadro | No hay ningún recuadro dibujado |
| 2 | Sistema | Entregar la posición de un QR detectado | Se dibuja un recuadro con esas coordenadas, alineado con el vídeo aunque la imagen esté recortada |
| 3 | Usuario | En el móvil, apuntar a un QR y apartarlo | El recuadro aparece sobre el QR mientras se detecta y desaparece al quitarlo |

## Resultado esperado final

El recuadro aparece solo sobre el QR detectado y no hay ningún marco fijo en la vista de cámara.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). SRS-001 FR-036 y WF-004.
