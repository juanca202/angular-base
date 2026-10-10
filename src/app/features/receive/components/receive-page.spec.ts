import { signal, WritableSignal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraErrorCode } from '@/features/receive/models/camera-error';
import {
  EMPTY_RECEIVE_PROGRESS,
  ReceivePhase,
  ReceiveProgress,
  ReceiveResult,
} from '@/features/receive/models/receive-state';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { FileExport } from '@/core/services/file-export';
import { ScreenWakeLock } from '@/core/services/screen-wake-lock';
import { ReceivePage } from '@/features/receive/components/receive-page';
import { ReceiveManager } from '@/features/receive/services/receive-manager';

interface FakeManager {
  phase: WritableSignal<ReceivePhase>;
  progress: WritableSignal<ReceiveProgress>;
  result: WritableSignal<ReceiveResult | null>;
  cameraError: WritableSignal<CameraErrorCode | null>;
  start: ReturnType<typeof vi.fn>;
  finishReading: ReturnType<typeof vi.fn>;
  continueScanning: ReturnType<typeof vi.fn>;
  retry: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
}

function createManager(): FakeManager {
  return {
    phase: signal<ReceivePhase>('reading'),
    progress: signal<ReceiveProgress>(EMPTY_RECEIVE_PROGRESS),
    result: signal<ReceiveResult | null>(null),
    cameraError: signal<CameraErrorCode | null>(null),
    start: vi.fn().mockResolvedValue(undefined),
    finishReading: vi.fn().mockResolvedValue(undefined),
    continueScanning: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
  };
}

const reading: ReceiveProgress = {
  name: 'informe-q3.pdf',
  size: 1_258_291,
  received: 268,
  total: 412,
  fragments: new Set<number>(),
  percent: 65,
  remainingSeconds: 70,
};

