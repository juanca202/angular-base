import * as Sentry from '@sentry/angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (environment.sentry) {
  Sentry.init({
    dsn: environment.sentry.dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        // Disable the injection of the default widget
        autoInject: false,
        enableScreenshot: false,
        showBranding: false,
        isNameRequired: true,
        isEmailRequired: true,
        useSentryUser: { name: 'fullName', email: 'email' },
        triggerLabel: $localize`Need help?`,
        formTitle: $localize`Need help?`,
        submitButtonLabel: $localize`Submit`,
        cancelButtonLabel: $localize`Cancel`,
        confirmButtonLabel: $localize`Confirm`,
        nameLabel: $localize`Name`,
        namePlaceholder: $localize`Type your name`,
        emailPlaceholder: $localize`Type your email`,
        isRequiredLabel: '*',
        messageLabel: $localize`Description`,
        messagePlaceholder: $localize`Tell us what problem you're having or how we can help you…`,
        successMessageText: $localize`Thank you for your message`
      })
    ],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
