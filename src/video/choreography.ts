// Motion of the app window and the mascot, as pure functions of time t (seconds).
import { M, DROPS, INTRO_CARDS, SHAKES, TITLE_DROP } from "./script";
import { shakeAt } from "./Impact";
import { DEFAULT_CFG, MotionCfg, PUSH_KEYS } from "./config";
import { clamp, mix, transform } from "motion";
import { easeIn, easeInOut, easeOut, easeOutBack } from "./anim";

// ── App window ───────────────────────────────────────────────────────────────

/** Moments the window recedes (shrinks, dims, blurs) behind a title. [start, end, depth] */
export const RECEDES: [number, number, number][] = [
  ...INTRO_CARDS.map((c): [number, number, number] => [c.a - 0.05, c.b, c.depth ?? 0.9]), // the intro's statement cards
  [54.25, 58.1, 0.45], // behind the exploding title (held until the map build); the map still shows through
  [M.B2, M.D2 + 0.1, 1], // build to drop 2
  ...[M.D2, 122.04, M.D3].map((a): [number, number, number] => [a - 0.05, a + 1.25, 0.9]), // title cards
  [M.GAP, M.D3 + 0.1, 0.8], // "and when something breaks?"
  [M.FIN - 0.05, 163.1, 0.9], // "One more thing: just ask your map"
];

export { ZOOMS } from "./zooms";
import { ZOOMS } from "./zooms";

/** How far the window recedes behind a title right now (0–1, depth included). */
export const recedeAt = (t: number) => RECEDES.reduce((m, [a, b, depth]) => Math.max(m, transform(t, [a, a + 0.45, b - 0.45, b], [0, 1, 1, 0]) * depth), 0);

/** `plate`: no receding behind titles (the editor's base layer keeps a clean still of the platform; the titles carry a wash). */
export function windowAt(t: number, plate = false, m: MotionCfg = DEFAULT_CFG.motion) {
  const W = m.window;
  let o = 1;
  let ty = 0;
  let s = 1;
  let blur = 0;
  // Hidden during the title open, rises at 3.9 s.
  if (t < 3.9) {
    o = 0;
    ty = 120;
  } else if (t < 4.7) {
    const k = transform(t, [3.9, 4.6], [0, 1], { ease: easeOut });
    o = k;
    ty = (1 - k) * W.riseDistance;
    s = mix(W.riseStartScale, 1, k);
  }
  if (t >= 11.65 && t < M.D1) s *= 1 + W.introPush * transform(t, [11.65, M.D1 - 0.1], [0, 1], { ease: easeIn });
  if (t >= M.D1 && t < M.D1 + 0.6) s *= 1 + W.firstDropPunch * transform(t, [M.D1, M.D1 + 0.6], [1, 0], { ease: easeOut });
  for (const [a, b, depth] of plate ? [] : RECEDES) {
    const k = transform(t, [a, a + 0.45, b - 0.45, b], [0, 1, 1, 0]) * depth;
    s *= 1 - m.recedeIntro.shrink * k;
    blur = Math.max(blur, m.recedeIntro.blur * k);
    o *= 1 - m.recedeIntro.dim * k;
  }
  if (t >= M.HIT && t < M.HIT + 0.35) s *= 1 + W.hitPunch * transform(t, [M.HIT, M.HIT + 0.35], [1, 0]);
  // punch on each drop: a quick 4 % kick that settles in 0.45 s
  for (const d of DROPS) if (t >= d && t < d + W.dropPunchTime) s *= 1 + W.dropPunch * transform(t, [d, d + W.dropPunchTime], [1, 0]) ** 2;
  if (t >= M.LOGO - 0.4) {
    const k = transform(t, [M.LOGO - 0.4, M.LOGO + 0.6], [0, 1], { ease: easeInOut });
    o *= 1 - k;
    s *= 1 - W.endShrink * k;
    blur = Math.max(blur, W.endBlur * k);
  }
  let zs = 1;
  let zx = 810;
  let zy = 440;
  ZOOMS.forEach(([a, b], i) => {
    const pz = m.pushIns[PUSH_KEYS[i]];
    if (!pz?.on) return;
    const sc = pz.scale, ox = pz.focusX, oy = pz.focusY;
    const k = Math.min(transform(t, [a, a + m.pushInEase.in], [0, 1], { ease: easeInOut }), transform(t, [b - m.pushInEase.out, b], [1, 0], { ease: easeInOut }));
    if (k > 0) {
      zs = mix(1, sc, k);
      zx = ox;
      zy = oy;
    }
  });
  const [jx, jy] = shakeAt(t, [...SHAKES, TITLE_DROP.at], m.shake);
  return { opacity: o, translateY: ty + jy, translateX: jx, scale: s, zoom: zs, zoomOrigin: [zx, zy] as [number, number], blur };
}

// ── Mascot ───────────────────────────────────────────────────────────────────

