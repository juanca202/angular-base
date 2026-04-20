# ADR-006: Patrón Repository para Servicios REST

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 25/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

A medida que la aplicación crece, gestionar la comunicación con la API se vuelve complejo:

- Múltiples servicios haciendo peticiones HTTP con diferentes patrones
- Manejo de errores inconsistente entre componentes
- Gestión duplicada del estado de carga
- Falta de gestión centralizada de endpoints de API
- Difícil de testear y mockear llamadas a API
- No hay forma estandarizada de manejar mutaciones vs. consultas

Sin un patrón consistente, los desarrolladores podrían:

- Crear llamadas HTTP ad-hoc en componentes
- Duplicar lógica de manejo de errores
- Gestionar estados de carga manualmente en cada componente
- Hacer difícil testear y mantener interacciones con la API

## Decisión

Usaremos el **Patrón Repository** con funciones helper `getMutations()`, `getResource()` y `getResourceCollection()` para estandarizar toda la comunicación REST API. Este patrón proporciona:

1. **Lógica de API centralizada** en clases repository
2. **Gestión automática de estado** con signals (loading, error, value)
3. **Manejo de errores consistente** con notificaciones automáticas al usuario
4. **Llamadas a API type-safe** con genéricos de TypeScript
5. **Testing fácil** a través de inyección de dependencias
6. **Separación de concerns** entre acceso a datos y lógica de negocio

## Definición Arquitectónica

### Estructura del patrón

- **Un repository por entidad**: Cada entidad tiene su propia clase `{Entity}Repository`.
- **Mutations (operaciones de escritura)**: Usar `getMutations()` para POST, PUT, PATCH y DELETE.
- **Resources (operaciones de lectura)**:
  - `getResource()`: recurso único o lista simple.
  - `getResourceCollection()`: listas con paginación, filtros o acumulación (scroll infinito).
- **Resolución de URLs**: Siempre usar `getApiUrl()` desde `environment.restEndpoint`; no incluir `/api/v1/` manualmente.
- **Recursos independientes**: No usar rutas anidadas; usar query params para filtros.

### Repositorios mock

Cuando no hay backend real disponible, se crea un repositorio mock con `MockHttpClient` y datos desde JSON en `test/mocks/repositories/`. Los datos mock deben ser raw data; nunca strings de UI hardcodeados.

### Convenciones de nombres

- **Clase**: `{Entity}Repository`
- **Método mutations**: `mutations()`
- **Recurso único**: `find()` o `findById()`
- **Lista**: `findBy()` o `findAll()`
- **Consultas filtradas**: `findBy{Filter}()` (ej: `findByStatus()`, `findByDateRange()`)

## Consecuencias

### Positivas

- **Consistencia:** Todas las llamadas a API siguen el mismo patrón
- **Mantenibilidad:** La lógica de API centralizada es más fácil de actualizar
- **Testabilidad:** Los repositories pueden mockearse fácilmente en tests
- **Seguridad de Tipos:** Soporte completo de TypeScript previene errores en tiempo de ejecución
- **Experiencia del Desarrollador:** Menos código boilerplate, gestión automática de estado
- **Manejo de Errores:** Manejo de errores consistente en toda la aplicación
- **Rendimiento:** Limpieza automática previene memory leaks
- **Desarrollo Sin Backend:** Los repositorios mock permiten desarrollar componentes completos sin depender de APIs externas
- **Migración Fácil:** La transición de mock a API real es sencilla, solo requiere cambiar el cliente HTTP inyectado

### Negativas

- **Curva de Aprendizaje:** Los miembros del equipo necesitan aprender el patrón
- **Abstracción:** Capa adicional de abstracción (aunque beneficiosa)
- **Configuración Inicial:** Requiere crear clases repository para cada entidad

### Mitigación

- Documentación exhaustiva en este ADR
- **Skill operativo** `abp-repository` con instrucciones para implementación
- Proceso de revisión de código para asegurar cumplimiento del patrón

## Referencias

- **Skill operativo:** [abp-repository](../../.ai/skills/abp-repository/SKILL.md) — instrucciones para crear, modificar y usar repositories
- [Angular HttpClient](https://angular.dev/api/common/http/HttpClient)
- [Documentación de Signals](https://angular.dev/guide/signals)
