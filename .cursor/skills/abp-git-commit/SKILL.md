---
name: ab-git-commit
description: 'Ejecutar git commit con análisis de mensajes conventional commits, staging inteligente y generación de mensajes. Usar cuando el usuario pida hacer commit de cambios, crear un git commit o mencione "/commit". Soporta: (1) Detección automática de tipo y scope desde los cambios, (2) Generación de mensajes conventional commit desde el diff, (3) Commit interactivo con opciones para sobrescribir tipo/scope/descripción, (4) Staging inteligente de archivos para agrupación lógica'
license: MIT
allowed-tools: Bash
---

# Git Commit con Conventional Commits

## Resumen

Crear commits de git estandarizados y semánticos usando la especificación Conventional Commits. Analizar el diff real para determinar el tipo, scope y mensaje apropiados.

## Formato Conventional Commit

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Tipos de Commit

| Tipo       | Propósito                         |
| ---------- | --------------------------------- |
| `feat`     | Nueva funcionalidad               |
| `fix`      | Corrección de bug                 |
| `docs`     | Solo documentación                |
| `style`    | Formato/estilo (sin lógica)       |
| `refactor` | Refactorización (sin feature/fix) |
| `perf`     | Mejora de rendimiento             |
| `test`     | Añadir/actualizar tests           |
| `build`    | Sistema de build/dependencias     |
| `ci`       | Cambios en CI/configuración       |
| `chore`    | Mantenimiento/miscelánea          |
| `revert`   | Revertir commit                   |

## Cambios Breaking

```
# Signo de exclamación después de type/scope
feat!: remove deprecated endpoint

# Footer BREAKING CHANGE
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## Flujo de Trabajo

### 1. Analizar el Diff

```bash
# Si hay archivos en staging, usar el diff staged
git diff --staged

# Si no hay nada en staging, usar el diff del árbol de trabajo
git diff

# También verificar el estado
git status --porcelain
```

### 2. Añadir Archivos al Staging (si es necesario)

Si no hay nada en staging o quieres agrupar los cambios de otra forma:

```bash
# Añadir archivos específicos
git add path/to/file1 path/to/file2

# Añadir por patrón
git add *.test.*
git add src/components/*

# Staging interactivo
git add -p
```

**Nunca hacer commit de secretos** (.env, credentials.json, claves privadas).

### 3. Generar el Mensaje del Commit

Analizar el diff para determinar:

- **Tipo**: ¿Qué tipo de cambio es este?
- **Scope**: ¿Qué área/módulo está afectado?
- **Descripción**: Resumen en una línea de lo que cambió (tiempo presente, modo imperativo, <72 caracteres)

### 4. Ejecutar el Commit

```bash
# Una sola línea
git commit -m "<type>[scope]: <description>"

# Multi-línea con body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## Buenas Prácticas

- Un cambio lógico por commit
- Tiempo presente: "add" no "added"
- Modo imperativo: "fix bug" no "fixes bug"
- Referenciar issues: `Closes #123`, `Refs #456`
- Mantener la descripción bajo 72 caracteres

## Protocolo de Seguridad Git

- NUNCA actualizar la configuración de git
- NUNCA ejecutar comandos destructivos (--force, hard reset) sin petición explícita
- NUNCA saltar hooks (--no-verify) a menos que el usuario lo pida
- NUNCA hacer force push a main/master
- Si el commit falla por hooks, corregir y crear un NUEVO commit (no amend)
