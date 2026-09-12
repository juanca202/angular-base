---
id: ADR-015
status: Accepted
last_update: 2026-09-12
deciders: [Equipo de Arquitectura]
tags: [angular, di, servicios, decoradores, coding-style]
supersedes: null
superseded_by: null
emits: [coding-style/CR-005]
---

# ADR-015: Adopción del decorador `@Service` para servicios singleton

## Contexto

Angular v22 introduce `@Service` como decorador dedicado para clases de servicio con alcance de
aplicación, como alternativa más explícita a `@Injectable({ providedIn: 'root' })`. Este segundo
patrón sigue siendo válido y es el que usa hoy todo el código del proyecto (`AppManager`, `Session`,
`LayoutManager`), pero mezcla dos responsabilidades bajo un mismo decorador genérico (`@Injectable`,
pensado también para servicios con `providedIn` distinto de `'root'`, o sin alcance de aplicación),
mientras que `@Service` nombra directamente la intención — "esta clase es un servicio singleton de la
app" — sin necesidad de leer sus opciones para saberlo.

La preferencia por `@Service` ya estaba anotada en `AGENTS.md § Services`, pero nunca se había
registrado como decisión de arquitectura ni tenía un criterio verificable: una auditoría de
cumplimiento (`arch-audit`, 2026-09-12) encontró que el 100% de los servicios existentes usa todavía
`@Injectable({ providedIn: 'root' })`.

## Decisión

Se adopta **`@Service`** como el decorador estándar para declarar **servicios singleton de alcance de
aplicación** (equivalentes a `providedIn: 'root'`) en código nuevo. `@Injectable(...)` sigue siendo
válido para el resto de casos que `@Service` no cubre (p. ej. `providedIn` apuntando a un módulo o
inyector concreto, o clases inyectables sin alcance singleton de app).

El enunciado normativo (RFC 2119), el criterio de cumplimiento verificable y su fitness function viven
en el estándar de dominio **Coding Style Standards** (`../standards/coding-style.md`), no en este ADR.

## Consecuencias

### Positivas

- El decorador comunica la intención de la clase (servicio singleton de app) sin tener que leer sus
  opciones.
- Menos código repetido: `@Service` no requiere pasar `{ providedIn: 'root' }` explícitamente.

### Negativas / trade-offs

- El criterio de cumplimiento se registra como `warning` para no bloquear el trabajo en curso mientras
  los servicios existentes se migran de forma incremental. `AppManager` y `Session` ya se migraron a
  `@Service` (corrección de la auditoría `arch-audit` 2026-09-12); `LayoutManager` se eliminó en la
  misma corrección al no orquestar ningún flujo (ver requisito `manager-orchestration-pattern` en
  Architecture Standards).
- Introduce un segundo decorador válido para "esto es un servicio" (`@Service` vs. `@Injectable`),
  que el equipo debe aprender a distinguir por su alcance (app vs. no-app).

## Referencias

- [Coding Style Standards](../standards/coding-style.md)
- [Índice de ADRs](./README.md)
- [ADR-002: Modificadores de acceso explícitos y uso de readonly en clases](./ADR-002-explicit-member-accessibility-and-readonly.md)
- Informe de auditoría: `../audits/arch-audit-2026-09-12.md`
