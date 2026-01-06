<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (initial creation)
Added sections: All core principles, constraints, workflow, governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Aligns with ADR-driven requirements
  ✅ tasks-template.md - Aligns with testing and architecture principles
Follow-up TODOs: None
-->

# Angular Base Project Constitution

## Core Principles

### I. Arquitectura de Capas (Core, Shared, Cross, Features)
La aplicación DEBE organizarse en cuatro capas con responsabilidades claras y reglas de dependencias estrictas. Core contiene infraestructura global (servicios singleton, guards, interceptors, modelos globales). Shared contiene componentes UI reutilizables y utilidades. Cross contiene capacidades de dominio transversales (auth, sesión). Features contiene funcionalidad específica organizada por dominio. Las dependencias DEBEN seguir la jerarquía: Features → (Shared, Cross) → Core. Core NO DEBE depender de Shared, Cross ni Features. Shared NO DEBE depender de Features. Cross NO DEBE depender de Shared ni Features. Features NO DEBEN depender de otras Features. Esta separación es NO-NEGOCIABLE y DEBE hacerse cumplir mediante linting y revisiones de código.

**Referencia**: [ADR-001: Separación de Responsabilidades](./docs/adr/ADR-001-separation-of-responsibilities.md)

### II. Guía de Estilo de Angular
TODOS los componentes DEBEN seguir la Guía de Estilo de Angular oficial. Componentes DEBEN ser standalone. Detección de cambios DEBE usar OnPush cuando sea posible. Inyección de dependencias DEBE usar `inject()` en lugar de constructores. Estado reactivo DEBE usar Angular Signals. Flujos de control DEBEN usar sintaxis nativa (`@if`, `@for`, `@switch`). TypeScript DEBE usar modo estricto. Estas convenciones son obligatorias y DEBEN verificarse mediante ESLint y revisiones de código.

**Referencia**: [ADR-002: Adopción de la Guía de Estilo de Angular](./docs/adr/ADR-002-angular-style-guide.md)

### III. Estrategia de Estilos CSS
Tailwind CSS DEBE priorizarse para layout, espaciado y tipografía. Clases personalizadas DEBEN usar BEM con prefijo `ft-` solo para estilos específicos de componentes. Variables CSS DEBEN usarse para temas y consistencia. NO DEBE usarse `ngClass` o `ngStyle`; DEBE usarse bindings `[class]` y `[style]`. Diseño responsivo DEBE usar breakpoints de Tailwind. Esta estrategia DEBE aplicarse consistentemente en todo el proyecto.

**Referencia**: [ADR-003: Uso de Tailwind CSS](./docs/adr/ADR-003-tailwind-css-utilities.md)

### IV. Testing (NON-NEGOTIABLE)
Testing DEBE seguir un enfoque multi-capa: Unit Testing con Vitest, Integration Testing para interacciones componente-servicio, E2E Testing con Playwright. TODOS los tests DEBEN seguir el patrón AAA (Arrange, Act, Assert). Cobertura de tests DEBE ser ≥80% de ramas para rutas críticas. Tests DEBEN ser independientes y determinísticos. Angular Signals DEBEN tratarse como contenedores de estado, NO como funciones; NO DEBEN hacerse spy o mock de signals. Inferencia de tipos DEBE preferirse por defecto; tipos explícitos solo cuando sea necesario para claridad o herramientas de IA. Tests DEBEN escribirse antes o junto con la implementación.

**Referencia**: [ADR-007: Estrategia de Testing](./docs/adr/ADR-007-testing-strategy.md)

### V. Calidad de Código y Herramientas
ESLint, Prettier, Husky, lint-staged y Commitlint DEBEN configurarse y usarse. TODOS los commits DEBEN seguir Conventional Commits. Pre-commit hooks DEBEN ejecutar linting y formateo automático. Mensajes de commit DEBEN validarse mediante Commitlint. TypeScript DEBE usar modo estricto. Documentación API DEBE generarse con Compodoc usando JSDoc/TSDoc. Estas herramientas DEBEN integrarse en el flujo de trabajo y CI/CD.

**Referencia**: [ADR-009: Calidad de Código y Herramientas](./docs/adr/ADR-009-code-quality-tooling.md)

### VI. Documentación de Decisiones Arquitectónicas
TODAS las decisiones arquitectónicas significativas DEBEN documentarse como ADRs (Architectural Decision Records) en `docs/adr/`. Los ADRs DEBEN seguir el formato estándar: Título, Estado, Fecha, Decisores, Contexto, Decisión, Implementación, Consecuencias, Referencias. Los ADRs DEBEN mantenerse actualizados y versionados con el código. Las especificaciones de features DEBEN ubicarse en `docs/specs/`. La documentación DEBE servir tanto para humanos como para herramientas de desarrollo asistido por IA.

**Referencia**: [ADR-004: Reglas de Desarrollo Asistido por IA](./docs/adr/ADR-004-ai-assisted-development-rules.md), [ADR-011: Estrategia de Documentación](./docs/adr/ADR-011-documentation-strategy.md)

### VII. Patrón Repository para REST
Comunicación con APIs DEBE usar el patrón Repository. Servicios DEBEN implementar `getResource` para peticiones GET y `getMutations` para POST, PUT, DELETE. Gestión de estado DEBE usar signals. Manejo de errores DEBE seguir patrones consistentes. Este patrón DEBE aplicarse en todas las features que requieran comunicación con APIs.

**Referencia**: [ADR-006: Patrón Repository para REST](./docs/adr/ADR-006-repository-pattern-rest.md)

### VIII. Internacionalización (i18n)
El proyecto DEBE soportar múltiples idiomas usando Localize. Cadenas de texto DEBEN extraerse usando `npm run extract-i18n`. Archivos de traducción DEBEN generarse usando `npm run i18n -- [LOCALE]`. Archivos de i18n DEBEN ubicarse en `public/i18n/`. El idioma base DEBE ser inglés (`en`).

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
- **Commits**: Conventional Commits (feat, fix, docs, style, refactor, test, chore)
- **Nombres de archivos**: kebab-case para archivos, PascalCase para clases
- **Selectores de componentes**: Prefijo `ft-` para componentes del proyecto
- **Modificadores de acceso**: Seguir [ADR-012](./docs/adr/ADR-012-typescript-access-modifiers.md)

### Validación de Formularios
- Formularios DEBEN usar formularios reactivos de Angular
- Validadores DEBEN seguir el orden: Angular → Shared → Feature
- Mensajes de error DEBEN mostrarse usando el pipe `errorMessage`
- Validadores personalizados DEBEN crearse según necesidad

**Referencia**: [ADR-008: Estrategia de Validación de Formularios](./docs/adr/ADR-008-form-validation-strategy.md)

### Uso de Iconos
- Iconos DEBEN usarse mediante el componente `<ft-icon />`
- Colecciones disponibles: factoricons-slim, factoricons-regular, factoricons-solid
- Iconos personalizados DEBEN crearse en `public/images/icons.svg`

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

**Version**: 1.0.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-05
