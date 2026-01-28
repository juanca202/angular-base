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

# 📜 Constitución del Proyecto – Angular

## 1. Propósito del proyecto

Desarrollar una aplicación web moderna, escalable y mantenible utilizando **Angular**, siguiendo principios de **arquitectura limpia**, **Spec Driven Development** y documentación estructurada.

La IA se utiliza como apoyo para definir, planificar y ejecutar el desarrollo, siempre bajo control humano.

---

## 2. Idioma y comunicación

- **Idioma oficial:** Español (LatAm)
- Toda la documentación, especificaciones, planes y tareas deben generarse en español.
- Evitar anglicismos innecesarios.
- Usar terminología clara y consistente.
- Cuando existan dudas de significado, **consultar y referenciar el glosario del proyecto**.

---

## 3. Stack tecnológico

- Framework: **Angular (v21+)**
- Lenguaje: **TypeScript**
- Arquitectura: **Standalone Components**
- Estilos: CSS / Tailwind
- Gestión de estado: Signals y servicios
- Testing: Vitest / Playwright
- Calidad de código: ESLint + Prettier

---

## 4. Principios de arquitectura

- Separación clara de responsabilidades.
- Componentes enfocados en presentación y orquestación ligera.
- La lógica de negocio reside en **servicios**.
- Evitar lógica compleja en templates.
- Uso explícito y consciente de dependencias (`inject`).

---

## 5. Decisiones de arquitectura (ADR)

- Todas las decisiones técnicas relevantes deben documentarse mediante **Architecture Decision Records (ADR)**.
- Los ADR deben almacenarse en la ruta: `docs/adr`.
- Cada ADR debe incluir:
  - Contexto
  - Decisión
  - Alternativas consideradas
  - Consecuencias

Ninguna decisión arquitectónica relevante debe introducirse sin su ADR correspondiente.

---

## 6. Contratos y modelos

- Todos los **contratos** del proyecto deben almacenarse en la ruta: `docs/contracts`.

- Todo **modelo de dominio** debe definirse mediante contratos claros (interfaces o tipos).

- Los contratos de modelos deben:
  - Ser explícitos
  - Estar versionados cuando aplique
  - Evitar ambigüedades semánticas

- Los contratos de **API** deben definirse antes de la implementación.

- Las respuestas y solicitudes deben respetar estrictamente los contratos definidos.

---

## 7. Uso del glosario

- El proyecto debe mantener un **glosario de términos** compartido.

- El glosario debe almacenarse en la ruta: `docs/glossary`.

- Cualquier término de negocio o técnico relevante debe:
  - Definirse en el glosario
  - Usarse de forma consistente en specs, ADRs y código

- Si un término no está claro, **no se asume**: se agrega o se consulta en el glosario.

---

## 8. Convenciones de código

- Usar Standalone Components por defecto.
- Preferir Signals sobre RxJS cuando sea posible.
- Código en inglés, documentación en español.
- Tipado estricto obligatorio.
- Prohibido el uso de `any`.
- Priorizar legibilidad y mantenibilidad.

---

## 9. Calidad y buenas prácticas

- Código legible > código complejo.
- Evitar optimizaciones prematuras.
- Validar accesibilidad básica (a11y).
- No introducir dependencias sin justificación.
- Todo cambio significativo debe tener especificación previa.

---

## 10. Uso de IA (Speckit)

La IA debe:

- Generar especificaciones antes del código.
- Respetar ADRs, contratos y glosario existentes.
- Explicar decisiones técnicas cuando sea relevante.
- Generar tareas accionables y verificables.

La IA no debe:

- Inventar requisitos.
- Introducir decisiones arquitectónicas sin ADR.
- Modificar contratos sin impacto documentado.

---

## 11. Flujo Spec Driven obligatorio

1. `/speckit.specify` → Requisitos y casos de uso (almacenados en `docs/specs`)
2. `/speckit.plan` → Diseño técnico y arquitectura
3. `/speckit.tasks` → Tareas de implementación
4. Implementación
5. Revisión

---

## 12. Criterios de éxito

- La funcionalidad cumple la especificación.
- Las decisiones están documentadas en ADRs.
- Los contratos son claros y respetados.
- El glosario elimina ambigüedades.
- El proyecto es escalable y mantenible.

**Version**: 1.1.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-07
