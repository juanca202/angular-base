import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
});
