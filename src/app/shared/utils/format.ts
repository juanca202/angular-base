/**
 * Formats a duration in seconds as minutes and seconds.
 *
 * @param totalSeconds - Duration in seconds.
 */
export function formatSeconds(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}
