# 🌟 Angular Base Project

Angular Base Project es una plantilla inicial diseñada para acelerar el desarrollo de aplicaciones modernas con Angular.  
Incluye una configuración completa orientada a **buenas prácticas**, **calidad de código** y **escalabilidad**, integrando herramientas y librerías clave tanto para web.

Este proyecto ofrece una base sólida con:

- **PWA (Web App Progresiva)** lista para instalar y usar offline.
- **Calidad de código** con ESLint, Prettier y Husky (hooks para validación).
- **Pruebas unitarias y E2E** con Jest y Playwright.
- **Monitoreo de errores** mediante Sentry.
- **Manejo de errores y mensajes** notificaciones, modales, páginas, validaciones, solicitudes http.
- **Internacionalización (i18n)** con Localize.
- **Despliegue en la nube** configuracion para despliegue en Azure, AWS y Google Cloud.
- **IA Friendly** para facilitar el desarrollo y que se ajuste a las reglas del proyecto.
- **Marketing y analítica** con Google Tag Manager y Firebase (Analytics, Messaging).
- **Notificaciones Push** integradas.
- **UI moderna** con Angular Material, theming, soporte de modo oscuro y basado en la guía de estilos de [Angular 20 Style Guide](https://angular.dev/style-guide).
- **Autenticación completa**: login, signup, reset/change password y eliminación de cuenta, integracion con autenticación federada.
- **Gestión de configuración y páginas legales**: settings, privacy, terms.
- **Contenedores** para estructurar la aplicación.

Este repositorio busca servir como **punto de partida** para proyectos que requieren una base confiable, estructurada y lista para escalar.

## Tecnologías Principales

- Angular
- Angular Material
- TypeScript
- SCSS

## Requisitos Previos

- Node.js (versión 19 o superior)
- Angular CLI (versión 19)
- NPM (versión 20 o superior)

# Instalación

> **Nota:** Este repositorio es un _boilerplate_. Lo recomendable es crear tu propio repositorio vacío y sincronizarlo con el repositorio principal.

Repositorio principal: [angular-base-project](https://github.com/juanca202/angular-base-project.git)

1. **Crear tu repositorio vacío**

```sh
git init angular-app
cd angular-app
```

2. **Agregar el repositorio principal como `upstream`**

```sh
git remote add upstream https://github.com/juanca202/angular-base-project.git
```

3. **Traer el contenido del repositorio principal**

```sh
git fetch upstream
```

4. **Fusionar (`merge`) el contenido del upstream a tu rama principal**

```sh
# Asegúrate de estar en tu rama main
git checkout -b main

# Fusiona los cambios del upstream
git merge upstream/main
```

Donde:

- `origin` → tu copia/fork (el repositorio sobre el que tienes permisos de escritura).
- `upstream` → el repositorio original del que proviene este proyecto.

Para sincronizar tu rama local con el original:

```sh
git fetch upstream
git checkout main
git merge upstream/main
```

## Scripts Disponibles

- `npm run start`: Genera la versión de Git y inicia el servidor de desarrollo
- `npm run build`: Genera la versión de Git y compila la aplicación para desplegarla
- `npm run extract-i18n -- [LOCALE]`: Extrae todas las cadenas de internacionalización desde el código fuente y genera el archivo correspondiente al idioma proporcionado (por ejemplo: `npm run extract-i18n -- es`).  
  Si existen cadenas sin traducir, se creará también el archivo `[LOCALE]_missing.js` con las claves faltantes.
- `npm run i18n -- [LOCALE]`: Usa el archivo base `en.js` para generar o actualizar el archivo de idioma indicado, sin volver a extraer las cadenas de la aplicación.  
  También genera un archivo `[LOCALE]_missing.js` si hay traducciones faltantes.
- `npm run watch`: Compila la aplicación en modo desarrollo con recarga automática
- `npm run test`: Ejecuta las pruebas unitarias
- `npm run prettier`: Formatea automáticamente el código fuente usando Prettier

## Estructura del Proyecto

```plaintext
public/ # Recursos estáticos
src/
├── app/
│ ├── core/ # Servicios core, guardias, interceptores
│ ├── shared/ # Componentes y utilidades compartidas
│ └── main/ # Componentes principales de la aplicación
├── theme/ # Estilos y temas
└── environments/ # Configuraciones por ambiente
```

## Internacionalización (i18n)

Este proyecto incluye soporte para **múltiples idiomas** utilizando archivos JSON como base y archivos JS para cada idioma.  
El idioma base siempre es **inglés (`en.json`)** y los idiomas adicionales se generan o actualizan mediante el script `generate-i18n.js`.

### Uso del script `generate-i18n.js`

Para generar o actualizar los archivos de traducción de un idioma específico, ejecuta:

```sh
npm run extract-i18n     # Extrae la base en en.json
npm run i18n -- es        # Genera o actualiza español
npm run i18n -- fr        # Genera o actualiza francés
```

### Funcionamiento

- El script toma **el JSON base en inglés (`en.json`)** y lo compara con el archivo JS del idioma destino (`es.js`, `fr.js`, etc.).
- Ordena las claves según el archivo base.
- Crea un archivo de **claves faltantes** (`<lang>_missing.json`) para que puedas completar traducciones que aún no existan.
- Genera o actualiza el archivo JS del idioma destino.
- Genera también el archivo JS del idioma base (`en.js`) a partir del JSON.

> Esto permite que la aplicación pueda cambiar de idioma fácilmente y mantener todas las traducciones sincronizadas con la versión en inglés.

### Manejo de mensajes y errores

MessageService
Error (component)
Error 404
getResource(errores http globales)
ErrorPipe (errores de validacion)

## 📝 Convención para nombres de commits

Este proyecto utiliza la convención de [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).  
Todos los mensajes de commit deben seguir el siguiente formato:

```
<tipo>(alcance opcional): descripción breve
```

### Tipos permitidos

- **feat** → una nueva funcionalidad.
- **fix** → una corrección de error.
- **docs** → cambios en documentación.
- **style** → cambios de formato/estilo (no afectan el código).
- **refactor** → cambios en el código que no corrigen errores ni agregan funciones.
- **test** → agregar o corregir pruebas.
- **chore** → tareas varias (build, herramientas, dependencias).

### Ejemplos válidos

```
feat(auth): agregar login con Google
fix(api): corregir error en el endpoint de usuarios
docs(readme): actualizar instrucciones de instalación
style(app): aplicar prettier a los componentes
refactor(core): optimizar servicio de notificaciones
test(auth): agregar pruebas para flujo de login
chore(deps): actualizar Angular a v16
```

### Reglas

- La descripción debe ser corta y en **tiempo presente**.
- Usa **inglés** para los commits (recomendado en proyectos abiertos).
- Los mensajes serán validados automáticamente por **commitlint** en el hook `commit-msg`

## Enlaces

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Semantic Versioning](https://semver.org/)
- [Angular Material](https://material.angular.dev/)