export type Eyes = "normal" | "happy" | "wow" | "worried" | "star" | "squint";
export interface MascotState {
  x: number; // centre, frame px
  y: number;
  s: number; // scale of the 840×580 artwork
  r?: number; // rotation, degrees
  o?: number; // opacity
  eyes?: Eyes;
  look?: [number, number]; // eye offset
  sparkle?: number; // 0–1 sparkles around the head
  streak?: number; // 0–1 speed streak behind it
  q?: number; // 0–1 question mark
}

/** Where the mascot is and how it reacts, beat by beat. */
export function mascotAt(t: number): MascotState {
  const m: MascotState = { x: 2400, y: 600, s: 0.5, o: 1, eyes: "normal", look: [0, 0] };
  const corner = () => {
    m.x = 1830;
    m.y = 960;
    m.s = 0.38;
    m.r = -10;
    m.look = [-16, -8];
  };

  // 0 – 3.9: flies in next to the opening headline.
  if (t < 3.9) {
    const k = transform(t, [0.6, 1.9], [0, 1], { ease: easeOut });
    m.x = mix(2350, 1490, k);
    m.y = mix(420, 640, k);
    m.s = 0.78;
    m.r = mix(-10, 0, k);
    m.streak = transform(t, [1.4, 2.2], [1, 0], { ease: easeInOut });
    m.look = [-14, 4];
    if (t > 2.4) m.eyes = "happy";
  }
  // 3.9 – D1: watches the problem from the corner: wide-eyed as the list hits 100, puzzled when the hand-off link turns out
  // to be invisible, worried when one form change hits four workflows, dizzy in the tab scramble, worried through the questions.
  else if (t < M.D1) {
    const k = transform(t, [3.9, 4.6], [0, 1], { ease: easeInOut });
    m.x = mix(1490, 1780, k);
    m.y = mix(640, 930, k);
    m.s = mix(0.78, 0.42, k);
    m.r = mix(0, -8, k);
    m.look = t < 13.5 ? [-6, 10 + Math.sin(t * 2) * 3] : [-14, -4];
    if (t > 8.6 && t < 10.4) m.eyes = "wow";
    if (t > 20.0 && t < 23.2) m.eyes = "happy";
    if (t >= 23.3 && t < 25.1) {
      m.eyes = "squint";
      m.q = transform(t, [23.4, 23.8], [0, 1], { ease: easeOutBack }) * transform(t, [24.8, 25.1], [1, 0], { ease: easeInOut });
    }
    if (t > 31.79 && t < 34.8) m.eyes = "worried";
    if (t > 36.9 && t < 40.6) m.eyes = "wow";
    if (t > 42.7 && t < 46.4) {
      m.eyes = "squint";
      m.q = transform(t, [43.05, 43.4], [0, 1], { ease: easeOutBack }) * transform(t, [46.0, 46.4], [1, 0], { ease: easeInOut });
      m.r = -8 + Math.sin(t * 26) * 5;
    }
    if (t >= 46.4 && t < 52.1) {
      // "What if we could change all of this…" → watches the map take shape from its corner, more and more wide-eyed
      m.eyes = t < 48.85 ? "squint" : "wow";
      m.look = [-22, -6];
      m.sparkle = transform(t, [50.5, 51.1, 51.8, 52.1], [0, 1, 1, 0]) * 0.5;
    }
    if (t >= 52.1) {
      const k3 = transform(t, [52.1, 52.85], [0, 1], { ease: easeOut });
      m.x = mix(1780, 1700, k3);
      m.y = mix(930, 880, k3);
      m.s = mix(0.42, 0.5, k3);
      m.r = -16;
      m.eyes = t > 52.74 ? "wow" : "normal";
      m.look = [-16, -6];
    }
  }
  // D1 – 46.52: star eyes as Workflow Maps explodes, then the map.
  else if (t < 62.02) {
    const k = transform(t, [M.D1 + 0.1, M.D1 + 0.9], [0, 1], { ease: easeOutBack });
    m.x = mix(1700, 1640, k);
    m.y = mix(880, 860, k);
    m.s = mix(0.5, 0.56, k);
    m.r = -12;
    m.eyes = t < 58.15 ? "star" : "happy";
    m.sparkle = transform(t, [M.D1 + 0.1, M.D1 + 0.3, 56.55, 57.15], [0, 1, 1, 0]) + transform(t, [58.18, 58.38, 59.25, 59.75], [0, 1, 1, 0]) * 0.6;
    m.look = [-18, -8];
  }
  // 23.27 – B2: Plan tours, peeking from the corner.
  else if (t < M.B2) {
    const k = transform(t, [62.02, 62.75], [0, 1], { ease: easeInOut });
    m.x = mix(1640, 1830, k);
    m.y = mix(860, 960, k);
    m.s = mix(0.56, 0.36, k);
    m.r = -10;
    m.look = [-16, -8];
    if (t > 86.35 && t < 88.35) {
      m.eyes = "wow";
      m.sparkle = transform(t, [86.35, 86.55, 87.85, 88.35], [0, 1, 1, 0]);
    }
    if (t > 78.55 && t < 79.85) m.eyes = "happy";
    if (t >= M.STOP) {
      m.eyes = "wow";
      m.r = -10 + (t > M.HIT ? Math.sin((t - M.HIT) * 40) * 4 * transform(t, [M.HIT, M.HIT + 0.4], [1, 0], { ease: easeInOut }) : 0);
    }
  }
  // B2 – D2: big, centre stage for "Plan it. Organise it. Troubleshoot it."
  else if (t < M.D2) {
    const k = transform(t, [M.B2, M.B2 + 1.0], [0, 1], { ease: easeInOut });
    m.x = mix(1830, 1480, k);
    m.y = mix(960, 640, k);
    m.s = mix(0.36, 0.86, k);
    m.r = mix(-10, -4, k);
    m.look = t < 94.86 ? [-8, -14] : [-22, 0];
    m.eyes = t > 99.76 ? "wow" : t > 96.86 ? "happy" : "normal";
    if (t > M.SIL) {
      const sq = transform(t, [M.SIL, M.D2], [0, 1], { ease: easeIn });
      m.s *= 1 - 0.06 * sq;
      m.y += 20 * sq;
    }
  }
  // D2 – 74.18: organise.
  else if (t < 122.04) {
    const k = transform(t, [M.D2, M.D2 + 1.1], [0, 1], { ease: easeOut });
    m.x = mix(1480, 1830, k);
    m.y = mix(640, 960, k);
    m.s = mix(0.86, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = transform(t, [M.D2, M.D2 + 0.1, M.D2 + 0.5, M.D2 + 0.9], [0, 1, 1, 0]);
    if (t > 111.66 && t < 113.26) {
      m.eyes = "wow";
      m.look = [-24, -10];
    }
    if (t > 118.96 && t < 120.86) {
      m.eyes = "happy";
      m.sparkle = transform(t, [118.96, 119.16, 120.36, 120.86], [0, 1, 1, 0]);
    }
  }
  // 74.18 – GAP: troubleshoot, the contact journey ("Why did Jordan get this email?").
  else if (t < M.GAP) {
    corner();
    if (t < 123.16) m.streak = transform(t, [122.04, 122.14, 122.66, 123.06], [0, 1, 1, 0]);
    if (t > 125.46 && t < 135.96) m.eyes = "squint";
    if (t > 139.06) {
      m.eyes = "happy";
      m.sparkle = transform(t, [139.06, 139.26, 140.66, 141.16], [0, 1, 1, 0]);
    }
  }
  // GAP – D3: steps forward for "one more thing".
  else if (t < M.D3) {
    const k = transform(t, [M.GAP, M.GAP + 0.7], [0, 1], { ease: easeInOut });
    m.x = mix(1830, 1180, k);
    m.y = mix(960, 600, k);
    m.s = mix(0.38, 0.9, k);
    m.r = mix(-10, 6, k);
    m.look = [0, -6];
    m.eyes = t > 145.76 ? "worried" : "normal";
  }
  // D3 – FIN: troubleshoot, find what's broken.
  else if (t < M.FIN) {
    const k = transform(t, [M.D3, M.D3 + 1.0], [0, 1], { ease: easeOut });
    m.x = mix(1180, 1830, k);
    m.y = mix(600, 960, k);
    m.s = mix(0.9, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = transform(t, [M.D3, M.D3 + 0.1, M.D3 + 0.5, M.D3 + 0.9], [0, 1, 1, 0]);
    if (t > 148.86 && t < 155.26) m.eyes = "worried";
    if (t >= 155.26 && t < 158.16) {
      m.eyes = "happy";
      m.sparkle = transform(t, [155.36, 155.56, 156.96, 157.46], [0, 1, 1, 0]);
    }
    if (t >= 158.16) m.eyes = "wow";
  }
  // FIN – LOGO: finale.
  else if (t < M.LOGO) {
    corner();
    if (t > 164.15 && t < 166.3) m.eyes = "squint";
    if (t > 166.3) {
      m.eyes = "star";
      m.sparkle = transform(t, [166.3, 166.5, 168.26, 168.86], [0, 1, 1, 0]);
    }
    if (t > 168.01 && t < 170.43) {
      const k = transform(t, [168.01, 170.26], [0, 1], { ease: easeInOut });
      m.y = 960 - Math.abs(Math.sin(k * Math.PI * 2)) * 70;
      m.eyes = "happy";
      m.sparkle = 0.6;
    }
  }
  // LOGO – END: next to the lockup.
  else {
    const k = transform(t, [M.LOGO, M.LOGO + 1.0], [0, 1], { ease: easeOut });
    m.x = mix(1830, 1560, k);
    m.y = mix(960, 780, k);
    m.s = mix(0.38, 0.62, k);
    m.r = mix(-10, -6, k);
    m.eyes = "happy";
    m.sparkle = transform(t, [M.LOGO + 0.3, M.LOGO + 0.7, M.END - 1.4, M.END - 0.6], [0, 1, 1, 0]);
    m.look = [-18, -4];
    m.o = transform(t, [M.END - 0.9, M.END], [1, 0], { ease: easeInOut });
  }
  m.o = clamp(0, 1, m.o ?? 1);
  return m;
}
