---
name: abp-testing-signals
description: Guía operativa para escribir tests unitarios/integración con Angular Signals y Vitest en este repositorio. Usar cuando la tarea involucre tests de servicios, componentes o estado reactivo.
---

# Testing de Signals con Vitest

## Cuándo usar

Úsalo cuando escribas o corrijas tests que involucren `signal`, `computed` o estado reactivo en Angular.

## Reglas operativas

1. **AAA siempre**: Arrange, Act, Assert.
2. **Signals son estado**:
   - leer con `signal()`
   - actualizar con `.set()` / `.update()`
3. **No hacer spy/mock/reasignación de signals**.
4. **Testear APIs públicas** y comportamiento observable.
5. **Tipado**: preferir inferencia; añadir genéricos explícitos cuando exista ambigüedad.

## Comandos sugeridos

- `ng test`
- `ng test --watch`
- `ng test --coverage`

## Referencias

- `docs/adr/ADR-014-testing-strategy.md`
