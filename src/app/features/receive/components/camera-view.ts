import { Component, ElementRef, viewChild } from '@angular/core';

/**
 * Live preview of the camera with a reading frame. The video element is exposed so the reception can
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
        muted
        playsinline
        aria-label="Vista de la cámara"
        i18n-aria-label
      ></video>
      <div
        class="pointer-events-none absolute inset-6 rounded-lg border-4 border-white/90"
        aria-hidden="true"
      ></div>
    </div>
  `,
  host: { class: 'block' },
})
export class CameraView {
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  /** Video element where the camera stream is shown. */
  public get video(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }
}
