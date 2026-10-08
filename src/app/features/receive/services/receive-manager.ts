import { Service, inject, signal } from '@angular/core';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { CameraError, CameraErrorCode } from '@/features/receive/models/camera-error';
import {
  EMPTY_RECEIVE_PROGRESS,
  PendingTransfer,
  ReceivePhase,
  ReceiveProgress,
  ReceiveResult,
} from '@/features/receive/models/receive-state';
import { QrCameraReader } from '@/features/receive/services/qr-camera-reader';
import { ReceivedFileSaver } from '@/features/receive/services/received-file-saver';
import { FragmentAssembler, parseFragment } from '@/shared/utils/qr-protocol';

/**
 * Orchestrates one reception: camera, reassembly, confirmation of the transfer, result and saving.
 *
 * Every transfer seen by the camera gets its own assembler, so a foreign sequence in frame never mixes
 * with the user's. Nothing is completed or saved until the user confirms the transfer, and the partial
 * fragments live only in memory: they are dropped on cancel, retry or when the page is left.
 *
 * Only a verified file is saved and registered; «incomplete», «invalid data» and «unreconstructable»
 * save nothing. The screen drives it through `start`, `confirm`, `discard`, `finishReading`,
 * `continueScanning`, `retry` and `cancel`, and renders its signals.
 */
@Service()
export class ReceiveManager {
  private readonly reader = inject(QrCameraReader);
  private readonly saver = inject(ReceivedFileSaver);

  private readonly _phase = signal<ReceivePhase>('idle');
  private readonly _progress = signal<ReceiveProgress>(EMPTY_RECEIVE_PROGRESS);
  private readonly _pending = signal<PendingTransfer | null>(null);
  private readonly _result = signal<ReceiveResult | null>(null);
  private readonly _cameraError = signal<CameraErrorCode | null>(null);

  /** Where the reception is. */
  public readonly phase = this._phase.asReadonly();
  /** Progress of the transfer being received (or of the one waiting for confirmation). */
  public readonly progress = this._progress.asReadonly();
  /** Transfer waiting for the user to confirm or discard it, if any. */
  public readonly pending = this._pending.asReadonly();
  /** Result of the reception once it ended. */
  public readonly result = this._result.asReadonly();
  /** Why the camera could not start, if it could not. */
  public readonly cameraError = this._cameraError.asReadonly();

  private assemblers = new Map<number, FragmentAssembler>();
  private firstSeenAt = new Map<number, number>();
  private discarded = new Set<number>();
  private activeId: number | null = null;
  private pendingId: number | null = null;
  private video: HTMLVideoElement | null = null;

  /**
   * Opens the camera and starts reading. Ignored while a reception is running.
   *
   * A camera that cannot be used leaves the reception stopped and the reason in {@link cameraError}.
   *
   * @param video - Video element where the camera preview is shown.
   */
  public async start(video: HTMLVideoElement): Promise<void> {
    if (this._phase() !== 'idle') {
      return;
    }
    this.video = video;
    this._cameraError.set(null);
    this.resetTransfers();
    await this.openCamera(video);
  }

  /** Accepts the transfer waiting for confirmation; if it is already complete, it ends right away. */
  public async confirm(): Promise<void> {
    if (this.pendingId === null) {
      return;
    }
    this.activeId = this.pendingId;
    this.pendingId = null;
    for (const id of [...this.assemblers.keys()]) {
      if (id !== this.activeId) {
        this.assemblers.delete(id);
        this.firstSeenAt.delete(id);
      }
    }
    this.refresh();
    if (this.isActiveComplete()) {
      await this.complete();
    }
  }

  /** Discards the transfer waiting for confirmation and ignores its fragments from now on. */
  public discard(): void {
    if (this.pendingId === null) {
      return;
    }
    this.discarded.add(this.pendingId);
    this.assemblers.delete(this.pendingId);
    this.firstSeenAt.delete(this.pendingId);
    this.pendingId = null;
    this.updatePending();
    this.refresh();
  }

  /** The user ends the reading: with fragments missing the result is «incomplete». */
  public async finishReading(): Promise<void> {
    if (this._phase() !== 'reading') {
      return;
    }
    if (this.activeId === null) {
      this.reader.stop();
      this._result.set({ outcome: 'incomplete', progress: this.leadingProgress() });
      this._phase.set('result');
      return;
    }
    await this.complete();
  }

  /** After «incomplete», reads again keeping the valid fragments already received. */
  public async continueScanning(): Promise<void> {
    if (this._phase() !== 'result' || this._result()?.outcome !== 'incomplete' || !this.video) {
      return;
    }
    this._result.set(null);
    await this.openCamera(this.video);
  }

  /** After an error, starts over from scratch without the previous fragments. */
  public async retry(): Promise<void> {
    if (this._phase() !== 'result' || !this.video) {
      return;
    }
    const video = this.video;
    this.resetTransfers();
    this._result.set(null);
    await this.openCamera(video);
  }

