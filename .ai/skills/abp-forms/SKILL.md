---
name: abp-forms
description: Construye formularios basados en signals en Angular v21+ usando la nueva Signal Forms API. Úsalo para creación de formularios con enlace bidireccional automático, validación basada en esquema, gestión del estado de campos y formularios dinámicos. Se activa en implementación de formularios, añadir validación, crear formularios multi-paso o construir formularios con campos condicionales. Signal Forms es experimental pero recomendado para nuevos proyectos Angular.
---

# Angular Signal Forms

Construye formularios reactivos y con tipado seguro usando la Signal Forms API de Angular. Signal Forms proporciona enlace bidireccional automático, validación basada en esquema y estado reactivo de campos.

**Nota:** Signal Forms es experimental en Angular v21. Para aplicaciones en producción que requieran estabilidad, consulta [references/form-patterns.md](references/form-patterns.md) para patrones con Reactive Forms.

## Configuración básica

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
  `,
})
export class Login {
  // Modelo del formulario - un signal escribible
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });
  
  // Crear formulario con esquema de validación
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduce una dirección de email válida' });
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
  });
  
  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      const credentials = this.loginModel();
      console.log('Enviando:', credentials);
    }
  }
}
```

## Modelos de formulario

Los modelos de formulario son signals escribibles que sirven como única fuente de verdad:

```typescript
// Definir interfaz para tipado seguro
interface UserProfile {
  name: string;
  email: string;
  age: number | null;
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

// Crear signal del modelo con valores iniciales
const userModel = signal<UserProfile>({
  name: '',
  email: '',
  age: null,
  preferences: {
    newsletter: false,
    theme: 'light',
  },
});

// Crear formulario desde el modelo
const userForm = form(userModel);

// Acceder a campos anidados mediante notación de punto
userForm.name                    // FieldTree<string>
userForm.preferences.theme       // FieldTree<'light' | 'dark'>
```

### Lectura de valores

```typescript
// Leer el modelo completo
const data = this.userModel();

// Leer valor del campo mediante el estado del campo
const name = this.userForm.name().value();
const theme = this.userForm.preferences.theme().value();
```

### Actualización de valores

```typescript
// Reemplazar el modelo completo
this.userModel.set({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
  preferences: { newsletter: true, theme: 'dark' },
});

// Actualizar un solo campo
this.userForm.name().value.set('Bob');
this.userForm.age().value.update(age => (age ?? 0) + 1);
```

## Estado del campo

Cada campo proporciona signals reactivos para validación, interacción y disponibilidad:

```typescript
const emailField = this.form.email();

// Estado de validación
emailField.valid()      // true si pasa todas las validaciones
emailField.invalid()    // true si tiene errores de validación
emailField.errors()     // array de objetos de error
emailField.pending()    // true si hay validación asíncrona en curso

// Estado de interacción
emailField.touched()    // true después de focus + blur
emailField.dirty()      // true después de modificación por el usuario

// Estado de disponibilidad
emailField.disabled()   // true si el campo está deshabilitado
emailField.hidden()     // true si el campo debe estar oculto
emailField.readonly()   // true si el campo es solo lectura

// Valor
emailField.value()      // valor actual del campo (signal)
```

### Estado a nivel de formulario

El formulario en sí también es un campo con estado agregado:

```typescript
// El formulario es válido cuando todos los campos interactivos son válidos
this.form().valid()

// El formulario está touched cuando algún campo está touched
this.form().touched()

// El formulario está dirty cuando algún campo fue modificado
this.form().dirty()
```

## Validación

### Validadores incorporados

```typescript
import { 
  form, required, email, min, max, 
  minLength, maxLength, pattern 
} from '@angular/forms/signals';

const userForm = form(this.userModel, (schemaPath) => {
  // Campo obligatorio
  required(schemaPath.name, { message: 'El nombre es obligatorio' });
  
  // Formato email
  email(schemaPath.email, { message: 'Email inválido' });
  
  // Rango numérico
  min(schemaPath.age, 18, { message: 'Debe ser mayor de 18' });
  max(schemaPath.age, 120, { message: 'Edad inválida' });
  
  // Longitud de string/array
  minLength(schemaPath.password, 8, { message: 'Mínimo 8 caracteres' });
  maxLength(schemaPath.bio, 500, { message: 'Máximo 500 caracteres' });
  
  // Patrón regex
  pattern(schemaPath.phone, /^\d{3}-\d{3}-\d{4}$/, {
    message: 'Formato: 555-123-4567',
  });
});
```

### Validación condicional

```typescript
const orderForm = form(this.orderModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Código promocional obligatorio para descuentos',
    when: ({ valueOf }) => valueOf(schemaPath.applyDiscount),
  });
});
```

### Validadores personalizados

```typescript
import { validate } from '@angular/forms/signals';

const signupForm = form(this.signupModel, (schemaPath) => {
  // Lógica de validación personalizada
  validate(schemaPath.username, ({ value }) => {
    if (value().includes(' ')) {
      return { kind: 'noSpaces', message: 'El nombre de usuario no puede contener espacios' };
    }
    return null;
  });
});
```

### Validación entre campos

```typescript
const passwordForm = form(this.passwordModel, (schemaPath) => {
  required(schemaPath.password);
  required(schemaPath.confirmPassword);
  
  // Comparar campos
  validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
    if (value() !== valueOf(schemaPath.password)) {
      return { kind: 'mismatch', message: 'Las contraseñas no coinciden' };
    }
    return null;
  });
});
```

### Validación asíncrona

