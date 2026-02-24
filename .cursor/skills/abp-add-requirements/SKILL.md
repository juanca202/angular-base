---
name: abp-add-requirements
description: Agrega un repositorio Git como submodule en docs/requirements. Usar cuando el usuario quiera agregar un repositorio de requirements como submodule, añadir requirements o integrar un repo de requirements en el proyecto.
---

# ABP Add Requirements

Agrega un repositorio Git como submodule en `docs/requirements`.

## Requisito previo

Si el usuario **no proporciona la URL del repositorio**, debes pedirla explícitamente antes de continuar:

> "Por favor, proporciona la URL del repositorio Git que deseas agregar como submodule (ej: https://github.com/org/repo o git@github.com:org/repo.git)"

## Flujo de trabajo

1. **Verificar que existe la URL**
   Si no hay URL → pedirla y detener hasta recibirla.

2. **Crear el directorio padre si no existe**

   ```bash
   mkdir -p docs
   ```

3. **Agregar el submodule**

   ```bash
   git submodule add <URL_DEL_REPOSITORIO> docs/requirements
   ```

4. **Inicializar y actualizar** (si el proyecto ya tenía submodules configurados)
   ```bash
   git submodule update --init --recursive
   ```

## Ejemplos

**Usuario:** "Agrega el repo de requirements como submodule"
**Agente:** Pide la URL del repositorio.

**Usuario:** "Agrega https://github.com/mi-org/requirements como submodule en docs/requirements"
**Agente:** Ejecuta `git submodule add https://github.com/mi-org/requirements docs/requirements`

**Usuario:** "abp-add-requirements con git@github.com:org/repo.git"
**Agente:** Ejecuta `git submodule add git@github.com:org/repo.git docs/requirements`

## Notas

- La ruta del submodule es fija: `docs/requirements`
- Acepta URLs HTTPS o SSH
- Si `docs/requirements` ya existe y no es un submodule, el comando fallará; informar al usuario
