import { fireEvent, render, screen } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileExport } from '@/core/services/file-export';
import { ReceiveSuccess } from '@/features/receive/components/receive-success';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';

describe('ReceiveSuccess', () => {
  const open = vi.fn();
  const download = vi.fn();
  const file = new File([new Uint8Array(2048)], 'informe.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    open.mockReset();
    download.mockReset();
  });

  const setup = () =>
    render(ReceiveSuccess, {
      inputs: { file },
      providers: [
        { provide: SafeFileOpener, useValue: { open, previewKind: () => 'none' } },
        { provide: FileExport, useValue: { download } },
      ],
    });

  it('announces that the file was received with its name', async () => {
    await setup();

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(/recibido exitosamente\./)).toBeTruthy();
    expect(screen.getByText('informe.pdf', { selector: 'strong' })).toBeTruthy();
  });

  it('offers only the two actions «Abrir» and «Descargar»', async () => {
    await setup();

    expect(screen.getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      'informe.pdf',
      'Abrir',
      'Descargar',
    ]);
    expect(screen.queryByRole('button', { name: 'Aceptar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ver archivo' })).toBeNull();
  });

  it('lets the user open the file', async () => {
    await setup();

    await fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    expect(open).toHaveBeenCalledWith(file);
    expect(download).not.toHaveBeenCalled();
  });

  it('lets the user download the file', async () => {
    await setup();

    await fireEvent.click(screen.getByRole('button', { name: 'Descargar' }));

    expect(download).toHaveBeenCalledWith(file);
    expect(open).not.toHaveBeenCalled();
  });
});
