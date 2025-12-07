import { Injectable, Injector, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Messaging } from '@angular/fire/messaging';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { GoogleTagManagerService, StorageService, Language } from '@factor_ec/utils';
import { LANGUAGES } from '@/core/constants/languages';
import { skip } from 'rxjs';
import moment from 'moment';
import { getToken, isSupported } from 'firebase/messaging';

import { versionInfo } from '@/version-info';
import { environment } from '@/environments/environment';
import { AuthProvider } from '@/core/services/auth.provider';
import { Session } from '@/core/services/session';

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

/**
 * Coordinates application-wide concerns such as localization, PWA updates,
 * push messaging, and analytics initialization.
 *
 * @remarks
 * This singleton is bootstrapped through an app initializer so that routing
 * and session restoration happen before the UI renders.
 */
@Injectable({
  providedIn: 'root'
})
export class AppManager {
  private readonly authService = inject(AuthProvider);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private readonly platformId = inject<object>(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly session = inject(Session);
  private readonly snackbar = inject(MatSnackBar);
  private readonly swUpdate = inject(SwUpdate);
  private readonly storageService = inject(StorageService);

  public readonly allowSignup: boolean = true;
  public readonly allowAuthFederation: boolean = false;
  public readonly id = '';
  public readonly name = '';
  public initialized = false;
  private installPrompt: any = null; // BeforeInstallPromptEvent;
  public readonly version = versionInfo.git.raw;
  public readonly updateStatus = signal<string | null>('done');
  private readonly defaultLocale = 'en';
  public readonly languages = signal<Language[]>(LANGUAGES);
  private pushToken: string | undefined;

  // Storage keys
  private readonly clientKey = `${environment.sessionPrefix}_cid`;
  private readonly localeKey = `${environment.sessionPrefix}_loc`;

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
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          const snack = this.snackbar.open($localize`Update Available`, $localize`Reload`);
          snack.onAction().subscribe(() => {
            window.location.reload();
          });
          break;
        }
        case 'VERSION_INSTALLATION_FAILED':
          this.updateStatus.set('failed');
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (event: Event) => {
        event.preventDefault();
        this.installPrompt = event as any;
      });
    }
  }

  public checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      this.updateStatus.set('failed');
      return;
    }
    this.updateStatus.set('checking');
    this.swUpdate.checkForUpdate();
  }
  public getClientId(): string {
    let cid = this.storageService.get(this.clientKey, 'local');
    if (!cid) {
      cid = crypto.randomUUID();
      this.storageService.set(this.clientKey, cid, 'local');
    }
    return cid;
  }
  public getLocale(): string {
    return this.storageService.get(this.localeKey, 'local') || 'en';
  }
  public goBack(): void {
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
  public async init(): Promise<void> {
    let timerStart = performance.now();
    // Show version in console
    console.log(`${versionInfo.npmPackage.name} ${versionInfo.git.raw}`);
    // Insert Google Tag Manager tracking code
    if (environment.googleTagManager) {
      this.googleTagManagerService.appendTrackingCode(environment.googleTagManager.trackingCode);
    }
    // Check for updates
    this.checkForUpdates();
    // Load the configured application language
    const locale = await this.setLocale();
    console.log('Current locale: ', locale);
    console.log('init app in:', (performance.now() - timerStart).toFixed(2), 'ms');
    // If authenticated, initialize with local data
    if (this.session.isLoggedIn()) {
      timerStart = performance.now();
      await this.initData(false);
      console.log('init local data in:', (performance.now() - timerStart).toFixed(2), 'ms');
    }
    // Upon authentication, a server synchronization is required
    this.session.loggedIn.pipe(skip(this.session.isLoggedIn() ? 1 : 0)).subscribe(async (value) => {
      if (value) {
        timerStart = performance.now();
        await this.initData(true);
        // If a redirect is found use it; otherwise load the home page
        const redirect = this.storageService.get(`${environment.sessionPrefix}_rdi`);
        if (redirect) {
          this.router.navigateByUrl(redirect);
          this.storageService.delete(`${environment.sessionPrefix}_rdi`);
        } else {
          this.router.navigateByUrl('/');
        }
        console.log('init network data in:', (performance.now() - timerStart).toFixed(2), 'ms');
      }
    });
  }
  private async initData(networkOnly: boolean): Promise<void> {
    // Initialize push messages
    if (!this.pushToken) {
      this.pushToken = await this.initMessaging();
    }
    // Load initial configuration
    await this.authService.getSettings(networkOnly, this.pushToken);
    this.initialized = true;
  }
  private async initMessaging(): Promise<string | undefined> {
    let token = '';
    try {
      if (!isPlatformBrowser(this.platformId) || !navigator.onLine) {
        return '';
      }
      const supported = await isSupported();
      if (!supported) {
        console.warn('Firebase Messaging is not supported in this environment.');
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
          // Here you would send the token to your server if needed
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      }
    } catch (err) {
      if (isPlatformBrowser(this.platformId) && !navigator.onLine) {
        console.error('No internet connection. Token generation failed.');
        // You can handle lack of connection here, e.g., retry later
      } else {
        console.error('Error obtaining push token:', err);
      }
    }
    return token;
  }
  public install(): void {
    if (!this.installPrompt) {
      return;
    }
    this.installPrompt.prompt();
    this.installPrompt.userChoice?.then((result: any) => {
      if (result?.outcome !== 'dismissed') {
        //this.googleTagManagerService.addVariable({ event: 'install', user_id: this.settings.user?.username, app_id: this.id });
      }
    });
  }
  private async setLocale(): Promise<string> {
    const systemLocale = isPlatformBrowser(this.platformId)
      ? this.languages().find((l) => l.code === navigator.language.split('-')[0])?.code
      : null;
    const userLocale = this.languages().find(
      (l) => l.code === this.storageService.get(this.localeKey, 'local')
    )?.code;
    const locale = userLocale || systemLocale || this.defaultLocale;
    this.storageService.set(this.localeKey, locale, 'local');

    // Load translation file
    const localeTranslationsModule = await import(`../../../../public/i18n/${locale}.js`);

    // Load translations for the current locale at run-time
    loadTranslations(localeTranslationsModule.default);

    // Moment internationalization
    moment.locale(locale);

    return locale;
  }
}
