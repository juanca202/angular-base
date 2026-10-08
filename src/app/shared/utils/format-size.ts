/**
 * Formatea un tamaño en bytes con la unidad más legible (B, KB, MB o GB).
 *
 * @param bytes - Tamaño en bytes.
 * @returns El tamaño con un decimal a partir de KB, por ejemplo `150.0 KB`.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}
