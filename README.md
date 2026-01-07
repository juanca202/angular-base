Este proyecto es una aplicación base desarrollada con **Angular**, diseñada siguiendo una arquitectura modular y escalable. El proyecto implementa las mejores prácticas de Angular, usando componentes standalone, signals para gestión de estado, y una estructura organizada en capas (Core, Shared, Features).

### Características Principales

- **Arquitectura modular**: Separación clara de responsabilidades
- **PWA (Progressive Web App)**: Lista para instalar y usar offline
- **Angular Material (MDC)**: Componentes UI basados en Material Design
- **Tailwind CSS**: Utilidades CSS para layout y estilos comunes
- **Calidad de código**: ESLint, Prettier y Husky (hooks para validación)
- **Testing unitario y E2E**: Vitest y Playwright
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
- Vitest (testing)

### Scripts Disponibles

#### Desarrollo

- **`npm run start`**: Genera la versión de Git e inicia el servidor de desarrollo
- **`npm run build`**: Genera la versión de Git y compila la aplicación para despliegue
- **`npm run watch`**: Compila la aplicación en modo desarrollo con recarga automática

#### Testing

- **`npm run test`**: Ejecuta tests unitarios con Vitest
- **`npm run e2e`**: Ejecuta tests end-to-end con Playwright

#### Internacionalización (i18n)

- **`npm run extract-i18n`**: Extrae todas las cadenas de internacionalización del código fuente y genera el archivo base `en.json` (ver [ADR-005](./docs/adr/ADR-005-internationalization-strategy.md))
- **`npm run i18n -- [LOCALE]`**: Genera o actualiza archivos de traducción para el idioma indicado (ej: `npm run i18n -- es`) (ver [ADR-005](./docs/adr/ADR-005-internationalization-strategy.md))

#### Calidad de Código

- **`npm run lint`**: Ejecuta ESLint para verificar problemas en el código
- **`npm run lint:fix`**: Ejecuta ESLint y corrige automáticamente los problemas que pueda
- **`npm run prettier`**: Formatea automáticamente el código fuente usando Prettier

#### Documentación

- **`npm run compodoc:build`**: Genera la documentación de la API usando Compodoc
- **`npm run compodoc:build-and-serve`**: Genera la documentación y la sirve en un servidor local
- **`npm run compodoc:serve`**: Sirve la documentación existente en un servidor local

#### Utilidades

- **`npm run icons:pack`**: Genera el archivo de iconos SVG empaquetado

### Internacionalización (i18n)

Este proyecto incluye soporte para múltiples idiomas. Para más detalles sobre la estrategia de internacionalización, flujo de trabajo y uso de scripts, consulta [ADR-005: Estrategia de Internacionalización](./docs/adr/ADR-005-internationalization-strategy.md).

### Convención de Mensajes de Commit

Este proyecto usa la convención **Conventional Commits**. Para más detalles sobre los tipos permitidos, formato y reglas, consulta [ADR-009: Calidad de Código y Herramientas](./docs/adr/ADR-009-code-quality-tooling.md).

---

## Acceso Rápido a la Documentación

Enlaces directos a toda la documentación disponible:

- 🚀 [Comenzando](./docs/specs/rules/getting-started.md) - Cómo usar este proyecto base
- 📐 [Arquitectura](./docs/README.md) - Estructura general y decisiones de diseño
- 🎨 [Estilos CSS](./docs/specs/rules/css-styling.md) - Reglas y convenciones CSS
- 📋 [Registros de Decisiones Arquitectónicas (ADRs)](./docs/adr/README.md) - Decisiones arquitectónicas documentadas

---

## Índice de Documentación

### 📐 [Arquitectura](./docs/README.md)

Documentación completa de la arquitectura del proyecto, incluyendo:
- Objetivos y alcance arquitectónicos
- Diagramas C4 (Componentes y módulos internos)
- Decisiones arquitectónicas (ADRs)
- Estructura de capas (Core, Shared, Features)
- Seguridad, rendimiento y optimizaciones

**Útil para:** Entender la estructura general del proyecto, decisiones de diseño y cómo se organizan los componentes.

---

### 📋 [Registros de Decisiones Arquitectónicas (ADRs)](./docs/adr/README.md)

Este proyecto documenta todas las decisiones arquitectónicas importantes en ADRs. Consulta el [índice completo de ADRs](./docs/adr/README.md) para ver todas las decisiones documentadas.

**Útil para:** Entender las decisiones arquitectónicas del proyecto y las razones detrás de ellas.

---

### 🎨 [Estilos CSS](./docs/specs/rules/css-styling.md)

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
