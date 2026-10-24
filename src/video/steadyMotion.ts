import type { MotionCfg } from "./config";

/** Reading a new line should not move the camera. Keep the deliberate opening,
 * map-build split and ending, while removing repeated title-driven framing resets. */
export const withSteadyMotion = (motion: MotionCfg): MotionCfg => ({
  ...motion,
  window: { ...motion.window, introPush: 0, firstDropPunch: 0, dropPunch: 0, hitPunch: 0 },
  recedeIntro: { ...motion.recedeIntro, shrink: 0 },
  recedeCards: { ...motion.recedeCards, shrink: 0 },
  introCallouts: { ...motion.introCallouts, push: 1 },
  pushIns: Object.fromEntries(Object.entries(motion.pushIns).map(([key, zoom]) => [key, { ...zoom, on: false }])) as MotionCfg["pushIns"],
  shake: { ...motion.shake, x: 0, y: 0 },
  titles: { ...motion.titles, mode: "calm", pulse: 0, rise: 0.15, exitLift: 0.1, tilt: 0, blur: 0, letterDelay: 0, duration: 0.3 },
});
