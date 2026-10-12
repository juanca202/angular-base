---
id: ADR-012
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [architecture, mapper, transformacion, features, inmutabilidad]
supersedes: null
superseded_by: null
emits: [architecture/CR-014, architecture/CR-015, architecture/CR-016, architecture/CR-017]
---

# ADR-012: Mappers como objetos de funciones puras por feature

## Contexto

Las transformaciones entre representaciones de una misma entidad (p. ej. Response ↔ Record ↔ Request
↔ Cache) suelen repartirse entre repositorios, managers y componentes. Eso duplica reglas de
normalización (tipos, nulos, formas anidadas), dificulta el mantenimiento y mezcla la conversión de
datos con orquestación o presentación.

El acceso REST ya se concentra en repositorios ([ADR-010](./ADR-010-repository-pattern-rest-api.md))
y la orquestación en managers ([ADR-011](./ADR-011-manager-pattern-orchestration.md)). Falta un rol
explícito y reutilizable solo para mapear entre capas de datos, alineado con la organización por
feature de [ADR-001](./ADR-001-hybrid-layered-feature-architecture.md).

## Decisión

Se adoptan **mappers** como objetos exportados de funciones puras, agrupados por entidad y ubicados
en la feature correspondiente:

1. **Forma:** un objeto exportado (p. ej. `BudgetMapper`) cuyos métodos son funciones puras: sin
   efectos secundarios, sin servicios Angular ni estado global, y devolviendo siempre objetos nuevos
   (inmutabilidad respecto a la entrada).
2. **Alcance:** agrupa las transformaciones de una entidad entre representaciones (Response, Record,
   Request, Cache, etc.). No incluye lógica de negocio, validación ni formateo para UI.
3. **Ubicación:** `src/app/features/{feature}/utils/{entity}-mapper.ts`.
4. **Nomenclatura:** archivo `{entity}-mapper.ts`; objeto `{Entity}Mapper`; funciones de mapeo con
   el patrón explícito `map<Source>To<Target>` (p. ej. `mapResponseToRecord`), o la forma
   simplificada equivalente cuando el contexto dentro del mapper es claro.
5. **Uso típico:** repositorios (y, si aplica, managers u otros callers) aplican el mapper al entrar
   o salir de la frontera HTTP/cache, sin embeber la conversión en el componente.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
viven en el estándar de dominio **Architecture Standards**
(`../standards/architecture.md`), no en este ADR.

## Consecuencias

### Positivas

- Un solo lugar por entidad para normalizar tipos y valores por defecto.
- Repositorios y managers más delgados; mappers fáciles de probar en unit tests.
- Separación clara: Repository (I/O) / Mapper (forma de datos) / Manager (orquestación) / UI (vista).

### Negativas / trade-offs

- Más archivos por feature cuando hay varias entidades.
- Riesgo de filtrar lógica de negocio o formateo UI al mapper si no se revisa en code review.
- La pureza estricta puede forzar pasar valores derivados (p. ej. timestamps) como parámetros en
  lugar de leer el reloj o el entorno dentro del mapper.

## Referencias

- [Architecture Standards](../standards/architecture.md)
- [ADR-001: Arquitectura híbrida por capas y por funcionalidades](./ADR-001-hybrid-layered-feature-architecture.md)
- [ADR-010: Patrón Repository para comunicación REST API](./ADR-010-repository-pattern-rest-api.md)
- [ADR-011: Patrón Manager para orquestación de flujos de negocio y UX](./ADR-011-manager-pattern-orchestration.md)
- [Índice de ADRs](./README.md)
