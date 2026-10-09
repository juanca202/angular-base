import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FRAME_INTERVAL_MS,
  RESTART_HOLD_MS,
  SendSequenceManager,
} from '@/features/send/managers/send-sequence-manager';
import { QrEncoder } from '@/features/send/services/qr-encoder';
import { SPEED_KEY } from '@/features/send/services/send-preferences';

describe('SendSequenceManager', () => {
  let manager: SendSequenceManager;
  /** Almacenamiento local en memoria: cada prueba empieza sin nada guardado. */
  let stored: Map<string, string>;
  const fragments = [new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])];
  const encode = vi.fn((fragment: Uint8Array) => ({
    size: 1,
    modules: Uint8Array.of(fragment[0]),
  }));

  beforeEach(() => {
    vi.useFakeTimers();
    encode.mockClear();
    stored = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    });
    TestBed.configureTestingModule({ providers: [{ provide: QrEncoder, useValue: { encode } }] });
    manager = TestBed.inject(SendSequenceManager);
  });

  afterEach(() => {
    manager.cancel();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('mantiene la velocidad fija en 8 fps', () => {
    expect(FRAME_INTERVAL_MS).toBe(125);
  });

  it('al iniciar deja fijo el primer QR, sin avanzar, hasta que el usuario lo toque', () => {
    manager.start(fragments);

    vi.advanceTimersByTime(10_000);

    expect(manager.active()).toBe(true);
    expect(manager.progress()).toMatchObject({ waiting: true, index: 0, total: 3, lap: 1 });
    expect(manager.currentQr()?.modules[0]).toBe(1);
    expect(encode).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el primer toque arranca la secuencia: retiene el primer QR y luego avanza solo', () => {
    manager.start(fragments);

    manager.restartLap();

    expect(manager.progress()).toMatchObject({ waiting: false, index: 0, lap: 1 });
    vi.advanceTimersByTime(RESTART_HOLD_MS - 1);
    expect(manager.progress().index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(manager.progress().index).toBe(1);
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);
    expect(manager.progress().index).toBe(2);
    expect(manager.currentQr()?.modules[0]).toBe(3);
  });

  it('repite la secuencia en bucle: tras tres vueltas sigue emitiendo', () => {
    manager.start(fragments);
    manager.restartLap();

    vi.advanceTimersByTime(RESTART_HOLD_MS + FRAME_INTERVAL_MS * 8);

    expect(manager.active()).toBe(true);
    expect(manager.progress()).toMatchObject({ index: 0, lap: 4 });
  });

  it('no acumula deriva: tras 80 fotogramas han pasado 10 s', () => {
    manager.start(fragments);
    manager.restartLap();
    encode.mockClear();

    vi.advanceTimersByTime(RESTART_HOLD_MS + 10_000);

    expect(encode).toHaveBeenCalledTimes(81);
  });

  it('muestra el tiempo por vuelta desde el inicio: total × 125 ms', () => {
    manager.start(fragments);

    expect(manager.progress().estimatedLapMs).toBe(3 * FRAME_INTERVAL_MS);
  });

  it('con un solo fragmento repite el mismo QR y cuenta las vueltas', () => {
    manager.start([fragments[0]]);
    manager.restartLap();

    vi.advanceTimersByTime(RESTART_HOLD_MS + FRAME_INTERVAL_MS);

    expect(manager.progress()).toMatchObject({ index: 0, total: 1, lap: 3 });
  });

  it('volver a tocar reinicia la vuelta: retiene el primer QR y luego sigue con la cadencia normal', () => {
    manager.start(fragments);
    manager.restartLap();
    vi.advanceTimersByTime(RESTART_HOLD_MS + FRAME_INTERVAL_MS * 4);
    expect(manager.progress()).toMatchObject({ index: 2, lap: 2 });

    manager.restartLap();

    expect(manager.progress()).toMatchObject({ index: 0, lap: 1 });
    vi.advanceTimersByTime(RESTART_HOLD_MS - 1);
    expect(manager.progress().index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(manager.progress().index).toBe(1);
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);
    expect(manager.progress().index).toBe(2);
  });

  describe('continuar desde un fragmento elegido', () => {
    it('muestra ese fragmento, lo retiene unos segundos y sigue desde ahí con la cadencia normal', () => {
      manager.start(fragments);
      manager.restartLap();
      vi.advanceTimersByTime(RESTART_HOLD_MS + FRAME_INTERVAL_MS * 3);

      manager.seekTo(1);

      expect(manager.progress()).toMatchObject({ index: 1, waiting: false });
      expect(manager.currentQr()?.modules[0]).toBe(2);
      vi.advanceTimersByTime(RESTART_HOLD_MS - 1);
      expect(manager.progress().index).toBe(1);
      vi.advanceTimersByTime(1);
      expect(manager.progress().index).toBe(2);
      vi.advanceTimersByTime(FRAME_INTERVAL_MS);
      expect(manager.progress().index).toBe(0);
    });

    it('mantiene la vuelta en curso y la cuenta al pasar por el final', () => {
      manager.start(fragments);
      manager.restartLap();
      vi.advanceTimersByTime(RESTART_HOLD_MS + FRAME_INTERVAL_MS * 3);
      const { lap } = manager.progress();

      manager.seekTo(2);
      vi.advanceTimersByTime(RESTART_HOLD_MS);

      expect(manager.progress()).toMatchObject({ index: 0, lap: lap + 1 });
    });

    it('arranca la secuencia desde ahí si aún esperaba el primer toque', () => {
      manager.start(fragments);

      manager.seekTo(2);

      expect(manager.progress()).toMatchObject({ waiting: false, index: 2, lap: 1 });
      vi.advanceTimersByTime(RESTART_HOLD_MS);
      expect(manager.progress().index).toBe(0);
    });

    it('acota la posición al rango de la secuencia', () => {
      manager.start(fragments);

      manager.seekTo(99);
      expect(manager.progress().index).toBe(2);
      manager.seekTo(-5);
      expect(manager.progress().index).toBe(0);
    });

    it('no hace nada sin emisión en curso', () => {
      manager.seekTo(1);

      expect(manager.active()).toBe(false);
      expect(manager.currentQr()).toBeNull();
    });
  });

  describe('velocidad', () => {
    it('emite por defecto a 8 QR por segundo', () => {
      expect(manager.speed()).toBe(8);
    });

    it('al cambiarla antes del primer toque recalcula el tiempo por vuelta sin arrancar', () => {
      manager.start(fragments);

      manager.setSpeed(4);

      expect(manager.speed()).toBe(4);
      expect(manager.progress()).toMatchObject({ waiting: true, estimatedLapMs: 3 * 250 });
      expect(vi.getTimerCount()).toBe(0);
    });

    it('con la secuencia en marcha, el QR siguiente llega con el nuevo intervalo', () => {
      manager.start(fragments);
      manager.restartLap();
      vi.advanceTimersByTime(RESTART_HOLD_MS);
      expect(manager.progress().index).toBe(1);

      manager.setSpeed(4);

      expect(manager.progress()).toMatchObject({ index: 1, estimatedLapMs: 3 * 250 });
      vi.advanceTimersByTime(249);
      expect(manager.progress().index).toBe(1);
      vi.advanceTimersByTime(1);
      expect(manager.progress().index).toBe(2);
      vi.advanceTimersByTime(249);
      expect(manager.progress().index).toBe(2);
      vi.advanceTimersByTime(1);
      expect(manager.progress().index).toBe(0);
    });

    it('subir la velocidad acorta el intervalo', () => {
      manager.start(fragments);
      manager.restartLap();
      vi.advanceTimersByTime(RESTART_HOLD_MS);

      manager.setSpeed(12);

      // 1000 / 12 = 83,3 ms: el reloj simulado redondea, así que se comprueba con holgura.
      vi.advanceTimersByTime(70);
      expect(manager.progress().index).toBe(1);
      vi.advanceTimersByTime(20);
      expect(manager.progress().index).toBe(2);
    });

    it('si se cambia durante la retención del QR elegido, la retención se respeta', () => {
      manager.start(fragments);
      manager.restartLap();
      vi.advanceTimersByTime(1000);

      manager.setSpeed(12);

      vi.advanceTimersByTime(RESTART_HOLD_MS - 1000 - 1);
      expect(manager.progress().index).toBe(0);
      vi.advanceTimersByTime(1);
      expect(manager.progress().index).toBe(1);
      vi.advanceTimersByTime(84);
      expect(manager.progress().index).toBe(2);
    });

    it('ignora velocidades no válidas', () => {
      manager.start(fragments);

      manager.setSpeed(0);
      manager.setSpeed(-3);
      manager.setSpeed(Number.NaN);

      expect(manager.speed()).toBe(8);
    });

    it('sin emisión en curso solo recuerda la velocidad, y la usa al iniciar', () => {
      manager.setSpeed(6);

      expect(manager.speed()).toBe(6);
      expect(vi.getTimerCount()).toBe(0);
      manager.start(fragments);
      expect(manager.progress().estimatedLapMs).toBeCloseTo(3 * (1000 / 6));
    });

    it('guarda la velocidad elegida para recordarla', () => {
      manager.setSpeed(10);

      expect(stored.get(SPEED_KEY)).toBe('10');
    });

    it('no guarda una velocidad no válida', () => {
      manager.setSpeed(0);
      manager.setSpeed(Number.NaN);

      expect(stored.has(SPEED_KEY)).toBe(false);
    });

    it('al cargar la página de nuevo arranca con la velocidad que se eligió', () => {
      manager.setSpeed(12);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [{ provide: QrEncoder, useValue: { encode } }] });

      const reloaded = TestBed.inject(SendSequenceManager);

      expect(reloaded.speed()).toBe(12);
      reloaded.start(fragments);
      expect(reloaded.progress().estimatedLapMs).toBeCloseTo(3 * (1000 / 12));
    });

    it('ignora una velocidad guardada que ya no es una opción', () => {
      stored.set(SPEED_KEY, '99');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [{ provide: QrEncoder, useValue: { encode } }] });

      expect(TestBed.inject(SendSequenceManager).speed()).toBe(8);
    });

    it('al cancelar conserva la velocidad elegida', () => {
      manager.start(fragments);
      manager.setSpeed(10);

      manager.cancel();

      expect(manager.speed()).toBe(10);
    });
  });

  it('tocar sin emisión en curso no hace nada', () => {
    manager.restartLap();

    expect(manager.active()).toBe(false);
    expect(manager.currentQr()).toBeNull();
  });

  it('cancelar detiene la emisión, libera el QR y el temporizador', () => {
    manager.start(fragments);
    manager.restartLap();
    vi.advanceTimersByTime(RESTART_HOLD_MS);

    manager.cancel();

    expect(manager.active()).toBe(false);
    expect(manager.currentQr()).toBeNull();
    expect(manager.progress().total).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    encode.mockClear();
    vi.advanceTimersByTime(FRAME_INTERVAL_MS * 5);
    expect(encode).not.toHaveBeenCalled();
  });

  it('iniciar de nuevo cancela la emisión anterior y vuelve a esperar el toque', () => {
    manager.start(fragments);
    manager.restartLap();
    vi.advanceTimersByTime(RESTART_HOLD_MS);

    manager.start([fragments[2]]);

    expect(manager.progress()).toMatchObject({ waiting: true, index: 0, total: 1, lap: 1 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rechaza una secuencia vacía', () => {
    expect(() => manager.start([])).toThrow();
    expect(manager.active()).toBe(false);
  });
});
