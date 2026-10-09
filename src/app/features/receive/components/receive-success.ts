import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FileExport } from '@/core/services/file-export';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';
import { formatSize } from '@/shared/utils/format-size';

/**
 * Message shown when a reception ended well: says that the file was received, verified and saved, and
 * offers to view it (shown when its type is passive, downloaded otherwise) or to download it.
 */
@Component({
  selector: 'app-receive-success',
  imports: [MatButtonModule],
  template: `
    <section
      role="status"
      class="flex flex-col gap-3 rounded-lg border border-green-300 bg-green-50 p-4 text-green-950"
    >
      <h2 class="text-xl font-semibold" i18n>Archivo recibido correctamente</h2>
      <p i18n>«{{ file().name }}» ({{ size() }}) se verificó y se guardó en el historial.</p>
      <div class="flex flex-wrap gap-3">
        <button type="button" matButton="filled" (click)="view()" i18n>Ver archivo</button>
        <button type="button" matButton="outlined" (click)="download()" i18n>Descargar</button>
      </div>
    </section>
  `,
  host: { class: 'block' },
})
export class ReceiveSuccess {
  private readonly opener = inject(SafeFileOpener);
  private readonly fileExport = inject(FileExport);

  /** Received file. */
  public readonly file = input.required<File>();

  protected readonly size = computed(() => formatSize(this.file().size));

  protected view(): void {
    this.opener.open(this.file());
  }

  protected download(): void {
    this.fileExport.download(this.file());
  }
}
