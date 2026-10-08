import { Component, DestroyRef, computed, inject, input } from '@angular/core';
import { Icon } from '@factor_ec/ui';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';

/**
 * Preview of a received file: the picture when it is an image, otherwise a file icon with its name.
 * Clicking it opens the file (shown when its type is passive, downloaded otherwise).
 */
@Component({
  selector: 'app-file-preview',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="mx-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-gray-300 p-4 hover:bg-gray-50"
      (click)="open()"
    >
      @if (imageUrl(); as url) {
        <img [src]="url" [alt]="file().name" class="max-h-64 max-w-full object-contain" />
      } @else {
        <ft-icon name="document" class="ft-icon--5" aria-hidden="true" />
      }
      <span class="break-all font-medium">{{ file().name }}</span>
    </button>
  `,
  host: { class: 'block' },
})
export class FilePreview {
  private readonly opener = inject(SafeFileOpener);

  /** Received file to preview. */
  public readonly file = input.required<File>();

  private url: string | null = null;

  protected readonly imageUrl = computed(() => {
    this.release();
    const file = this.file();
    if (this.opener.previewKind(file.type) !== 'image') {
      return null;
    }
    this.url = URL.createObjectURL(file);
    return this.url;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.release());
  }

  protected open(): void {
    this.opener.open(this.file());
  }

  private release(): void {
    if (this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
  }
}
