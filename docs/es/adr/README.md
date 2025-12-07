# Registros de Decisiones Arquitectónicas (ADRs)

**📖 [English](../../en/adr/README.md) | [Español](./README.md)**

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
- **Fecha:** Cuándo se tomó la decisión
- **Contexto:** La situación y problema que llevó a esta decisión
- **Decisión:** La elección arquitectónica que se tomó
- **Consecuencias:** Impactos positivos y negativos de la decisión

## ADRs Actuales

- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001.md)
- [ADR-002: Adopción de la Guía de Estilo Oficial de Angular](./ADR-002.md)
- [ADR-003: Uso de Tailwind CSS para Clases Utilitarias y Creación de Componentes](./ADR-003.md)
- [ADR-004: Reglas de Desarrollo Asistido por IA](./ADR-004.md)
- [ADR-005: Estrategia de Internacionalización (i18n)](./ADR-005.md)
- [ADR-006: Patrón de Repositorio para Servicios REST](./ADR-006.md)
- [ADR-007: Estrategia de Testing](./ADR-007.md)
- [ADR-008: Estrategia de Validación de Formularios](./ADR-008.md)
- [ADR-009: Calidad de Código y Herramientas](./ADR-009.md)
- [ADR-010: Estrategia de Uso de Iconos](./ADR-010.md)
- [ADR-011: Estrategia de Documentación](./ADR-011.md)
- [ADR-012: Convención de modificadores de acceso y uso de readonly en TypeScript](./ADR-012.md)
- [ADR-013: Layout y Estructura de Formularios](./ADR-013.md)

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
- [Documentación de Arquitectura](../README.md)

