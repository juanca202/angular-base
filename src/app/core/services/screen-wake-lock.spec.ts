import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScreenWakeLock } from '@/core/services/screen-wake-lock';

/** Bloqueo simulado: se puede liberar por el sistema (como al ocultarse la pestaña). */
function createSentinel() {
  const listeners: (() => void)[] = [];
  return {
    release: vi.fn(async () => undefined),
    addEventListener: vi.fn((_type: string, listener: () => void) => listeners.push(listener)),
    releasedBySystem: () => listeners.forEach((listener) => listener()),
  };
}

describe('ScreenWakeLock', () => {
  let request: ReturnType<typeof vi.fn>;
  let sentinels: ReturnType<typeof createSentinel>[];

  beforeEach(() => {
    sentinels = [];
    request = vi.fn(async () => {
      const sentinel = createSentinel();
      sentinels.push(sentinel);
      return sentinel;
    });
    vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const create = () => TestBed.inject(ScreenWakeLock);
  const show = (state: 'visible' | 'hidden') => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
    document.dispatchEvent(new Event('visibilitychange'));
  };

  it('pide mantener la pantalla encendida', async () => {
    await create().acquire();

    expect(request).toHaveBeenCalledWith('screen');
  });

  it('no pide un segundo bloqueo si ya tiene uno', async () => {
    const wakeLock = create();

    await wakeLock.acquire();
    await wakeLock.acquire();

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('libera el bloqueo al terminar', async () => {
    const wakeLock = create();
    await wakeLock.acquire();

    await wakeLock.release();

    expect(sentinels[0].release).toHaveBeenCalledTimes(1);
  });

  it('puede pedirse de nuevo tras liberarlo', async () => {
    const wakeLock = create();
    await wakeLock.acquire();
    await wakeLock.release();

    await wakeLock.acquire();

    expect(request).toHaveBeenCalledTimes(2);
  });

  it('liberar sin haber pedido nada no hace nada ni falla', async () => {
    await expect(create().release()).resolves.toBeUndefined();
    expect(request).not.toHaveBeenCalled();
  });

  it('lo vuelve a pedir al volver a ver la pestaña, porque el sistema lo libera al ocultarla', async () => {
    const wakeLock = create();
    await wakeLock.acquire();
    sentinels[0].releasedBySystem();

    show('visible');
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    await wakeLock.release();
  });

  it('no lo vuelve a pedir al ver la pestaña si ya se dejó de necesitar', async () => {
    const wakeLock = create();
    await wakeLock.acquire();
    await wakeLock.release();

    show('visible');
    await Promise.resolve();

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('no pide nada mientras la pestaña se oculta', async () => {
    const wakeLock = create();
    await wakeLock.acquire();
    sentinels[0].releasedBySystem();

    show('hidden');
    await Promise.resolve();

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('libera el bloqueo que llega cuando ya no se necesitaba', async () => {
    let answer: (sentinel: ReturnType<typeof createSentinel>) => void = () => undefined;
    request.mockImplementationOnce(() => new Promise((resolve) => (answer = resolve)));
    const wakeLock = create();
    const acquiring = wakeLock.acquire();
    await wakeLock.release();

    const late = createSentinel();
    answer(late);
    await acquiring;

    expect(late.release).toHaveBeenCalledTimes(1);
  });

  it('sigue sin fallar si el navegador no ofrece la API', async () => {
    vi.stubGlobal('navigator', {});

    await expect(create().acquire()).resolves.toBeUndefined();
  });

  it('sigue sin fallar si el navegador rechaza el bloqueo', async () => {
    request.mockRejectedValue(new DOMException('low battery', 'NotAllowedError'));

    await expect(create().acquire()).resolves.toBeUndefined();
  });

  it('ignora un error al liberar un bloqueo que el sistema ya soltó', async () => {
    const wakeLock = create();
    await wakeLock.acquire();
    sentinels[0].release.mockRejectedValue(new Error('already released'));

    await expect(wakeLock.release()).resolves.toBeUndefined();
  });
});
