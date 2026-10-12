---
id: ADR-004
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [typescript, tsdoc, documentación, coding-style]
supersedes: null
superseded_by: null
emits: [coding-style/CR-003, coding-style/CR-004]
---

# ADR-004: Documentación de código con TSDoc durante el desarrollo

## Contexto

Sin una convención compartida de documentación en el código, las APIs y la lógica no trivial
quedan opacas para quien las consume o mantiene: el onboarding se alarga y la intención del diseño
solo se recupera leyendo la implementación. Al mismo tiempo, si la documentación se deja como
tarea diferida («ya documentamos después»), suele acumularse deuda: el contexto del cambio se
pierde y la documentación llega tarde, incompleta o nunca. Por otro lado, exigir comentarios en
toda pieza trivial genera ruido sin valor y desincentiva el cumplimiento.

Se necesita una estrategia que mejore la legibilidad y el onboarding de lo no obvio, y que evite
deuda de documentación, sin imponer burocracia sobre lógica simple.

## Decisión

Se adopta **TSDoc** como formato de documentación en el código TypeScript del proyecto.

La documentación se escribe **mientras se desarrolla** el código (mismo ciclo de cambio), no como
una tarea aparte aplazada. No se exige documentar lógica **simple o trivial** cuyo comportamiento
queda claro por el nombre, la tipificación y la implementación a simple vista; el esfuerzo se
concentra en APIs, reglas de negocio, algoritmos no obvios y contratos entre piezas.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness
functions de esta decisión viven en el estándar de dominio **Coding Style Standards**
(`../standards/coding-style.md`), no en este ADR.

## Consecuencias

### Positivas

- Mejora el onboarding y la lectura de APIs y lógica no trivial sin salir del código.
- Reduce la deuda de documentación al acoplar la escritura al desarrollo del cambio.
- Evita ruido: la lógica trivial no queda obligada a comentarios vacíos.

### Negativas / trade-offs

- «Trivial» vs «no trivial» requiere criterio humano en revisión de código.
- El formato TSDoc exige disciplina en etiquetas y estructura; un linter opcional puede ayudar
  más adelante, pero no sustituye el juicio sobre *qué* documentar.

## Referencias

- [Coding Style Standards](../standards/coding-style.md)
- [Índice de ADRs](./README.md)
- [TSDoc](https://tsdoc.org/)
