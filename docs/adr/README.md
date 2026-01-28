# Registros de Decisiones Arquitectónicas (ADRs)

Este directorio contiene Registros de Decisiones Arquitectónicas (ADRs) que documentan decisiones arquitectónicas significativas tomadas en este proyecto.

## ¿Qué son los ADRs?

Los ADRs son documentos que capturan decisiones arquitectónicas importantes junto con su contexto y consecuencias. Ayudan a:

- **Documentar decisiones:** Registrar por qué se tomaron ciertas elecciones
- **Compartir conocimiento:** Ayudar a los miembros del equipo a entender el razonamiento detrás de las elecciones arquitectónicas
- **Mantener consistencia:** Proporcionar referencia para decisiones futuras
- **Onboarding de nuevos desarrolladores:** Entender rápidamente la arquitectura del proyecto y las decisiones

## Formato de ADR

Cada ADR sigue un formato estándar:

- **Título:** Título claro y descriptivo
- **Estado:** Estado actual (Accepted, Proposed, Deprecated, etc.)
- **Fecha de Creación:** Cuándo se creó el ADR
- **Última Actualización:** Cuándo se actualizó por última vez el ADR
- **Decisores:** Quién tomó la decisión
- **Contexto:** La situación y problema que llevó a esta decisión
- **Decisión:** La elección arquitectónica que se tomó
- **Consecuencias:** Impactos positivos y negativos de la decisión

## ADRs Actuales

- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001-separation-of-responsibilities.md)
- [ADR-002: Adopción de la Guía de Estilo Oficial de Angular](./ADR-002-angular-style-guide.md)
- [ADR-003: Uso de Tailwind CSS para Clases Utilitarias y Creación de Componentes](./ADR-003-tailwind-css-utilities.md)
- [ADR-004: Reglas de Desarrollo Asistido por IA](./ADR-004-ai-assisted-development-rules.md)
- [ADR-005: Estrategia de Internacionalización (i18n)](./ADR-005-internationalization-strategy.md)
- [ADR-006: Patrón de Repositorio para Servicios REST](./ADR-006-repository-pattern-rest.md)
- [ADR-007: Estrategia de Testing](./ADR-007-testing-strategy.md)
- [ADR-008: Estrategia de Validación de Formularios](./ADR-008-form-validation-strategy.md)
- [ADR-009: Calidad de Código y Herramientas](./ADR-009-code-quality-tooling.md)
- [ADR-010: Estrategia de Uso de Iconos](./ADR-010-icon-usage-strategy.md)
- [ADR-011: Estrategia de Documentación](./ADR-011-documentation-strategy.md)
- [ADR-012: Convención de modificadores de acceso y uso de readonly en TypeScript](./ADR-012-typescript-access-modifiers.md)
- [ADR-013: Layout y Estructura de Formularios](./ADR-013-form-layout-structure.md)
- [ADR-014: Uso de Diálogos para Interacciones Maestro–Detalle](./ADR-014-dialog-master-detail.md)
- [ADR-015: Patrón Manager para Coordinación de Flujos de Negocio](./ADR-015-manager-pattern.md)
- [ADR-016: Modelo de flujo de ramas basado en Features → Staging → Producción](./ADR-016-branching-strategy.md)

## Crear un Nuevo ADR

Al tomar una decisión arquitectónica significativa:

1. **Crea un nuevo archivo:** `ADR-XXX.md` donde XXX es el siguiente número secuencial
2. **Usa la plantilla:** Sigue el formato de los ADRs existentes
3. **Sé exhaustivo:** Incluye contexto, justificación de la decisión y consecuencias
4. **Agrega ejemplos:** Incluye ejemplos de código cuando sea relevante
5. **Actualiza el índice:** Agrega un enlace en `README.md` y este README

## Estados de ADR

- **Proposed:** La decisión está bajo consideración
- **Accepted:** La decisión ha sido aprobada e implementada
- **Deprecated:** La decisión ha sido reemplazada por un ADR más nuevo
- **Superseded:** Reemplazado por otro ADR (referencia el nuevo ADR)

## Referencias

- [Repositorio ADR en GitHub](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documentando Decisiones Arquitectónicas](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Documentación Principal](../README.md)