  /** Cancels at any moment, without confirmation: stops, drops partial data and releases the camera. */
  public cancel(): void {
    this.reader.stop();
    this.resetTransfers();
    this._result.set(null);
    this._cameraError.set(null);
    this._phase.set('idle');
  }

  private async openCamera(video: HTMLVideoElement): Promise<void> {
    this._phase.set('starting');
    try {
      await this.reader.start(video, (bytes) => this.onQr(bytes));
    } catch (error) {
      if (this._phase() === 'starting') {
        this._phase.set('idle');
      }
      if (error instanceof CameraError) {
        this._cameraError.set(error.code);
        return;
      }
      throw error;
    }
    if (this._phase() === 'starting') {
      this._phase.set('reading');
    }
  }

  private onQr(bytes: Uint8Array): void {
    if (this._phase() !== 'reading') {
      return;
    }
    const fragment = parseFragment(bytes);
    if (!fragment) {
      return;
    }
    const id = fragment.transferId;
    if (this.discarded.has(id) || (this.activeId !== null && id !== this.activeId)) {
      return;
    }
    let assembler = this.assemblers.get(id);
    if (!assembler) {
      assembler = new FragmentAssembler(id);
      this.assemblers.set(id, assembler);
      this.firstSeenAt.set(id, Date.now());
    }
    if (assembler.accept(bytes) !== 'accepted') {
      return;
    }
    this.updatePending();
    this.refresh();
    if (this.isActiveComplete()) {
      void this.complete();
    }
  }

  private async complete(): Promise<void> {
    const assembler = this.activeId === null ? undefined : this.assemblers.get(this.activeId);
    if (!assembler) {
      return;
    }
    this._phase.set('finishing');
    this.reader.stop();
    const reception = await assembler.finish();
    if (reception.outcome === 'completed') {
      this._result.set(await this.save(reception.file));
    } else {
      this._result.set(reception);
    }
    this._phase.set('result');
  }

  private async save(
    file: Extract<ReceiveResult, { outcome: 'completed' }>['file'],
  ): Promise<ReceiveResult> {
    try {
      return { outcome: 'completed', record: await this.saver.save(file), file };
    } catch (error) {
      return { outcome: error instanceof StorageQuotaError ? 'storage-full' : 'save-failed', file };
    }
  }

  private isActiveComplete(): boolean {
    const assembler = this.activeId === null ? undefined : this.assemblers.get(this.activeId);
    const { received, total } = assembler?.progress ?? { received: 0, total: 0 };
    return total > 0 && received === total;
  }

  /** Elects the first transfer with readable metadata as the one to confirm, unless one is already chosen. */
  private updatePending(): void {
    if (this.activeId !== null || this.pendingId !== null) {
      return;
    }
    for (const [id, assembler] of this.assemblers) {
      if (assembler.metadata) {
        this.pendingId = id;
        return;
      }
    }
  }

  /** Assembler whose progress is shown: the confirmed one, else the pending one, else the most advanced. */
  private displayed(): { id: number; assembler: FragmentAssembler } | null {
    const id = this.activeId ?? this.pendingId;
    if (id !== null) {
      const assembler = this.assemblers.get(id);
      return assembler ? { id, assembler } : null;
    }
    let best: { id: number; assembler: FragmentAssembler } | null = null;
    for (const [candidate, assembler] of this.assemblers) {
      if (!best || assembler.progress.received > best.assembler.progress.received) {
        best = { id: candidate, assembler };
      }
    }
    return best;
  }

  private leadingProgress(): { received: number; total: number } {
    return this.displayed()?.assembler.progress ?? { received: 0, total: 0 };
  }

  private refresh(): void {
    const pending =
      this.pendingId === null ? null : (this.assemblers.get(this.pendingId)?.metadata ?? null);
    this._pending.set(pending);
    const shown = this.displayed();
    if (!shown) {
      this._progress.set(EMPTY_RECEIVE_PROGRESS);
      return;
    }
    const { received, total } = shown.assembler.progress;
    const metadata = shown.assembler.metadata;
    this._progress.set({
      name: metadata?.name ?? null,
      size: metadata?.size ?? null,
      received,
      total,
      percent: total > 0 ? Math.round((received / total) * 100) : 0,
      remainingSeconds: this.remainingSeconds(shown.id, received, total),
    });
  }

  private remainingSeconds(id: number, received: number, total: number): number | null {
    const elapsed = (Date.now() - (this.firstSeenAt.get(id) ?? Date.now())) / 1000;
    if (received < 2 || elapsed <= 0 || total <= received) {
      return received >= total && total > 0 ? 0 : null;
    }
    return Math.ceil((total - received) / ((received - 1) / elapsed));
  }

  private resetTransfers(): void {
    this.assemblers = new Map();
    this.firstSeenAt = new Map();
    this.discarded = new Set();
    this.activeId = null;
    this.pendingId = null;
    this._pending.set(null);
    this._progress.set(EMPTY_RECEIVE_PROGRESS);
  }
}
