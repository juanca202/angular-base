# 🌟 Angular Base Project

Angular Base Project es una plantilla inicial diseñada para acelerar el desarrollo de aplicaciones modernas con Angular.  
Incluye una configuración completa orientada a **buenas prácticas**, **calidad de código** y **escalabilidad**, integrando herramientas y librerías clave tanto para la web como para dispositivos móviles mediante **Capacitor**.

Este proyecto ofrece una base sólida con:

- **PWA (Web App Progresiva)** lista para instalar y usar offline.
- **Calidad de código** con ESLint, Prettier y Husky (hooks para validación).
- **Pruebas unitarias y E2E** con Jest y Playwright.
- **Monitoreo de errores** mediante Sentry.
- **Marketing y analítica** con Google Tag Manager y Firebase (Analytics, Messaging).
- **Internacionalización (i18n)** con Localize.
- **Notificaciones Push** integradas.
- **UI moderna** con Angular Material, theming, soporte de modo oscuro y basado en la guía de estilos de [Angular 20 Style Guide](https://angular.dev/style-guide).
- **Autenticación completa**: login, signup, reset/change password y eliminación de cuenta.
- **Gestión de configuración y páginas legales**: settings, privacy, terms.
- **Contenedores y notificaciones** para estructurar la aplicación.
- **Compatibilidad multiplataforma** gracias a Capacitor y despliegue en tiendas mediante Appflow.

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
- `npm run build`: Genera la versión de Git y compila la aplicación para desplegarla con Capacitor
- `npm run extract-i18n`: Extrae las cadenas de internacionalización a un archivo JSON en inglés
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
