import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { FileExport } from '@/core/services/file-export';
import { PrivateStorage } from '@/core/services/private-storage';
import { HomePage } from '@/features/home/components/home-page';

import { ConfirmEvent, NotificationEvent, notificationEvents } from '@/core/utils/notification';

/** Dobles de las respuestas del puente de notificaciones (ADR-009), escuchando sus eventos reales. */
const confirmMock = vi.fn();
const notifyMock = vi.fn();
const onConfirm = (event: Event) => {
  const { message, options, resolve } = (event as CustomEvent<ConfirmEvent>).detail;
  confirmMock(message, options);
  resolve(confirmAnswer);
};
const onNotify = (event: Event) => {
  const { message, options } = (event as CustomEvent<NotificationEvent>).detail;
  notifyMock(message, options);
};
let confirmAnswer: string | undefined;

function entry(id: string, direction: 'sent' | 'received', date: number, name = `${id}.bin`) {
  return {
    id,
    direction,
    name,
    type: 'application/octet-stream',
    size: 2048,
    date,
  } as StoredTransfer;
}

describe('HomePage', () => {
  let stored: StoredTransfer[];
  const list = vi.fn();
  const remove = vi.fn();
  const read = vi.fn();
  const fileExport = {
    download: vi.fn(),
    share: vi.fn(),
    canShare: vi.fn(),
    isShareAvailable: vi.fn(),
  };

  const setup = () =>
    render(HomePage, {
      providers: [
        provideRouter([]),
        { provide: PrivateStorage, useValue: { list, remove, read } },
        { provide: FileExport, useValue: fileExport },
      ],
    });

  const rows = () => screen.queryAllByRole('listitem');
  const rowNames = () =>
    rows().map((row) => within(row).getByRole('heading', { level: 3 }).textContent);

  beforeEach(() => {
    stored = [];
    list.mockReset().mockImplementation(async () => [...stored]);
    remove.mockReset().mockImplementation(async (id: string) => {
      stored = stored.filter((e) => e.id !== id);
    });
    read.mockReset().mockResolvedValue(new File(['x'], 'a.bin'));
    confirmMock.mockReset();
    notifyMock.mockReset();
    confirmAnswer = undefined;
    notificationEvents.addEventListener('confirm', onConfirm);
    notificationEvents.addEventListener('notify', onNotify);
    Object.values(fileExport).forEach((fn) => fn.mockReset());
    fileExport.isShareAvailable.mockReturnValue(false);
    fileExport.canShare.mockReturnValue(true);
  });

  afterEach(() => {
    notificationEvents.removeEventListener('confirm', onConfirm);
    notificationEvents.removeEventListener('notify', onNotify);
    vi.restoreAllMocks();
  });

  it('muestra los botones Enviar y Recibir que navegan a sus rutas', async () => {
    await setup();

    expect(screen.getByRole('link', { name: /enviar/i }).getAttribute('href')).toBe('/enviar');
    expect(screen.getByRole('link', { name: /recibir/i }).getAttribute('href')).toBe('/recibir');
  });

  it('lista las transferencias de la más reciente a la más antigua', async () => {
    stored = [entry('a', 'sent', 100), entry('c', 'received', 300), entry('b', 'sent', 200)];

    await setup();

    await waitFor(() => expect(rowNames()).toEqual(['c.bin', 'b.bin', 'a.bin']));
  });

  it('muestra el contenido de cada fila: nombre, dirección, tipo y tamaño', async () => {
    stored = [entry('a', 'received', 100, 'foto.png')];

    await setup();

    const row = await screen.findByRole('listitem');
    expect(within(row).getByText('foto.png')).toBeTruthy();
    expect(row.textContent).toContain('Recibido');
    expect(row.textContent).toContain('application/octet-stream');
    expect(row.textContent).toContain('2.0 KB');
  });

  it('muestra Todos por defecto y filtra por Recibidos y Enviados', async () => {
    stored = [entry('s', 'sent', 200), entry('r', 'received', 100)];
    await setup();
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(screen.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed')).toBe('true');

    await fireEvent.click(screen.getByRole('button', { name: 'Recibidos' }));
    expect(rowNames()).toEqual(['r.bin']);

    await fireEvent.click(screen.getByRole('button', { name: 'Enviados' }));
    expect(rowNames()).toEqual(['s.bin']);

    await fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(rowNames()).toEqual(['s.bin', 'r.bin']);
  });

  it('muestra «Aún no hay transferencias» en lugar de la lista si no hay ninguna', async () => {
    await setup();

    expect(await screen.findByText('Aún no hay transferencias')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('exporta por descarga el archivo de la fila', async () => {
    stored = [entry('a', 'sent', 1)];
    const file = new File(['x'], 'a.bin');
    read.mockResolvedValue(file);
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /exportar a\.bin/i }));

    await waitFor(() => expect(fileExport.download).toHaveBeenCalledWith(file));
    expect(read).toHaveBeenCalledWith('a');
  });

  it('no ofrece Compartir si el navegador no lo permite', async () => {
    stored = [entry('a', 'sent', 1)];
    await setup();

    await screen.findByRole('listitem');
    expect(screen.queryByRole('button', { name: /compartir/i })).toBeNull();
  });

  it('comparte el archivo cuando el navegador lo permite', async () => {
    fileExport.isShareAvailable.mockReturnValue(true);
    fileExport.share.mockResolvedValue(true);
    stored = [entry('a', 'sent', 1)];
    const file = new File(['x'], 'a.bin');
    read.mockResolvedValue(file);
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /compartir a\.bin/i }));

    await waitFor(() => expect(fileExport.share).toHaveBeenCalledWith(file));
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('si el usuario cancela compartir, conserva el historial sin avisos', async () => {
    fileExport.isShareAvailable.mockReturnValue(true);
    fileExport.share.mockResolvedValue(false);
    stored = [entry('a', 'sent', 1)];
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /compartir a\.bin/i }));

    await waitFor(() => expect(fileExport.share).toHaveBeenCalled());
    expect(notifyMock).not.toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
  });

  it('avisa del error si el archivo ya no existe al exportar', async () => {
    stored = [entry('a', 'sent', 1)];
    read.mockResolvedValue(undefined);
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /exportar a\.bin/i }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith(expect.any(String), { level: 'error' }),
    );
    expect(fileExport.download).not.toHaveBeenCalled();
  });

  it('pide confirmación y elimina la entrada al confirmar', async () => {
    confirmAnswer = 'delete';
    stored = [entry('a', 'sent', 2), entry('b', 'received', 1)];
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /eliminar a\.bin/i }));

    await waitFor(() => expect(rowNames()).toEqual(['b.bin']));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('a');
  });

  it('no elimina nada si se cancela la confirmación', async () => {
    confirmAnswer = 'cancel';
    stored = [entry('a', 'sent', 1)];
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /eliminar a\.bin/i }));

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(remove).not.toHaveBeenCalled();
    expect(rows()).toHaveLength(1);
  });

  it('muestra el estado vacío al eliminar la última entrada', async () => {
    confirmAnswer = 'delete';
    stored = [entry('a', 'sent', 1)];
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: /eliminar a\.bin/i }));

    expect(await screen.findByText('Aún no hay transferencias')).toBeTruthy();
  });

  it('no inicia ninguna salida de archivos solo con usar la pantalla', async () => {
    stored = [entry('a', 'sent', 1)];
    await setup();

    await fireEvent.click(await screen.findByRole('button', { name: 'Enviados' }));

    expect(fileExport.download).not.toHaveBeenCalled();
    expect(fileExport.share).not.toHaveBeenCalled();
  });

  it('avisa si no se puede cargar el historial', async () => {
    list.mockRejectedValue(new Error('fallo'));

    await setup();

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith(expect.any(String), { level: 'error' }),
    );
  });
});
