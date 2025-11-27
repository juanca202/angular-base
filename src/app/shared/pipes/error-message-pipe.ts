import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'errorMessage',
  pure: false
})
export class ErrorMessagePipe implements PipeTransform {
  getErrorMessage(field: AbstractControl | null, messages?: any): string {
    let error = '';
    const keys: string[] = Object.keys(field?.errors || {});
    if (keys && keys.length > 0) {
      if (messages?.[keys[0]]) {
        return messages?.[keys[0]];
      }
      switch (keys[0]) {
        case 'required':
          error = $localize`Field required`;
          break;
        case 'email':
          error = $localize`Type a valid email`;
          break;
        case 'min':
          error = $localize`The number must be greater than or equal to ${
            (field as any)?.errors?.min?.min
          }`;
          break;
        case 'max':
          error = $localize`The number must be less than or equal to ${
            (field as any)?.errors?.max?.max
          }`;
          break;
        case 'minlength':
          error = $localize`Type at least ${
            (field as any)?.errors?.minlength?.requiredLength
          } characters`;
          break;
        case 'maxlength':
          error = $localize`Type a maximum of ${
            (field as any)?.errors?.maxlength?.requiredLength
          } characters`;
          break;
        case 'nameTaken':
          error = $localize`This name is already in use`;
          break;
      }
    }
    return error;
  }
  transform(errors: any, fieldName?: any): string {
    return this.getErrorMessage(errors, fieldName);
  }
}
