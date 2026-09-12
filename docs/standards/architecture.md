---
name: Architecture Standards
domain: architecture
status: Active
last_update: 2026-09-12
source_adrs: [ADR-001, ADR-009, ADR-010, ADR-011, ADR-012]
tags: [angular, capas, features, dependencias, modularidad, notify, eventos, ui, repository, rest, manager, mapper]
---

# Architecture Standards

Estándar de dominio que agrupa los requisitos verificables sobre la estructura interna de la
aplicación: las capas del proyecto, la dirección permitida de sus dependencias, cómo se comunican las
features entre sí, la convención de imports entre capas, el puente de notificaciones por eventos en
Core, el patrón Repository para REST, el patrón Manager para orquestación y los mappers de
transformación por entidad. Aplica a todo el código bajo `src/app/`.

## Organización en capas (Core, Shared, Features)

**ID:** layer-organization

Todo artefacto de `src/app/` **DEBE** ubicarse dentro de una de las tres capas de primer nivel (ver
ADR-001):

- **Core** (`core/`) — infraestructura global.
- **Shared** (`shared/`) — componentes/utilidades reutilizables y los contracts de comunicación entre
  features.
- **Features** (`features/{feature}/`) — lógica de negocio de cada funcionalidad.

El código de dominio usado por varias features **DEBE** clasificarse en Core (infraestructura), Shared
(reutilizable) o en la feature poseedora del flujo.

**NO DEBE** crearse una carpeta de primer nivel adicional bajo `src/app/` para código de infraestructura
o de negocio sin documentar antes un ADR que la incorpore como capa o como excepción.

### Excepciones

Los archivos de bootstrap de la aplicación (`app.ts`, `app.routes.ts`, `app.config.ts` y equivalentes)
en la raíz de `src/app/` no pertenecen a ninguna capa y quedan fuera de este requisito.

## Dirección de dependencias entre capas

**ID:** layer-dependency-direction

Las dependencias entre capas **DEBEN** respetar una única dirección, para evitar dependencias inversas
(p. ej. Core dependiendo de una feature) y dependencias directas entre features:

- Core **NO DEBE** depender de Shared ni Features.
- Shared **NO DEBE** depender de Features; **PUEDE** depender de Core.
- Una Feature **PUEDE** depender de Core y Shared; **NO DEBE** importar directamente artefactos
  de otra Feature — la comunicación entre Features **DEBE** resolverse mediante el requisito
  «Comunicación entre Features mediante Contracts».

### Excepciones

Ninguna.

## Comunicación entre Features mediante Contracts

**ID:** feature-contracts

Cuando dos features necesitan comunicarse sin crear una dependencia directa entre ellas, se usa el
patrón de **contracts**: interfaces y tipos (sin implementación) ubicados en
`shared/contracts/{dominio}/`.

- Los contracts **DEBEN** contener únicamente interfaces, tipos y modelos, sin lógica de implementación.
- Una feature que provee un contract **DEBE** registrar su implementación mediante providers de Angular.
- Una feature que consume un contract **DEBE** inyectarlo; **NO DEBE** importar la implementación
  concreta de la feature proveedora.

### Excepciones

Ninguna.

## Convención de path aliases

**ID:** path-alias-convention

Todo import relativo (`../`, `./`) cuyo módulo de destino sea alcanzable mediante alguno de los path
aliases configurados en `tsconfig.json` (`@/core`, `@/shared`, `@/features`, `@/environments`,
`@/version-info`, `@/test`) **DEBE** usar ese alias en vez de la ruta relativa, para que el origen de
cada import quede explícito en el propio código — sin excepción por pertenecer a la misma capa o al
mismo directorio.

- **NO DEBE** usarse una ruta relativa cuando exista un path alias configurado que resuelva al mismo
  destino, tanto al cruzar de capa (`@/core`, `@/shared`, `@/features`) como al importar cualquier otra
  raíz con alias declarado (`@/environments`, `@/version-info`, `@/test`) o dentro de la misma capa.

### Excepciones

Ninguna.

## Puente de notificaciones por eventos (`notify`)

**ID:** core-event-notification-bridge

El feedback al usuario que no deba acoplarse a la librería visual concreta **DEBE** publicarse con
`notify(message, options?)` en `src/app/core/utils/notification.ts`, que **DEBE** emitir un
`CustomEvent('notify')` sobre el `EventTarget` compartido `notificationEvents`.

