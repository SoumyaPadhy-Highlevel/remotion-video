/** Sample continuous motion between captured frames, without crossing a shot.
 * Rounding the index introduces a repeated-position cadence at 0.85x/0.83x.
 * Discrete UI states still use the shot's nearest frame in their callers.
 */
export const sampleFilmTrack = (values: readonly number[], frame: number, stride: number): number[] => {
  const last = Math.floor(values.length / stride) - 1;
  if (last < 0) return [];
  const at = Math.max(0, Math.min(last, frame)), a = Math.floor(at), b = Math.min(last, a + 1), k = at - a;
  return Array.from({length: stride}, (_, i) => values[a * stride + i] + (values[b * stride + i] - values[a * stride + i]) * k);
};
