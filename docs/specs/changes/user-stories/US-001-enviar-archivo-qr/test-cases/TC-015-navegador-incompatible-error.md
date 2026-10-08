# TC-015 — Dado un navegador sin las capacidades necesarias, Cuando el usuario abre la app y pulsa «Enviar», Entonces se muestra un mensaje claro y no se inicia la transferencia

<!-- tc:status=Ready · testType=E2E · criterion=AC-011 · parent=US-001 -->
**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-011 (Salidas del sistema)
**Artefacto padre:** US-001
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
| 1 | Sistema | Abrir la app en un contexto sin la API requerida (simulada) | La app detecta la incompatibilidad |
| 2 | Usuario | Pulsar «Enviar» | Se muestra el mensaje de navegador no compatible |

## Resultado esperado final

Mensaje claro; no se inicia nada.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). Se simula quitando la API requerida con un script de inicialización de Playwright.