- `message` **DEBE** ser un `string` ya localizado cuando sea visible al usuario.
- `options.level` **PUEDE** ser `'success' | 'error' | 'info' | 'warning'`.
- `options.type` **PUEDE** ser `'modal' | 'notification'`; si se omite, el puente **DEBE** tratarlo
  como `notification`.
- `AppManager.init()` **DEBE** registrar el listener que reenvía a
  `MessageService.show()` de `@factor_ec/ui` (p. ej.
  `messageService.show(message, { type: options?.type ?? 'notification' })`). Si la librería expone
  parámetros alineados con `level`, el puente **DEBE** ampliarse para reenviarlos.
- Core (y utilidades de Core distintas del puente) **NO DEBE** importar `MessageService` /
  `@factor_ec/ui` para mostrar feedback al usuario; **DEBE** usar `notify`.
- `AppManager` (en `src/app/core/services/app-manager.ts`) **DEBE** registrar en `init()` el listener
  que reenvía a `MessageService.show()` de `@factor_ec/ui`. Es la excepción controlada de
  acoplamiento a la UI en Core.
- El shell de error de Core (`core/components/error`) **PUEDE** importar componentes de
  `@factor_ec/ui` necesarios para la página de error.
- Los helpers de recursos asíncronos (`async-resources`: `load`, cargas de colección, `mutate`)
  **DEBEN** llamar a `notify` con `{ level: 'error' }` cuando la operación falle y `notifyError` sea
  `true` (valor por defecto). Con `notifyError: false` **NO DEBEN** emitir ese `notify` automático.

**Cuándo usar `notify` directamente:** feedback tras acciones que no pasan por `async-resources`;
errores o avisos en utilidades de Core; cualquier capa que deba permanecer libre de dependencias de UI
concreta.

**Cuándo no usar `notify`:** mensajes solo de un componente (preferir estado local y plantilla);
diálogos de confirmación o maestro–detalle complejos (flujos de Manager estructurados, no un
`notify` modal improvisado).

### Excepciones

- Pantallas con error inline, reintentos silenciosos o Managers que centralizan el mensaje **PUEDEN**
  pasar `{ notifyError: false }` en `async-resources`.
- Llamadas a `notify` antes de `AppManager.init()` **PUEDEN** no producir UI visible (evento sin
  listener); el arranque de la app **DEBE** registrar el listener antes del feedback de usuario
  esperado.
- `AppManager` y el shell `core/components/error` **PUEDEN** importar `@factor_ec/ui` como puntos
  designados de acoplamiento a la librería visual.

## Patrón Repository para REST API

**ID:** rest-repository-pattern

Toda comunicación REST API de la aplicación **DEBE** pasar por el patrón Repository: una clase
`{Entity}Repository` por entidad (que **PUEDE** extender `BaseRepository` en Core), usando los helpers
de `src/app/core/utils/async-resources.ts`.

- Las operaciones de escritura (POST, PUT, PATCH, DELETE) **DEBEN** exponerse vía `getMutations()`
  (típicamente un método `mutations()` del repository).
- Las lecturas de recurso único o lista simple **DEBEN** usarse con `getResource()` (métodos
  `find()` / `findById()` / `findBy()` / `findAll()` según el caso).
- Las listas con paginación, filtros o acumulación **DEBEN** usarse con `getResourceCollection()`
  (p. ej. `findBy{Filter}()`).
- Las URLs **DEBEN** resolverse solo con `getApiUrl(path)` (base `environment.apiRestBaseUrl`);
  **NO DEBE** incluirse el prefijo de versión/API (`/api/v1/` u equivalente) de forma manual en el
  caller.
- Los recursos **DEBEN** modelarse de forma independiente (sin rutas anidadas de recursos); los
  filtros **DEBEN** ir como query params.
- **NO DEBE** usarse `HttpClient` ad hoc en features/managers para REST de entidades que deban tener
  repository, salvo excepciones documentadas abajo.

### Excepciones

- Código de infraestructura puntual en Core (p. ej. carga de `settings` de sesión) **PUEDE** llamar
  HTTP con `getApiUrl` sin un `{Entity}Repository` dedicado mientras no modele una entidad de
  dominio con CRUD completo.
- Endpoints no REST o de terceros fuera del contrato de `apiRestBaseUrl` **PUEDEN** quedar fuera de
  este requisito si se documentan en un ADR.

## Patrón Manager para orquestación

**ID:** manager-orchestration-pattern

