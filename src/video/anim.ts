// Small animation helpers. Everything in this video is a pure function of time `t` (seconds).
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const easeIn = (k: number) => Math.pow(clamp(k), 3);
export const easeInOut = (k: number) => {
  k = clamp(k);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
export const easeOutBack = (k: number) => {
  k = clamp(k);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
export const linear = (k: number) => clamp(k);

/** 0→1 progress of t through [a, b], eased. */
export const prog = (t: number, a: number, b: number, ease: (k: number) => number = easeInOut) =>
  ease(clamp((t - a) / (b - a)));

/** Visibility window [a, b] with fade in / fade out durations (seconds). */
export const win = (t: number, a: number, b: number, fin = 0.25, fout = 0.25) =>
  t < a || t > b ? 0 : Math.min(clamp((t - a) / fin), clamp((b - t) / fout));

/** Deterministic pseudo-random number in [0, 1). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
