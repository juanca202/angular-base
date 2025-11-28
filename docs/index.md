# Documentación del Proyecto

## Resumen General

Este proyecto es una aplicación base desarrollada con **Angular**, diseñada siguiendo una arquitectura modular y escalable. El proyecto implementa las mejores prácticas de Angular, utilizando componentes standalone, signals para el manejo de estado, y una estructura organizada en capas (Core, Shared, Features).

### Características Principales

- **Arquitectura modular**: Separación clara de responsabilidades entre Core, Shared y Features
- **Angular Material (MDC)**: Componentes UI basados en Material Design
- **Tailwind CSS**: Utilidades CSS para layout y estilos comunes
- **BEM con prefijo `ft-`**: Convención de nombres para estilos de componentes
- **Formularios reactivos**: Validación estandarizada con pipes personalizados
- **Servicios REST**: Patrón de repositorios para comunicación con APIs
- **Testing con Jest**: Estrategias de testing unitario e integración
- **Localización (i18n)**: Soporte para múltiples idiomas
- **Desarrollo asistido por IA**: Reglas documentadas para mantener consistencia

### Tecnologías Clave

- Angular (standalone components, signals)
- TypeScript (strict mode)
- Angular Material (MDC)
- Tailwind CSS
- Jest (testing)
- RxJS (programación reactiva)

---

## Índice de Documentación

### 📐 [Arquitectura](./architecture.md)

Documentación completa de la arquitectura del proyecto, incluyendo:
- Objetivos arquitectónicos y alcance
- Diagramas C4 (Componentes y módulos internos)
- Decisiones arquitectónicas (ADRs)
- Estructura de capas (Core, Shared, Features)
- Seguridad, performance y optimizaciones

**Útil para:** Entender la estructura general del proyecto, decisiones de diseño y cómo se organizan los componentes.

---

### 📁 [Estructura del Proyecto](./project-structure.md)

Guía detallada de la organización de carpetas y archivos en `src/app`:
- Estructura de Core, Shared y Features
- Convenciones de nomenclatura
- Organización de componentes, servicios, modelos y más

**Útil para:** Navegar el código, ubicar archivos y entender dónde colocar nuevos componentes.

---

### 🎨 [Guías de Estilos CSS](./css-styling.md)

Reglas y convenciones para el uso de CSS en el proyecto:
- BEM con prefijo `ft-` para clases personalizadas
- Priorización de Tailwind CSS para utilidades
- Variables CSS para temas y consistencia
- Responsive design con breakpoints de Tailwind

**Útil para:** Aplicar estilos consistentes, decidir cuándo usar Tailwind vs. clases personalizadas.

---

### ✅ [Validación de Formularios](./form-field-validation.md)

Estándares para manejo de formularios reactivos y validaciones:
- Estructura de campos con `mat-form-field`
- Uso del pipe `errorMessage` para mensajes de error
- Orden de resolución de validadores (Angular → Shared → Feature)
- Ejemplos de validadores personalizados

**Útil para:** Implementar formularios con validación consistente y mensajes de error estandarizados.

---

### 🎯 [Uso de Iconos](./icons.md)

Guía para el uso de iconos en la aplicación:
- Componente `<ft-icon />` y sus propiedades
- Colecciones disponibles (factoricons-slim, factoricons-regular, factoricons-solid)
- Iconos personalizados en `public/images/icons.svg`
- Modificadores de tamaño

**Útil para:** Agregar iconos a componentes, crear iconos personalizados y mantener consistencia visual.

---

### 🌐 [Servicios REST](./rest-services.md)

Patrón de repositorios para comunicación con APIs:
- Estructura de repositorios
- Mutaciones (POST, PUT, DELETE) con `getMutations`
- Recursos individuales y listas con `getResource`
- Manejo de estados (loading, error) con signals

**Útil para:** Implementar servicios que consumen APIs REST, manejar estados de carga y errores.

---

### 🧪 [Testing Unitario](./unit-testing.md)

Estrategias y mejores prácticas para testing:
- Configuración con Jest
- Patrón AAA (Arrange, Act, Assert)
- Testing de componentes y servicios
- Testing de signals y computed values
- Cobertura y casos de prueba (positivos y negativos)

**Útil para:** Escribir tests efectivos, mantener cobertura de código y validar comportamientos.

---

## Guías Rápidas

### Para Nuevos Desarrolladores

1. Comienza con [Arquitectura](./architecture.md) para entender la estructura general
2. Revisa [Estructura del Proyecto](./project-structure.md) para navegar el código
3. Consulta las guías específicas según tu tarea:
   - Crear componentes → [CSS Styling](./css-styling.md) + [Icons](./icons.md)
   - Formularios → [Validación de Formularios](./form-field-validation.md)
   - APIs → [Servicios REST](./rest-services.md)
   - Testing → [Testing Unitario](./unit-testing.md)

### Para Desarrollo Asistido por IA

Todas las reglas documentadas aquí están también disponibles en `.cursor/rules/` para ser aplicadas automáticamente por herramientas de IA como Cursor, garantizando consistencia en el código generado.

---

## Contribuir

Al agregar nueva documentación:
- Mantén el formato Markdown consistente
- Incluye ejemplos de código cuando sea relevante
- Actualiza este índice con enlaces y descripciones
- Sigue las convenciones establecidas en los documentos existentes

