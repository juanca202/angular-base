import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QrEncoder } from '@/features/send/services/qr-encoder';

describe('QrEncoder', () => {
  const encoder = () => TestBed.inject(QrEncoder);
  const payload = (size: number) => Uint8Array.from({ length: size }, (_, i) => (i * 7) % 256);

  it('codifica carga binaria como una matriz cuadrada de módulos 0/1', () => {
    const matrix = encoder().encode(payload(100));

    expect(matrix.modules.length).toBe(matrix.size * matrix.size);
    expect(new Set(matrix.modules)).toEqual(new Set([0, 1]));
  });

  it('usa corrección M: un fragmento de 400 B más cabecera cabe en la versión 15 (77 módulos)', () => {
    const matrix = encoder().encode(payload(412));

    expect(matrix.size).toBe(77);
  });

  it('produce matrices distintas para fragmentos distintos y la misma para el mismo', () => {
    const a = encoder().encode(payload(50));
    const b = encoder().encode(payload(51));
    const a2 = encoder().encode(payload(50));

    expect(Array.from(a.modules)).toEqual(Array.from(a2.modules));
    expect(Array.from(a.modules)).not.toEqual(Array.from(b.modules));
  });

  it('falla con una carga que no cabe en ningún QR', () => {
    expect(() => encoder().encode(payload(3000))).toThrow();
  });
});
