import { ErrorHandler, inject, Injectable } from '@angular/core';
import { ApplicationInsightsLogging } from './application-insights-logging';

@Injectable({
  providedIn: 'root'
})
export class AilErrorHandler implements ErrorHandler {
  private readonly ail = inject(ApplicationInsightsLogging);

  public handleError(error: any): void {
    let severity = 3; // Error por defecto

    if (error instanceof TypeError) {
      severity = 4; // Critical (bugs de código)
    } else if (error instanceof ReferenceError) {
      severity = 4;
    } else if (error instanceof SyntaxError) {
      severity = 4;
    } else if (error instanceof RangeError) {
      severity = 3;
    } else if (error instanceof Error) {
      severity = 3; // Error normal de lógica
    }
    this.ail.logException(error, severity);

    // Evitar que Angular lo silencie
    throw error;
  }
}
