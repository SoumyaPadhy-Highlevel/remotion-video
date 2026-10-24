// Easing curves and a seeded random. Interpolation, mixing and springs come from Motion (transform, mix, spring); everything
// in this video stays a pure function of time `t` (seconds), because Remotion renders each frame on its own.
import { cubicBezier } from "motion";

// The video's cubic curves as Motion beziers (within 1 % of the exact cubics; Motion's built-in easeIn/Out are much softer).
export const easeOut = cubicBezier(0.33, 1, 0.68, 1);
export const easeIn = cubicBezier(0.32, 0, 0.67, 0);
export const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
export const easeOutBack = cubicBezier(0.34, 1.56, 0.64, 1);
export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);

/** Deterministic pseudo-random number in [0, 1). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
