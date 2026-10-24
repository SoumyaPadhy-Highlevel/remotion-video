// Easing curves, springs, colour blends and a seeded random. Interpolation, mixing, springs, stagger and colour mixing come from
// Motion (transform, mix, spring, stagger, mixColor); everything in this video stays a pure function of time `t` (seconds),
// because Remotion renders each frame on its own.
import { clamp, cubicBezier, mixColor, spring } from "motion";

// The video's cubic curves as Motion beziers (within 1 % of the exact cubics; Motion's built-in easeIn/Out are much softer).
export const easeOut = cubicBezier(0.33, 1, 0.68, 1);
export const easeIn = cubicBezier(0.32, 0, 0.67, 0);
export const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
export const easeOutBack = cubicBezier(0.34, 1.56, 0.64, 1);
export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
/** For the held middle of a keyframe list, e.g. `ease: [easeOut, linear, easeIn]`. */
export const linear = (k: number) => k;

const springs = new Map<string, ReturnType<typeof spring>>();
/** 0 → 1 of a Motion spring released at `at` (seconds): it arrives in about `visualDuration` s, overshoots by `bounce`
 *  (0 = none, 0.3 = lively) and settles. Use it as the `k` of a `mix`; it can go past 1 while it settles. */
export const springAt = (t: number, at: number, visualDuration = 0.5, bounce = 0.25) => {
  if (t < at) return 0;
  const key = `${visualDuration}|${bounce}`;
  let g = springs.get(key);
  if (!g) springs.set(key, (g = spring({ keyframes: [0, 1], visualDuration, bounce })));
  return g.next((t - at) * 1000).value;
};

/** Motion's mixColor from `from` to `to` at `p` (0–1) as a CSS colour. Colours must be hex or rgb(), not CSS variables. */
export const blend = (from: string, to: string, p: number) => String(mixColor(from, to)(clamp(0, 1, p)));

/** Deterministic pseudo-random number in [0, 1). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
