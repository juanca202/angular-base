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
        { provide: SafeFileOpener, useValue: { open } },
        { provide: FileExport, useValue: { download } },
      ],
    });

  it('announces that the file was received, verified and saved, with its name and size', async () => {
    await setup();

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Archivo recibido correctamente' })).toBeTruthy();
    expect(screen.getByText(/«informe\.pdf» \(2\.0 KB\) se verificó y se guardó/)).toBeTruthy();
  });

  it('lets the user view the file', async () => {
    await setup();

    await fireEvent.click(screen.getByRole('button', { name: 'Ver archivo' }));

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
