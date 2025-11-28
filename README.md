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
- **`npm run extract-i18n -- [LOCALE]`**: Extracts all internationalization strings from the source code and generates the corresponding file for the provided language (e.g., `npm run extract-i18n -- es`). If there are untranslated strings, it will also create the `[LOCALE]_missing.js` file with the missing keys
- **`npm run i18n -- [LOCALE]`**: Uses the base `en.js` file to generate or update the indicated language file, without re-extracting strings from the application. Also generates a `[LOCALE]_missing.js` file if there are missing translations
- **`npm run watch`**: Compiles the application in development mode with automatic reload
- **`npm run test`**: Runs unit tests
- **`npm run prettier`**: Automatically formats source code using Prettier

### Internationalization (i18n)

This project includes support for multiple languages using JSON files as base and JS files for each language.

The base language is always English (`en.json`) and additional languages are generated or updated through the `generate-i18n.js` script.

#### Using the generate-i18n.js script

To generate or update translation files for a specific language, run:

```bash
npm run extract-i18n     # Extracts the base in en.json
npm run i18n -- es        # Generates or updates Spanish
npm run i18n -- fr        # Generates or updates French
```

#### How it works

The script takes the base English JSON (`en.json`) and compares it with the target language JS file (`es.js`, `fr.js`, etc.).

- Sorts keys according to the base file
- Creates a missing keys file (`<lang>_missing.json`) so you can complete translations that don't exist yet
- Generates or updates the target language JS file
- Also generates the base language JS file (`en.js`) from the JSON

This allows the application to easily change languages and keep all translations synchronized with the English version.

### Commit Message Convention

This project uses the **Conventional Commits** convention.

All commit messages must follow this format:

```
<type>(optional scope): brief description
```

#### Allowed types

- **`feat`** → a new feature
- **`fix`** → a bug fix
- **`docs`** → documentation changes
- **`style`** → formatting/style changes (don't affect code)
- **`refactor`** → code changes that don't fix bugs or add features
- **`test`** → adding or fixing tests
- **`chore`** → miscellaneous tasks (build, tools, dependencies)

#### Valid examples

- `feat(auth): add Google login`
- `fix(api): fix error in users endpoint`
- `docs(readme): update installation instructions`
- `style(app): apply prettier to components`
- `refactor(core): optimize notifications service`
- `test(auth): add tests for login flow`
- `chore(deps): update Angular to v16`

#### Rules

- The description should be short and in present tense
- Use English for commits (recommended in open projects)
- Messages will be automatically validated by commitlint in the `commit-msg` hook

---

## Quick Access to Documentation

Direct links to all available documentation:

- 📐 [Architecture](./docs/architecture.md) - General structure and design decisions
- 📁 [Project Structure](./docs/project-structure.md) - Folder and file organization
- 🎨 [CSS Styling](./docs/css-styling.md) - CSS rules and conventions
- ✅ [Form Field Validation](./docs/form-field-validation.md) - Reactive forms standards
- 🎯 [Icon Usage](./docs/icons.md) - Guide for using icons
- 🌐 [REST Services](./docs/rest-services.md) - Repository pattern for APIs
- 🧪 [Unit Testing](./docs/unit-testing.md) - Testing strategies and best practices

---

## Documentation Index

### 📐 [Architecture](./docs/architecture.md)

Complete documentation of the project architecture, including:
- Architectural objectives and scope
- C4 diagrams (Components and internal modules)
- Architectural decisions (ADRs)
- Layer structure (Core, Shared, Features)
- Security, performance, and optimizations

**Useful for:** Understanding the general project structure, design decisions, and how components are organized.

---

### 📁 [Project Structure](./docs/project-structure.md)

Detailed guide to folder and file organization in `src/app`:
- Core, Shared, and Features structure
- Naming conventions
- Organization of components, services, models, and more

**Useful for:** Navigating code, locating files, and understanding where to place new components.

---

### 🎨 [CSS Styling](./docs/css-styling.md)

Rules and conventions for CSS usage in the project:
- BEM with `ft-` prefix for custom classes
- Tailwind CSS prioritization for utilities
- CSS variables for themes and consistency
- Responsive design with Tailwind breakpoints

**Useful for:** Applying consistent styles, deciding when to use Tailwind vs. custom classes.

---

### ✅ [Form Field Validation](./docs/form-field-validation.md)

Standards for handling reactive forms and validations:
- Field structure with `mat-form-field`
- Using the `errorMessage` pipe for error messages
- Validator resolution order (Angular → Shared → Feature)
- Custom validator examples

**Useful for:** Implementing forms with consistent validation and standardized error messages.

---

### 🎯 [Icon Usage](./docs/icons.md)

Guide for using icons in the application:
- `<ft-icon />` component and its properties
- Available collections (factoricons-slim, factoricons-regular, factoricons-solid)
- Custom icons in `public/images/icons.svg`
- Size modifiers

**Useful for:** Adding icons to components, creating custom icons, and maintaining visual consistency.

---

### 🌐 [REST Services](./docs/rest-services.md)

Repository pattern for API communication:
- Repository structure
- Mutations (POST, PUT, DELETE) with `getMutations`
- Individual resources and lists with `getResource`
- State handling (loading, error) with signals

**Useful for:** Implementing services that consume REST APIs, handling loading and error states.

---

### 🧪 [Unit Testing](./docs/unit-testing.md)

Strategies and best practices for testing:
- Configuration with Jest
- AAA pattern (Arrange, Act, Assert)
- Component and service testing
- Testing signals and computed values
- Coverage and test cases (positive and negative)

**Useful for:** Writing effective tests, maintaining code coverage, and validating behaviors.

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

