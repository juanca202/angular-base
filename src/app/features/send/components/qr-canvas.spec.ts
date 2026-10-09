import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrCanvas } from '@/features/send/components/qr-canvas';

describe('QrCanvas', () => {
  const context = { fillRect: vi.fn(), clearRect: vi.fn(), fillStyle: '' };

  afterEach(() => {
    vi.restoreAllMocks();
    context.fillRect.mockClear();
    context.clearRect.mockClear();
  });

  const setup = async (matrix: { size: number; modules: Uint8Array } | null) => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    return render(QrCanvas, { inputs: { matrix } });
  };

  it('dibuja el fondo blanco y un cuadrado por módulo oscuro, con zona de silencio', async () => {
    const { container } = await setup({ size: 2, modules: Uint8Array.of(1, 0, 0, 1) });

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    // (2 módulos + 2 × 4 de zona de silencio) × 6 px por módulo
    expect(canvas.width).toBe(60);
    // 1 llamada de fondo + 2 módulos oscuros
    expect(context.fillRect).toHaveBeenCalledTimes(3);
    expect(context.fillRect).toHaveBeenCalledWith(24, 24, 6, 6);
    expect(context.fillRect).toHaveBeenCalledWith(30, 30, 6, 6);
  });

  it('limpia el lienzo cuando no hay matriz', async () => {
    await setup(null);

    expect(context.clearRect).toHaveBeenCalled();
    expect(context.fillRect).not.toHaveBeenCalled();
  });

  it('no falla si el navegador no ofrece contexto 2D', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const { container } = await render(QrCanvas, {
      inputs: { matrix: { size: 1, modules: Uint8Array.of(1) } },
    });

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  describe('escala entera en píxeles del dispositivo', () => {
    let observe: ReturnType<typeof vi.fn>;
    let disconnect: ReturnType<typeof vi.fn>;
    let resize: () => void;

    beforeEach(() => {
      observe = vi.fn();
      disconnect = vi.fn();
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            resize = callback;
          }
          public observe = observe;
          public disconnect = disconnect;
        },
      );
    });

    afterEach(() => vi.unstubAllGlobals());

    const hostWidth = (width: number) =>
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    const matrix = { size: 21, modules: new Uint8Array(21 * 21).fill(1) };

    it('usa el mayor número entero de píxeles por módulo que cabe en el ancho', async () => {
      hostWidth(400);
      const { container } = await setup(matrix);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      // 29 módulos con zona de silencio: 400 / 29 = 13,8 → 13 px por módulo
      expect(canvas.width).toBe(13 * 29);
      expect(canvas.height).toBe(13 * 29);
      expect(canvas.style.width).toBe(`${13 * 29}px`);
      expect(context.fillRect).toHaveBeenCalledWith(4 * 13, 4 * 13, 13, 13);
    });

    it('cuenta los píxeles del dispositivo: con pantalla de densidad doble, módulos enteros de ese tamaño', async () => {
      vi.stubGlobal('devicePixelRatio', 2);
      hostWidth(400);
      const { container } = await setup(matrix);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      // 400 px CSS = 800 px de dispositivo: 800 / 29 = 27,6 → 27 px de dispositivo por módulo
      expect(canvas.width).toBe(27 * 29);
      expect(canvas.style.width).toBe(`${(27 * 29) / 2}px`);
    });

    it('nunca baja de un píxel por módulo', async () => {
      hostWidth(10);
      const { container } = await setup(matrix);

      expect((container.querySelector('canvas') as HTMLCanvasElement).width).toBe(29);
    });

    it('vuelve a dibujar con otra escala cuando cambia el ancho disponible', async () => {
      const width = hostWidth(400);
      const { container } = await setup(matrix);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.width).toBe(13 * 29);

      width.mockReturnValue(200);
      resize();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve));

      expect(canvas.width).toBe(6 * 29);
    });

    it('observa el ancho y deja de observarlo al destruirse', async () => {
      hostWidth(400);
      const { fixture } = await setup(matrix);

      expect(observe).toHaveBeenCalled();
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    });

    it('sin ancho conocido usa 6 píxeles por módulo y no fija el tamaño por CSS', async () => {
      hostWidth(0);
      const { container } = await setup(matrix);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.width).toBe(6 * 29);
      expect(canvas.style.width).toBe('');
    });
  });
});