Los flujos de negocio complejos y las experiencias de usuario que requieren orquestar múltiples
servicios, repositorios o componentes **DEBEN** coordinarse mediante un **Manager** (servicio Angular
singleton). Los componentes **DEBEN** permanecer enfocados en la presentación y **DEBERÍAN**
delegar esa coordinación al Manager.

- Un Manager **DEBE** usarse para: diálogos/modales con configuración o multi-paso; secuencias que
  involucran varios servicios/repositorios; flujos con validaciones/confirmaciones; estado compartido
  de una feature; experiencias que combinan navegación, diálogos, notificaciones y datos.
- Un Manager **NO DEBE** usarse para: operación de un solo servicio; lógica de presentación pura;
  utilidades genéricas (Core/Shared); acceso directo a datos (eso es Repository — ver requisito
  «Patrón Repository para REST API»).
- **Ubicación:**
  - Feature: `src/app/features/{feature}/managers/`.
  - Transversal (auth/settings u otros flujos compartidos): en la feature/área poseedora del flujo
    (p. ej. `features/settings/managers/`), respetando ADR-001.
  - Core (infra global): `src/app/core/services/` (p. ej. `AppManager`).
- **Nomenclatura:** clase `{Entidad|Flujo}Manager`; archivo `{entidad|flujo}-manager.ts`.

### Excepciones

- Coordinaciones triviales de un solo paso y un solo colaborador **PUEDEN** vivir en el componente o
  en el servicio llamado directamente, sin crear un Manager.
- Managers históricos en Core bajo `services/` (p. ej. `AppManager`) **PUEDEN** permanecer ahí; no es
  obligatorio moverlos a una carpeta `managers/`.

## Mappers de transformación por entidad

**ID:** feature-entity-mappers

Las transformaciones entre representaciones de una entidad (Response, Record, Request, Cache u
otras) **DEBEN** centralizarse en un **mapper** por entidad: un objeto exportado de funciones
puras, ubicado en la feature correspondiente.

- **Ubicación:** `src/app/features/{feature}/utils/{entity}-mapper.ts`.
- **Nomenclatura:** archivo `{entity}-mapper.ts`; objeto exportado `{Entity}Mapper`; funciones con
  el patrón `map<Source>To<Target>` (p. ej. `mapResponseToRecord`, `mapRecordToRequest`) cuando el
  origen/destino deba quedar explícito.
- **Pureza:** las funciones del mapper **NO DEBEN** tener efectos secundarios (HTTP, almacenamiento,
  mutación de la entrada, estado global) ni depender de inyección de servicios Angular.
- **Responsabilidad:** el mapper **DEBE** limitarse a transformar y normalizar datos (tipos, nulos
  con valores por defecto, forma de objetos nuevos). **NO DEBE** incluir lógica de negocio,
  validación ni formateo orientado a UI (eso corresponde a pipes/componentes).
- Repositories (y callers que crucen fronteras de representación) **DEBERÍAN** aplicar el mapper en
  lugar de inlinear la conversión.
- Cada función de mapeo **DEBERÍA** tener pruebas unitarias.

### Excepciones

- Conversiones triviales de un solo campo en un único call site **PUEDEN** omitir un mapper dedicado
  mientras no se dupliquen ni crezcan.
- Utilidades genéricas de transformación reutilizables entre features **PUEDEN** vivir en Shared;
  no usan el sufijo Mapper de entidad de feature salvo que modelen una entidad concreta compartida
  documentada en un ADR.

## Criterios de cumplimiento

