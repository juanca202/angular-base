import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivateStorage } from '@/core/services/private-storage';
import { ScreenWakeLock } from '@/core/services/screen-wake-lock';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { SendPage } from '@/features/send/components/send-page';
import { DENSITY_KEY, SPEED_KEY } from '@/features/send/services/send-preferences';

describe('SendPage', () => {
  const save = vi.fn();
  const wakeLock = { acquire: vi.fn(async () => undefined), release: vi.fn(async () => undefined) };
  /** Almacenamiento local en memoria: cada prueba empieza sin nada guardado. */
  let stored: Map<string, string>;

  const setup = async () => {
    const view = await render(SendPage, {
      providers: [
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
        { provide: PrivateStorage, useValue: { save } },
        { provide: ScreenWakeLock, useValue: wakeLock },
      ],
    });
    await view.fixture.whenStable();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    return { ...view, input };
  };

  /** Simula la elección de un archivo en el selector. */
  const choose = async (input: HTMLInputElement, files: File[]) => {
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await fireEvent.change(input);
  };

  /** Abre el menú ⋮ de la cabecera y elige la opción de densidad o velocidad con ese valor. */
  const chooseOption = async (value: number) => {
    await fireEvent.click(screen.getByRole('button', { name: 'Opciones de envío' }));
    await fireEvent.click(await screen.findByRole('menuitemradio', { name: String(value) }));
  };

  /** Valor marcado en cada grupo del menú ⋮ (densidad y velocidad). */
  const checkedOptions = async () => {
    await fireEvent.click(screen.getByRole('button', { name: 'Opciones de envío' }));
    const items = await screen.findAllByRole('menuitemradio');
    const checked = items
      .filter((item) => item.getAttribute('aria-checked') === 'true')
      .map((item) => item.textContent?.replace('✓', '').trim());
    await fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
      keyCode: 27,
    });
    return checked;
  };

  /** Contenido de `size` bytes: ceros (se comprimen) o aleatorio (no se comprime). */
  const contentOf = (size: number, random: boolean) => {
    const buffer = new ArrayBuffer(size);
    if (random) {
      for (let at = 0; at < size; at += 65_536) {
        crypto.getRandomValues(new Uint8Array(buffer, at, Math.min(65_536, size - at)));
      }
    }
    return buffer;
  };

  const fileOf = (
    name: string,
    size: number,
    type = 'application/octet-stream',
    random = false,
  ) => {
    const file = new File([new Uint8Array(Math.min(size, 1024))], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    Object.defineProperty(file, 'arrayBuffer', { value: async () => contentOf(size, random) });
    return file;
  };

  beforeEach(() => {
    save.mockReset().mockResolvedValue({});
    wakeLock.acquire.mockClear();
    wakeLock.release.mockClear();
    stored = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    });
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

  it('muestra el QR fijo y la información del archivo, con el tiempo por vuelta y sin progreso', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('prueba.bin', 102_400, 'application/octet-stream', true)]);

    expect(await screen.findByRole('img', { name: 'Código QR del archivo' })).toBeTruthy();
    expect(screen.getByText('prueba.bin')).toBeTruthy();
    expect(screen.getByText('application/octet-stream · 100.0 KB · 65 QR')).toBeTruthy();
    expect(screen.getByText('~8 s por vuelta')).toBeTruthy();
    expect(screen.getByText('Toca el QR para iniciar o reiniciar la vuelta')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(save).toHaveBeenCalledWith('sent', expect.objectContaining({ name: 'prueba.bin' }));
  });

  it('transmite comprimido un archivo que se comprime, e informa del tamaño que viaja y de los QR', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('ceros.bin', 102_400)]);

    expect(await screen.findByRole('img', { name: 'Código QR del archivo' })).toBeTruthy();
    expect(screen.getByText(/100\.0 KB \(se transmite .* comprimido\)/)).toBeTruthy();
    expect(screen.queryByText(/ · 65 QR$/)).toBeNull();
  });

  it('no muestra el tamaño transmitido cuando el archivo no se comprime', async () => {
    const { input } = await setup();

    await choose(input, [fileOf('azar.bin', 5_000, 'application/octet-stream', true)]);

    await screen.findByRole('img', { name: 'Código QR del archivo' });
    expect(screen.queryByText(/se transmite/)).toBeNull();
  });

  it('muestra la barra de posición y continúa la secuencia desde el QR que se elige en ella', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 5_000, 'application/octet-stream', true)]);
    const bar = await screen.findByRole('slider', { name: 'Posición en la secuencia de QR' });
    expect(screen.getByText(/^QR 1 de \d+$/)).toBeTruthy();

    await fireEvent.keyDown(bar, { key: 'ArrowRight' });

    expect(screen.getByText(/^QR 2 de \d+$/)).toBeTruthy();
    expect(screen.getByText('Toca el QR para iniciar o reiniciar la vuelta')).toBeTruthy();
    expect(screen.queryByText(/arrastra la barra/)).toBeNull();
  });

  describe('preferencias recordadas', () => {
    const randomFile = () => fileOf('prueba.bin', 102_400, 'application/octet-stream', true);

    it('guarda la densidad y la velocidad al elegirlas', async () => {
      const { input } = await setup();
      await choose(input, [randomFile()]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await chooseOption(400);
      await waitFor(() => expect(stored.get(DENSITY_KEY)).toBe('400'));
      await chooseOption(12);

      expect(stored.get(SPEED_KEY)).toBe('12');
    });

    it('al cargar la página de nuevo recuerda la densidad y la velocidad, y fragmenta con ellas', async () => {
      stored.set(DENSITY_KEY, '400');
      stored.set(SPEED_KEY, '4');
      const { input } = await setup();

      await choose(input, [randomFile()]);

      await screen.findByRole('img', { name: 'Código QR del archivo' });
      expect(await checkedOptions()).toEqual(['400', '4']);
      expect(screen.getByText(/ · 257 QR$/)).toBeTruthy();
      expect(screen.getByText('~1 min 4 s por vuelta')).toBeTruthy();
    });

    it('no guarda una densidad que no se pudo aplicar', async () => {
      const { input } = await setup();
      await choose(input, [fileOf('grande.bin', 14_000_000)]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await chooseOption(200);

      await screen.findByRole('alert');
      expect(stored.has(DENSITY_KEY)).toBe(false);
    });

    it('ignora valores guardados que ya no son opciones y usa los de por defecto', async () => {
      stored.set(DENSITY_KEY, '300');
      stored.set(SPEED_KEY, '99');
      const { input } = await setup();

      await choose(input, [randomFile()]);

      await screen.findByRole('img', { name: 'Código QR del archivo' });
      expect(await checkedOptions()).toEqual(['1600', '8']);
    });
  });

  describe('densidad (bytes por QR)', () => {
    const randomFile = (name = 'prueba.bin', size = 102_400) =>
      fileOf(name, size, 'application/octet-stream', true);

    it('ofrece en el menú ⋮ 200, 400, 800, 1200 y 1600 B por QR desplegados, con 1600 marcado por defecto', async () => {
      const { input } = await setup();
      await choose(input, [randomFile()]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await fireEvent.click(screen.getByRole('button', { name: 'Opciones de envío' }));
      const group = await screen.findByRole('group', { name: 'Densidad' });

      const items = Array.from(group.querySelectorAll('[role="menuitemradio"]'));
      expect(items.map((o) => o.textContent?.replace('✓', '').trim())).toEqual([
        '200',
        '400',
        '800',
        '1200',
        '1600',
      ]);
      expect(items.map((o) => o.getAttribute('aria-checked'))).toEqual([
        'false',
        'false',
        'false',
        'false',
        'true',
      ]);
      expect(screen.queryByRole('menuitem', { name: 'Cancelar' })).toBeNull();
    });

    it('al cambiarla vuelve a fragmentar: más QR, más tiempo por vuelta y espera de nuevo el primer toque', async () => {
      const { input } = await setup();
      await choose(input, [randomFile()]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });
      await fireEvent.click(screen.getByRole('button', { name: /Iniciar o reiniciar la vuelta/ }));
      expect(screen.getByText(/ · 65 QR$/)).toBeTruthy();

      await chooseOption(400);

      await waitFor(() => expect(screen.getByText(/ · 257 QR$/)).toBeTruthy());
      expect(screen.getByText('~32 s por vuelta')).toBeTruthy();
      expect((await checkedOptions())[0]).toBe('400');
      expect(screen.getByText(/el receptor debe empezar de nuevo/)).toBeTruthy();
    });

    it('no vuelve a guardar la copia del archivo al cambiarla', async () => {
      const { input } = await setup();
      await choose(input, [randomFile()]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await chooseOption(1200);

      await waitFor(() => expect(screen.getByText(/ · 86 QR$/)).toBeTruthy());
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('conserva la velocidad elegida al cambiar la densidad', async () => {
      const { input } = await setup();
      await choose(input, [randomFile()]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });
      await chooseOption(4);

      await chooseOption(400);

      await waitFor(() => expect(screen.getByText(/ · 257 QR$/)).toBeTruthy());
      expect(await checkedOptions()).toEqual(['400', '4']);
    });

    it('avisa y conserva el tamaño actual si el nombre no cabe en fragmentos tan pequeños', async () => {
      const { input } = await setup();
      await choose(input, [randomFile(`${'n'.repeat(190)}.bin`, 5_000)]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await chooseOption(200);

      expect((await screen.findByRole('alert')).textContent).toContain('demasiado largo');
      expect((await checkedOptions())[0]).toBe('1600');
      expect(screen.getByRole('img', { name: 'Código QR del archivo' })).toBeTruthy();
    });

    it('avisa y conserva el tamaño actual si el archivo es demasiado grande para fragmentos pequeños', async () => {
      const { input } = await setup();
      await choose(input, [fileOf('grande.bin', 14_000_000)]);
      await screen.findByRole('img', { name: 'Código QR del archivo' });

      await chooseOption(200);

      expect((await screen.findByRole('alert')).textContent).toContain('demasiado grande');
      expect((await checkedOptions())[0]).toBe('1600');
    });
  });

  describe('pantalla encendida durante el envío', () => {
    it('no pide mantenerla encendida mientras no hay nada que enviar', async () => {
      await setup();

      expect(wakeLock.acquire).not.toHaveBeenCalled();
    });

    it('la pide al empezar a mostrar la secuencia', async () => {
      const { input } = await setup();

      await choose(input, [fileOf('prueba.bin', 5_000, 'application/octet-stream', true)]);

      await waitFor(() => expect(wakeLock.acquire).toHaveBeenCalled());
    });

    it('la libera al cerrar la hoja de envío', async () => {
      const { input } = await setup();
      await choose(input, [fileOf('prueba.bin', 5_000, 'application/octet-stream', true)]);
      await waitFor(() => expect(wakeLock.acquire).toHaveBeenCalled());
      wakeLock.release.mockClear();

      await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });

      await waitFor(() => expect(wakeLock.release).toHaveBeenCalled());
    });

    it('la libera al salir de la pantalla', async () => {
      const { input, fixture } = await setup();
      await choose(input, [fileOf('prueba.bin', 5_000, 'application/octet-stream', true)]);
      await waitFor(() => expect(wakeLock.acquire).toHaveBeenCalled());
      wakeLock.release.mockClear();

      fixture.destroy();

      expect(wakeLock.release).toHaveBeenCalled();
    });
  });

  it('la velocidad del menú ⋮ cambia el tiempo por vuelta y ofrece 4, 6, 8, 10 y 12', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 102_400, 'application/octet-stream', true)]);
    await screen.findByRole('img', { name: 'Código QR del archivo' });
    expect((await checkedOptions())[1]).toBe('8');
    expect(screen.getByText('~8 s por vuelta')).toBeTruthy();

    await chooseOption(4);

    expect(screen.getByText('~16 s por vuelta')).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: 'Opciones de envío' }));
    const group = await screen.findByRole('group', { name: 'Velocidad' });
    expect(
      Array.from(group.querySelectorAll('[role="menuitemradio"]')).map((o) =>
        o.textContent?.replace('✓', '').trim(),
      ),
    ).toEqual(['4', '6', '8', '10', '12']);
  });

  it('el toque sobre el QR inicia la secuencia y la ayuda sigue siendo la misma', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 5_000)]);
    await screen.findByRole('img', { name: 'Código QR del archivo' });

    await fireEvent.click(
      screen.getByRole('button', { name: 'Iniciar o reiniciar la vuelta desde el primer QR' }),
    );

    expect(screen.getByText('Toca el QR para iniciar o reiniciar la vuelta')).toBeTruthy();
  });

  it('cerrar la hoja cancela sin confirmación, detiene el QR y conserva la copia guardada', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 5_000)]);
    await screen.findByRole('img', { name: 'Código QR del archivo' });

    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });

    await waitFor(() =>
      expect(screen.queryByRole('img', { name: 'Código QR del archivo' })).toBeNull(),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('la hoja no ofrece «Cancelar» ni selectores: solo el menú ⋮ y la ayuda del QR', async () => {
    const { input } = await setup();
    await choose(input, [fileOf('prueba.bin', 5_000)]);
    await screen.findByRole('img', { name: 'Código QR del archivo' });

    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Opciones de envío' })).toBeTruthy();
  });

  it('vuelve al inicio si se cierra el selector de archivos sin elegir', async () => {
    const { input } = await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await fireEvent(input, new Event('cancel'));

    expect(navigate).toHaveBeenCalledWith('/');
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

    await choose(input, [fileOf('enorme.bin', 120_000_000)]);

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
