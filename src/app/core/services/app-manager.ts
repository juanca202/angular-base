import { Service, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthProvider, Storage } from '@factor_ec/utils';
import { MessageService, type MessageOptions } from '@factor_ec/ui';

import { versionInfo } from '@/version-info';
import { environment } from '@/environments/environment';
import { Session } from '@/core/services/session';
import {
  ConfirmEvent,
  ConfirmOptions,
  NotificationEvent,
  NotificationOptions,
  notificationEvents
} from '@/core/utils/notification';
import { firstValueFrom } from 'rxjs';
import { Language } from '@/core/models/language';

interface BeforeInstallPromptEventLike extends Event {
  readonly prompt: () => Promise<void>;
  readonly userChoice?: Promise<{ outcome?: string }>;
}

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
@Service()
export class AppManager {
  // Dependency injection
  private readonly authProvider = inject(AuthProvider);
  private readonly platformId = inject<object>(PLATFORM_ID);
  private readonly session = inject(Session);
  private readonly snackbar = inject(MatSnackBar);
  private readonly swUpdate = inject(SwUpdate);
  private readonly storage = inject(Storage);
  private readonly messageService = inject(MessageService);

  // Properties
  private installPrompt: BeforeInstallPromptEventLike | null = null;
  public readonly updateStatus = signal<string | null>('done');
  public readonly languages = signal<Language[]>(environment.i18n.languages);
  public readonly startTime = performance.now();

  // Storage keys
  private readonly clientKey = `${environment.sessionPrefix}_cid`;
  private readonly localeKey = `${environment.sessionPrefix}_loc`;

  /**
   * Triggers a service worker update check. Sets {@link updateStatus} to `'failed'`
   * when the service worker is not enabled (e.g. non-browser platforms, dev mode).
   */
  public checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      this.updateStatus.set('failed');
      return;
    }
    this.updateStatus.set('checking');
    this.swUpdate.checkForUpdate();
    console.log('Check for app updates');
  }

  /**
   * Returns a stable per-device client identifier, generating and persisting
   * one on first use.
   */
  public getClientId(): string {
    let cid = this.storage.get(this.clientKey, 'local');
    if (!cid) {
      cid = crypto.randomUUID();
      this.storage.set(this.clientKey, cid, 'local');
    }
    return cid;
  }

  /**
   * Returns the locale persisted from a previous {@link setLocale} call, or
   * `'en'` if none was stored yet.
   */
  public getLocale(): string {
    return this.storage.get(this.localeKey, 'local') || 'en';
  }

  /**
   * Bootstraps application-wide concerns: PWA update listeners, the `notify`
   * event bridge (ADR-009), locale resolution, and session restoration for an
   * already authenticated user.
   */
  public async init(): Promise<void> {
    // Show version in console
    console.log(`${versionInfo.npmPackage.name} ${versionInfo.git.raw}`);
    // React to updates
    this.setUpdateListeners();
    // Check for updates
    this.checkForUpdates();
    // Listen for notifications
    notificationEvents.addEventListener('notify', (event: Event) => {
      const { message, options } = (event as CustomEvent<NotificationEvent>).detail;
      this.messageService.show(message, this.buildMessageOptions(options));
    });
    notificationEvents.addEventListener('confirm', async (event: Event) => {
      const { message, options, resolve } = (event as CustomEvent<ConfirmEvent>).detail;
      const value = await firstValueFrom(
        this.messageService.show(message, this.buildConfirmOptions(options))
      );
      resolve(value);
    });
    // Load the configured application language
    const locale = await this.setLocale();
    console.log('Current locale: ', locale);
    // If authenticated, initialize with local data
    if (this.authProvider.isLoggedIn()) {
      this.session.getSettings();
    }

    // Log the time taken to initialize the app
    console.log('App initialized in:', (performance.now() - this.startTime).toFixed(2), 'ms');
  }
  /**
   * Shows the captured "Add to Home Screen" browser prompt, if one was
   * intercepted by {@link setUpdateListeners}.
   */
  public install(): void {
    if (!this.installPrompt) {
      return;
    }
    this.installPrompt.prompt();
  }

  /**
   * Resolves the active locale (persisted user choice, then system locale,
   * then the default) and persists it. Loads translations when i18n is enabled.
   *
   * @internal
   */
  private async setLocale(): Promise<string> {
    const systemLocale = isPlatformBrowser(this.platformId)
      ? this.languages().find((l) => l.code === navigator.language.split('-')[0])?.code
      : null;
    const userLocale = this.languages().find(
      (l) => l.code === this.storage.get(this.localeKey, 'local')
    )?.code;
    const locale = userLocale || systemLocale || environment.i18n.defaultLocale;
    this.storage.set(this.localeKey, locale, 'local');

    if (environment.i18n.enabled) {
      await this.loadTranslationsForLocale(locale);
    }

    return locale;
  }
  /**
   * Loads the base and locale-specific translation bundles for the given locale.
   *
   * @internal
   */
  private async loadTranslationsForLocale(locale: string): Promise<void> {
    // Load base translations
    try {
      // const localeBaseTranslations = await import(`../../../../public/i18n/${locale}-base.js`);
      // loadTranslations(localeBaseTranslations.default);
    } catch (error) {
      console.error(`Error loading base translations for ${locale}:`, error);
    }

    // Load translation file
    // const localeTranslations = await import(`../../../../public/i18n/${locale}.js`);
    // loadTranslations(localeTranslations.default);
  }
  /**
   * Maps a `notify` event's {@link NotificationOptions} to the `MessageOptions`
   * expected by `MessageService.show()`, applying styling per severity level.
   *
   * @internal
   */
  private buildMessageOptions(options?: NotificationOptions): MessageOptions {
    const type = options?.type ?? 'notification';
    switch (options?.level) {
      case 'success':
        return { type, class: 'ft-message--success', icon: 'check--circle' };
      case 'error':
        return { type, class: 'ft-message--error' };
      case 'warning':
        return { type, class: 'ft-message--warning' };
      case 'info':
        return { type, class: 'ft-message--info' };
      default:
        return { type };
    }
  }
  /**
   * Maps a `confirm` event's {@link ConfirmOptions} to the `MessageOptions`
   * expected by `MessageService.show()` for a modal confirmation dialog.
   *
   * @internal
   */
  private buildConfirmOptions(options?: ConfirmOptions): MessageOptions {
    return {
      type: 'modal',
      class: options?.class,
      icon: options?.icon,
      actions: options?.actions as MessageOptions['actions']
    };
  }
  /**
   * Subscribes to service worker version events (updating {@link updateStatus}
   * and prompting a reload once a new version is ready) and, on browser
   * platforms, captures the `beforeinstallprompt` event for {@link install}.
   *
   * @internal
   */
  private setUpdateListeners(): void {
    this.swUpdate.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          this.updateStatus.set('checking');
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          this.updateStatus.set('done');
          console.log('No new app version detected');
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
        this.installPrompt = event as BeforeInstallPromptEventLike;
      });
    }
  }
}
