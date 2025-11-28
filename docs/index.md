# Documentación del Proyecto

## Resumen General

Este proyecto es una aplicación base desarrollada con **Angular**, diseñada siguiendo una arquitectura modular y escalable. El proyecto implementa las mejores prácticas de Angular, utilizando componentes standalone, signals para el manejo de estado, y una estructura organizada en capas (Core, Shared, Features).

### Características Principales

- **Arquitectura modular**: Separación clara de responsabilidades entre Core, Shared y Features
- **PWA (Web App Progresiva)**: Lista para instalar y usar offline
- **Angular Material (MDC)**: Componentes UI basados en Material Design
- **Tailwind CSS**: Utilidades CSS para layout y estilos comunes
- **BEM con prefijo `ft-`**: Convención de nombres para estilos de componentes
- **Formularios reactivos**: Validación estandarizada con pipes personalizados
- **Servicios REST**: Patrón de repositorios para comunicación con APIs
- **Calidad de código**: ESLint, Prettier y Husky (hooks para validación)
- **Pruebas unitarias y E2E**: Jest y Playwright
- **Monitoreo de errores**: Sentry, Azure Application Insights
- **Documentación**: JSDoc/TSDoc con Compodoc
- **Internacionalización (i18n)**: Localize
- **Despliegue en la nube**: Configuración para despliegue en Azure, AWS y Google Cloud
- **Marketing y analítica**: Google Tag Manager y Firebase (Analytics, Messaging)
- **Desarrollo asistido por IA**: Reglas documentadas para mantener consistencia

### Tecnologías Clave

- Angular (standalone components, signals)
- TypeScript (strict mode)
- Angular Material (MDC)
- Tailwind CSS
- Jest (testing)

### Scripts Disponibles

- **`npm run start`**: Genera la versión de Git y inicia el servidor de desarrollo
- **`npm run build`**: Genera la versión de Git y compila la aplicación para desplegarla
- **`npm run extract-i18n -- [LOCALE]`**: Extrae todas las cadenas de internacionalización desde el código fuente y genera el archivo correspondiente al idioma proporcionado (por ejemplo: `npm run extract-i18n -- es`). Si existen cadenas sin traducir, se creará también el archivo `[LOCALE]_missing.js` con las claves faltantes
- **`npm run i18n -- [LOCALE]`**: Usa el archivo base `en.js` para generar o actualizar el archivo de idioma indicado, sin volver a extraer las cadenas de la aplicación. También genera un archivo `[LOCALE]_missing.js` si hay traducciones faltantes
- **`npm run watch`**: Compila la aplicación en modo desarrollo con recarga automática
- **`npm run test`**: Ejecuta las pruebas unitarias
- **`npm run prettier`**: Formatea automáticamente el código fuente usando Prettier

### Internacionalización (i18n)

Este proyecto incluye soporte para múltiples idiomas utilizando archivos JSON como base y archivos JS para cada idioma.

El idioma base siempre es inglés (`en.json`) y los idiomas adicionales se generan o actualizan mediante el script `generate-i18n.js`.

#### Uso del script generate-i18n.js

Para generar o actualizar los archivos de traducción de un idioma específico, ejecuta:

```bash
npm run extract-i18n     # Extrae la base en en.json
npm run i18n -- es        # Genera o actualiza español
npm run i18n -- fr        # Genera o actualiza francés
```

#### Funcionamiento

El script toma el JSON base en inglés (`en.json`) y lo compara con el archivo JS del idioma destino (`es.js`, `fr.js`, etc.).

- Ordena las claves según el archivo base
- Crea un archivo de claves faltantes (`<lang>_missing.json`) para que puedas completar traducciones que aún no existan
- Genera o actualiza el archivo JS del idioma destino
- Genera también el archivo JS del idioma base (`en.js`) a partir del JSON

Esto permite que la aplicación pueda cambiar de idioma fácilmente y mantener todas las traducciones sincronizadas con la versión en inglés.

### Convención para nombres de commits

Este proyecto utiliza la convención de **Conventional Commits**.

Todos los mensajes de commit deben seguir el siguiente formato:

```
<tipo>(alcance opcional): descripción breve
```

#### Tipos permitidos

- **`feat`** → una nueva funcionalidad
- **`fix`** → una corrección de error
- **`docs`** → cambios en documentación
- **`style`** → cambios de formato/estilo (no afectan el código)
- **`refactor`** → cambios en el código que no corrigen errores ni agregan funciones
- **`test`** → agregar o corregir pruebas
- **`chore`** → tareas varias (build, herramientas, dependencias)

#### Ejemplos válidos

- `feat(auth): agregar login con Google`
- `fix(api): corregir error en el endpoint de usuarios`
- `docs(readme): actualizar instrucciones de instalación`
- `style(app): aplicar prettier a los componentes`
- `refactor(core): optimizar servicio de notificaciones`
- `test(auth): agregar pruebas para flujo de login`
- `chore(deps): actualizar Angular a v16`

#### Reglas

- La descripción debe ser corta y en tiempo presente
- Usa inglés para los commits (recomendado en proyectos abiertos)
- Los mensajes serán validados automáticamente por commitlint en el hook `commit-msg`

---

## Acceso Rápido a la Documentación

Enlaces directos a toda la documentación disponible:

- 📐 [Arquitectura](./architecture.md) - Estructura general y decisiones de diseño
- 📁 [Estructura del Proyecto](./project-structure.md) - Organización de carpetas y archivos
- 🎨 [Guías de Estilos CSS](./css-styling.md) - Reglas y convenciones de CSS
- ✅ [Validación de Formularios](./form-field-validation.md) - Estándares de formularios reactivos
- 🎯 [Uso de Iconos](./icons.md) - Guía para el uso de iconos
- 🌐 [Servicios REST](./rest-services.md) - Patrón de repositorios para APIs
- 🧪 [Testing Unitario](./unit-testing.md) - Estrategias y mejores prácticas de testing

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

## Enlaces

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Semantic Versioning](https://semver.org/)
- [Angular Material](https://material.angular.dev/)

