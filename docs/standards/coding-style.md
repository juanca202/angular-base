---
name: Coding Style Standards
domain: coding-style
status: Active
last_update: 2026-09-12
source_adrs: [ADR-002, ADR-004, ADR-015]
tags: [typescript, angular, eslint, prettier, encapsulamiento, inmutabilidad, tsdoc, documentación, formatting, di, servicios]
---

# Coding Style Standards

Estándar de dominio que agrupa los requisitos verificables sobre el estilo y la sintaxis del código
TypeScript del proyecto: visibilidad explícita de los miembros de clase, uso de `readonly` en
propiedades inmutables, documentación con TSDoc y formateo con Prettier. Aplica a toda clase
(componentes, servicios, repositorios, pipes, guards, utilidades…) y al resto de archivos que
Prettier procesa según `.prettierignore`.

## Modificadores de acceso explícitos

**ID:** explicit-member-accessibility

Toda propiedad y método definidos por el desarrollador en una clase **DEBE** declarar su modificador de
acceso de forma explícita. Se implementa mediante la regla
`@typescript-eslint/explicit-member-accessibility` de ESLint:

- `public` para los miembros que forman parte de la API pública de la clase.
- `private` para los de implementación interna.
- `protected` para los accesibles desde subclases.

Reglas adicionales sobre dónde va (o no) el modificador:

- La declaración del propio constructor (`constructor(...)`) **NO DEBE** llevar el modificador `public`
  de forma explícita — su omisión ya equivale a `public` en TypeScript.
- Los parámetros del constructor **DEBEN** llevar su modificador de acceso (y, si aplica, `readonly`)
  únicamente cuando definen una parameter property; un parámetro que no define una propiedad de
  instancia **NO DEBE** llevar modificador.
