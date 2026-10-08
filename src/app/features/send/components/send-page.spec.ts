import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivateStorage } from '@/core/services/private-storage';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { SendPage } from '@/features/send/components/send-page';

describe('SendPage', () => {
  const save = vi.fn();

  const setup = async () => {
    const view = await render(SendPage, {
      providers: [{ provide: PrivateStorage, useValue: { save } }],
    });
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
    return { ...view, input };
  };

  /** Simula la elección de un archivo en el selector. */
  const choose = async (input: HTMLInputElement, files: File[]) => {
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await fireEvent.change(input);
  };

  const fileOf = (name: string, size: number, type = 'application/octet-stream') => {
    const file = new File([new Uint8Array(Math.min(size, 1024))], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new ArrayBuffer(size),
    });
    return file;
  };

  beforeEach(() => {
    save.mockReset().mockResolvedValue({});
    vi.stubGlobal('navigator', { ...navigator, storage: { getDirectory: vi.fn() } });
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('abre el selector al entrar y admite un solo archivo', async () => {
    const { input } = await setup();

    expect(HTMLInputElement.prototype.click).toHaveBeenCalled();
    expect(input.multiple).toBe(false);
  });

  it('no inicia ninguna transferencia si se cierra el selector sin elegir', async () => {
    const { input } = await setup();

    await choose(input, []);

    expect(save).not.toHaveBeenCalled();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'Elegir archivo' })).toBeTruthy();
  });

  it('muestra el QR y la información del archivo, con el tiempo «calculando…» y sin progreso', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('prueba.bin', 102_400, 'application/octet-stream')]);

    expect(await screen.findByRole('img', { name: 'Código QR del archivo' })).toBeTruthy();
    expect(screen.getByText('prueba.bin')).toBeTruthy();
    expect(screen.getByText('application/octet-stream')).toBeTruthy();
    expect(screen.getByText('100.0 KB')).toBeTruthy();
    expect(screen.getByText('257')).toBeTruthy();
    expect(screen.getByText('calculando…')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(save).toHaveBeenCalledWith('sent', expect.objectContaining({ name: 'prueba.bin' }));
  });

  it('cancela sin confirmación, detiene el QR y conserva la copia guardada', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 5_000)]);

    await fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Elegir archivo' })).toBeTruthy();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rechaza un archivo vacío con un mensaje claro y no guarda ni emite', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('vacio.bin', 0)]);

    expect((await screen.findByRole('alert')).textContent).toContain('vacío');
    expect(save).not.toHaveBeenCalled();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('rechaza un archivo que excede el máximo de fragmentos', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('enorme.bin', 30_000_000)]);

    expect((await screen.findByRole('alert')).textContent).toContain('demasiado grande');
    expect(save).not.toHaveBeenCalled();
  });

  it('informa que el navegador no es compatible y no inicia nada', async () => {
    vi.stubGlobal('navigator', { storage: {} });
    const { input } = await setup();

    await choose(input, [fileOf('a.bin', 100)]);

    expect((await screen.findByRole('alert')).textContent).toContain('no es compatible');
    expect(save).not.toHaveBeenCalled();
  });

  it('no inicia la transferencia cuando la cuota se agota al guardar la copia', async () => {
    save.mockRejectedValue(new StorageQuotaError(100, 0));
    const { input } = await setup();

    await choose(input, [fileOf('a.bin', 100)]);

    expect((await screen.findByRole('alert')).textContent).toContain('espacio de almacenamiento');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('muestra un mensaje genérico ante otros errores al preparar el envío', async () => {
    save.mockRejectedValue(new Error('disco'));
    const { input } = await setup();

    await choose(input, [fileOf('a.bin', 100)]);

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('No se pudo preparar'),
    );
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('el selector no rompe si el navegador bloquea abrirlo sin gesto del usuario', async () => {
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {
      throw new DOMException('bloqueado', 'NotAllowedError');
    });

    await setup();

    expect(screen.getByRole('button', { name: 'Elegir archivo' })).toBeTruthy();
  });
});
