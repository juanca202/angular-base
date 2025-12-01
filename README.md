**📖 [English](./README.md) | [Español](./README.es.md)**

This project is a base application developed with **Angular**, designed following a modular and scalable architecture. The project implements Angular best practices, using standalone components, signals for state management, and an organized layered structure (Core, Shared, Features).

### Main Features

- **Modular architecture**: Clear separation of responsibilities between Core, Shared, and Features
- **PWA (Progressive Web App)**: Ready to install and use offline
- **Angular Material (MDC)**: UI components based on Material Design
- **Tailwind CSS**: CSS utilities for layout and common styles
- **BEM with `ft-` prefix**: Naming convention for component styles
- **Reactive forms**: Standardized validation with custom pipes
- **REST services**: Repository pattern for API communication
- **Code quality**: ESLint, Prettier, and Husky (hooks for validation)
- **Unit and E2E testing**: Jest and Playwright
- **Error monitoring**: Sentry, Azure Application Insights
- **Documentation**: JSDoc/TSDoc with Compodoc
- **Internationalization (i18n)**: Localize
- **Cloud deployment**: Configuration for deployment on Azure, AWS, and Google Cloud
- **Marketing and analytics**: Google Tag Manager and Firebase (Analytics, Messaging)
- **AI-assisted development**: Documented rules to maintain consistency

### Key Technologies

- Angular (standalone components, signals)
- TypeScript (strict mode)
- Angular Material (MDC)
- Tailwind CSS
- Jest (testing)

### Available Scripts

- **`npm run start`**: Generates the Git version and starts the development server
- **`npm run build`**: Generates the Git version and compiles the application for deployment
- **`npm run extract-i18n -- [LOCALE]`**: Extracts all internationalization strings from the source code (see [ADR-005](./docs/en/decisions/ADR-005.md))
- **`npm run i18n -- [LOCALE]`**: Generates or updates translation files for the indicated language (see [ADR-005](./docs/en/decisions/ADR-005.md))
- **`npm run watch`**: Compiles the application in development mode with automatic reload
- **`npm run test`**: Runs unit tests
- **`npm run prettier`**: Automatically formats source code using Prettier

### Internationalization (i18n)

This project includes support for multiple languages. For more details on the internationalization strategy, workflow, and script usage, see [ADR-005: Internationalization Strategy](./docs/en/decisions/ADR-005.md).

### Commit Message Convention

This project uses the **Conventional Commits** convention. For more details on allowed types, format, and rules, see [ADR-009: Code Quality & Tooling](./docs/en/decisions/ADR-009.md).

---

## Quick Access to Documentation

Direct links to all available documentation:

- 📐 [Architecture](./docs/en/architecture.md) - General structure and design decisions
- 🎨 [CSS Styling](./docs/en/css-styling.md) - CSS rules and conventions
- 📋 [Architectural Decision Records (ADRs)](./docs/en/decisions/README.md) - Documented architectural decisions

**📖 [View documentation in Spanish](./README.es.md)**

---

## Documentation Index

### 📐 [Architecture](./docs/en/architecture.md)

Complete documentation of the project architecture, including:
- Architectural objectives and scope
- C4 diagrams (Components and internal modules)
- Architectural decisions (ADRs)
- Layer structure (Core, Shared, Features)
- Security, performance, and optimizations

**Useful for:** Understanding the general project structure, design decisions, and how components are organized.

---

### 📋 [Architectural Decision Records (ADRs)](./docs/en/decisions/README.md)

This project documents all significant architectural decisions in ADRs:

- **[ADR-001: Separation of Responsibilities](./docs/en/decisions/ADR-001.md)** - Three-layer architecture (Core, Shared, Features)
- **[ADR-002: Adoption of Angular Style Guide](./docs/en/decisions/ADR-002.md)** - Conventions and best practices
- **[ADR-003: Use of Tailwind CSS](./docs/en/decisions/ADR-003.md)** - CSS styling strategy
- **[ADR-004: AI-Assisted Development Rules](./docs/en/decisions/ADR-004.md)** - Rules for Cursor
- **[ADR-005: Internationalization Strategy](./docs/en/decisions/ADR-005.md)** - i18n and translation management
- **[ADR-006: Repository Pattern for REST](./docs/en/decisions/ADR-006.md)** - API communication
- **[ADR-007: Testing Strategy](./docs/en/decisions/ADR-007.md)** - Jest and Playwright
- **[ADR-008: Form Validation Strategy](./docs/en/decisions/ADR-008.md)** - Reactive forms
- **[ADR-009: Code Quality & Tooling](./docs/en/decisions/ADR-009.md)** - ESLint, Prettier, Husky
- **[ADR-010: Icon Usage Strategy](./docs/en/decisions/ADR-010.md)** - `<ft-icon />` component
- **[ADR-011: Documentation Strategy](./docs/en/decisions/ADR-011.md)** - JSDoc/TSDoc, Compodoc

**Useful for:** Understanding the project's architectural decisions and the reasoning behind them.

---

### 🎨 [CSS Styling](./docs/en/css-styling.md)

Rules and conventions for CSS usage in the project:
- BEM with `ft-` prefix for custom classes
- Tailwind CSS prioritization for utilities
- CSS variables for themes and consistency
- Responsive design with Tailwind breakpoints

**Useful for:** Applying consistent styles, deciding when to use Tailwind vs. custom classes.

---

## Contributing

When adding new documentation:
- Keep Markdown format consistent
- Include code examples when relevant
- Update this index with links and descriptions
- Follow conventions established in existing documents

## Enlaces

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Semantic Versioning](https://semver.org/)
- [Angular Material](https://material.angular.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Sentry](https://docs.sentry.io/)

