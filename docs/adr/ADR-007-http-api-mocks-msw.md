---
id: ADR-007
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [testing, msw, http, mocks, vitest]
supersedes: null
superseded_by: null
emits: [testing/CR-010, testing/CR-011]
---

# ADR-007: Mocks de APIs HTTP con Mock Service Worker (MSW)

## Contexto

Las pruebas unitarias e de integración que ejercen código que llama a APIs HTTP necesitan respuestas
controladas sin depender de un backend real. Sin una estrategia común, los equipos tienden a mezclar
spies sobre `HttpClient`/`fetch`, stubs ad hoc y servidores falsos incompatibles entre sí. Eso rompe
el realismo del contrato HTTP (cabeceras, status, cuerpo, errores de red) y dificulta reutilizar los
mismos handlers entre suites o en desarrollo local.

Se necesita interceptar la red de forma alineada con el contrato HTTP real, integrada con el stack de
pruebas del proyecto (Vitest / Testing Library; ADR-003), sin imponer MSW como requisito de la suite
E2E (Playwright; ADR-005).

## Decisión

Se adopta **Mock Service Worker (MSW)** como mecanismo estándar para mocks de APIs HTTP:

1. **Alcance obligatorio:** las pruebas unitarias e de integración que mockeen APIs HTTP usan MSW
   (handlers + worker/server de MSW según el entorno de test).
2. **Alcance opcional:** MSW **puede** usarse también en el navegador o en herramientas de
   desarrollo local para simular APIs sin backend.
3. **Fuera de alcance obligatorio:** la suite E2E con Playwright **no** requiere MSW; los E2E siguen
   el criterio de ADR-005 (flujos reales o los mecanismos propios de Playwright).

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Testing Standards**
(`../standards/testing.md`), no en este ADR.

Complementa a [ADR-003](./ADR-003-unit-testing-vitest-testing-library.md) y
[ADR-005](./ADR-005-e2e-testing-playwright.md); no los reemplaza.

## Consecuencias

### Positivas

- Un solo modelo de mock HTTP basado en el protocolo real mejora fidelidad y reutilización de handlers.
- MSW encaja con Vitest (Node) y, si se desea, con el browser para desarrollo.
- Separar E2E de MSW obligatorio evita acoplar Playwright a una capa de mock innecesaria.

### Negativas / trade-offs

- Exige setup inicial (handlers, arranque/parada del server en hooks de test) y disciplina para no
  volver a spies HTTP ad hoc.
- Handlers desactualizados respecto al contrato real de la API pueden dar falsa confianza.

## Referencias

- [Testing Standards](../standards/testing.md)
- [ADR-003: Estrategia de pruebas unitarias con Vitest, Testing Library y convenciones AAA / Object Mother](./ADR-003-unit-testing-vitest-testing-library.md)
- [ADR-005: Pruebas end-to-end con Playwright](./ADR-005-e2e-testing-playwright.md)
- [Índice de ADRs](./README.md)
- [Mock Service Worker](https://mswjs.io/)
- Scaffold: `src/mocks/` (`handlers.ts`, `node.ts`, `browser.ts`) y worker en `public/`
