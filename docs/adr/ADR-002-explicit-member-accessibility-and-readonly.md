---
id: ADR-002
status: Accepted
last_update: 2026-07-29
deciders: [Equipo de Arquitectura]
tags: [typescript, angular, coding-style, eslint, encapsulamiento, inmutabilidad]
supersedes: null
superseded_by: null
emits: [coding-style/CR-001, coding-style/CR-002]
---

# ADR-002: Modificadores de acceso explícitos y uso de readonly en clases

## Contexto

Sin un modificador de acceso explícito en cada propiedad y método de una clase, no queda claro a
simple vista qué miembros forman parte de la API pública del componente/servicio y cuáles son detalle
de implementación interna, lo que dificulta razonar sobre el impacto de un cambio y complica el
onboarding. De forma similar, propiedades que en la práctica nunca cambian tras la inicialización
(identificadores, configuración, referencias a servicios inyectados) suelen declararse mutables por
omisión, ocultando esa intención y dejando abierta la puerta a reasignaciones accidentales.

## Decisión

Se adoptan dos convenciones para todas las clases del código base:

1. **Modificador de acceso explícito.** Toda propiedad y método definidos por el desarrollador declaran
   su visibilidad de forma explícita: `public` para los miembros que forman parte de la API pública de
   la clase, `private` para los de implementación interna, y `protected` para los accesibles desde
   subclases. La declaración del propio constructor (`constructor(...)`) no requiere el modificador
   explícito — en TypeScript, omitirlo ya equivale a `public` — y los métodos de ciclo de vida de
   Angular (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`, `ngAfterViewInit`, `ngAfterViewChecked`,
   `ngAfterContentInit`, `ngAfterContentChecked`, `ngDoCheck`) se escriben sin `public`, siguiendo la
   guía de estilo de Angular. Los parámetros del constructor solo llevan modificador cuando definen una
   parameter property.
2. **`readonly` en propiedades inmutables.** Toda propiedad de instancia que no deba cambiar tras la
   inicialización — IDs, configuración, referencias a servicios inyectados que no deben mutar, y otras
   constantes de instancia — se declara `readonly`.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Coding Style Standards**
(`../standards/coding-style.md`), no en este ADR.

## Consecuencias

### Positivas

- Distingue con claridad la API pública de una clase de su implementación interna, sin necesidad de leer
  el cuerpo de cada miembro.
- Hace explícita la intención de inmutabilidad de una propiedad, reduciendo el riesgo de reasignaciones
  accidentales.
- El constructor y los lifecycle hooks de Angular conservan la convención habitual del framework, sin
  ruido adicional.

### Negativas / trade-offs

- Añade verbosidad a cada declaración de propiedad y método.
- Adoptarlo sobre el código ya existente requiere un refactor gradual, fuera del alcance de este ADR.
- La fitness function de `readonly` solo puede probar de forma determinista los miembros `private`; los
  `protected`/`public` que deberían ser `readonly` se verifican en revisión de código.

## Referencias

- [Coding Style Standards](../standards/coding-style.md)
- [Índice de ADRs](./README.md)
