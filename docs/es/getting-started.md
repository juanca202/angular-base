# Comenzando con Angular Base Project

**📖 [English](../en/getting-started.md) | [Español](./getting-started.md)**

Este documento explica cómo usar el Angular Base Project como punto de partida para crear nuevos proyectos.

## Resumen

El Angular Base Project es un **boilerplate** diseñado para servir como base para nuevas aplicaciones Angular. Incluye:

- Arquitectura preconfigurada (Core, Shared, Features)
- Herramientas de desarrollo y estándares de calidad
- Mejores prácticas y convenciones
- Documentación y ADRs
- Componentes y servicios listos para usar

## Instalación

**Nota:** Este repositorio es un boilerplate. Se recomienda crear tu propio repositorio vacío y sincronizarlo con el repositorio principal.

### Repositorio Principal

**Repositorio:** `angular-base-project`

### Crear tu Nuevo Repositorio de Proyecto

#### Paso 1: Crear tu Repositorio Vacío

```bash
git init angular-app
cd angular-app
```

#### Paso 2: Agregar el Repositorio Principal como Upstream

```bash
git remote add upstream https://github.com/juanca202/angular-base-project.git
```

#### Paso 3: Traer el Contenido del Repositorio Principal

```bash
git fetch upstream
```

#### Paso 4: Fusionar el Contenido del Upstream a tu Rama Principal

```bash
# Asegúrate de estar en tu rama main
git checkout -b main

# Fusiona los cambios del upstream
git merge upstream/main
```

### Estructura de Repositorios

Al configurar tu proyecto, tendrás dos remotes:

- **`origin`** → Tu copia/fork (el repositorio sobre el que tienes permisos de escritura)
- **`upstream`** → El repositorio original del que proviene este proyecto

### Sincronizar tu Rama Local con el Original

Para mantener tu proyecto sincronizado con el repositorio original:

```bash
# Traer los últimos cambios del upstream
git fetch upstream

# Cambiar a tu rama main
git checkout main

# Fusionar los cambios del upstream en tu rama
git merge upstream/main
```

## Configuración Inicial

Después de clonar o fusionar el proyecto base, sigue estos pasos:

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Ajustes del Proyecto

Actualiza los siguientes archivos con información específica de tu proyecto:

- **`package.json`**: Actualiza el nombre del proyecto, descripción y URL del repositorio
- **`angular.json`**: Actualiza el nombre del proyecto si es necesario
- **`README.md`**: Actualiza con información específica de tu proyecto
- **Archivos de entorno**: Configura variables de entorno en `src/environments/`

### 3. Actualizar Metadatos del Proyecto

- Actualiza `src/version-info.ts` con la información de tu proyecto
- Actualiza `public/manifest.webmanifest` con los detalles de tu app
- Actualiza `public/index.html` con el título de tu app y meta tags

### 4. Configurar i18n

Si necesitas agregar o modificar idiomas:

```bash
# Extraer traducciones base
npm run extract-i18n

# Generar archivos de idioma
npm run i18n -- es  # Para español
```

### 5. Ejecutar el Servidor de Desarrollo

```bash
npm run start
```

## Personalización del Proyecto

### Actualizar el Nombre del Proyecto

1. Actualiza `package.json`:
   ```json
   {
     "name": "tu-nombre-proyecto",
     "description": "Descripción de tu proyecto"
   }
   ```

2. Actualiza `angular.json`:
   ```json
   {
     "projects": {
       "tu-nombre-proyecto": {
         ...
       }
     }
   }
   ```

3. Actualiza `README.md` con la información de tu proyecto

### Eliminar Código de Ejemplo

El proyecto base incluye código de ejemplo en `src/app/samples/`. Puedes:

- Eliminar todo el directorio `samples/` si no lo necesitas
- Usarlo como referencia para implementar tus propias funcionalidades
- Mantenerlo como punto de partida para tus funcionalidades

### Personalizar el Tema

Actualiza colores y estilos del tema en:
- `src/styles.scss` - Estilos globales
- `src/theme/` - Archivos de configuración del tema
- Configuración de Tailwind en `tailwind.config.js`

## Mantenerse al Día con Actualizaciones del Proyecto Base

### Sincronización Regular

Para recibir actualizaciones y mejoras del proyecto base:

```bash
# Traer los últimos cambios
git fetch upstream

# Revisar cambios
git log HEAD..upstream/main

# Fusionar actualizaciones
git merge upstream/main
```

### Manejo de Conflictos

Si ocurren conflictos durante la fusión:

1. Revisa los conflictos cuidadosamente
2. Resuelve los conflictos preservando tus personalizaciones
3. Prueba exhaustivamente después de resolver conflictos
4. Confirma la fusión

### Mejores Prácticas

- **Mantén las personalizaciones separadas**: Evita modificar archivos de arquitectura core a menos que sea necesario
- **Documenta tus cambios**: Actualiza los ADRs si haces cambios arquitectónicos significativos
- **Prueba después de actualizaciones**: Siempre prueba tu aplicación después de fusionar cambios del upstream
- **Revisa los cambios**: Revisa los cambios del upstream antes de fusionar para entender qué hay de nuevo

## Próximos Pasos

1. **Revisar Arquitectura**: Lee la [Documentación de Arquitectura](./README.md) para entender la estructura del proyecto
2. **Leer ADRs**: Revisa los [Registros de Decisiones Arquitectónicas](./adr/README.md) para entender las decisiones de diseño
3. **Configurar CI/CD**: Configura tu pipeline de CI/CD
4. **Configurar Entornos**: Configura entornos de desarrollo, staging y producción
5. **Agregar Funcionalidades**: Comienza a construir las funcionalidades de tu aplicación siguiendo los patrones establecidos

## Solución de Problemas

### Problemas Comunes

#### Conflictos de Fusión

Si encuentras conflictos de fusión:

```bash
# Ver archivos en conflicto
git status

# Resolver conflictos manualmente
# Luego agregar archivos resueltos
git add <archivo-resuelto>

# Completar la fusión
git commit
```

#### Dependencias Faltantes

Si faltan dependencias después de la fusión:

```bash
npm install
```

#### Errores de Compilación

Si encuentras errores de compilación:

1. Limpiar node_modules y reinstalar:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Limpiar caché de Angular:
   ```bash
   rm -rf .angular
   ```

3. Recompilar:
   ```bash
   npm run build
   ```

## Referencias

- [Documentación de Arquitectura](./README.md)
- [Registros de Decisiones Arquitectónicas (ADRs)](./adr/README.md)
- [Documentación de Angular](https://angular.dev)
- [README del Proyecto](../README.md)

