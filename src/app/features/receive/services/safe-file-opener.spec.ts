import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FileExport } from '@/core/services/file-export';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';

function fileOf(name: string, type: string, content = 'x'): File {
  return new File([content], name, { type });
}

describe('SafeFileOpener', () => {
  let opener: SafeFileOpener;
  let download: ReturnType<typeof vi.fn>;
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    download = vi.fn();
    open = vi.spyOn(window, 'open').mockReturnValue(null) as unknown as ReturnType<typeof vi.fn>;
    URL.createObjectURL = vi.fn(() => 'blob:fake');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: FileExport, useValue: { download } }],
    });
    opener = TestBed.inject(SafeFileOpener);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('open', () => {
    it.each([
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ])('shows a %s file in a new tab detached from the app', (type) => {
      // Act
      opener.open(fileOf('a', type));
      // Assert
      expect(open).toHaveBeenCalledWith('blob:fake', '_blank', 'noopener');
      expect(download).not.toHaveBeenCalled();
    });

    it('treats the type case-insensitively and ignores its parameters', () => {
      // Act
      opener.open(fileOf('a.txt', 'Text/Plain; charset=utf-8'));
      // Assert
      expect(open).toHaveBeenCalled();
    });

    it.each([
      'image/svg+xml',
      'text/html',
      'application/xhtml+xml',
      'application/octet-stream',
      'text/javascript',
      '',
    ])(
      'downloads a file of type "%s" instead of showing it, so no script can run in the app origin',
      (type) => {
        // Arrange
        const file = fileOf('a', type);
        // Act
        opener.open(file);
        // Assert
        expect(download).toHaveBeenCalledWith(file);
        expect(open).not.toHaveBeenCalled();
      },
    );

    it('releases the object URL after a while', () => {
      // Act
      opener.open(fileOf('a.png', 'image/png'));
      vi.advanceTimersByTime(60_000);
      // Assert
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
    });
  });

  describe('previewKind', () => {
    it.each([
      ['image/png', 'image'],
      ['image/jpeg', 'image'],
      ['image/svg+xml', 'image'],
      ['application/pdf', 'file'],
      ['text/html', 'file'],
      ['', 'file'],
    ])('classifies %s as %s', (type, kind) => {
      expect(opener.previewKind(type)).toBe(kind);
    });
  });
});
