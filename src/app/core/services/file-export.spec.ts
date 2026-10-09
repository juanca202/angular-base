import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileExport } from '@/core/services/file-export';

describe('FileExport', () => {
  let service: FileExport;
  let anchor: HTMLAnchorElement;
  let click: ReturnType<typeof vi.fn>;
  let createUrl: ReturnType<typeof vi.fn>;
  let revokeUrl: ReturnType<typeof vi.fn>;

  const file = (name = 'informe.pdf') => new File(['contenido'], name, { type: 'application/pdf' });

  beforeEach(() => {
    click = vi.fn();
    anchor = Object.assign(document.createElement('a'), { click });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    createUrl = vi.fn(() => 'blob:fake');
    revokeUrl = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileExport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('download', () => {
    it('descarga con el nombre original, incluidos espacios, acentos y varios puntos', () => {
      const exported = file('Informe final – año 2026.v2.pdf');

      service.download(exported);

      expect(anchor.download).toBe('Informe final – año 2026.v2.pdf');
      expect(createUrl).toHaveBeenCalledWith(exported);
      expect(anchor.href).toContain('blob:fake');
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('libera la URL de objeto tras un plazo, no al instante', () => {
      vi.useFakeTimers();
      try {
        service.download(file());

        expect(revokeUrl).not.toHaveBeenCalled();
        vi.advanceTimersByTime(60_000);
        expect(revokeUrl).toHaveBeenCalledWith('blob:fake');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('compartir', () => {
    it('informa si el navegador ofrece compartir', () => {
      vi.stubGlobal('navigator', { share: vi.fn(), canShare: vi.fn() });
      expect(service.isShareAvailable()).toBe(true);

      vi.stubGlobal('navigator', {});
      expect(service.isShareAvailable()).toBe(false);
    });

    it('no está disponible si el navegador no admite compartir archivos', () => {
      vi.stubGlobal('navigator', {});

      expect(service.canShare(file())).toBe(false);
    });

    it('no está disponible si canShare rechaza los archivos', () => {
      vi.stubGlobal('navigator', { share: vi.fn(), canShare: vi.fn(() => false) });

      expect(service.canShare(file())).toBe(false);
    });

    it('está disponible si el navegador admite compartir el archivo', () => {
      const exported = file();
      const canShare = vi.fn(() => true);
      vi.stubGlobal('navigator', { share: vi.fn(), canShare });

      expect(service.canShare(exported)).toBe(true);
      expect(canShare).toHaveBeenCalledWith({ files: [exported] });
    });

    it('comparte el archivo con su nombre original y devuelve true', async () => {
      const exported = file('Informe final – año 2026.v2.pdf');
      const share = vi.fn(async () => undefined);
      vi.stubGlobal('navigator', { share, canShare: () => true });

      const shared = await service.share(exported);

      expect(shared).toBe(true);
      expect(share).toHaveBeenCalledWith({ files: [exported] });
      expect((share.mock.calls[0] as unknown as [{ files: File[] }])[0].files[0].name).toBe(
        'Informe final – año 2026.v2.pdf',
      );
    });

    it('trata cerrar la hoja sin elegir aplicación como una cancelación sin efectos', async () => {
      const share = vi.fn(async () => {
        throw new DOMException('cancelado', 'AbortError');
      });
      vi.stubGlobal('navigator', { share, canShare: () => true });

      await expect(service.share(file())).resolves.toBe(false);
      expect(click).not.toHaveBeenCalled();
    });

    it('propaga los errores de compartir que no son una cancelación', async () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(async () => {
          throw new DOMException('sin permiso', 'NotAllowedError');
        }),
        canShare: () => true,
      });

      await expect(service.share(file())).rejects.toThrow('sin permiso');
    });
  });

  it('no genera ninguna salida mientras no se llame a download o share', () => {
    expect(click).not.toHaveBeenCalled();
    expect(createUrl).not.toHaveBeenCalled();
  });
});
