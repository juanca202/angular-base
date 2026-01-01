# ADR-007: Estrategia de Testing

**Estado:** Aceptado  
**Fecha:** 2025  
**Decisores:** Equipo de Arquitectura

---

## Contexto

A medida que la aplicación crece, mantener la calidad del código y prevenir regresiones se vuelve crítico. Sin una estrategia de testing bien definida:

* Los tests pueden ser inconsistentes en estructura y calidad
* Bugs críticos pueden pasar desapercibidos
* La refactorización se vuelve riesgosa sin cobertura de tests
* El onboarding de nuevos desarrolladores es más lento sin ejemplos de tests
* Los problemas de integración se descubren tarde en el desarrollo
* No hay guías claras sobre qué testear y cómo

Adicionalmente, el proyecto hace uso intensivo de **Angular Signals** y **herramientas asistidas por IA** (Cursor, Copilot, etc.), que pueden interpretar incorrectamente los signals como funciones regulares si no existe un contrato de testing claro.

Este ADR aplica a **Angular 21+**, que incluye **Vitest integrado por defecto** a través de Angular CLI, como se describe en la guía oficial de testing de Angular.

Necesitamos una estrategia de testing exhaustiva que:

* Asegure confiabilidad y mantenibilidad del código
* Proporcione confianza al refactorizar
* Sirva como documentación del comportamiento del código
* Detecte bugs temprano en el ciclo de desarrollo
* Mantenga calidad de tests consistente en todo el equipo
* Evite ambigüedad al testear estado reactivo (Signals)

---

## Decisión

Usaremos un **enfoque de testing multi-capa** con:

1. **Unit Testing:** Vitest (integrado con Angular CLI en Angular 21+)
2. **Integration Testing:** Testing de interacciones componente-servicio
3. **E2E Testing:** Playwright para flujos de trabajo de usuario end-to-end
4. **Patrón AAA:** Estructura Arrange, Act, Assert para todos los tests
5. **Cobertura de Tests:** Objetivo de ≥80% de cobertura de ramas, enfocándose en rutas críticas
6. **Aislamiento de Tests:** Los tests deben ser independientes y determinísticos
7. **Inferencia de Tipos Primero:** La inferencia de TypeScript es preferida por defecto
8. **Contrato de Testing de Signals:** Los Angular Signals deben tratarse como contenedores de estado, no como funciones

---

## Principios Fundamentales

### Inferencia de Tipos Primero

El proyecto favorece la **inferencia de tipos de TypeScript** sobre el tipado explícito para mantener el código conciso y legible.

Los tipos explícitos DEBEN introducirse solo cuando:

* La inferencia de tipos es ambigua
* Las herramientas (tests, IDEs, asistentes de IA) malinterpretan la intención
* Las APIs públicas o límites arquitectónicos requieren claridad

La inferencia es el predeterminado. El tipado explícito es una herramienta para eliminar ambigüedad, no un requisito.

---

## Implementación

### Stack de Testing

* **Vitest:** Framework de testing unitario e integración (integrado con Angular 21+)
* **Utilidades de Testing de Angular:** TestBed, ComponentFixture
* **Playwright:** Framework de testing end-to-end

Los tests se ejecutan usando Angular CLI:

```bash
ng test
```

La configuración de tests (cobertura, modo navegador, modo watch) se gestiona por Angular CLI según la guía oficial de testing de Angular.

---

## Unit Testing con Vitest

### Patrón AAA (Arrange, Act, Assert)

Todos los tests deben seguir el patrón AAA:

```ts
it('should calculate total price correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];
  component.items = items;

  // Act
  const total = component.calculateTotal();

  // Assert
  expect(total).toBe(35);
});
```

---

## Contrato de Testing de Signals

Los Signals representan **estado**, no comportamiento.

### Reglas

#### DEBE

* Los Signals DEBEN leerse usando `signal()`
* Los Signals DEBEN actualizarse usando `set()` o `update()`
* Los tests DEBEN verificar valores de signals, no instancias de signals
* Los Signals DEBEN depender de la inferencia de tipos por defecto

#### NO DEBE

* NO DEBE hacer spy en signals
* NO DEBE hacer mock de signals
* NO DEBE reasignar signals
* NO DEBE tratar signals como funciones regulares

---

### Signals e Inferencia de Tipos

Los Signals DEBERÍAN depender de la inferencia:

```ts
customers = signal<Customer[]>([]);
```

Los tipos genéricos explícitos DEBEN proporcionarse cuando:

* Los Signals se usan en tests unitarios
* Los Signals cruzan límites arquitectónicos
* Los Signals son accedidos por herramientas asistidas por IA

Esto asegura que los signals sean claramente distinguibles de funciones sin introducir tipado explícito `Signal<T>`.

---

## Testing de Signals

```ts
describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    service = new CustomerService();
  });

  it('should initialize with empty customers', () => {
    expect(service.customers()).toEqual([]);
  });

  it('should update customers signal', () => {
    const newCustomers = [{ id: '1', name: 'John' }];
    service.setCustomers(newCustomers);

    expect(service.customers()).toEqual(newCustomers);
  });

  it('should compute total count', () => {
    service.setCustomers([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ]);

    expect(service.totalCount()).toBe(2);
  });
});
```

---

## Testear APIs Públicas, No Detalles de Implementación

Los Signals se consideran **estado**, no implementación.

```ts
// ✅ Correcto
expect(component.customers()).toEqual(mockCustomers);

// ❌ Incorrecto
vi.spyOn(component, 'customers');
```

---

## Test Doubles

Solo el **comportamiento** puede ser mockeado o espiado.

```ts
const mockRepository = {
  findBy: vi.fn().mockReturnValue({
    load: vi.fn(),
    value: signal<Customer[]>([]),
    loading: signal(false),
    error: signal(null),
    destroy: vi.fn()
  })
};
```

Los Signals siempre deben ser signals reales.

---

## Guías de Testing Asistido por IA

Cuando uses herramientas de IA (Cursor, Copilot, ChatGPT):

* Prefiere la inferencia, pero agrega genéricos explícitos a signals cuando sea necesario
* Nunca aceptes tests generados que hagan spy o mock de signals
* Revisa tests generados por mal uso de signals
* Los Signals siempre deben leerse con `()` y actualizarse con `.set()`

---

## Objetivos de Cobertura de Tests

* **Cobertura de Ramas:** ≥80% para rutas críticas
* **Cobertura de Funciones:** ≥80% general
* **Cobertura de Líneas:** ≥80% general
* **Áreas de Enfoque:** Lógica de negocio, manejo de errores, casos extremos

---

## E2E Testing con Playwright

```ts
test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/signin');
  await page.fill('[formControlName="email"]', 'user@example.com');
  await page.fill('[formControlName="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

---

## Consecuencias

### Positivas

* Estructura de tests consistente y confiable
* Refactorización segura con confianza
* Semántica de testing clara para Signals
* Reducción de errores de herramientas asistidas por IA
* Los tests actúan como documentación ejecutable

### Negativas

* Se requiere un poco más de disciplina en los tests
* Curva de aprendizaje alrededor de la semántica de Signals

### Mitigación

* Proporcionar ejemplos y plantillas
* Hacer cumplir reglas mediante revisiones de PR
* Tratar Signals como estado, no como comportamiento

---

## Ejecutar Tests

```bash
ng test

ng test --watch

ng test --coverage

ng test:e2e
```

---

## Referencias

* [Guía de Testing de Angular](https://angular.dev/guide/testing)
* [Documentación de Vitest](https://vitest.dev/)
* [Documentación de Playwright](https://playwright.dev/)
