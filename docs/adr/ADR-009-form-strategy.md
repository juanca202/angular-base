# ADR-009: Estrategia de Formularios

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 15/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

Los formularios son un elemento central en la mayoría de aplicaciones Angular. Existen varias opciones para implementarlos:

- **Formularios template-driven:** Enfoque declarativo con `ngModel`, menos adecuado para lógica compleja
- **Formularios reactivos:** API estable y madura con `FormBuilder` y `FormGroup`
- **Angular Signal Forms:** Nueva API basada en signals (experimental en Angular v21+)

Necesitamos una decisión clara sobre qué enfoque usar para mantener consistencia en el codebase.

## Decisión

Usaremos **Angular Signal Forms** (`@angular/forms/signals`) para todos los formularios nuevos.

Esta decisión se basa en:

1. **Integración con signals:** Alineado con la dirección de Angular hacia signals como primitiva reactiva
2. **Enlace bidireccional automático:** El modelo es un signal escribible que sincroniza con los campos
3. **Validación basada en esquema:** Validadores declarativos con mensajes integrados
4. **Estado reactivo:** Campos exponen signals para `valid()`, `invalid()`, `touched()`, `errors()`, etc.
5. **Tipado seguro:** Soporte completo de TypeScript para modelos y campos

## Implementación

### Configuración básica

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <label>
        Email
        <input type="email" [formField]="loginForm.email" />
      </label>
      @if (loginForm.email().touched() && loginForm.email().invalid()) {
        <p class="error">{{ loginForm.email().errors()[0].message }}</p>
      }

      <label>
        Contraseña
        <input type="password" [formField]="loginForm.password" />
      </label>
      @if (loginForm.password().touched() && loginForm.password().invalid()) {
        <p class="error">{{ loginForm.password().errors()[0].message }}</p>
      }

      <button type="submit" [disabled]="loginForm().invalid()">Iniciar sesión</button>
    </form>
  `
})
export class Login {
  loginModel = signal<LoginData>({ email: '', password: '' });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduce una dirección de email válida' });
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      console.log('Enviando:', this.loginModel());
    }
  }
}
```

### Visualización de errores

```html
<input [formField]="form.email" />

@if (form.email().touched() && form.email().invalid()) {
<ul class="errors">
  @for (error of form.email().errors(); track error) {
  <li>{{ error.message }}</li>
  }
</ul>
}
```

### Integración con mat-form-field

Para formularios que usen Angular Material, combinar `FormField` con `mat-form-field`:

```html
<mat-form-field>
  <mat-label i18n>Email</mat-label>
  <input matInput type="email" [formField]="form.email" />
  @if (form.email().touched() && form.email().invalid()) {
  <mat-error>{{ form.email().errors()[0].message }}</mat-error>
  }
</mat-form-field>
```

## Consecuencias

### Positivas

- **Consistencia con signals:** Misma primitiva reactiva que el resto de la aplicación
- **Menos boilerplate:** No requiere `FormBuilder`, `FormGroup` ni `formControlName`
- **Validación declarativa:** Mensajes de error definidos junto al validador
- **Estado reactivo:** Integración natural con `@if`, `@for` y computed signals

### Negativas

- **Experimental:** Signal Forms está en estado experimental; la API puede evolucionar
- **Curva de aprendizaje:** El equipo debe familiarizarse con la nueva API

### Mitigación

- Documentación operativa en `.ai/skills/abp-signal-forms/SKILL.md`
- Para aplicaciones que requieran máxima estabilidad, considerar Formularios Reactivos hasta que Signal Forms sea estable

## Referencias

- [Angular Signal Forms (experimental)](https://angular.dev/guide/forms/signal-forms)
- [Skill: abp-signal-forms](../../.ai/skills/abp-signal-forms/SKILL.md)
- [ADR-010: Layout y Estructura de Formularios](./ADR-010-form-layout-structure.md)