- Los métodos de ciclo de vida de Angular (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`, `ngAfterViewInit`,
  `ngAfterViewChecked`, `ngAfterContentInit`, `ngAfterContentChecked`, `ngDoCheck`) **NO DEBEN** declarar
  el modificador `public`.

### Excepciones

La declaración del constructor y los métodos de ciclo de vida de Angular listados arriba.

## Uso de readonly en propiedades inmutables

**ID:** readonly-immutable-properties

Toda propiedad de instancia que no deba reasignarse tras la inicialización **DEBE** declararse con
`readonly`, dejando explícita la intención de inmutabilidad. Se implementa, para miembros `private`,
mediante la regla `@typescript-eslint/prefer-readonly` de ESLint.

Ejemplos típicos de propiedades inmutables:

- Identificadores.
- Configuración.
- Referencias a servicios inyectados que no deben mutar.
- Otras constantes de instancia.

### Excepciones

Las propiedades `protected` y `public` no están cubiertas por la fitness function automatizada
(`@typescript-eslint/prefer-readonly` solo analiza miembros `private`, ya que solo de ellos puede
probar de forma determinista que no se reasignan fuera de la clase); su cumplimiento en esos casos se
verifica en revisión de código.

## Documentación con TSDoc

**ID:** tsdoc-documentation

La documentación en el código TypeScript **DEBE** redactarse en formato **TSDoc**. El código no
trivial — APIs públicas, reglas de negocio, algoritmos no obvios, contratos entre capas o piezas
cuyo comportamiento no queda claro por el nombre y los tipos — **DEBE** documentarse con TSDoc
**durante el mismo ciclo de desarrollo** en que se escribe o cambia ese código; **NO DEBE**
aplazarse la documentación como tarea diferida. La lógica simple o trivial **NO DEBE** exigirse
documentada cuando su comportamiento es evidente a partir del identificador, la tipificación y la
implementación. El cumplimiento de qué es «no trivial» y de que la documentación viaja con el
cambio se verifica en revisión de código (pull request / code review).

### Excepciones

Lógica simple o trivial (getters/setters obvios, wrappers sin comportamiento, re-exports, wiring
trivial de DI, lifecycle hooks sin lógica propia, etc.) cuando el código se explica solo.

## Formateo con Prettier

**ID:** prettier-formatting

Los archivos del repositorio **DEBEN** formatearse con **Prettier** según `.prettierrc`. El
cumplimiento **DEBE** verificarse con `prettier --check` en el flujo local (hooks) y/o CI; **NO DEBE**
aceptarse código fuera de ese formato. Qué se formatea y qué no **DEBE** controlarse
**exclusivamente** con `.prettierignore` (p. ej. Markdown, texto plano, artefactos generados).

### Excepciones

Las definidas en [`.prettierignore`](../../.prettierignore).

## Decorador `@Service` para servicios singleton

**ID:** service-decorator

Los servicios de alcance de aplicación (equivalentes a `providedIn: 'root'`) **DEBEN** declararse con
el decorador **`@Service`** en vez de `@Injectable({ providedIn: 'root' })`. `@Injectable(...)` sigue
siendo válido para el resto de casos (`providedIn` con un módulo o inyector distinto, o clases
inyectables sin alcance singleton de app).

### Excepciones

- Clases inyectables cuyo `providedIn` **no** sea `'root'` (p. ej. un módulo o inyector concreto)
  **PUEDEN** seguir usando `@Injectable(...)`: `@Service` no las cubre.

## Criterios de cumplimiento

| ID     | Requisito                     | Descripción                                                                                                                                                                                                                     | Origen                                                                          | Automatizable | Enfoque | Verificación |
| ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------- | ------- | ------------ |
| CR-001 | explicit-member-accessibility  | Toda propiedad y método definido por el desarrollador en una clase **DEBE** declarar su modificador de acceso explícito (`public`/`private`/`protected`), excepto la declaración del constructor y los lifecycle hooks de Angular (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`, `ngAfterViewInit`, `ngAfterViewChecked`, `ngAfterContentInit`, `ngAfterContentChecked`, `ngDoCheck`) | [ADR-002](../adr/ADR-002-explicit-member-accessibility-and-readonly.md) | yes            | warning | yes          |
| CR-002 | readonly-immutable-properties  | Toda propiedad `private` de instancia que nunca se reasigna fuera del constructor **DEBE** declararse `readonly`                                                                                                               | [ADR-002](../adr/ADR-002-explicit-member-accessibility-and-readonly.md) | yes            | warning | yes          |
| CR-003 | tsdoc-documentation            | El código no trivial **DEBE** documentarse en formato TSDoc                                                                                                                                                                      | [ADR-004](../adr/ADR-004-tsdoc-documentation-during-development.md) | no             | bloqueante | no           |
| CR-004 | tsdoc-documentation            | La documentación TSDoc del código no trivial **DEBE** incluirse en el mismo ciclo de desarrollo que el cambio; **NO DEBE** aplazarse como tarea diferida                                                                       | [ADR-004](../adr/ADR-004-tsdoc-documentation-during-development.md) | no             | bloqueante | no           |
| CR-005 | service-decorator              | Los servicios de alcance de aplicación **DEBEN** declararse con `@Service` en vez de `@Injectable({ providedIn: 'root' })`                                                                                                     | [ADR-015](../adr/ADR-015-service-decorator-for-singletons.md) | yes            | warning | yes          |

## Referencias

- [ADR-002: Modificadores de acceso explícitos y uso de readonly en clases](../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- [ADR-004: Documentación de código con TSDoc durante el desarrollo](../adr/ADR-004-tsdoc-documentation-during-development.md)
- [ADR-014: Formateo de código con Prettier](../adr/ADR-014-prettier-code-formatting.md)
- [ADR-015: Adopción del decorador `@Service` para servicios singleton](../adr/ADR-015-service-decorator-for-singletons.md)
- [scripts/arch/README.md](../../scripts/arch/README.md)
- [explicit-member-accessibility (typescript-eslint)](https://typescript-eslint.io/rules/explicit-member-accessibility/)
- [prefer-readonly (typescript-eslint)](https://typescript-eslint.io/rules/prefer-readonly/)
- [TSDoc](https://tsdoc.org/)
- [Prettier](https://prettier.io/)
