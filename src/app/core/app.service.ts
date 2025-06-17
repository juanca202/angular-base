import {
  Injectable,
  Injector,
  PLATFORM_ID,
  signal,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { AbstractControl } from '@angular/forms';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Messaging } from '@angular/fire/messaging';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import {
  GoogleTagManagerService,
  StorageService,
  Currency,
  Language
} from '@factor_ec/utils';
import { skip } from 'rxjs';
import moment from 'moment';
import { getToken, isSupported } from 'firebase/messaging';

import { versionInfo } from 'version-info';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth.service';
import { Period } from 'app/core/models/period';
import { Page } from 'app/core/components/page/page';
import { Router } from '@angular/router';

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private googleTagManagerService = inject(GoogleTagManagerService);
  private injector = inject(Injector);
  private platformId = inject<object>(PLATFORM_ID);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  private swUpdate = inject(SwUpdate);
  private location = inject(Location);
  private storageService = inject(StorageService);

  allowAuthFederation = true;
  allowSignup = true;
  id = '';
  name = '';
  initialized = false;
  installPrompt: any; // BeforeInstallPromptEvent;
  installationAllowed = false;
  version = versionInfo.git.raw;
  updateStatus = signal<string | null>('done');
  defaultLocale = 'en';
  defaultCurrency: Currency = {
    code: 'USD',
    decimalDigits: 2,
    symbol: '$',
    name: 'US Dollar'
  };
  languages = signal<Language[]>([
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ]);
  pushToken: string | undefined;
  route = '/';
  viewState: any = {};

  // Storage keys
  private clientKey = `${environment.sessionPrefix}_cid`;
  private localeKey = `${environment.sessionPrefix}_loc`;

  constructor() {
    this.swUpdate.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          this.updateStatus.set('checking');
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          this.updateStatus.set('done');
          break;
        case 'VERSION_READY': {
          this.updateStatus.set('done');
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(
            `New app version ready for use: ${evt.latestVersion.hash}`
          );
          const snack = this.snackbar.open(
            $localize`Update Available`,
            $localize`Reload`
          );
          snack.onAction().subscribe(() => {
            window.location.reload();
          });
          break;
        }
        case 'VERSION_INSTALLATION_FAILED':
          this.updateStatus.set('failed');
          console.log(
            `Failed to install app version '${evt.version.hash}': ${evt.error}`
          );
          break;
      }
    });
  }

  checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      this.updateStatus.set('failed');
      return;
    }
    this.updateStatus.set('checking');
    this.swUpdate.checkForUpdate();
  }
  getClientId(): string {
    let cid = this.storageService.get(this.clientKey, 'local');
    if (!cid) {
      cid = crypto.randomUUID();
      this.storageService.set(this.clientKey, cid, 'local');
    }
    return cid;
  }
  getLocale(): string {
    return this.storageService.get(this.localeKey, 'local') || 'en';
  }
  getUuid(id: string): string | undefined {
    return id.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/
    )?.[0];
  }
  goBack(): void {
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
  async initialize(): Promise<void> {
    let timerStart = performance.now();
    // Muestra versión en consola
    console.log(`${versionInfo.npmPackage.name} ${versionInfo.git.raw}`);
    // Inserta código de seguimiento Google Tag Manager
    this.googleTagManagerService.appendTrackingCode(
      environment.googleTagManager.trackingCode
    );
    // Comprueba si hay actualizaciones
    this.checkForUpdates();
    // Carga el idioma configurado para la aplicación
    const locale = await this.setLocale();
    console.log('Current locale: ', locale);
    console.log(
      'Initialized app in:',
      (performance.now() - timerStart).toFixed(2),
      'ms'
    );
    // Si esta autenticado inicializa con los datos locales
    if (this.authService.getToken()) {
      timerStart = performance.now();
      await this.initializeData(false);
      console.log(
        'Initialized local data in:',
        (performance.now() - timerStart).toFixed(2),
        'ms'
      );
    }
    // Si se autentica es obigatorio una sincronización desde el servidor
    this.authService.loggedIn
      .pipe(skip(this.authService.getToken() ? 1 : 0))
      .subscribe(async (value) => {
        if (value) {
          timerStart = performance.now();
          await this.initializeData(true);
          // Si encuentra una redirección la usa sino carga la pagina inicial
          const redirect = this.storageService.get(
            `${environment.sessionPrefix}_rdi`
          );
          if (redirect) {
            this.router.navigateByUrl(redirect);
            this.storageService.delete(`${environment.sessionPrefix}_rdi`);
          } else {
            this.router.navigateByUrl('/');
          }
          console.log(
            'Initialized network data in:',
            (performance.now() - timerStart).toFixed(2),
            'ms'
          );
        }
      });
  }
  async initializeData(networkOnly: boolean): Promise<void> {
    // Inicializa los mensajes push
    if (!this.pushToken) {
      this.pushToken = await this.initializeMessaging();
    }
    // Carga configuración inicial
    await this.authService.getSettings(networkOnly, this.pushToken);
    this.initialized = true;
  }
  async initializeMessaging(): Promise<string | undefined> {
    let token = '';
    try {
      if (!isPlatformBrowser(this.platformId) || !navigator.onLine) {
        return '';
      }
      const supported = await isSupported();
      if (!supported) {
        console.warn(
          'Firebase Messaging is not supported in this environment.'
        );
        return '';
      }
      const messaging = this.injector.get(Messaging);
      if (isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();

        if (!registration) {
          console.error('Service Worker registration not found.');
          //throw new Error('Service Worker registration not found.');
        }

        const currentToken = await getToken(messaging, {
          vapidKey: environment.vapidKey,
          serviceWorkerRegistration: registration
        });
        if (currentToken) {
          console.log('Push token', currentToken);
          token = currentToken;
          // Aquí enviarías el token a tu servidor si es necesario
        } else {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
        }
      }
    } catch (err) {
      if (isPlatformBrowser(this.platformId) && !navigator.onLine) {
        console.error('No internet connection. Token generation failed.');
        // Aquí puedes manejar la falta de conexión, por ejemplo, reintentar más tarde
      } else {
        console.error('Error obtaining push token:', err);
      }
    }
    return token;
  }
  install(): void {
    this.installationAllowed = false;
    this.installPrompt.prompt();
    this.installPrompt.userChoice.then((result: any) => {
      if (result.outcome !== 'dismissed') {
        //this.googleTagManagerService.addVariable({ event: 'install', user_id: this.settings.user?.username, app_id: this.id });
      }
    });
  }
  openPage(uuid: string): void {
    this.dialog.open(Page, {
      data: {
        url: `https://factor.ec/${this.getLocale()}/jsonapi/node/page/${uuid}`
      },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      }
    });
  }
  setOverlapped(event: boolean, element: HTMLElement | any): void {
    const targetElement =
      element instanceof HTMLElement ? element : element?.nativeElement;
    if (targetElement) {
      if (!event) {
        targetElement.classList.add('ft-overlapped');
      } else {
        targetElement.classList.remove('ft-overlapped');
      }
    }
  }
  async setLocale(): Promise<string> {
    const systemLocale = isPlatformBrowser(this.platformId)
      ? this.languages().find(
          (l) => l.code === navigator.language.split('-')[0]
        )?.code
      : null;
    const userLocale = this.languages().find(
      (l) => l.code === this.storageService.get(this.localeKey, 'local')
    )?.code;
    const locale = userLocale || systemLocale || this.defaultLocale;
    this.storageService.set(this.localeKey, locale, 'local');

    // Load translation file
    const localeTranslationsModule = await import(
      `../../../public/i18n/${locale}.js`
    );

    // Load translations for the current locale at run-time
    loadTranslations(localeTranslationsModule.default);

    // Internacionalización moment
    moment.locale(locale);

    return locale;
  }
  /**
   * Obtiene el primer mensaje de error de un control
   * @param field Control de formulario
   * @returns Mensaje de error
   */
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
  generatePeriodOptions(
    count: number,
    unit: moment.unitOfTime.DurationConstructor,
    format: string,
    type: moment.unitOfTime.StartOf,
    operation: 'add' | 'substract' = 'substract'
  ): Period[] {
    return Array.from({ length: count }).map((_, i) => {
      const period =
        operation === 'substract'
          ? moment().subtract(i, unit)
          : moment().add(i, unit);
      return {
        label: period.format(format),
        after: period.clone().startOf(type).format('YYYY-MM-DD'),
        before: period.clone().endOf(type).format('YYYY-MM-DD')
      };
    });
  }
}
