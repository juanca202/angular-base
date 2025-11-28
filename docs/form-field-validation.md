# Form Field Validation Rules - Cursor

## Objective
Provide standardized rules for handling reactive form validations and error messages in Angular forms using `mat-form-field`.

## Structure of a Form Field
```html
<mat-form-field>
  <mat-label i18n>Username or email</mat-label>
  <input
    type="text"
    matInput
    formControlName="username"
  />
  @if (form.get('username')?.invalid) {
    <mat-error>{{ form.get('username') | errorMessage }}</mat-error>
  }
</mat-form-field>
```

- Use the errorMessage pipe to display the error messages.
- Prefer native Angular validators or common validators in shared/utils.
- Feature-specific validators can be created in feature/validators.
- Validator files are identified by the suffix -validator.ts (e.g., phone-validator.ts).

## Rule Guidelines

### 1. Validator Resolution Order

- Angular built-in validators
    - Validators.required
    - Validators.minLength
    - Validators.maxLength
    - Validators.pattern

- Shared validator
    - Located in shared/validators
    - Reusable across multiple features

- Feature-specific validators
    - Located in feature/validators
    - Only for domain-specific validation

- Custom validator creation
    - If none of the above satisfy requirements, create a new validator
    - Place in feature/validators if specific
    - Place in shared/validators if global

### 2. Error Handling

- Always use the errorMessage pipe for display.
- Avoid inline error messages directly in the component template.
- Ensure all form controls have a formControlName.
- Display mat-error only if the control is invalid.

### 3. Form Field Implementation Example

```ts
this.form = this.fb.group({
  username: ['', [Validators.required, Validators.email, usernameValidator]],
  phone: ['', [phoneValidator]],
});
```

```html
<mat-form-field>
  <mat-label i18n>Phone</mat-label>
  <input matInput formControlName="phone" />
  @if (form.get('phone')?.invalid) {
    <mat-error>{{ form.get('phone') | errorMessage }}</mat-error>
  }
</mat-form-field>
```

### 4. Custom Validator Example

```ts
// shared/validators/username-validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function usernameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return /^[a-zA-Z0-9_-]{3,15}$/.test(value) ? null : { invalidUsername: true };
}
```

### 5. Best Practices

- Reuse validators whenever possible.
- Keep validators stateless and pure functions.
- Keep error messages centralized in the pipe.
- Validate at the feature level only when logic is domain-specific.