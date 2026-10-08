import { signal, WritableSignal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CameraErrorCode } from '@/features/receive/models/camera-error';
import {
  EMPTY_RECEIVE_PROGRESS,
  PendingTransfer,
  ReceivePhase,
  ReceiveProgress,
} from '@/features/receive/models/receive-state';
import { ReceivePage } from '@/features/receive/components/receive-page';
import { ReceiveManager } from '@/features/receive/services/receive-manager';

interface FakeManager {
  phase: WritableSignal<ReceivePhase>;
  progress: WritableSignal<ReceiveProgress>;
  pending: WritableSignal<PendingTransfer | null>;
  result: WritableSignal<null>;
  cameraError: WritableSignal<CameraErrorCode | null>;
  start: ReturnType<typeof vi.fn>;
  confirm: ReturnType<typeof vi.fn>;
  discard: ReturnType<typeof vi.fn>;
  finishReading: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
}

function createManager(): FakeManager {
  return {
    phase: signal<ReceivePhase>('reading'),
    progress: signal<ReceiveProgress>(EMPTY_RECEIVE_PROGRESS),
    pending: signal<PendingTransfer | null>(null),
    result: signal(null),
    cameraError: signal<CameraErrorCode | null>(null),
    start: vi.fn().mockResolvedValue(undefined),
    confirm: vi.fn().mockResolvedValue(undefined),
    discard: vi.fn(),
    finishReading: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
  };
}

const reading: ReceiveProgress = {
  name: 'informe-q3.pdf',
  size: 1_258_291,
  received: 268,
  total: 412,
  percent: 65,
  remainingSeconds: 70,
};

describe('ReceivePage', () => {
  const setup = async (manager = createManager()) => {
    const view = await render(ReceivePage, {
      providers: [provideRouter([]), { provide: ReceiveManager, useValue: manager }],
    });
    return { ...view, manager };
  };

  afterEach(() => vi.restoreAllMocks());

  it('activates the camera on entering, on the video element of the screen', async () => {
    // Act
    const { manager, container } = await setup();
    // Assert
    expect(manager.start).toHaveBeenCalledTimes(1);
    expect(manager.start).toHaveBeenCalledWith(container.querySelector('video'));
    expect(screen.getByText('Apunta al QR del emisor')).toBeTruthy();
  });

  it('waits for the first QR with an empty progress', async () => {
    // Act
    await setup();
    // Assert
    expect(screen.getByText('Esperando el primer QR…')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Progreso de la recepción' }).getAttribute('value'),
    ).toBe('0');
    expect(screen.getByText('0 %')).toBeTruthy();
  });

  it('shows name, total size, estimated time, fragments and progress with its percentage', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    expect(screen.getByText('informe-q3.pdf')).toBeTruthy();
    expect(screen.getByText(/1\.2 MB/)).toBeTruthy();
    expect(screen.getByText(/268\s+de\s+412\s+fragmentos/)).toBeTruthy();
    expect(screen.getByText(/~1 min 10 s/)).toBeTruthy();
    expect(screen.getByText('65 %')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Progreso de la recepción' }).getAttribute('value'),
    ).toBe('65');
  });

  it('hides the fragment count on narrow screens, keeping name, size, time and percentage', async () => {
    // Arrange
    const manager = createManager();
    manager.progress.set(reading);
    // Act
    await setup(manager);
    // Assert
    const fragments = screen.getByText(/268 de 412 fragmentos/);
    expect(fragments?.className).toContain('sm:inline');
    expect(screen.getByText('informe-q3.pdf').className).not.toContain('hidden');
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

  describe('confirmation notice', () => {
    it('does not show the notice when no transfer is waiting', async () => {
      // Act
      await setup();
      // Assert
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('asks to confirm the name and size, and lets the user confirm', async () => {
      // Arrange
      const manager = createManager();
      manager.pending.set({ name: 'informe-q3.pdf', type: 'application/pdf', size: 1_258_291 });
      await setup(manager);
      // Assert
      expect(screen.getByRole('alert').textContent).toContain('«informe-q3.pdf» (1.2 MB)');
      expect(screen.getByText('Hasta confirmar no se guarda nada.')).toBeTruthy();
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
      // Assert
      expect(manager.confirm).toHaveBeenCalledTimes(1);
    });

    it('lets the user discard the transfer', async () => {
      // Arrange
      const manager = createManager();
      manager.pending.set({ name: 'x.bin', type: '', size: 10 });
      await setup(manager);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
      // Assert
      expect(manager.discard).toHaveBeenCalledTimes(1);
    });

    it('stays visible and keeps the progress updating while waiting', async () => {
      // Arrange
      const manager = createManager();
      manager.pending.set({ name: 'x.bin', type: '', size: 10 });
      manager.progress.set({ ...reading, received: 3, percent: 1 });
      const { fixture } = await setup(manager);
      // Act
      manager.progress.set({ ...reading, received: 150, percent: 36 });
      fixture.detectChanges();
      // Assert
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText('36 %')).toBeTruthy();
    });
  });

  describe('actions', () => {
    it('ends the reading with «Terminar lectura»', async () => {
      // Arrange
      const { manager } = await setup();
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Terminar lectura' }));
      // Assert
      expect(manager.finishReading).toHaveBeenCalledTimes(1);
    });

    it('cancels without asking for confirmation and goes back to the start', async () => {
      // Arrange
      const { manager } = await setup();
      const navigate = vi.spyOn(TestBedRouter(), 'navigateByUrl').mockResolvedValue(true);
      // Act
      await fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      // Assert
      expect(manager.cancel).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('cannot end the reading or cancel while the file is being finished', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('finishing');
      await setup(manager);
      // Assert
      expect(
        (screen.getByRole('button', { name: 'Terminar lectura' }) as HTMLButtonElement).disabled,
      ).toBe(true);
      expect((screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it('cannot end the reading while the camera is still opening', async () => {
      // Arrange
      const manager = createManager();
      manager.phase.set('starting');
      await setup(manager);
      // Assert
      expect(
        (screen.getByRole('button', { name: 'Terminar lectura' }) as HTMLButtonElement).disabled,
      ).toBe(true);
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
        expect(screen.queryByRole('button', { name: 'Terminar lectura' })).toBeNull();
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

import { TestBed } from '@angular/core/testing';
function TestBedRouter(): Router {
  return TestBed.inject(Router);
}
