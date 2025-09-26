import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  ErrorHandler,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import * as Sentry from '@sentry/angular';
import { languageInterceptor } from 'app/core/language.interceptor';
import { graphqlProvider } from 'app/core/graphql-provider';
import { UI_OPTIONS } from '@factor_ec/ui';

import { routes } from 'app/app.routes';
import { AppManager } from 'app/core/app-manager';
import { authInterceptor } from 'app/core/auth.interceptor';
import { environment } from 'environments/environment';
import { clientInterceptor } from 'app/core/client.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(async () => {
      const appManager = inject(AppManager);
      await appManager.init();
    }),
    provideServiceWorker('sw-custom.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, clientInterceptor, languageInterceptor]),
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    provideClientHydration(),
    graphqlProvider,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        logErrors: true,
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: UI_OPTIONS,
      useValue: {
        iconSettings: {
          path: 'images',
          collection: 'factoricons-regular',
        },
      },
    },
    {
      provide: 'FactorUiConfiguration',
      useValue: {
        icon: {
          collection: 'factoricons-regular',
          mode: null,
        },
      },
    },
    {
      provide: LOCALE_ID,
      useFactory: (appManager: AppManager) => appManager.getLocale(),
      deps: [AppManager],
    },
  ],
};
