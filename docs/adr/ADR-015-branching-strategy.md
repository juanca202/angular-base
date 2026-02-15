# ADR-015: Modelo de flujo de ramas basado en Features → Staging → Producción

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 23/01/2026  
**Decisores:** Equipo de Arquitectura  
**Autor:** Juan Carlos Altamirano

## Contexto

El equipo necesita un flujo de trabajo de Git simple, moderno y controlado que permita:

- Desarrollar funcionalidades sin presionar tiempos de entrega
- Probar cambios de forma centralizada antes de producción
- Mantener la rama principal siempre estable y desplegable

El equipo trabaja con features que pueden tardar en madurar y requiere un entorno de pruebas previo a producción.

## Decisión

Se adopta un modelo de ramas inspirado en **Trunk-Based Development extendido con Staging**, con la siguiente estructura:

### Estructura de ramas

#### `feature/*`

**Propósito:** Ramas de desarrollo de funcionalidades

**Características:**

- Se crean desde: `staging`
- Permanecen activas hasta que la funcionalidad esté completa y estable
- Convención de nombre: `feature/<nombre-feature>`
- Ejemplo: `feature/user-authentication`, `feature/dashboard-improvements`
- Se integran a `staging` mediante Pull Request cuando están completas

**Workflow:**

1. Crear rama desde `staging`: `git checkout -b feature/nombre-feature staging`
2. Desarrollo y validación local de la funcionalidad
3. Cuando la feature esté estable, abrir Pull Request hacia `staging`
4. Revisión de código y aprobación
5. Merge a `staging`
6. Eliminar la rama `feature/*` después del merge

#### `staging`

**Propósito:** Rama de integración y pruebas

**Características:**

- Rama de integración donde se prueban las features completas
- Recibe features completas mediante Pull Request
- Se utiliza para QA, validaciones funcionales y pruebas manuales o automáticas
- Está protegida (no se permite push directo)
- Todos los cambios deben pasar por Pull Request

**Reglas:**

- Solo se permite merge mediante Pull Request desde `feature/*`
- Se requiere revisión de código antes de aprobar
- CI/CD debe pasar exitosamente antes de permitir el merge
- Se mantiene saludable para facilitar el merge hacia `main`

#### `main` (Producción)

**Propósito:** Rama estable y desplegable

**Características:**

- Contiene código en producción
- Solo recibe cambios desde `staging` una vez aprobados
- Siempre debe estar en estado desplegable
- Está protegida (no se permite push directo)
- Se despliega a producción desde esta rama
- Los releases se etiquetan con `git tag` siguiendo versionado semántico

**Reglas:**

- Solo se permite merge mediante Pull Request desde `staging`
- Se requiere aprobación antes de mergear
- Todos los tests deben pasar antes del merge
- El código debe compilar sin errores
- No se permite código roto o que rompa la aplicación

## Flujo de trabajo

### 1. Desarrollo de nueva funcionalidad

1. Actualizar `staging` localmente: `git checkout staging && git pull origin staging`
2. Crear rama `feature/nombre-feature` desde `staging`: `git checkout -b feature/nombre-feature staging`
3. Desarrollar y validar localmente la funcionalidad
4. Hacer commits pequeños y frecuentes
5. Actualizar desde `staging` frecuentemente: `git pull origin staging` (o rebase)
6. Cuando la feature esté estable, abrir Pull Request hacia `staging`
7. Revisión de código y aprobación
8. Merge a `staging`
9. Eliminar rama `feature/*` después del merge

### 2. Proceso de QA y pruebas

1. Ejecutar pruebas de calidad en `staging` (QA, testing, validaciones)
2. Validaciones funcionales y pruebas manuales o automáticas
3. Corregir cualquier issue encontrado en `staging` si es necesario
4. Una vez que `staging` esté estable y aprobado, proceder al merge hacia `main`

### 3. Deploy a producción

1. Crear Pull Request desde `staging` hacia `main`
2. Revisión final y aprobación
3. Merge a `main`
4. Desplegar a producción desde `main`
5. Si se requiere un release versionado, etiquetar después del deploy: `git tag -a v1.4.0 -m "Release version 1.4.0"`

### 4. Bug crítico en producción

1. Crear `feature/*` desde `staging`: `git checkout -b feature/fix-critical-bug staging`
2. Corregir el error
3. Crear Pull Request hacia `staging` (proceso de revisión acelerado si es crítico)
4. Merge a `staging` y validación rápida
5. Crear Pull Request desde `staging` hacia `main`
6. Merge a `main` y deploy inmediato
7. Etiquetar versión de patch: `git tag -a v1.4.1 -m "Hotfix: critical bug"`
8. Eliminar rama `feature/*`

