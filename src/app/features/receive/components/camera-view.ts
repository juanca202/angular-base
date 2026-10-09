import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { QrDecoder } from '@/features/receive/services/qr-decoder';

/**
 * Live preview of the camera. A frame is drawn over each QR only while the camera detects it. The video element is exposed so the reception can
 * attach the camera stream to it.
 */
@Component({
  selector: 'app-camera-view',
  template: `
    <div class="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-black">
      <video
        #video
        class="size-full object-cover"
        autoplay
        [muted]="true"
        playsinline
        aria-label="Vista de la cámara"
        i18n-aria-label
      ></video>
      @if (location(); as detected) {
        <svg
          class="pointer-events-none absolute inset-0 size-full"
          [attr.viewBox]="'0 0 ' + detected.width + ' ' + detected.height"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          @for (box of detected.boxes; track $index) {
            <rect
              [attr.x]="box.x"
              [attr.y]="box.y"
              [attr.width]="box.width"
              [attr.height]="box.height"
              rx="12"
              fill="none"
              stroke="white"
              stroke-width="6"
            />
          }
        </svg>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class CameraView {
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  /** Where the camera sees QR codes right now, in video pixels. */
  protected readonly location = inject(QrDecoder).location;

  /** Video element where the camera stream is shown. */
  public get video(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }
}
