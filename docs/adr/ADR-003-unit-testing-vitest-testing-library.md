---
id: ADR-003
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [testing, vitest, testing-library, angular, cobertura, object-mother, aaa]
supersedes: null
superseded_by: null
emits: [testing/CR-002, testing/CR-003, testing/CR-004, testing/CR-005, testing/CR-006]
---

# ADR-003: Estrategia de pruebas unitarias con Vitest, Testing Library y convenciones AAA / Object Mother

## Contexto

Sin una estrategia común de pruebas unitarias, los tests tienden a diverger en framework, ubicación,
estilo de escritura y forma de construir datos de prueba. Eso dificulta la lectura, el mantenimiento y
el onboarding: un desarrollador no sabe dónde encontrar el test de una pieza, qué estructura esperar
dentro del archivo ni cómo armar fixtures sin acoplarse a detalles de implementación. Además, sin un
umbral de cobertura ni criterios de aislamiento y determinismo, la suite deja de ser una red de
seguridad fiable — fallos flaky o tests que dependen de estado compartido erosionan la confianza en
el gate de calidad.

Se necesita una estrategia única que priorice **mantenibilidad y legibilidad** de las pruebas
unitarias, alineada con el stack Angular del proyecto.

## Decisión

Se adopta la siguiente estrategia para las **pruebas unitarias** del proyecto:

1. **Stack:** Vitest como runner/assert/mock, junto con Testing Library para interactuar con la UI
   desde la perspectiva del usuario (en Angular, el paquete de Testing Library del ecosistema Angular).
2. **Ubicación:** los archivos de prueba viven **junto al código bajo prueba** (colocation), no en un
   árbol de tests separado.
3. **Estructura:** cada test sigue el patrón **Arrange–Act–Assert (AAA)**.
4. **Datos de prueba:** se construyen con el **Object Mother Pattern**, evitando fixtures opacos o
   datos mágicos repartidos por la suite.
5. **Cobertura:** el umbral mínimo de cobertura de pruebas unitarias es del **80%**.
6. **Calidad de la suite:** las pruebas **deben** ser aisladas (sin depender del orden ni de estado
   compartido mutable) y **deterministas** (mismo input → mismo resultado, sin flakiness por tiempo,
   red o azar no controlado).

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Testing Standards**
(`../standards/testing.md`), no en este ADR.

## Consecuencias

### Positivas

- Un solo stack y un solo lugar donde buscar tests, lo que acelera el onboarding y las revisiones.
- AAA y Object Mother hacen el intent del test explícito y reducen acoplamiento a detalles de setup.
- El umbral de cobertura y el foco en aislamiento/determinismo refuerzan la confianza en la suite como
  gate de calidad.

### Negativas / trade-offs

- Exige disciplina y, en código legado, un esfuerzo de migración hacia colocation, Object Mother y AAA.
- Testing Library y el reporter de cobertura (p. ej. `@vitest/coverage-v8`) pueden requerir paquetes
  adicionales respecto a Vitest solo.
- Un umbral del 80% no garantiza por sí solo calidad de aserciones; sigue haciendo falta revisión humana
  de AAA, Object Mother, aislamiento y determinismo.

## Referencias

- [Testing Standards](../standards/testing.md)
- [Índice de ADRs](./README.md)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Angular unit testing](https://angular.dev/guide/testing)
