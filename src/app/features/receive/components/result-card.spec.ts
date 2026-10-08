import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { ReceivedFile } from '@/shared/utils/qr-protocol';
import { FailedReceiveResult, ResultCard } from '@/features/receive/components/result-card';

const file: ReceivedFile = { name: 'a.bin', type: '', size: 1, bytes: Uint8Array.of(1) };

describe('ResultCard', () => {
  const setup = async (result: FailedReceiveResult) => {
    const continueScanning = vi.fn();
    const retry = vi.fn();
    const download = vi.fn();
    await render(ResultCard, {
      inputs: { result },
      on: { continueScanning, retry, download },
    });
    return { continueScanning, retry, download };
  };

  it('explains an incomplete reception, says nothing was saved and offers to keep scanning', async () => {
    // Act
    const { continueScanning } = await setup({
      outcome: 'incomplete',
      progress: { received: 268, total: 412 },
    });
    // Assert
    expect(screen.getByRole('alert').textContent).toContain('Recepción incompleta');
    expect(screen.getByText(/268 de 412/)).toBeTruthy();
    expect(screen.getByText(/No se guardó ni registró ningún archivo/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: 'Seguir escaneando' }));
    expect(continueScanning).toHaveBeenCalledTimes(1);
  });

  it('says that nothing was read when no fragment was received', async () => {
    // Act
    await setup({ outcome: 'incomplete', progress: { received: 0, total: 0 } });
    // Assert
    expect(screen.getByText('No se leyó ningún fragmento de una transferencia.')).toBeTruthy();
    expect(screen.queryByText(/0 de 0/)).toBeNull();
  });

  it.each([
    [{ outcome: 'invalid-data' } as const, 'Datos inválidos'],
    [{ outcome: 'unreconstructable' } as const, 'Archivo no reconstruible'],
  ])('shows %o, says nothing was saved and offers to retry from scratch', async (result, title) => {
    // Act
    const { retry } = await setup(result);
    // Assert
    expect(screen.getByRole('alert').textContent).toContain(title);
    expect(screen.getByText(/No se guardó ni registró ningún archivo/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Seguir escaneando' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Descargar archivo' })).toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('on a full storage offers to download the received file and to retry', async () => {
    // Act
    const { download, retry } = await setup({ outcome: 'storage-full', file });
    // Assert
    expect(screen.getByRole('alert').textContent).toContain('Almacenamiento lleno');
    expect(screen.getByText(/No se guardó ni registró ningún archivo/)).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: 'Descargar archivo' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(download).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('on any other save failure also offers to download the received file', async () => {
    // Act
    await setup({ outcome: 'save-failed', file });
    // Assert
    expect(screen.getByRole('alert').textContent).toContain('No se pudo guardar');
    expect(screen.getByRole('button', { name: 'Descargar archivo' })).toBeTruthy();
  });
});
