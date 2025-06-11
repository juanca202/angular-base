import * as Sentry from "@sentry/angular";
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

Sentry.init({
    dsn: "https://0beb4472682733de2ff60602d424ecd7@o498284.ingest.us.sentry.io/4509482237231104",
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1
})

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));