## Reglas y convenciones

### Protección de ramas

- Las ramas `main` y `staging` deben estar protegidas en el repositorio
- No se permite push directo a `main` o `staging`
- Todos los cambios deben pasar por Pull Request
- Se requiere al menos una aprobación para mergear en `main` o `staging`
- CI/CD debe pasar exitosamente antes de permitir el merge

### Pull Requests

- Todos los merges deben realizarse mediante Pull Request
- Los Pull Requests desde `feature/*` van hacia `staging`
- Los Pull Requests desde `staging` van hacia `main`
- Los Pull Requests deben incluir descripción clara del cambio
- Los Pull Requests deben estar vinculados a issues cuando corresponda
- Se requiere revisión de código antes de aprobar

### Duración de ramas

- **Ramas de feature:** Pueden permanecer activas hasta que la funcionalidad esté completa y estable
- Actualizar desde `staging` frecuentemente para evitar divergencia
- Mantener `staging` saludable facilita el desarrollo y la integración

### Integración y pruebas

- `staging` se utiliza para QA, validaciones funcionales y pruebas
- Mantener `staging` estable facilita el proceso de merge hacia `main`
- Requiere disciplina para mantener `staging` saludable

### Versionado

- Los releases se etiquetan con `git tag` siguiendo versionado semántico (SemVer)
- Formato de tags: `v<major>.<minor>.<patch>` (ej: `v1.4.0`, `v2.0.1`)
- Los tags se crean en `main` después de desplegar

### Mensajes de commit

- Los mensajes de commit deben seguir la convención definida en el proyecto (ver ADR-008)
- Usar prefijos claros: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Los mensajes deben ser descriptivos y en español o inglés según la convención del proyecto

### Convención de nombres de ramas

- **Features:** `feature/<nombre-feature>` (ej: `feature/user-dashboard`, `feature/authentication`)

## Consecuencias

### Positivas

- **Flujo simple y fácil de entender:** Estructura clara de Features → Staging → Producción
- **`main` siempre permanece estable:** Solo recibe código aprobado desde `staging`
- **Permite desarrollo prolongado de features:** Las features pueden tardar en madurar sin afectar QA o producción
- **Facilita control de calidad:** Entorno explícito de pruebas antes del despliegue a producción
- **Separación clara de responsabilidades:** Cada rama tiene un propósito bien definido
- **Proceso de QA centralizado:** Todas las features se prueban en `staging` antes de producción

### Negativas

- **Features de larga duración pueden generar conflictos:** Al integrarse después de mucho tiempo, pueden surgir conflictos de merge
- **Requiere disciplina:** Necesita mantener `staging` saludable para facilitar el flujo
- **Dos niveles de integración:** Requiere gestionar dos ramas principales (`staging` y `main`)
- **Posible acumulación en staging:** Si no se gestiona bien, `staging` puede acumular muchas features pendientes

### Mitigación

- **Documentación clara:** Este ADR y guías de uso del flujo
- **Actualización frecuente:** Actualizar las ramas `feature/*` desde `staging` frecuentemente
- **Mantenimiento de staging:** Revisar y limpiar `staging` regularmente
- **Capacitación:** Sesiones de onboarding para nuevos miembros sobre el flujo
- **Revisión de código:** Asegurar que las features están completas antes de mergear a `staging`
- **Proceso de QA definido:** Establecer un proceso claro de QA en `staging` antes de mergear a `main`

## Alternativas consideradas

### 1. Git Flow clásico

**Descripción:** Modelo de trabajo basado en ramas con `main`, `develop`, `feature/*`, `release/*` y `hotfix/*`

**Rechazado por:**

- Más pesado y lento para el tamaño del equipo
- Mayor complejidad con múltiples tipos de ramas
- Proceso de release más burocrático
- Requiere gestión constante de múltiples ramas

### 2. Trunk-Based Development puro

**Descripción:** Desarrollo directo en una rama principal (`main`) con integración frecuente y feature flags

**Rechazado por:**

- Necesidad de un entorno explícito de QA antes de producción
- El equipo requiere un espacio de pruebas centralizado
- Las features pueden tardar en madurar y necesitan un entorno de pruebas dedicado
- Falta de separación clara entre desarrollo y producción

## Notas

Este modelo es adecuado para equipos pequeños o medianos y proyectos con despliegues controlados. Proporciona un equilibrio entre simplicidad y control, permitiendo desarrollo prolongado de features mientras mantiene la estabilidad de producción.

## Referencias

- [ADR-008: Calidad de Código y Herramientas](./ADR-008-code-quality-tooling.md) - Convenciones de commits
- [Semantic Versioning](https://semver.org/)
