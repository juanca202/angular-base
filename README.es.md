**📖 [English](./README.md) | [Español](./README.es.md)**

Este proyecto es una aplicación base desarrollada con **Angular**, diseñada siguiendo una arquitectura modular y escalable. El proyecto implementa las mejores prácticas de Angular, usando componentes standalone, signals para gestión de estado, y una estructura organizada en capas (Core, Shared, Features).

### Características Principales

- **Arquitectura modular**: Separación clara de responsabilidades entre Core, Shared y Features
- **PWA (Progressive Web App)**: Lista para instalar y usar offline
- **Angular Material (MDC)**: Componentes UI basados en Material Design
- **Tailwind CSS**: Utilidades CSS para layout y estilos comunes
- **Calidad de código**: ESLint, Prettier y Husky (hooks para validación)
- **Testing unitario y E2E**: Jest y Playwright
- **Monitoreo de errores**: Sentry, Azure Application Insights
- **Documentación**: JSDoc/TSDoc con Compodoc
- **Internacionalización (i18n)**: Localize
- **Despliegue en la nube**: Configuración para despliegue en Azure, AWS y Google Cloud
- **Marketing y analytics**: Google Tag Manager y Firebase (Analytics, Messaging)
- **Desarrollo asistido por IA**: Reglas documentadas para mantener consistencia

### Tecnologías Clave

- Angular (componentes standalone, signals)
- TypeScript (modo estricto)
- Angular Material (MDC)
- Tailwind CSS
- Jest (testing)

### Scripts Disponibles

- **`npm run start`**: Genera la versión de Git e inicia el servidor de desarrollo
- **`npm run build`**: Genera la versión de Git y compila la aplicación para despliegue
- **`npm run extract-i18n -- [LOCALE]`**: Extrae todas las cadenas de internacionalización del código fuente (ver [ADR-005](./docs/es/decisions/ADR-005.md))
- **`npm run i18n -- [LOCALE]`**: Genera o actualiza archivos de traducción para el idioma indicado (ver [ADR-005](./docs/es/decisions/ADR-005.md))
- **`npm run watch`**: Compila la aplicación en modo desarrollo con recarga automática
- **`npm run test`**: Ejecuta tests unitarios
- **`npm run prettier`**: Formatea automáticamente el código fuente usando Prettier

### Internacionalización (i18n)

Este proyecto incluye soporte para múltiples idiomas. Para más detalles sobre la estrategia de internacionalización, flujo de trabajo y uso de scripts, consulta [ADR-005: Estrategia de Internacionalización](./docs/es/decisions/ADR-005.md).

### Convención de Mensajes de Commit

Este proyecto usa la convención **Conventional Commits**. Para más detalles sobre los tipos permitidos, formato y reglas, consulta [ADR-009: Calidad de Código y Herramientas](./docs/es/decisions/ADR-009.md).

---

## Acceso Rápido a la Documentación

Enlaces directos a toda la documentación disponible:

- 🚀 [Comenzando](./docs/es/getting-started.md) - Cómo usar este proyecto base
- 📐 [Arquitectura](./docs/es/architecture.md) - Estructura general y decisiones de diseño
- 🎨 [Estilos CSS](./docs/es/css-styling.md) - Reglas y convenciones CSS
- 📋 [Registros de Decisiones Arquitectónicas (ADRs)](./docs/es/decisions/README.md) - Decisiones arquitectónicas documentadas

**📖 [Ver documentación en inglés](./README.md)**

---

## Índice de Documentación

### 📐 [Arquitectura](./docs/es/architecture.md)

Documentación completa de la arquitectura del proyecto, incluyendo:
- Objetivos y alcance arquitectónicos
- Diagramas C4 (Componentes y módulos internos)
- Decisiones arquitectónicas (ADRs)
- Estructura de capas (Core, Shared, Features)
- Seguridad, rendimiento y optimizaciones

**Útil para:** Entender la estructura general del proyecto, decisiones de diseño y cómo se organizan los componentes.

---

### 📋 [Registros de Decisiones Arquitectónicas (ADRs)](./docs/es/decisions/README.md)

Este proyecto documenta todas las decisiones arquitectónicas importantes en ADRs:

- **[ADR-001: Separación de Responsabilidades](./docs/es/decisions/ADR-001.md)** - Arquitectura de tres capas (Core, Shared, Features)
- **[ADR-002: Adopción de la Guía de Estilo de Angular](./docs/es/decisions/ADR-002.md)** - Convenciones y mejores prácticas
- **[ADR-003: Uso de Tailwind CSS](./docs/es/decisions/ADR-003.md)** - Estrategia de estilos CSS
- **[ADR-004: Reglas de Desarrollo Asistido por IA](./docs/es/decisions/ADR-004.md)** - Reglas de desarrollo asistido por IA
- **[ADR-005: Estrategia de Internacionalización](./docs/es/decisions/ADR-005.md)** - i18n y gestión de traducciones
- **[ADR-006: Patrón Repository para REST](./docs/es/decisions/ADR-006.md)** - Comunicación con APIs
- **[ADR-007: Estrategia de Testing](./docs/es/decisions/ADR-007.md)** - Jest y Playwright
- **[ADR-008: Estrategia de Validación de Formularios](./docs/es/decisions/ADR-008.md)** - Formularios reactivos
- **[ADR-009: Calidad de Código y Herramientas](./docs/es/decisions/ADR-009.md)** - ESLint, Prettier, Husky
- **[ADR-010: Estrategia de Uso de Iconos](./docs/es/decisions/ADR-010.md)** - Componente `<ft-icon />`
- **[ADR-011: Estrategia de Documentación](./docs/es/decisions/ADR-011.md)** - JSDoc/TSDoc, Compodoc

**Útil para:** Entender las decisiones arquitectónicas del proyecto y las razones detrás de ellas.

---

### 🎨 [Estilos CSS](./docs/es/css-styling.md)

Reglas y convenciones para el uso de CSS en el proyecto:
- BEM con prefijo `ft-` para clases personalizadas
- Priorización de Tailwind CSS para utilidades
- Variables CSS para temas y consistencia
- Diseño responsivo con breakpoints de Tailwind

**Útil para:** Aplicar estilos consistentes, decidir cuándo usar Tailwind vs. clases personalizadas.

---

## Contribuir

Al agregar nueva documentación:
- Mantener el formato Markdown consistente
- Incluir ejemplos de código cuando sea relevante
- Actualizar este índice con enlaces y descripciones
- Seguir las convenciones establecidas en los documentos existentes

## Enlaces

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Semantic Versioning](https://semver.org/)
- [Angular Material](https://material.angular.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Sentry](https://docs.sentry.io/)