```typescript
import { validateHttp } from '@angular/forms/signals';

const signupForm = form(this.signupModel, (schemaPath) => {
  validateHttp(schemaPath.username, {
    request: ({ value }) => `/api/check-username?u=${value()}`,
    onSuccess: (response: { taken: boolean }) => {
      if (response.taken) {
        return { kind: 'taken', message: 'El nombre de usuario ya está en uso' };
      }
      return null;
    },
    onError: () => ({
      kind: 'networkError',
      message: 'No se pudo verificar el nombre de usuario',
    }),
  });
});
```

## Campos condicionales

### Campos ocultos

```typescript
import { hidden } from '@angular/forms/signals';

const profileForm = form(this.profileModel, (schemaPath) => {
  hidden(schemaPath.publicUrl, ({ valueOf }) => !valueOf(schemaPath.isPublic));
});
```

```html
@if (!profileForm.publicUrl().hidden()) {
  <input [formField]="profileForm.publicUrl" />
}
```

### Campos deshabilitados

```typescript
import { disabled } from '@angular/forms/signals';

const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, ({ valueOf }) => valueOf(schemaPath.total) < 50);
});
```

### Campos de solo lectura

```typescript
import { readonly } from '@angular/forms/signals';

const accountForm = form(this.accountModel, (schemaPath) => {
  readonly(schemaPath.username); // Siempre solo lectura
});
```

## Envío del formulario

```typescript
import { submit } from '@angular/forms/signals';

@Component({
  template: `
    <form (submit)="onSubmit($event)">
      <input [formField]="form.email" />
      <input [formField]="form.password" />
      <button type="submit" [disabled]="form().invalid()">Enviar</button>
    </form>
  `,
})
export class Login {
  model = signal({ email: '', password: '' });
  form = form(this.model, (schemaPath) => {
    required(schemaPath.email);
    required(schemaPath.password);
  });
  
  onSubmit(event: Event) {
    event.preventDefault();
    
    // submit() marca todos los campos como touched y ejecuta el callback si es válido
    submit(this.form, async () => {
      await this.authService.login(this.model());
    });
  }
}
```

## Arrays y campos dinámicos

```typescript
interface Order {
  items: Array<{ product: string; quantity: number }>;
}

@Component({
  template: `
    @for (item of orderForm.items; track $index; let i = $index) {
      <div>
        <input [formField]="item.product" placeholder="Producto" />
        <input [formField]="item.quantity" type="number" />
        <button type="button" (click)="removeItem(i)">Eliminar</button>
      </div>
    }
    <button type="button" (click)="addItem()">Añadir elemento</button>
  `,
})
export class Order {
  orderModel = signal<Order>({
    items: [{ product: '', quantity: 1 }],
  });
  
  orderForm = form(this.orderModel, (schemaPath) => {
    applyEach(schemaPath.items, (item) => {
      required(item.product, { message: 'Producto obligatorio' });
      min(item.quantity, 1, { message: 'Cantidad mínima es 1' });
    });
  });
  
  addItem() {
    this.orderModel.update(m => ({
      ...m,
      items: [...m.items, { product: '', quantity: 1 }],
    }));
  }
  
  removeItem(index: number) {
    this.orderModel.update(m => ({
      ...m,
      items: m.items.filter((_, i) => i !== index),
    }));
  }
}
```

## Mostrar errores

### Con Signal Forms

```html
<input [formField]="form.email" />

@if (form.email().touched() && form.email().invalid()) {
  <ul class="errors">
    @for (error of form.email().errors(); track error) {
      <li>{{ error.message }}</li>
    }
  </ul>
}

@if (form.email().pending()) {
  <span>Validando...</span>
}
```

### Con Formularios Reactivos: pipe errorMessage

Cuando uses **Formularios Reactivos** (patrón alternativo para producción estable) con `mat-form-field`, utiliza el pipe `errorMessage` para centralizar los mensajes de validación. La estrategia principal del proyecto es [Signal Forms (ADR-009)](docs/adr/ADR-009-form-strategy.md).

**Uso del pipe:**

```html
<mat-form-field>
  <mat-label i18n>Email</mat-label>
  <input matInput type="email" formControlName="email" />
  @if (form.get('email')?.invalid && form.get('email')?.touched) {
    <mat-error>{{ form.get('email') | errorMessage }}</mat-error>
  }
</mat-form-field>
```

**Importar el pipe en el componente:**

```typescript
import { ErrorMessagePipe } from '@/shared/pipes/error-message.pipe';

@Component({
  imports: [MatFormFieldModule, MatInputModule, ErrorMessagePipe],
  // ...
})
```

**Reglas de uso:**

1. **Siempre verificar `invalid` y `touched`** antes de mostrar el error (evitar mostrar errores antes de que el usuario interactúe).
2. **Un solo `<mat-error>` por campo** usando el pipe; el pipe resuelve el mensaje según el primer error activo.
3. **Nuevos validadores:** añadir la clave de error correspondiente en `ErrorMessagePipe` (p. ej. `errors['invalidOrderNumber']`).

## Estilos según el estado

```html
<input
  [formField]="form.email"
  [class.is-invalid]="form.email().touched() && form.email().invalid()"
  [class.is-valid]="form.email().touched() && form.email().valid()"
/>
```

## Restablecer formulario

```typescript
async onSubmit() {
  if (!this.form().valid()) return;
  
  await this.api.submit(this.model());
  
  // Limpiar estado de interacción
  this.form().reset();
  
  // Limpiar valores
  this.model.set({ email: '', password: '' });
}
```

Para patrones con Reactive Forms (estables en producción), consulta [references/form-patterns.md](references/form-patterns.md).
