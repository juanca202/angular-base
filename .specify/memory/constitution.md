<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0
Modified principles: All principles refactored to reference ADRs instead of summarizing them
Added sections: None
Removed sections: Detailed summaries from each principle (moved to ADR references only)
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section already references ADRs
  ✅ spec-template.md - Already aligns with ADR-driven requirements
  ✅ tasks-template.md - Already aligns with testing and architecture principles
Follow-up TODOs: None
-->

# Angular Base Project Constitution

## Core Principles

### I. Arquitectura de Capas (Core, Shared, Cross, Features)
La aplicación DEBE seguir la arquitectura de capas definida en ADR-001. Esta separación es NO-NEGOCIABLE y DEBE hacerse cumplir mediante linting y revisiones de código.

**Referencia**: [ADR-001: Separación de Responsabilidades](./docs/adr/ADR-001-separation-of-responsibilities.md)

### II. Guía de Estilo de Angular
TODOS los componentes DEBEN seguir la Guía de Estilo de Angular oficial según ADR-002. Estas convenciones son obligatorias y DEBEN verificarse mediante ESLint y revisiones de código.

**Referencia**: [ADR-002: Adopción de la Guía de Estilo de Angular](./docs/adr/ADR-002-angular-style-guide.md)

### III. Estrategia de Estilos CSS
La estrategia de estilos CSS DEBE seguir las reglas definidas en ADR-003. Esta estrategia DEBE aplicarse consistentemente en todo el proyecto.

**Referencia**: [ADR-003: Uso de Tailwind CSS](./docs/adr/ADR-003-tailwind-css-utilities.md)

### IV. Testing (NON-NEGOTIABLE)
Testing DEBE seguir la estrategia multi-capa definida en ADR-007. Esta sección es NO-NEGOCIABLE y DEBE aplicarse en todas las features.

**Referencia**: [ADR-007: Estrategia de Testing](./docs/adr/ADR-007-testing-strategy.md)

### V. Calidad de Código y Herramientas
Las herramientas de calidad de código DEBEN configurarse y usarse según ADR-009. Estas herramientas DEBEN integrarse en el flujo de trabajo y CI/CD.

**Referencia**: [ADR-009: Calidad de Código y Herramientas](./docs/adr/ADR-009-code-quality-tooling.md)

### VI. Documentación de Decisiones Arquitectónicas
TODAS las decisiones arquitectónicas significativas DEBEN documentarse como ADRs según ADR-011. La documentación DEBE servir tanto para humanos como para herramientas de desarrollo asistido por IA según ADR-004.

**Referencia**: [ADR-004: Reglas de Desarrollo Asistido por IA](./docs/adr/ADR-004-ai-assisted-development-rules.md), [ADR-011: Estrategia de Documentación](./docs/adr/ADR-011-documentation-strategy.md)

### VII. Patrón Repository para REST
Comunicación con APIs DEBE usar el patrón Repository definido en ADR-006. Este patrón DEBE aplicarse en todas las features que requieran comunicación con APIs.

**Referencia**: [ADR-006: Patrón Repository para REST](./docs/adr/ADR-006-repository-pattern-rest.md)

### VIII. Internacionalización (i18n)
El proyecto DEBE seguir la estrategia de internacionalización definida en ADR-005.

**Referencia**: [ADR-005: Estrategia de Internacionalización](./docs/adr/ADR-005-internationalization-strategy.md)

## Stack Tecnológico

### Framework y Lenguaje
- **Angular**: 21.0+ (componentes standalone, signals)
- **TypeScript**: 5.9+ (modo estricto)
- **Node.js**: Compatible con npm 10.8.2+

### UI y Estilos
- **Angular Material (MDC)**: Componentes UI basados en Material Design
- **Tailwind CSS**: Utilidades CSS para layout y estilos
- **Factor UI**: Componentes UI de Factor (`@factor_ec/ui`)

### Testing
- **Vitest**: Testing unitario e integración (integrado con Angular CLI)
- **Playwright**: Testing end-to-end
- **Angular Testing Utilities**: TestBed, ComponentFixture

### Calidad de Código
- **ESLint**: Linting con reglas de Angular y TypeScript
- **Prettier**: Formateo automático
- **Husky**: Git hooks
- **lint-staged**: Linting en archivos staged
- **Commitlint**: Validación de Conventional Commits

### Documentación
- **Compodoc**: Generación de documentación API
- **JSDoc/TSDoc**: Comentarios de documentación

### Monitoreo y Analytics
- **Sentry**: Monitoreo de errores
- **Azure Application Insights**: Telemetría
- **Google Tag Manager**: Analytics
- **Firebase**: Analytics y Messaging

### Despliegue
- **PWA**: Progressive Web App con Service Worker
- **Azure/AWS/Google Cloud**: Configuración para despliegue en la nube

## Desarrollo y Workflow

### Estructura de Documentación
- **ADRs**: `docs/adr/` - Todas las decisiones arquitectónicas
- **Specs**: `docs/specs/` - Especificaciones de features
- **Arquitectura**: `docs/README.md` - Documentación general de arquitectura
- **Glosario**: `docs/glossary/` - Términos y definiciones

### Convenciones de Código
- **Commits**: Conventional Commits según ADR-009
- **Nombres de archivos**: Seguir ADR-002
- **Selectores de componentes**: Seguir ADR-002
- **Modificadores de acceso**: Seguir [ADR-012](./docs/adr/ADR-012-typescript-access-modifiers.md)

### Validación de Formularios
La validación de formularios DEBE seguir la estrategia definida en ADR-008.

**Referencia**: [ADR-008: Estrategia de Validación de Formularios](./docs/adr/ADR-008-form-validation-strategy.md)

### Uso de Iconos
El uso de iconos DEBE seguir la estrategia definida en ADR-010.

**Referencia**: [ADR-010: Estrategia de Uso de Iconos](./docs/adr/ADR-010-icon-usage-strategy.md)

## Governance

Esta constitución SUPERA todas las demás prácticas y decisiones del proyecto. Las decisiones arquitectónicas documentadas en ADRs DEBEN seguirse estrictamente. Cualquier desviación DEBE justificarse y documentarse.

### Proceso de Enmienda
1. Identificar necesidad de cambio o adición de principio
2. Documentar propuesta como ADR en `docs/adr/`
3. Revisión y aprobación del equipo de arquitectura
4. Actualizar esta constitución con versión incrementada
5. Actualizar templates y documentación relacionada
6. Comunicar cambios al equipo

### Versionado
La constitución usa versionado semántico (MAJOR.MINOR.PATCH):
- **MAJOR**: Cambios incompatibles, remoción o redefinición de principios
- **MINOR**: Nuevos principios o secciones agregadas
- **PATCH**: Clarificaciones, correcciones de texto, refinamientos no semánticos

### Cumplimiento
- TODOS los PRs y revisiones DEBEN verificar cumplimiento con esta constitución
- ESLint y herramientas de calidad DEBEN hacer cumplir reglas técnicas
- La complejidad DEBE justificarse cuando se desvíe de principios
- Los ADRs DEBEN referenciarse en decisiones de implementación

### Desarrollo Asistido por IA
Las herramientas de desarrollo asistido por IA (Cursor, Copilot, etc.) DEBEN cargar automáticamente la documentación de `docs/` para mantener consistencia. Las reglas arquitectónicas DEBEN aplicarse automáticamente durante la generación de código.

**Referencia**: [ADR-004: Reglas de Desarrollo Asistido por IA](./docs/adr/ADR-004-ai-assisted-development-rules.md)

**Version**: 1.1.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-07
