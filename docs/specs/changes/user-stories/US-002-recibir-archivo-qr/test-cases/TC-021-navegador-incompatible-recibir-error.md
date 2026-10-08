# TC-021 — Dado un navegador sin las APIs necesarias, Cuando el usuario pulsa «Recibir», Entonces se muestra un mensaje claro y no se inicia la recepción

<!-- tc:status=Ready · testType=E2E · criterion=AC-012 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-012 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| N/A | N/A | Sin datos específicos |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Abrir la app sin la API de cámara (simulada) | Incompatibilidad detectada |
| 2 | Usuario | Pulsar «Recibir» | Mensaje de navegador no compatible |

## Resultado esperado final

Mensaje claro y sin recepción.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Se simula con un script de inicialización de Playwright.
