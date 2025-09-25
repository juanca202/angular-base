# Angular Base Project

- PWA (Web)
- ESLint, Prettier, Husky (Calidad de código)
- Jest (Pruebas unitarias)
- Playwight (Pruebas e2e)
- Sentry (Log de errores)
- Google TagManager (Marketing, UX, Ads)
- Localize (Internacionalización)
- Notificaciones Push
- Material (Componentes)
- Theme (Estilos)
- Modo oscuro
- Estructura base
  - Login
  - Signup
  - Reset password
  - Change password
  - Delete account
  - Errors
  - Settings
  - Page (Privacy, terms)
  - Notifications
  - Container
- Guía de Estilo Angular 20 ([https://angular.dev/style-guide](https://angular.dev/style-guide#))
- Capacitor (Dispositivos, despliegue en tiendas con Appflow)
- Firebase (Analytics, Messaging)

## Requisitos Previos

- Node.js (versión 19 o superior)
- Angular CLI (versión 19)
- NPM (versión 20 o superior)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias
3. Iniciar servidor de desarrollo

## Scripts Disponibles

- `npm run start`: Genera la versión de Git y inicia el servidor de desarrollo
- `npm run build`: Genera la versión de Git y compila la aplicación para desplegarla con Capacitor
- `npm run extract-i18n`: Extrae las cadenas de internacionalización a un archivo JSON en inglés
- `npm run watch`: Compila la aplicación en modo desarrollo con recarga automática
- `npm run test`: Ejecuta las pruebas unitarias
- `npm run prettier`: Formatea automáticamente el código fuente usando Prettier

## Seguridad

- Hash de integridad en archivos CSS y JS

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

<br>

## Tecnologías Principales

- Angular
- Angular Material
- TypeScript
- SCSS

## Enlaces

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
- [Semantic Versioning](https://semver.org/)
- [Angular Material](https://material.angular.dev/)

## 🔄 Configuración de remotos (`origin` y `upstream`)

Este repositorio se encuentra configurado como un **fork** de otro proyecto.  
Para mantener tu copia actualizada, es importante agregar y verificar los remotos:

```sh
# Ver los remotos configurados
git remote -v
```

La salida debería mostrar al menos un `origin` (tu fork).  
Si no ves un `upstream`, puedes añadirlo con el comando:

```sh
git remote add upstream git@github.com:ORIGINAL_OWNER/REPO.git
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

O con rebase (opcional):

```sh
git checkout main
git pull --rebase upstream main
```

👉 Esto garantiza que tu fork siempre se mantenga alineado con el repositorio original.

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