describe('ReceivePage', () => {
  const download = vi.fn();
  const wakeLock = { acquire: vi.fn(async () => undefined), release: vi.fn(async () => undefined) };

  const setup = async (manager = createManager()) => {
    const view = await render(ReceivePage, {
      providers: [
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
        provideRouter([]),
        { provide: ReceiveManager, useValue: manager },
        { provide: FileExport, useValue: { download, isShareAvailable: () => false } },
        { provide: ScreenWakeLock, useValue: wakeLock },
      ],
    });
    return { ...view, manager };
  };

  beforeEach(() => {
    download.mockReset();
    wakeLock.acquire.mockClear();
    wakeLock.release.mockClear();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  describe('screen kept on while reading', () => {
    it.each(['starting', 'reading', 'finishing'] as const)(
      'asks to keep the screen on while the phase is %s',
      async (phase) => {
        const manager = createManager();
        manager.phase.set(phase);

        await setup(manager);

        expect(wakeLock.acquire).toHaveBeenCalled();
      },
    );

    it.each(['idle', 'result'] as const)(
      'does not keep the screen on in the %s phase',
      async (phase) => {
        const manager = createManager();
        manager.phase.set(phase);

        await setup(manager);

        expect(wakeLock.acquire).not.toHaveBeenCalled();
        expect(wakeLock.release).toHaveBeenCalled();
      },
    );

    it('lets the screen go once the reception has a result', async () => {
      const manager = createManager();
      const { fixture } = await setup(manager);
      wakeLock.release.mockClear();

      manager.phase.set('result');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(wakeLock.release).toHaveBeenCalled();
    });

    it('releases it when leaving the screen', async () => {
      const { fixture } = await setup();
      wakeLock.release.mockClear();

      fixture.destroy();

      expect(wakeLock.release).toHaveBeenCalled();
    });
  });

  it('activates the camera on entering, on the video element of the screen', async () => {
    // Act
    const { manager } = await setup();
    // Assert
    expect(manager.start).toHaveBeenCalledTimes(1);
    expect(manager.start).toHaveBeenCalledWith(document.querySelector('video'));
    expect(screen.getByText('Apunta al QR del emisor')).toBeTruthy();
  });

  it('waits for the first QR with an empty progress', async () => {
    // Act
    await setup();
    // Assert
    expect(screen.getByText('Esperando el primer QR…')).toBeTruthy();
    expect(screen.getByText('0 %')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByRole('img', { name: 'Fragmentos recibidos' })).toBeNull();
  });

  it('shows name, total size, estimated time, percentage and the bar of received fragments', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    expect(screen.getByRole('heading', { name: 'informe-q3.pdf' })).toBeTruthy();
    expect(screen.getByText(/1\.2 MB/)).toBeTruthy();
    expect(screen.getByText('QR 268 de 412')).toBeTruthy();
    expect(screen.getByText(/~1 min 10 s/)).toBeTruthy();
    expect(screen.getByText('65 %')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('img', { name: 'Fragmentos recibidos' })).toBeTruthy();
  });

  it('puts size, estimated time and percentage in one row spread across it, in that order, above the bar', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    const size = screen.getByText(/1\.2 MB/);
    const time = screen.getByText(/~1 min 10 s/);
    const percent = screen.getByText('65 %');
    const bar = screen.getByRole('img', { name: 'Fragmentos recibidos' });
    const row = size.parentElement as HTMLElement;
    expect(row.className).toContain('flex');
    expect(row.className).toContain('justify-between');
    expect(time.parentElement).toBe(row);
    expect(percent.parentElement).toBe(row);
    const follows = (a: Node, b: Node) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(follows(size, time)).toBeTruthy();
    expect(follows(time, percent)).toBeTruthy();
    expect(follows(row, bar)).toBeTruthy();
  });

  it('keeps the size and time labels available to screen readers, hidden on screen', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    expect(screen.getByText('Tamaño total:').className).toContain('sr-only');
    expect(screen.getByText('Tiempo estimado:').className).toContain('sr-only');
  });

  it('shows the file name and «QR n de N» in the header of the sheet, with a ⋮ menu', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    expect(screen.getByRole('dialog', { name: 'Recibir archivo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'informe-q3.pdf' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Opciones de recepción' })).toBeTruthy();
  });

  it('shows an estimate placeholder while there are too few fragments', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set({ ...reading, remainingSeconds: null });
    // Act
    await setup(manager);
    // Assert
    expect(screen.getByText(/calculando…/)).toBeTruthy();
  });

  describe('actions', () => {
    it('ends the reading with «Cerrar»', async () => {
      // Arrange
      const { manager } = await setup();
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
      // Assert
      expect(manager.finishReading).toHaveBeenCalledTimes(1);
    });

    it('cancels without asking for confirmation and goes back to the start', async () => {
      // Arrange
      const { manager } = await setup();
      const navigate = vi.spyOn(TestBedRouter(), 'navigateByUrl').mockResolvedValue(true);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Opciones de recepción' }));
      await fireEvent.click(await screen.findByRole('menuitem', { name: 'Cancelar' }));
      // Assert
      expect(manager.cancel).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('cancels when the sheet is dismissed', async () => {
      // Arrange
      const { manager } = await setup();
      const navigate = vi.spyOn(TestBedRouter(), 'navigateByUrl').mockResolvedValue(true);
      // Act
      await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
      // Assert
      await waitFor(() => expect(manager.cancel).toHaveBeenCalledTimes(1));
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('cannot end the reading or cancel while the file is being finished', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('finishing');
      await setup(manager);
      // Assert
      expect((screen.getByRole('button', { name: 'Cerrar' }) as HTMLButtonElement).disabled).toBe(
        true,
      );
      await fireEvent.click(screen.getByRole('button', { name: 'Opciones de recepción' }));
      expect(
        (await screen.findByRole('menuitem', { name: 'Cancelar' })).getAttribute('aria-disabled'),
      ).toBe('true');
    });

    it('cannot end the reading while the camera is still opening', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('starting');
      await setup(manager);
      // Assert
      expect((screen.getByRole('button', { name: 'Cerrar' }) as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it('cancels the reception when the screen is left', async () => {
      // Arrange
      const { manager, fixture } = await setup();
      // Act
      fixture.destroy();
      // Assert
      expect(manager.cancel).toHaveBeenCalled();
    });
  });

  describe('result', () => {
    const file = { name: 'foto.png', type: 'image/png', size: 4, bytes: Uint8Array.of(1, 2, 3, 4) };
    const record: StoredTransfer = {
      id: 'r1',
      direction: 'received',
      name: 'foto.png',
      type: 'image/png',
      size: 4,
      date: 0,
    };

    it('shows the success mark, the message and the preview of the received file', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set({ outcome: 'completed', record, file });
      // Act
      await setup(manager);
      // Assert
      expect(screen.getByRole('img', { name: 'foto.png' })).toBeTruthy();
      expect(screen.getByText(/recibido exitosamente\./)).toBeTruthy();
      expect(screen.queryByRole('heading', { name: 'Actividad reciente' })).toBeNull();
    });

    it('offers only «Abrir» and «Descargar»', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set({ outcome: 'completed', record, file });
      // Act
      await setup(manager);
      // Assert
      expect(screen.getByRole('button', { name: 'Abrir' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Descargar' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Aceptar' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Ver archivo' })).toBeNull();
    });

    it('hides the camera controls once there is a result', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set({ outcome: 'completed', record, file });
      // Act
      await setup(manager);
      // Assert
      expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.queryByRole('link', { name: 'Volver al inicio' })).toBeNull();
    });

    it('shows the card of an incomplete reception and keeps scanning from it', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set({ outcome: 'incomplete', progress: { received: 2, total: 4 } });
      await setup(manager);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Seguir escaneando' }));
      // Assert
      expect(screen.getByRole('alert').textContent).toContain('Recepción incompleta');
      expect(manager.continueScanning).toHaveBeenCalledTimes(1);
    });

    it.each([
      [{ outcome: 'invalid-data' } as const, 'Datos inválidos'],
      [{ outcome: 'unreconstructable' } as const, 'Archivo no reconstruible'],
    ])('shows %o and retries from scratch', async (result, title) => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set(result);
      await setup(manager);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
      // Assert
      expect(screen.getByRole('alert').textContent).toContain(title);
      expect(manager.retry).toHaveBeenCalledTimes(1);
    });

    it('on a full storage downloads the received file that could not be saved', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('result');
      manager.result.set({ outcome: 'storage-full', file });
      await setup(manager);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Descargar archivo' }));
      // Assert
      expect(download).toHaveBeenCalledTimes(1);
      const downloaded = download.mock.calls[0][0] as File;
      expect(downloaded.name).toBe('foto.png');
      expect(downloaded.type).toBe('image/png');
      expect(downloaded.size).toBe(4);
    });
  });

  describe('camera errors', () => {
    it.each([
      ['permission-denied', /permiso para usar la cámara/],
      ['no-camera', /No se encontró una cámara/],
      ['unsupported', /no es compatible/],
    ] as const)(
      'shows a clear message for %s and does not offer the reading controls',
      async (code, message) => {
        // Arrange
        const manager = createManager();
        manager.phase.set('idle');
        manager.cameraError.set(code);
        // Act
        await setup(manager);
        // Assert
        expect(screen.getByRole('alert').textContent).toMatch(message);
        expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
        expect(screen.queryByText('Esperando el primer QR…')).toBeNull();
      },
    );

    it('retries the reading from the error message', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('idle');
      manager.cameraError.set('permission-denied');
      await setup(manager);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
      // Assert
      expect(manager.start).toHaveBeenCalledTimes(2);
    });
  });
});

import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { TestBed } from '@angular/core/testing';
function TestBedRouter(): Router {
  return TestBed.inject(Router);
}
