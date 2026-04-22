---
name: abp-signal-forms
description: Implementa Angular Signal Forms (@angular/forms/signals) en v21+. Modelo signal + form() + FormField + esquema de validación. Actívalo para formularios nuevos, validación, campos condicionales, listas dinámicas o envío con submit(). La API es experimental; enlaza ADR-009 del repo y docs oficiales.
---

# Signal Forms (Angular)

Guía operativa para agentes: formularios con modelo en **signal**, árbol de campos **`form()`**, directiva **`[formField]`** y validadores en el **esquema**. Fuente normativa del producto: [ADR-009](../../../docs/adr/ADR-009-form-strategy.md). Fuente de API y comportamiento: [Forms with signals (Angular)](https://angular.dev/essentials/signal-forms) y [Signal Forms guides](https://angular.dev/guide/forms/signals/overview).

## Estado de la API

- **Experimental:** puede cambiar entre versiones. No usar en producción crítica sin evaluar riesgo; para formularios reactivos estables ver [Reactive forms](https://angular.dev/guide/forms/reactive-forms).
- **Proyecto:** salvo excepción documentada en ADR, los formularios nuevos usan Signal Forms (**ADR-009**).

## Flujo mínimo (memorizar)

1. `signal<Modelo>()` con estado inicial.
2. `form(modelo, (schemaPath) => { … })` — opcional segundo argumento para validación.
3. Plantilla: `imports: [FormField]` y `[formField]="miForm.campo"`.
4. Lectura: `miForm.campo().value()`, estado: `miForm.campo().valid()`, `touched()`, `errors()`.
5. Envío: `preventDefault`; opcionalmente `submit(formRef, callback)` para marcar touched y ejecutar solo si válido.

## Convenciones del repo (no omitir)

- Componentes **standalone** por defecto: **no** añadir `standalone: true` salvo que el archivo ya lo exija.
- **`ChangeDetectionStrategy.OnPush`** en componentes con formularios.
- **`input()` / `output()`** y **`inject()`** en código nuevo (ver `AGENTS.md`).
- Plantillas: control flow **`@if` / `@for`**, sin `*ngIf` / `*ngFor`.
- Errores en UI: patrón `touched() && invalid()` antes de mostrar mensajes (evita ruido antes de interacción).
- Texto visible al usuario: según `environment.defaultLocale` e **i18n** del proyecto si aplica (**ADR-014**).

## Imports frecuentes

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  applyEach,
  debounce,
  disabled,
  email,
  form,
  FormField,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  readonly,
  required,
  submit,
  validate,
  validateHttp
} from '@angular/forms/signals';
```

Ajusta imports al uso real para mantener el bundle limpio.

## Ejemplo base (alineado con angular.dev)

```typescript
@Component({
  selector: 'app-login',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html'
})
export class Login {
  loginModel = signal<LoginData>({ email: '', password: '' });

  loginForm = form(this.loginModel, (schemaPath) => {
    debounce(schemaPath.email, 500);
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.loginForm().valid()) return;
    void this.authService.login(this.loginModel());
  }
}
```

Errores por campo (lista completa de errores, no solo `[0]`):

```html
@if (loginForm.email().touched() && loginForm.email().invalid()) {
<ul class="error-list">
  @for (error of loginForm.email().errors(); track error.kind) {
  <li>{{ error.message }}</li>
  }
</ul>
}
```

## Modelo y árbol de campos

- El modelo es la única fuente de verdad: actualizar con `model.set()` / `model.update()` o por campo `form.email().value.set('x')`.
- Campos anidados: `userForm.address.zip`, mismos tipos que el modelo.
- **`field()`** devuelve estado: `valid()`, `invalid()`, `errors()`, `touched()`, `dirty()`, `pending()`, `disabled()`, `readonly()`, `hidden()`, y **`value()`** (signal del valor).

## Validación (esquema)

Segundo argumento de `form(model, schemaFn)`. Usar **`schemaPath`** para referir campos:

- Incorporados: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`.
- **`debounce(path, ms)`** antes de validadores que disparan en cada tecla (p. ej. email).
- Condicional: opción **`when`** en validadores (p. ej. `when: ({ valueOf }) => …`).
- Personalizado: **`validate(path, ({ value, valueOf }) => …)`** — devolver `null` o `{ kind, message }`.
- Async / HTTP: **`validateHttp`** cuando aplique.

## UI y controles HTML

- **`[formField]`** sincroniza también atributos como `required`, `disabled`, `readonly` cuando corresponde.
- **`<select multiple>`** no está soportado por `[formField]` en la versión actual — usar otro patrón si hace falta multi-selección.
- **Números:** `type="number"` convierte entre string y número automáticamente.
- **Fechas:** `type="date"` / `time` como strings ISO convenientes; convertir a `Date` en lógica si es necesario.
- **Radio:** mismo `[formField]` en radios que comparten el campo; el valor es el del `value` del input seleccionado.

## Condicionalidad

- **`hidden(path, predicate)`** / **`disabled`** / **`readonly`**: enlazar en plantilla con `@if (!form.x().hidden()) { … }` cuando el campo no deba mostrarse.

## Envío con `submit()`

```typescript
import { submit } from '@angular/forms/signals';

onSubmit(event: Event): void {
  event.preventDefault();
  submit(this.loginForm, async () => {
    await this.authService.login(this.loginModel());
  });
}
```

Marca interacción y ejecuta el callback solo si el formulario es válido (evita duplicar comprobaciones).

## Arrays y campos dinámicos

Actualizar el **modelo** (push/splice/filter); el árbol refleja la forma. Validar elementos con **`applyEach`**:

```typescript
import { applyEach, form, min, required } from '@angular/forms/signals';

orderForm = form(this.orderModel, (schemaPath) => {
  applyEach(schemaPath.items, (item) => {
    required(item.product);
    min(item.quantity, 1);
  });
});
```

No olvides **`import { applyEach }`** en el archivo.

## Integración Material (`mat-form-field`)

Patrón del proyecto (ver **ADR-009**):

```html
<mat-form-field>
  <mat-label i18n>Email</mat-label>
  <input matInput type="email" [formField]="form.email" />
  @if (form.email().touched() && form.email().invalid()) {
  <mat-error>
    @for (error of form.email().errors(); track error.kind) {
    <span>{{ error.message }}</span>
    }
  </mat-error>
  }
</mat-form-field>
```

Para **solo** Reactive Forms + `mat-form-field`, mensajes centralizados con el pipe `errorMessage` del repo (ver código existente y **ADR-009**).

## Reset

Tras envío exitoso: **`form().reset()`** limpia estado de interacción; restablecer valores con **`model.set(…)`** al estado inicial deseado.

## Errores comunes (agentes)

1. Olvidar **`FormField`** en `imports`.
2. Mostrar errores sin **`touched()`** (mala UX).
3. Usar **`errors()[0]`** cuando hay varios errores — preferir **`@for` de `errors()`**.
4. Snippets con **`applyEach`** sin import.
5. Tratar Signal Forms como estable en contextos que exijan API congelada.

## Referencias rápidas

| Tema             | URL                                                     |
| ---------------- | ------------------------------------------------------- |
| Esencial         | https://angular.dev/essentials/signal-forms             |
| Panorama         | https://angular.dev/guide/forms/signals/overview        |
| Modelos          | https://angular.dev/guide/forms/signals/models          |
| Validación       | https://angular.dev/guide/forms/signals/validation      |
| Controles custom | https://angular.dev/guide/forms/signals/custom-controls |
