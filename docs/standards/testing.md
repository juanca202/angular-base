---
name: Testing Standards
domain: testing
status: Active
last_update: 2026-07-30
source_adrs: [ADR-003, ADR-005, ADR-007]
tags: [testing, vitest, testing-library, playwright, e2e, msw, http, mocks, cobertura, aaa, object-mother]
---

# Testing Standards

Estándar de dominio que agrupa los requisitos verificables sobre la estrategia de verificación del
proyecto: herramientas, ubicación y convenciones de las pruebas unitarias y end-to-end, mocks de APIs
HTTP, umbrales de cobertura y criterios de calidad de la suite (aislamiento y determinismo). Aplica a
las pruebas unitarias del código bajo `src/` y a las pruebas E2E bajo `e2e/`.

## Pruebas unitarias

**ID:** unit-testing

Las pruebas unitarias se implementan con **Vitest** (runner, aserciones y mocks) y **Testing Library**
(interacción con la UI desde la perspectiva del usuario; en Angular, el paquete del ecosistema
Testing Library para Angular). Los archivos de prueba viven **junto al código bajo prueba** (p. ej.
`foo.ts` ↔ `foo.spec.ts` en el mismo directorio), se estructuran con el patrón **Arrange–Act–Assert
(AAA)** y construyen sus datos de prueba con el **Object Mother Pattern**.

- Las pruebas unitarias **DEBEN** implementarse con Vitest y Testing Library; **NO DEBE** introducirse
  otro runner o framework de unit testing en paralelo para código de aplicación.
- Los archivos de prueba unitaria **DEBEN** ubicarse junto al código bajo prueba (colocation); **NO
  DEBEN** agruparse en un árbol de tests separado desconectado del módulo bajo prueba.
- Cada caso de prueba **DEBE** seguir el patrón AAA (Arrange, Act, Assert).
- Los datos de prueba reutilizables o no triviales **DEBEN** construirse mediante el Object Mother
  Pattern.
- La cobertura de pruebas unitarias **DEBE** ser ≥ 80%.
- Las pruebas unitarias **DEBEN** ser aisladas (sin dependencia de orden de ejecución ni de estado
  compartido mutable) y deterministas (sin flakiness por tiempo, red, azar no controlado u otras
  fuentes externas no mockeadas).

### Excepciones

- Smoke tests o comprobaciones generadas automáticamente por el scaffolding del framework que aún no
  ejercen lógica de negocio **PUEDEN** omitir Object Mother mientras no construyan datos de dominio.
- Código puramente declarativo sin rama ejecutable (p. ej. re-exports, barrels) **PUEDE** excluirse del
  cálculo de cobertura si se documenta la exclusión en la configuración de Vitest/Angular.

## Pruebas end-to-end

**ID:** e2e-testing

Las pruebas end-to-end ejercen flujos de usuario de punta a punta en el navegador. Se implementan con
**Playwright** (`@playwright/test`). Los archivos de prueba E2E viven bajo el directorio `e2e/` en la
raíz del repositorio. El alcance mínimo de la suite son los **flujos críticos definidos por producto**.

- Las pruebas E2E **DEBEN** implementarse con Playwright; **NO DEBE** introducirse otro framework o
  runner de E2E en paralelo para la aplicación.
- Los archivos de prueba E2E **DEBEN** ubicarse bajo `e2e/` (p. ej. `e2e/**/*.spec.ts`); **NO DEBEN**
  colocalizarse con el código de aplicación bajo `src/`.
- Los flujos críticos definidos por producto **DEBEN** tener cobertura E2E con Playwright.

### Excepciones

- Pruebas exploratorias o de smoke puntuales fuera de CI **PUEDEN** usar otras herramientas de
  automatización de navegador sin formar parte de la suite E2E oficial del repositorio.
- Flujos aún no priorizados por producto **PUEDEN** carecer de cobertura E2E hasta que se incluyan en
  la lista de flujos críticos.

## Mocks de APIs HTTP con MSW

**ID:** http-api-mocks-msw

Cuando una prueba unitaria o de integración necesita mockear APIs HTTP, se usa **Mock Service Worker
(MSW)** para interceptar la red con el mismo contrato HTTP (método, URL, status, cabeceras, cuerpo).
Así se evita depender de un backend real y se unifica el modelo de mock.

