import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FRAME_INTERVAL_MS,
  SendSequenceManager,
} from '@/features/send/managers/send-sequence-manager';
import { QrEncoder } from '@/features/send/services/qr-encoder';

describe('SendSequenceManager', () => {
  let manager: SendSequenceManager;
  const fragments = [new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])];
  const encode = vi.fn((fragment: Uint8Array) => ({
    size: 1,
    modules: Uint8Array.of(fragment[0]),
  }));

  beforeEach(() => {
    vi.useFakeTimers();
    encode.mockClear();
    TestBed.configureTestingModule({ providers: [{ provide: QrEncoder, useValue: { encode } }] });
    manager = TestBed.inject(SendSequenceManager);
  });

  afterEach(() => {
    manager.cancel();
    vi.useRealTimers();
  });

  it('mantiene la velocidad fija en 8 fps', () => {
    expect(FRAME_INTERVAL_MS).toBe(125);
  });

  it('muestra el primer QR al iniciar y avanza solo, sin intervención', () => {
    manager.start(fragments);

    expect(manager.active()).toBe(true);
    expect(manager.progress()).toMatchObject({ index: 0, total: 3, lap: 1 });
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);
    expect(manager.progress().index).toBe(1);
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);
    expect(manager.progress().index).toBe(2);
    expect(manager.currentQr()?.modules[0]).toBe(3);
  });

  it('repite la secuencia en bucle: tras tres vueltas sigue emitiendo', () => {
    manager.start(fragments);

    vi.advanceTimersByTime(FRAME_INTERVAL_MS * fragments.length * 3);

    expect(manager.active()).toBe(true);
    expect(manager.progress()).toMatchObject({ index: 0, lap: 4 });
  });

  it('no acumula deriva: tras 80 fotogramas han pasado 10 s', () => {
    manager.start(fragments);

    vi.advanceTimersByTime(10_000);

    expect(encode).toHaveBeenCalledTimes(81);
  });

  it('muestra el tiempo por vuelta como no disponible hasta tener datos y luego total × 125 ms', () => {
    manager.start(fragments);
    expect(manager.progress().estimatedLapMs).toBeNull();

    vi.advanceTimersByTime(FRAME_INTERVAL_MS);

    expect(manager.progress().estimatedLapMs).toBe(3 * FRAME_INTERVAL_MS);
  });

  it('con un solo fragmento repite el mismo QR y cuenta las vueltas', () => {
    manager.start([fragments[0]]);

    vi.advanceTimersByTime(FRAME_INTERVAL_MS * 2);

    expect(manager.progress()).toMatchObject({ index: 0, total: 1, lap: 3 });
  });

  it('cancelar detiene la emisión, libera el QR y el temporizador', () => {
    manager.start(fragments);
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);

    manager.cancel();

    expect(manager.active()).toBe(false);
    expect(manager.currentQr()).toBeNull();
    expect(manager.progress().total).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    encode.mockClear();
    vi.advanceTimersByTime(FRAME_INTERVAL_MS * 5);
    expect(encode).not.toHaveBeenCalled();
  });

  it('iniciar de nuevo cancela la emisión anterior', () => {
    manager.start(fragments);
    vi.advanceTimersByTime(FRAME_INTERVAL_MS);

    manager.start([fragments[2]]);

    expect(manager.progress()).toMatchObject({ index: 0, total: 1, lap: 1 });
    expect(vi.getTimerCount()).toBe(1);
  });

  it('rechaza una secuencia vacía', () => {
    expect(() => manager.start([])).toThrow();
    expect(manager.active()).toBe(false);
  });
});
