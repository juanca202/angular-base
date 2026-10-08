import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilePreview } from '@/features/receive/components/file-preview';
import { SafeFileOpener } from '@/features/receive/services/safe-file-opener';

function fileOf(name: string, type: string): File {
  return new File(['contenido'], name, { type });
}

describe('FilePreview', () => {
  const open = vi.fn();

  beforeEach(() => {
    open.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  const setup = (file: File) =>
    render(FilePreview, {
      inputs: { file },
      providers: [
        {
          provide: SafeFileOpener,
          useValue: {
            open,
            previewKind: (type: string) => (type.startsWith('image/') ? 'image' : 'file'),
          },
        },
      ],
    });

  it('shows the picture when the file is an image', async () => {
    // Act
    await setup(fileOf('foto.png', 'image/png'));
    // Assert
    const image = screen.getByRole('img', { name: 'foto.png' }) as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('blob:preview');
  });

  it('shows an SVG as a picture, which never runs the scripts inside it', async () => {
    // Act
    await setup(fileOf('dibujo.svg', 'image/svg+xml'));
    // Assert
    expect(screen.getByRole('img', { name: 'dibujo.svg' }).tagName).toBe('IMG');
  });

  it('shows a file icon with the name when the file is not an image', async () => {
    // Act
    await setup(fileOf('informe.pdf', 'application/pdf'));
    // Assert
    expect(screen.queryByRole('img', { name: 'informe.pdf' })).toBeNull();
    expect(screen.getByText('informe.pdf')).toBeTruthy();
  });

  it('opens the file when the preview is clicked', async () => {
    // Arrange
    const file = fileOf('informe.pdf', 'application/pdf');
    await setup(file);
    // Act
    await fireEvent.click(screen.getByRole('button', { name: /informe\.pdf/ }));
    // Assert
    expect(open).toHaveBeenCalledWith(file);
  });

  it('releases the picture URL when the preview is destroyed', async () => {
    // Arrange
    const { fixture } = await setup(fileOf('foto.png', 'image/png'));
    // Act
    fixture.destroy();
    // Assert
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
