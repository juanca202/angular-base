# TC-022 — Dado el tamaño de fragmento por defecto de 1600 B, Cuando se mide con la cámara de un móvil a unos 30 cm, Entonces se mantiene solo si 9 o más de 10 lecturas secuenciales son correctas

<!-- tc:status=Ready · testType=Manual · criterion=AC-016 · parent=US-001 -->
**Perspectiva:** Límite
**Tipo de prueba:** Manual
**Prioridad:** Media
**Criterio de aceptación:** AC-016 (Procesamiento de datos)
**Artefacto padre:** US-001
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
| 1 | Usuario | Mostrar un QR estático de 1600 B (el tamaño por defecto) en el emisor | El QR se ve completo en pantalla |
| 2 | Usuario | Realizar 10 intentos de lectura secuenciales con el móvil | Cada intento registra OK o fallo |
| 3 | Usuario | Contar los aciertos | ≥ 9 de 10 para mantener 1600 B; si no, se reduce el valor por defecto (800 o 400 B) |

## Resultado esperado final

El tamaño por defecto de 1600 B solo se mantiene con ≥ 9/10 aciertos en una serie válida.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Usar la pestaña Capacidad de la app de medición; un intento a la vez.
