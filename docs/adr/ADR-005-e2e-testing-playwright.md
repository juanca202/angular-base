---
id: ADR-005
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [testing, e2e, playwright, angular]
supersedes: null
superseded_by: null
emits: [testing/CR-007, testing/CR-008, testing/CR-009]
---

# ADR-005: Pruebas end-to-end con Playwright

## Contexto

Las pruebas unitarias (ADR-003) cubren el comportamiento aislado de componentes y servicios, pero no
ejercen los flujos críticos de punta a punta que el usuario final recorre en el navegador: navegación,
integración entre features, y regresiones en el recorrido real de la aplicación. Sin una estrategia
E2E común, esos flujos quedan sin red de seguridad automatizada o se fragmentan entre herramientas
heterogéneas (Cypress, Selenium, scripts ad hoc), lo que encarece el mantenimiento y diluye el criterio
de calidad en CI.

Se necesita una única herramienta E2E alineada con el stack Angular/TypeScript del proyecto, con una
ubicación convencional de specs y un criterio claro sobre qué flujos deben cubrirse.

## Decisión

Se adopta **Playwright** como framework exclusivo de pruebas end-to-end del proyecto:

1. **Stack:** Playwright (`@playwright/test`) para browser automation, aserciones y ejecución de la
   suite E2E.
2. **Ubicación:** los archivos de prueba E2E viven bajo el directorio `e2e/` en la raíz del
   repositorio (no colocalizados con el código de aplicación bajo `src/`).
3. **Alcance de cobertura:** los flujos críticos definidos por producto **deben** tener cobertura E2E
   con Playwright.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Testing Standards**
(`../standards/testing.md`), no en este ADR.

Complementa a [ADR-003](./ADR-003-unit-testing-vitest-testing-library.md) (pruebas unitarias); no lo
reemplaza.

## Consecuencias

### Positivas

- Una sola herramienta E2E reduce fricción de onboarding y evita suites paralelas incompatibles.
- Playwright encaja con TypeScript y ofrece ejecución multi-navegador y trazas útiles para depurar
  fallos en CI.
- Separar E2E en `e2e/` mantiene clara la frontera respecto a las unitarias colocalizadas en `src/`.

### Negativas / trade-offs

- Playwright (browsers y runners) añade coste de instalación, tiempo de CI y mantenimiento de
  fixtures/entornos.
- La definición de «flujos críticos» depende de producto; sin esa lista viva, el criterio de cobertura
  E2E queda ambiguo.

## Referencias

- [Testing Standards](../standards/testing.md)
- [ADR-003: Estrategia de pruebas unitarias con Vitest, Testing Library y convenciones AAA / Object Mother](./ADR-003-unit-testing-vitest-testing-library.md)
- [Índice de ADRs](./README.md)
- [Playwright](https://playwright.dev/)
- [Playwright — Angular](https://playwright.dev/docs/intro)
