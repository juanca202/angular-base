import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppUpdate, RELOAD_PAGE } from '@/core/services/app-update';

describe('AppUpdate', () => {
  let unrecoverable: Subject<unknown>;
  const reload = vi.fn();
  let swUpdate: {
    isEnabled: boolean;
    unrecoverable: Subject<unknown>;
    checkForUpdate: ReturnType<typeof vi.fn>;
    activateUpdate: ReturnType<typeof vi.fn>;
  };
  let service: AppUpdate;
  let visibility: DocumentVisibilityState;

  const create = (enabled: boolean) => {
    swUpdate.isEnabled = enabled;
    service = TestBed.inject(AppUpdate);
  };

  beforeEach(() => {
    reload.mockClear();
    unrecoverable = new Subject<unknown>();
    visibility = 'hidden';
    swUpdate = {
      isEnabled: true,
      unrecoverable,
      checkForUpdate: vi.fn(async () => true),
      activateUpdate: vi.fn(async () => true),
    };
    const document = new EventTarget();
    Object.defineProperty(document, 'visibilityState', { get: () => visibility });
    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: swUpdate },
        { provide: DOCUMENT, useValue: document },
        { provide: RELOAD_PAGE, useValue: reload },
      ],
    });
  });

  const show = () => {
    visibility = 'visible';
    TestBed.inject(DOCUMENT).dispatchEvent(new Event('visibilitychange'));
  };

  it('busca una versión nueva cada vez que la aplicación vuelve a primer plano', () => {
    create(true);
    service.watch();

    show();

    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('no busca versión nueva al pasar a segundo plano', () => {
    create(true);
    service.watch();

    TestBed.inject(DOCUMENT).dispatchEvent(new Event('visibilitychange'));

    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
  });

  it('vigilar dos veces no duplica la búsqueda', () => {
    create(true);
    service.watch();
    service.watch();

    show();

    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('tolera que la búsqueda de versión falle sin conexión', async () => {
    swUpdate.checkForUpdate.mockRejectedValue(new Error('sin red'));
    create(true);
    service.watch();

    expect(() => show()).not.toThrow();
    await Promise.resolve();
  });

  it('recarga cuando el service worker queda en estado irrecuperable', () => {
    create(true);
    service.watch();

    unrecoverable.next({ reason: 'caché dañada' });

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('sin service worker activo no vigila nada', () => {
    create(false);
    service.watch();

    show();
    unrecoverable.next({});

    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('activa la versión descargada y recarga', async () => {
    create(true);

    await service.activate();

    expect(swUpdate.activateUpdate).toHaveBeenCalled();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('recarga aunque la activación falle', async () => {
    swUpdate.activateUpdate.mockRejectedValue(new Error('fallo'));
    create(true);

    await service.activate();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('sin service worker, activar solo recarga', async () => {
    create(false);

    await service.activate();

    expect(swUpdate.activateUpdate).not.toHaveBeenCalled();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
