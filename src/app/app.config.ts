import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { UI_OPTIONS } from '@factor_ec/ui';
import { AuthProvider } from '@factor_ec/utils';

import { clientInterceptor } from '@/core/interceptors/client-interceptor';
import { environment } from '@/environments/environment';
import { languageInterceptor } from '@/core/interceptors/language-interceptor';

import { AnonymousAuthProvider } from '@/core/services/anonymous-auth-provider';
import { AppManager } from '@/core/services/app-manager';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(async () => {
      // Dependency injection
      const appManager = inject(AppManager);
      await appManager.init();
    }),
    provideHttpClient(withInterceptors([clientInterceptor, languageInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // No authentication yet: swap for a real provider (e.g. AuthService) when needed
    {
      provide: AuthProvider,
      useClass: AnonymousAuthProvider
    },
    {
      provide: UI_OPTIONS,
      useValue: {
        iconSettings: environment.iconSettings
      }
    },
    {
      provide: LOCALE_ID,
      useFactory: (appManager: AppManager) => appManager.getLocale(),
      deps: [AppManager]
    }
  ],
};