- Las pruebas unitarias e de integración que mockeen APIs HTTP **DEBEN** hacerlo con MSW.
- **NO DEBE** introducirse otra librería o framework de mock HTTP de red en paralelo para esas
  pruebas (p. ej. Nock, Mirage JS, o stubs ad hoc de `fetch`/`HttpClient` como estrategia habitual
  de mock de API).
- MSW **PUEDE** usarse también en el navegador o en herramientas de desarrollo local para simular
  APIs.
- La suite E2E (Playwright) **NO DEBE** requerir MSW: el mock HTTP con MSW no es obligatorio ahí.

### Excepciones

- Spies o stubs puntuales sobre un colaborador concreto (no sobre la capa HTTP de red) **PUEDEN**
  usarse cuando el objetivo del test no es el contrato HTTP.
- La suite E2E **PUEDE** usar fixtures, `route`/`fulfill` de Playwright u un backend de prueba sin
  MSW.
## Criterios de cumplimiento

| ID     | Requisito           | Descripción                                                                                                                                 | Origen                                                             | Automatizable | Enfoque    | Verificación |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------- | ---------- | ------------ |
| CR-002 | unit-testing        | Los archivos de prueba unitaria **DEBEN** vivir junto al código bajo prueba (colocation; p. ej. `*.spec.ts` colocalizado con el módulo)    | [ADR-003](../adr/ADR-003-unit-testing-vitest-testing-library.md) | yes           | bloqueante | yes          |
| CR-003 | unit-testing        | Cada caso de prueba unitaria **DEBE** estructurarse según el patrón Arrange–Act–Assert (AAA)                                                | [ADR-003](../adr/ADR-003-unit-testing-vitest-testing-library.md) | no            | bloqueante | no           |
| CR-004 | unit-testing        | Los datos de prueba no triviales **DEBEN** construirse con el Object Mother Pattern                                                         | [ADR-003](../adr/ADR-003-unit-testing-vitest-testing-library.md) | no            | bloqueante | no           |
| CR-005 | unit-testing        | La cobertura de pruebas unitarias **DEBE** ser ≥ 80%                                                                                        | [ADR-003](../adr/ADR-003-unit-testing-vitest-testing-library.md) | yes           | bloqueante | yes          |
| CR-006 | unit-testing        | Las pruebas unitarias **DEBEN** ser aisladas y deterministas (sin flakiness por orden, estado compartido, tiempo, red o azar no controlado) | [ADR-003](../adr/ADR-003-unit-testing-vitest-testing-library.md) | no            | bloqueante | no           |
| CR-007 | e2e-testing         | Las pruebas E2E **DEBEN** implementarse con Playwright; **NO DEBE** haber otro framework E2E en paralelo                                    | [ADR-005](../adr/ADR-005-e2e-testing-playwright.md)              | yes           | bloqueante | yes          |
| CR-008 | e2e-testing         | Los archivos de prueba E2E **DEBEN** ubicarse bajo `e2e/` en la raíz del repositorio                                                         | [ADR-005](../adr/ADR-005-e2e-testing-playwright.md)              | yes           | bloqueante | yes          |
| CR-009 | e2e-testing         | Los flujos críticos definidos por producto **DEBEN** tener cobertura E2E con Playwright                                                     | [ADR-005](../adr/ADR-005-e2e-testing-playwright.md)              | no            | bloqueante | no           |
| CR-010 | http-api-mocks-msw  | Las pruebas unitarias/integración que mockeen APIs HTTP **DEBEN** usar MSW                                                                  | [ADR-007](../adr/ADR-007-http-api-mocks-msw.md)                  | yes           | bloqueante | no           |
| CR-011 | http-api-mocks-msw  | **NO DEBE** coexistir otra librería de mock HTTP de red en paralelo (p. ej. nock, miragejs) para esas pruebas; la suite E2E **NO DEBE** requerir MSW | [ADR-007](../adr/ADR-007-http-api-mocks-msw.md)                  | yes           | bloqueante | no           |

## Referencias

- [ADR-003: Estrategia de pruebas unitarias con Vitest, Testing Library y convenciones AAA / Object Mother](../adr/ADR-003-unit-testing-vitest-testing-library.md)
- [ADR-005: Pruebas end-to-end con Playwright](../adr/ADR-005-e2e-testing-playwright.md)
- [ADR-007: Mocks de APIs HTTP con Mock Service Worker (MSW)](../adr/ADR-007-http-api-mocks-msw.md)
- [scripts/arch/README.md](../../scripts/arch/README.md)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Mock Service Worker](https://mswjs.io/)
