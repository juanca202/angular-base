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

- Conventional Commits[https://www.conventionalcommits.org/en/v1.0.0]
