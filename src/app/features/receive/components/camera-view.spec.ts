import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CameraView } from '@/features/receive/components/camera-view';
import { QrDecoder, QrLocation } from '@/features/receive/services/qr-decoder';

describe('CameraView', () => {
  const setup = async (value: QrLocation | null) => {
    const location = signal<QrLocation | null>(value);
    const view = await render(CameraView, {
      providers: [{ provide: QrDecoder, useValue: { location: location.asReadonly() } }],
    });
    return view.container;
  };

  it('draws no frame while no QR is detected', async () => {
    // Act
    const container = await setup(null);
    // Assert
    expect(container.querySelector('svg')).toBeNull();
  });

  it('draws a frame over every detected QR', async () => {
    // Act
    const container = await setup({
      boxes: [
        { x: 10, y: 20, width: 100, height: 90 },
        { x: 300, y: 40, width: 60, height: 60 },
      ],
      width: 640,
      height: 480,
    });
    // Assert
    const rects = Array.from(container.querySelectorAll('svg rect'));
    expect(rects.map((r) => [r.getAttribute('x'), r.getAttribute('y')])).toEqual([
      ['10', '20'],
      ['300', '40'],
    ]);
    expect(rects[0].getAttribute('width')).toBe('100');
    expect(rects[0].getAttribute('height')).toBe('90');
  });

  it('keeps the frame aligned with the cropped video', async () => {
    // Act
    const container = await setup({
      boxes: [{ x: 1, y: 1, width: 1, height: 1 }],
      width: 640,
      height: 480,
    });
    // Assert
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 640 480');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice');
  });
});
