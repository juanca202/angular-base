import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideClientHydration } from '@angular/platform-browser';

import { UI_OPTIONS } from '@factor_ec/ui';
import { GoogleTagManagerService } from '@factor_ec/utils';

import { languageInterceptor } from '@/core/interceptors/language-interceptor';
import { routes } from '@/app.routes';
import { AppManager } from '@/core/services/app-manager';
import { authInterceptor } from '@/cross/auth/auth-interceptor';
import { clientInterceptor } from '@/core/interceptors/client-interceptor';
import { AuthService } from '@/cross/auth/auth-service';
import { AuthProvider } from '@/core/models/auth.provider';
import { environment } from '@/environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(async () => {
      // Dependency injection
      const appManager = inject(AppManager);
      const googleTagManagerService = inject(GoogleTagManagerService);

      // Insert Google Tag Manager tracking code
      if (environment.googleTagManager) {
        googleTagManagerService.appendTrackingCode(environment.googleTagManager.trackingCode);
      }
      await appManager.init();
    }),
    provideServiceWorker('sw-custom.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, clientInterceptor, languageInterceptor])
    ),
    provideClientHydration(),
    {
      provide: UI_OPTIONS,
      useValue: {
        iconSettings: {
          path: 'images',
          collection: 'factoricons-regular'
        }
      }
    },
    {
      provide: LOCALE_ID,
      useFactory: (appManager: AppManager) => appManager.getLocale(),
      deps: [AppManager]
    },
    {
      provide: AuthProvider,
      useClass: AuthService
    }
  ]
};
