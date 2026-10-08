# TC-036 — Dado un QR de 400 B con corrección M a unos 30 cm, Cuando se lee 10 veces con el móvil, Entonces al menos 9 intentos son correctos

<!-- tc:status=Ready · testType=Manual · criterion=AC-023 · parent=US-002 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Manual
**Prioridad:** Alta
**Criterio de aceptación:** AC-023 (Eficiencia de rendimiento)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Móvil Android con Chrome y túnel HTTPS a la app en desarrollo; segundo dispositivo o pantalla como emisor (guion `spike/GUIA-MEDICION.md` de la rama `spike/WI-002-medicion-qr-android`).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| N/A | N/A | Sin datos específicos |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Mostrar el QR estático de 400 B, M, en el emisor | QR visible |
| 2 | Usuario | Realizar 10 intentos secuenciales de lectura | Cada intento registra OK o fallo |
| 3 | Usuario | Contar los aciertos | ≥ 9 de 10 |

## Resultado esperado final

Al menos 9 de 10 lecturas correctas.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Medido en el spike WI-002: 10 de 10. Un intento a la vez.