| ID     | Requisito                       | Descripción                                                                                                                                                                                                                                        | Origen                                                            | Automatizable | Enfoque    | Verificación |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------- | ---------- | ------------ |
| CR-001 | layer-organization              | Las carpetas `src/app/core/`, `src/app/shared/` y `src/app/features/` **DEBEN** existir                                                                                                                     | [ADR-001](../adr/ADR-001-hybrid-layered-feature-architecture.md) | yes           | bloqueante | yes          |
| CR-002 | layer-dependency-direction      | Todo módulo de `src/app/` **NO DEBE** importar (directa o transitivamente vía el grafo de dependencias) un módulo de una capa en dirección prohibida: Core→{Shared,Features}, Shared→Features, Feature→otra Feature | [ADR-001](../adr/ADR-001-hybrid-layered-feature-architecture.md) | yes           | bloqueante | yes          |
| CR-003 | feature-contracts               | Los archivos bajo `shared/contracts/**` **DEBEN** limitarse a `interface`, `type` y `enum` (sin `class` con implementación ni funciones con lógica)                                                                                                | [ADR-001](../adr/ADR-001-hybrid-layered-feature-architecture.md) | no            | bloqueante | no           |
| CR-004 | path-alias-convention           | Todo import relativo (`../`, `./`) **NO DEBE** resolver a un módulo alcanzable mediante un path alias configurado en `tsconfig.json` (`@/core`, `@/shared`, `@/features`, `@/environments`, `@/version-info`, `@/test`), sea o no cruce de capa    | [ADR-001](../adr/ADR-001-hybrid-layered-feature-architecture.md) | yes           | bloqueante | yes          |
| CR-007 | core-event-notification-bridge  | `async-resources` **DEBE** usar `notify({ level: 'error' })` en fallos cuando `notifyError` es `true` (default)                                                                                                                                    | [ADR-009](../adr/ADR-009-core-event-notification-bridge.md)      | no            | bloqueante | no           |
| CR-009 | rest-repository-pattern         | Las URLs REST de la API propia **DEBEN** construirse con `getApiUrl`; **NO DEBE** hardcodearse `/api/v1/` (u otro prefijo de versión) en callers                                                                                                  | [ADR-010](../adr/ADR-010-repository-pattern-rest-api.md)         | yes           | bloqueante | yes          |
| CR-010 | rest-repository-pattern         | Cada entidad con acceso REST **DEBE** exponerse mediante una clase `{Entity}Repository` con convenciones `mutations` / `find*`                                                                                                                     | [ADR-010](../adr/ADR-010-repository-pattern-rest-api.md)         | no            | bloqueante | no           |
| CR-011 | manager-orchestration-pattern   | Los flujos complejos (diálogos multi-paso, orquestación multi-servicio, UX combinada) **DEBEN** coordinarse con un Manager; **NO DEBE** usarse Manager para acceso a datos ni presentación pura                                                     | [ADR-011](../adr/ADR-011-manager-pattern-orchestration.md)       | no            | bloqueante | no           |
| CR-013 | manager-orchestration-pattern   | Las clases Manager **DEBEN** nombrarse `{Entidad\|Flujo}Manager` y el archivo `{entidad\|flujo}-manager.ts`                                                                                                                                         | [ADR-011](../adr/ADR-011-manager-pattern-orchestration.md)       | yes           | bloqueante | yes          |
| CR-014 | feature-entity-mappers          | Los mappers de entidad de feature **DEBEN** vivir en `features/{feature}/utils/{entity}-mapper.ts`                                                                                                                                                  | [ADR-012](../adr/ADR-012-feature-mappers-pure-functions.md)      | yes           | bloqueante | yes          |
| CR-015 | feature-entity-mappers          | El objeto exportado **DEBE** nombrarse `{Entity}Mapper` y alinearse con el archivo `{entity}-mapper.ts`                                                                                                                                             | [ADR-012](../adr/ADR-012-feature-mappers-pure-functions.md)      | yes           | bloqueante | yes          |
| CR-016 | feature-entity-mappers          | Los módulos mapper **NO DEBEN** usar inyección Angular (`inject`, `@Injectable`/`@Service`) ni dependencias de I/O (p. ej. `HttpClient`, APIs de almacenamiento)                                                                                    | [ADR-012](../adr/ADR-012-feature-mappers-pure-functions.md)      | yes           | bloqueante | yes          |
| CR-017 | feature-entity-mappers          | Un mapper **DEBE** limitarse a transformar/normalizar datos; **NO DEBE** incluir lógica de negocio, validación ni formateo para UI                                                                                                                 | [ADR-012](../adr/ADR-012-feature-mappers-pure-functions.md)      | no            | bloqueante | no           |

## Referencias

- [ADR-001: Arquitectura híbrida por capas y por funcionalidades](../adr/ADR-001-hybrid-layered-feature-architecture.md)
- [ADR-009: Puente de notificaciones por eventos en Core (`notify`)](../adr/ADR-009-core-event-notification-bridge.md)
- [ADR-010: Patrón Repository para comunicación REST API](../adr/ADR-010-repository-pattern-rest-api.md)
- [ADR-011: Patrón Manager para orquestación de flujos de negocio y UX](../adr/ADR-011-manager-pattern-orchestration.md)
- [ADR-012: Mappers como objetos de funciones puras por feature](../adr/ADR-012-feature-mappers-pure-functions.md)
- [scripts/arch/README.md](../../scripts/arch/README.md)
