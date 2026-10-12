---
id: ADR-009
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [architecture, core, notify, eventos, ui, async-resources]
supersedes: null
superseded_by: null
emits: [architecture/CR-007]
---

# ADR-009: Puente de notificaciones por eventos en Core (`notify`)

## Contexto

El feedback al usuario (éxitos, errores, avisos) suele acoplar prematuramente la infraestructura y las
features a la librería visual concreta (`MessageService` de `@factor_ec/ui`). Eso viola la intención de
la capa Core ([ADR-001](./ADR-001-hybrid-layered-feature-architecture.md)): Core no debe conocer la
implementación de presentación. Además, sin un canal único, los errores de operaciones asíncronas y el
feedback de acciones ad hoc se resuelven de forma inconsistente (spies locales, imports directos de UI,
diálogos improvisados).

Se necesita un puente que permita publicar mensajes desde Core (y desde capas que deban permanecer
libres de UI concreta) y que la capa de aplicación traduzca esos mensajes a la UI oficial en runtime.

## Decisión

Se adopta un **puente basado en eventos** en Core:

1. **API de publicación:** la función `notify(message, options?)` vive en
   `src/app/core/utils/notification.ts` y publica un `CustomEvent('notify')` sobre un `EventTarget`
   compartido (`notificationEvents`).
2. **Opciones del evento:** `options.level` (`'success' | 'error' | 'info' | 'warning'`) y
   `options.type` (`'modal' | 'notification'`; por defecto se trata como `notification` si se omite).
   El texto `message` debe estar ya localizado cuando es visible al usuario.
3. **Consumo en runtime:** `AppManager` (`src/app/core/services/app-manager.ts`), durante `init()`,
   registra un listener que recibe el evento y delega en `MessageService.show()` de `@factor_ec/ui`.
   Ese servicio es la excepción controlada de acoplamiento a la UI en Core. El puente reenvía `type` y
   mapea `level` a clases/iconos de mensaje cuando aplica.
4. **Integración con async-resources:** `load`, cargas de colección y `mutate` usan `notify` con
   `{ level: 'error' }` cuando fallan y `notifyError` es `true` (valor por defecto). Con
   `notifyError: false` el error se propaga sin `notify` automático.
5. **Límites de uso:** `notify` es para feedback que no debe acoplarse a UI concreta; no sustituye
   estado local de componente, mensajes de formulario inline, ni flujos de confirmación /
   maestro–detalle estructurados en Managers.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
viven en el estándar de dominio **Architecture Standards**
(`../standards/architecture.md`), no en este ADR.

## Consecuencias

### Positivas

- Core y utilidades asíncronas pueden informar al usuario sin importar `@factor_ec/ui`.
- Un único canal (`notify`) homogeneiza errores async y feedback puntual.
- El puente en `AppManager` concentra el acoplamiento a la librería visual en un solo lugar.

### Negativas / trade-offs

- Llamar `notify` antes de `AppManager.init()` puede emitir eventos sin listener (sin UI visible).
- `MessageOptions` no expone `level` nativo; el puente lo mapea a `class`/`icon`.
- Abusar de `type: 'modal'` puede improvisar diálogos que deberían ser flujos de Manager explícitos.

## Referencias

- [Architecture Standards](../standards/architecture.md)
- [ADR-001: Arquitectura híbrida por capas y por funcionalidades](./ADR-001-hybrid-layered-feature-architecture.md)
- [Índice de ADRs](./README.md)
- Implementación: `src/app/core/utils/notification.ts`, `src/app/core/services/app-manager.ts`
- Firma: `import { notify } from '@/core/utils/notification';`
