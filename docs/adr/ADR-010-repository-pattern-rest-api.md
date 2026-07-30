---
id: ADR-010
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [architecture, repository, rest, async-resources, signals]
supersedes: null
superseded_by: null
emits: [architecture/CR-009, architecture/CR-010]
---

# ADR-010: Patrón Repository para comunicación REST API

## Contexto

Sin un patrón único de acceso HTTP, cada feature tiende a llamar a `HttpClient` a su manera: URLs
armadas a mano (incluidos prefijos `/api/v1/`), estado de carga/error local inconsistente, y lógica de
negocio mezclada con el detalle de la red. Eso dificulta tests (inyección), reutilizar el manejo de
errores (p. ej. `notify` vía ADR-009) y predecir la forma de los recursos asíncronos (signals).

Se necesita estandarizar la comunicación REST: repositorios por entidad, helpers tipados para lecturas
y escrituras, y resolución centralizada de URLs.

## Decisión

Se adopta el **patrón Repository** para toda comunicación REST API, apoyado en los helpers de Core
`getMutations()`, `getResource()` y `getResourceCollection()` (`src/app/core/utils/async-resources.ts`)
y en `BaseRepository` (`src/app/core/services/base-repository.ts`):

1. **Un repository por entidad:** clase `{Entity}Repository` (que puede extender `BaseRepository`)
   concentra las llamadas HTTP de esa entidad.
2. **Escrituras:** `getMutations()` para POST, PUT, PATCH y DELETE, con estado reactivo
   (`submitting`, `error`, `value`).
3. **Lecturas:** `getResource()` para recurso único o lista simple; `getResourceCollection()` para
   listas con paginación, filtros o acumulación (scroll infinito), con signals `loading` / `error` /
   `value` (y `accumulated` / `total` en colecciones).
4. **URLs:** siempre vía `getApiUrl(path)` (base en `environment.apiRestBaseUrl`); no incluir
   `/api/v1/` (u otros prefijos de versión) manualmente en los callers.
5. **Recursos independientes:** no rutas anidadas de recursos; filtros vía query params.
6. **Convenciones de métodos:** `mutations()`, `find()` / `findById()`, `findBy()` / `findAll()`,
   `findBy{Filter}()` (p. ej. `findByStatus()`).
7. **Errores:** el fallo de load/mutate notifica al usuario vía `notify` cuando `notifyError` es
   `true` (default), alineado con ADR-009.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
viven en el estándar de dominio **Architecture Standards**
(`../standards/architecture.md`), no en este ADR.

## Consecuencias

### Positivas

- API REST homogénea, tipada y testeable por inyección de dependencias del repository.
- Estado async predecible con signals y errores alineados al puente `notify`.
- Separación clara entre acceso a datos (repository) y lógica de negocio (managers/features).

### Negativas / trade-offs

- Exige disciplina: no saltarse el repository con `HttpClient` ad hoc en features.
- Colecciones y mutaciones con forma fija de helpers; casos muy atípicos pueden requerir extensión
  cuidadosa de `async-resources` en vez de bypass.
- La base URL vive en environment (`apiRestBaseUrl`); cambiar el contrato de entorno implica tocar
  `getApiUrl`.

## Referencias

- [Architecture Standards](../standards/architecture.md)
- [ADR-001: Arquitectura híbrida por capas y por funcionalidades](./ADR-001-hybrid-layered-feature-architecture.md)
- [ADR-009: Puente de notificaciones por eventos en Core (`notify`)](./ADR-009-core-event-notification-bridge.md)
- [Índice de ADRs](./README.md)
- Implementación: `src/app/core/utils/async-resources.ts`, `src/app/core/services/base-repository.ts`
