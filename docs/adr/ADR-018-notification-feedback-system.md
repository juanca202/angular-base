# ADR-018: Sistema de notificación y feedback (`notify`)

**Estado:** Aceptado  
**Fecha de Creación:** 17/04/2026  
**Última Actualización:** 17/04/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

La aplicación necesita mostrar mensajes de feedback (errores, confirmaciones, avisos) de forma consistente sin acoplar cada feature a la biblioteca de UI concreta que renderiza el mensaje. Los requisitos incluyen:

- Un punto de entrada único y fácil de invocar desde utilidades, servicios y flujos asíncronos compartidos
- Posibilidad de desactivar notificaciones automáticas en escenarios controlados (por ejemplo, listas que gestionan el error en pantalla)
- Testabilidad sin depender del DOM o de componentes de Material en cada prueba
- Coexistencia con la infraestructura existente (`AppManager`, `MessageService` de `@factor_ec/ui`)

Sin una decisión explícita, cada equipo podría inyectar servicios de UI directamente, duplicar patrones o mostrar feedback incoherente.

## Decisión

Se adopta un **puente basado en eventos** en la capa **Core**:

1. La función **`notify(message, options?)`** vive en `src/app/core/utils/notification.ts` y publica un evento `CustomEvent('notify')` sobre un **`EventTarget` compartido** (`notificationEvents`).
2. **`AppManager`** registra, durante `init()`, un listener que recibe el evento y delega en **`MessageService.show()`** de `@factor_ec/ui`, que es la implementación visual oficial en runtime.
3. Los helpers de recursos asíncronos (`async-resources`) usan **`notify`** para errores por defecto, con una opción **`notifyError: false`** para suprimir ese comportamiento.

### API pública de `notify`

| Parámetro / campo | Tipo                                                     | Descripción                                                                                         |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `message`         | `string`                                                 | Texto a mostrar. Debe estar **ya localizado** cuando la cadena es visible al usuario (ver ADR-014). |
| `options.level`   | `'success' \| 'error' \| 'info' \| 'warning'` (opcional) | Semántica del mensaje para estilos o iconografía, cuando la capa de presentación la soporte.        |
| `options.type`    | `'modal' \| 'notification'` (opcional)                   | Presentación en biblioteca de UI. Por defecto se comporta como **`notification`** si se omite.      |

Firma de referencia:

```typescript
import { notify } from '@/core/utils/notification';

notify($localize`Changes saved`);
notify($localize`Request failed`, { level: 'error' });
notify($localize`Please confirm`, { type: 'modal' });
notify($localize`Session expiring soon`, { level: 'warning', type: 'notification' });
```

### Comportamiento en runtime

- **Registro del listener:** Solo después de que `AppManager.init()` haya añadido el listener los eventos se traducen en UI visible. Llamar `notify` antes de esa inicialización puede emitir un evento que nadie procesa todavía.
- **Puente actual (`AppManager`):** El listener reenvía a `messageService.show(message, { type: options?.type ?? 'notification' })`. Si la biblioteca expone parámetros adicionales alineados con `level`, el puente debe ampliarse para reenviarlos y mantener coherencia con la tabla de opciones anteriores.

### Uso junto a `async-resources`

Las operaciones `load`, cargas de colección y `mutate` aceptan opciones con **`notifyError`** (por defecto `true`). Si la operación falla y `notifyError` es `true`, se llama internamente a `notify` con `{ level: 'error' }`.

```typescript
// Error mostrado al usuario vía notify (comportamiento por defecto)
await resource.load(params);

// El error se propaga; la UI del feature decide cómo informar (sin notify automático)
await resource.load(params, { notifyError: false });
```

**Cuándo usar `notifyError: false`:** pantallas que ya muestran estado de error inline, reintentos silenciosos, o flujos donde el `Manager` centraliza el mensaje.

### Cuándo usar `notify` directamente

- Feedback tras una acción que no pasa por `async-resources`
- Errores o avisos en utilidades de Core que no deben conocer `MessageService`
- Cualquier capa que deba permanecer libre de dependencias de UI concreta

### Cuándo **no** usar `notify` (alternativas)

- **Mensajes que solo pertenecen a un componente:** preferir estado local y plantilla (`@if`, mensajes de campo en formularios — ADR-009 / ADR-010).
- **Diálogos de confirmación o maestro–detalle complejos:** seguir ADR-013 y los patrones de `Manager` (ADR-007), no sustituir flujos estructurados por un simple `notify` modal.

### Pruebas

- Los tests pueden suscribirse a **`notificationEvents`** con `addEventListener('notify', ...)` para aserciones sin levantar la UI completa (ver `async-resources.spec.ts`).
- Simular o espiar `notify` mantiene las pruebas enfocadas en el comportamiento del caller.

## Consecuencias

**Positivas**

- Desacoplamiento entre lógica de aplicación y biblioteca de UI
- API mínima y estable (`message` + opciones)
- Supresión explícita de errores globales donde el feature asume el feedback

**Negativas / riesgos**

- Dependencia del orden de bootstrap (`AppManager.init`)
- Eventos globales: abuso de `notify` puede generar spam de mensajes; convención de equipo y revisión de UX siguen siendo necesarias
- El `EventTarget` compartido debe considerarse en entornos donde se ejecuten múltiples instancias de la app en la misma página (no es el caso habitual de esta SPA)

## Referencias

- `src/app/core/utils/notification.ts` — implementación de `notify` y `notificationEvents`
- `src/app/core/services/app-manager.ts` — registro del listener y delegación a `MessageService`
- `src/app/core/utils/async-resources.ts` — integración con `notifyError`
- [ADR-001: Separación de responsabilidades](./ADR-001-separation-of-responsibilities.md) — ubicación en Core
- [ADR-007: Patrón Manager](./ADR-007-manager-pattern.md) — coordinación de flujos vs feedback puntual
- [ADR-014: Internacionalización](./ADR-014-internationalization-strategy.md) — cadenas mostradas al usuario
