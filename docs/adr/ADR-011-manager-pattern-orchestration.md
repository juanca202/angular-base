---
id: ADR-011
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [architecture, manager, orquestacion, features, angular]
supersedes: null
superseded_by: null
emits: [architecture/CR-011, architecture/CR-013]
---

# ADR-011: Patrón Manager para orquestación de flujos de negocio y UX

## Contexto

Cuando los flujos de usuario combinan diálogos, navegación, notificaciones y varias operaciones de
datos, esa coordinación suele acabar en componentes (que engordan y mezclan presentación con
orquestación) o repartida entre servicios ad hoc. Eso choca con la separación ya adoptada entre
acceso a datos ([ADR-010](./ADR-010-repository-pattern-rest-api.md) — Repository) y feedback
desacoplado ([ADR-009](./ADR-009-core-event-notification-bridge.md) — `notify`), y dificulta
reutilizar reglas de presentación y de negocio.

Se necesita un rol explícito que orqueste experiencias complejas sin absorber el acceso HTTP ni la
UI puramente declarativa.

## Decisión

Se adopta el **patrón Manager** como mecanismo estándar para coordinar flujos de negocio complejos y
experiencias de usuario que requieren orquestación de múltiples servicios o componentes:

1. **Rol:** un Manager es un servicio Angular singleton (`@Injectable({ providedIn: 'root' })` o
   `@Service()`) que coordina UX (diálogos, navegación, flujos interactivos), orquesta lógica de
   negocio (varios servicios/repositorios) y centraliza reglas de presentación/comportamiento,
   dejando los componentes enfocados en la vista.
2. **Cuándo usarlo:** coordinación de diálogos/modales, secuencias multi-servicio, flujos con
   validaciones/confirmaciones multi-paso, estado compartido de una feature, o experiencias que
   combinan navegación + diálogos + notificaciones + datos.
3. **Cuándo no usarlo:** operación de un solo servicio; lógica de presentación pura (componente);
   utilidades genéricas (Core/Shared); acceso directo a datos (Repository).
4. **Ubicación por alcance:**
   - **Feature:** `src/app/features/{feature}/managers/` — orquestación específica de la feature.
   - **Transversal (p. ej. auth/settings):** managers reutilizados por varias features, ubicados en la
     feature o área que posea ese flujo (p. ej. `features/settings/managers/`), sin romper la
     dirección de dependencias de [ADR-001](./ADR-001-hybrid-layered-feature-architecture.md).
   - **Core:** `src/app/core/services/` — infraestructura global (p. ej. `AppManager`,
     `LayoutManager`); no depende de Features.
5. **Nomenclatura:** clase `{Entidad|Flujo}Manager`; archivo `{entidad|flujo}-manager.ts`.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
viven en el estándar de dominio **Architecture Standards**
(`../standards/architecture.md`), no en este ADR.

## Consecuencias

### Positivas

- Separación clara: componente (vista) / Manager (orquestación) / Repository (datos).
- Flujos multi-paso y diálogos reutilizables y más fáciles de testear por inyección.
- Reglas de presentación/comportamiento centralizadas por feature o por infraestructura global.

### Negativas / trade-offs

- Riesgo de “God Managers” si se agrupa demasiada lógica no relacionada en un solo Manager.
- Exige criterio para no crear Managers triviales (operaciones de un solo servicio).
- Managers de feature con `providedIn: 'root'` siguen siendo singletons globales; el equipo debe
  vigilar el acoplamiento y el ciclo de vida.

## Referencias

- [Architecture Standards](../standards/architecture.md)
- [ADR-001: Arquitectura híbrida por capas y por funcionalidades](./ADR-001-hybrid-layered-feature-architecture.md)
- [ADR-009: Puente de notificaciones por eventos en Core (`notify`)](./ADR-009-core-event-notification-bridge.md)
- [ADR-010: Patrón Repository para comunicación REST API](./ADR-010-repository-pattern-rest-api.md)
- [Índice de ADRs](./README.md)
- Ejemplos en repo: `src/app/core/services/app-manager.ts`, `layout-manager.ts`
