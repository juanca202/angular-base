---
id: ADR-001
status: Accepted
last_update: 2026-07-29
deciders: [Equipo de Arquitectura]
tags: [angular, arquitectura, capas, features, modularidad]
supersedes: null
superseded_by: null
emits: [architecture/CR-001, architecture/CR-002, architecture/CR-003, architecture/CR-004]
---

# ADR-001: Arquitectura híbrida por capas y por funcionalidades (Core, Shared, Cross, Features)

## Contexto

A medida que la aplicación crece, las funcionalidades de negocio tienden a acoplarse entre sí: una
feature empieza a importar directamente componentes, servicios o modelos de otra, lo que dificulta
desarrollarlas y probarlas de forma independiente, complica la refactorización y hace más difícil
predecir el impacto de un cambio. Además, sin una estructura explícita, el equipo no tiene un criterio
claro de dónde debe vivir cada pieza de código: infraestructura global, utilidades reutilizables,
capacidades de dominio compartidas entre varias features, o lógica de negocio propia de una sola
feature.

Se necesita una organización del código que separe claramente la infraestructura y las capacidades
compartidas de la lógica de negocio específica de cada funcionalidad, y que evite que las features
dependan unas de otras de forma directa.

## Decisión

Se adopta una **arquitectura híbrida** que combina:

- **Arquitectura por capas**, para la infraestructura y las capacidades compartidas.
- **Arquitectura por funcionalidades (feature-based)**, para encapsular la lógica de negocio.

La aplicación se organiza en cuatro capas principales:

| Capa | Responsabilidad |
|---|---|
| **Core** (`src/app/core/`) | Infraestructura global de la aplicación: servicios singleton, interceptors, guards globales, modelos y utilidades usadas en toda la app. |
| **Shared** (`src/app/shared/`) | Componentes de presentación, directivas, pipes y utilidades reutilizables entre features; también aloja los **contracts** (interfaces) que las features usan para comunicarse entre sí sin acoplarse directamente. |
| **Cross** (`src/app/cross/`) | Capacidades de dominio transversales que aplican a varias features (p. ej. persistencia, integraciones externas, repositorios/managers compartidos), pero que no son infraestructura genérica de la app. |
| **Features** (`src/app/features/{feature}/`) | Funcionalidades de negocio independientes y autocontenidas: componentes, servicios, repositorios, modelos y rutas propios de esa funcionalidad. |

Las capas (Core, Shared, Cross) proveen infraestructura y capacidades reutilizables; las features
encapsulan la lógica de negocio específica y consumen esas capas sin depender directamente unas de
otras. Las dependencias entre capas y entre features fluyen en una única dirección — de mayor a menor
nivel — evitando dependencias inversas y dependencias directas entre features; cuando dos features
necesitan comunicarse, lo hacen a través de **contracts** (interfaces) definidos en `shared/contracts/`
e inyectados mediante providers de Angular, nunca importándose entre sí. Los imports que cruzan de una
capa a otra deben hacerse mediante los path aliases configurados (`@/core`, `@/shared`, `@/cross`,
`@/features`), en vez de rutas relativas, para que la capa de origen de cada import sea explícita en el
propio código.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Architecture Standards**
(`../standards/architecture.md`), no en este ADR.

## Consecuencias

### Positivas

- Separación clara de responsabilidades: el equipo sabe dónde ubicar código de infraestructura, de
  dominio compartido o de negocio.
- Reutilización de componentes de Shared y de capacidades de Cross entre múltiples features.
- Las features pueden desarrollarse, probarse y evolucionar de forma independiente.
- Nuevas features pueden agregarse sin afectar la infraestructura ni otras features existentes.
- Los imports con alias hacen explícita la capa de origen, facilitando la lectura y el onboarding.

### Negativas / trade-offs

- Requiere disciplina del equipo para respetar la estructura y la dirección de dependencias.
- Curva de aprendizaje para quienes se incorporan al proyecto.
- El patrón de contracts para comunicación entre features añade una capa de indirección (interfaces +
  providers) frente a un import directo.

## Referencias

- [Architecture Standards](../standards/architecture.md)
- [Índice de ADRs](./README.md)
- [Angular Style Guide - Estructura de Archivos](https://angular.dev/style-guide#file-structure)
