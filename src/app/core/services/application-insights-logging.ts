import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationInsightsLogging {
  private readonly appInsights: ApplicationInsights;
  constructor() {
    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: environment.appInsights?.instrumentationKey,
        enableAutoRouteTracking: true // option to log all route changes
      }
    });
    this.appInsights.loadAppInsights();
  }

  public logPageView(name?: string, url?: string) {
    // option to call manually
    this.appInsights.trackPageView({
      name: name,
      uri: url
    });
  }

  public logEvent(name: string, properties?: { [key: string]: any }) {
    this.appInsights.trackEvent({ name: name }, properties);
  }

  public logMetric(name: string, average: number, properties?: { [key: string]: any }) {
    this.appInsights.trackMetric({ name: name, average: average }, properties);
  }

  public logException(exception: Error, severityLevel?: number) {
    this.appInsights.trackException({ exception: exception, severityLevel: severityLevel });
  }

  public logTrace(message: string, properties?: { [key: string]: any }) {
    this.appInsights.trackTrace({ message: message }, properties);
  }
}
