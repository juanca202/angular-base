import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('jsqr', () => ({ default: vi.fn() }));

import jsQR from 'jsqr';
import { QrDecoder } from '@/features/receive/services/qr-decoder';

const frame = { data: new Uint8ClampedArray(16), width: 2, height: 2 };

describe('QrDecoder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(jsQR).mockReset();
  });

  describe('with BarcodeDetector available', () => {
    it('returns the bytes of the detected QR using the raw value as latin1', async () => {
      // Arrange
      const detect = vi.fn().mockResolvedValue([{ rawValue: 'AÿB' }]);
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public detect = detect;
        },
      );
      const video = {} as HTMLVideoElement;
      // Act
      const bytes = await new QrDecoder().decode(video);
      // Assert
      expect(bytes).toEqual(Uint8Array.of(0x41, 0xff, 0x42));
      expect(detect).toHaveBeenCalledWith(video);
      expect(jsQR).not.toHaveBeenCalled();
    });

    it('returns null when no QR is detected', async () => {
      // Arrange
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public detect = vi.fn().mockResolvedValue([]);
        },
      );
      // Act
      const bytes = await new QrDecoder().decode({} as HTMLVideoElement);
      // Assert
      expect(bytes).toBeNull();
    });
  });

  describe('without BarcodeDetector', () => {
    it('falls back to jsQR and returns its binary data', async () => {
      // Arrange
      vi.stubGlobal('BarcodeDetector', undefined);
      vi.mocked(jsQR).mockReturnValue({ binaryData: [1, 2, 3] } as ReturnType<typeof jsQR>);
      const decoder = new QrDecoder();
      vi.spyOn(decoder, 'grabFrame').mockReturnValue(frame);
      // Act
      const bytes = await decoder.decode({} as HTMLVideoElement);
      // Assert
      expect(bytes).toEqual(Uint8Array.of(1, 2, 3));
      expect(jsQR).toHaveBeenCalledWith(frame.data, 2, 2, { inversionAttempts: 'dontInvert' });
    });

    it('returns null when jsQR finds nothing', async () => {
      // Arrange
      vi.stubGlobal('BarcodeDetector', undefined);
      vi.mocked(jsQR).mockReturnValue(null);
      const decoder = new QrDecoder();
      vi.spyOn(decoder, 'grabFrame').mockReturnValue(frame);
      // Act
      const bytes = await decoder.decode({} as HTMLVideoElement);
      // Assert
      expect(bytes).toBeNull();
    });
  });
});
