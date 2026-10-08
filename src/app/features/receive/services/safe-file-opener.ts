import { Service, inject } from '@angular/core';
import { FileExport } from '@/core/services/file-export';

/** Types the browser can show in a tab without running anything from the file. */
const VIEWABLE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'application/pdf',
  'text/plain',
]);

/** Time the object URL stays valid so the new tab can load it before it is released. */
const URL_LIFETIME_MS = 60_000;

/** How a received file is previewed: its own image, or a generic file icon with its name. */
export type PreviewKind = 'image' | 'file';

function baseType(type: string): string {
  return type.split(';')[0].trim().toLowerCase();
}

/**
 * Opens a received file without running active content.
 *
 * A file is shown in a new tab only when its type is on a short list of passive types (raster images,
 * PDF, plain text). Everything else, notably SVG and HTML, is downloaded instead: a blob URL opened as
 * a document shares the origin of the app, so a script inside would run with its privileges. The
 * preview as an `<img>` is safe for SVG because images never run scripts.
 */
@Service()
export class SafeFileOpener {
  private readonly fileExport = inject(FileExport);

  /**
   * Shows the file in a new tab when its type is passive, otherwise downloads it.
   *
   * @param file - Received file, with its original name and type.
   */
  public open(file: File): void {
    if (!VIEWABLE_TYPES.has(baseType(file.type))) {
      this.fileExport.download(file);
      return;
    }
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), URL_LIFETIME_MS);
  }

  /**
   * Tells how the preview of a file of this type is drawn.
   *
   * @param type - MIME type of the file.
   * @returns `image` when it is shown as a picture, `file` when it gets an icon with its name.
   */
  public previewKind(type: string): PreviewKind {
    const base = baseType(type);
    return base === 'image/svg+xml' || (VIEWABLE_TYPES.has(base) && base.startsWith('image/'))
      ? 'image'
      : 'file';
  }
}
