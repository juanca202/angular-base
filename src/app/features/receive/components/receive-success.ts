import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Icon } from '@factor_ec/ui';
import { FileExport } from '@/core/services/file-export';
import { FilePreview } from '@/features/receive/components/file-preview';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';

/**
 * Content of the sheet shown when a reception ended well: a success mark, the message that the file
 * was received, its preview and the only two actions, «Abrir» (shown when its type is passive,
 * downloaded otherwise) and «Descargar».
 */
@Component({
  selector: 'app-receive-success',
  imports: [MatButtonModule, Icon, FilePreview],
  template: `
    <section role="status" class="flex flex-col items-center gap-4 text-center">
      <span
        class="grid size-14 place-items-center rounded-full bg-green-700 text-white"
        aria-hidden="true"
      >
        <ft-icon name="check" class="text-2xl" />
      </span>
      <p class="text-lg" i18n>
        Archivo <strong>{{ file().name }}</strong> recibido exitosamente.
      </p>
      <app-file-preview class="w-full" [file]="file()" />
      <div class="flex w-full gap-3">
        <button type="button" matButton="filled" class="grow" (click)="open()" i18n>Abrir</button>
        <button type="button" matButton="outlined" class="grow" (click)="download()" i18n>
          Descargar
        </button>
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

  protected open(): void {
    this.opener.open(this.file());
  }

  protected download(): void {
    this.fileExport.download(this.file());
  }
}
