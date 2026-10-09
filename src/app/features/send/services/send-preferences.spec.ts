import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DENSITY_KEY, SPEED_KEY, SendPreferences } from '@/features/send/services/send-preferences';

/** Almacenamiento local en memoria, para que ninguna prueba dependa del navegador ni de otra. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
    data,
  };
}

describe('SendPreferences', () => {
  afterEach(() => vi.unstubAllGlobals());

  const create = (storage: object | undefined) => {
    vi.stubGlobal('localStorage', storage);
    TestBed.resetTestingModule();
    return TestBed.inject(SendPreferences);
  };

  describe('sin nada guardado', () => {
    it('da la velocidad (8 QR/s) y la densidad (800 B) por defecto', () => {
      const preferences = create(memoryStorage());

      expect(preferences.speed()).toBe(8);
      expect(preferences.density()).toBe(800);
    });
  });

  describe('con valores guardados', () => {
    it('recupera la velocidad y la densidad elegidas', () => {
      const preferences = create(memoryStorage({ [SPEED_KEY]: '12', [DENSITY_KEY]: '400' }));

      expect(preferences.speed()).toBe(12);
      expect(preferences.density()).toBe(400);
    });

    it.each(['7', '0', '-4', 'abc', '', '8.5', 'NaN'])(
      'ignora una velocidad guardada que no es una opción vigente (%j)',
      (stored) => {
        expect(create(memoryStorage({ [SPEED_KEY]: stored })).speed()).toBe(8);
      },
    );

    it.each(['300', '0', '99999', 'abc', ''])(
      'ignora una densidad guardada que no es una opción vigente (%j)',
      (stored) => {
        expect(create(memoryStorage({ [DENSITY_KEY]: stored })).density()).toBe(800);
      },
    );
  });

  describe('al guardar', () => {
    it('escribe la velocidad y la densidad con claves propias, solo como números', () => {
      const storage = memoryStorage();
      const preferences = create(storage);

      preferences.saveSpeed(4);
      preferences.saveDensity(1200);

      expect(storage.data.get(SPEED_KEY)).toBe('4');
      expect(storage.data.get(DENSITY_KEY)).toBe('1200');
      expect(storage.data.size).toBe(2);
    });

    it('lo guardado se recupera con una instancia nueva, como al recargar la página', () => {
      const storage = memoryStorage();
      create(storage).saveSpeed(10);
      create(storage).saveDensity(200);

      const reloaded = create(storage);

      expect(reloaded.speed()).toBe(10);
      expect(reloaded.density()).toBe(200);
    });
  });

  describe('sin almacenamiento utilizable', () => {
    it('usa los valores por defecto y no falla si no existe localStorage', () => {
      const preferences = create(undefined);

      expect(preferences.speed()).toBe(8);
      expect(preferences.density()).toBe(800);
      expect(() => preferences.saveSpeed(4)).not.toThrow();
    });

    it('usa los valores por defecto y no falla si leer o escribir lanza (modo privado, cuota)', () => {
      const broken = {
        getItem: () => {
          throw new DOMException('denied', 'SecurityError');
        },
        setItem: () => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
      };
      const preferences = create(broken);

      expect(preferences.speed()).toBe(8);
      expect(preferences.density()).toBe(800);
      expect(() => preferences.saveSpeed(4)).not.toThrow();
      expect(() => preferences.saveDensity(400)).not.toThrow();
    });
  });

  beforeEach(() => TestBed.resetTestingModule());
});
