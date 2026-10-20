// Motion of the app window and the mascot, as pure functions of time t (seconds).
import { M, DROPS, SHAKES } from "./script";
import { shakeAt } from "./Impact";
import { clamp, easeIn, easeInOut, easeOut, easeOutBack, lerp, prog, win } from "./anim";

// ── App window ───────────────────────────────────────────────────────────────

/** Moments the window recedes (shrinks, dims, blurs) behind a title. [start, end, depth] */
export const RECEDES: [number, number, number][] = [
  [9.5, 13.45, 0.6], // Plan / Organise / Troubleshoot over the chaos
  [15.5, 17.55, 0.45], // behind the exploding title; the map still shows through
  [M.B2, M.D2 + 0.1, 1], // build to drop 2
  ...[M.D2, 83.29, M.D3].map((a): [number, number, number] => [a - 0.05, a + 1.25, 0.9]), // title cards
  [M.GAP, M.D3 + 0.1, 0.8], // "and when something breaks?"
  [M.FIN - 0.05, 124.35, 0.9], // "One more thing: just ask your map"
];

/** Push-ins so panels read at 1080p: [start, end, scale, originX, originY] in window px. */
export const ZOOMS: [number, number, number, number, number][] = [
  [29.6, 37.45, 1.2, 1620, 0], // workflow drawer, then the asset drawer
  [37.95, 40.95, 1.2, 0, 0], // search panel
  [63.71, 66.71, 1.15, 0, 0], // cleanup panel
  [87.01, 93.51, 1.15, 1620, 0], // contact drawer: workflows, timeline
  [97.01, 100.71, 1.12, 1620, 220], // run: the email step's details
  [111.01, 113.01, 1.15, 0, 0], // "Need your attention" card
  [113.21, 116.11, 1.2, 1620, 0], // error executions in the drawer
  [124.55, 131.35, 1.12, 0, 300], // the Assistant's answer
]

export function windowAt(t: number) {
  let o = 1;
  let ty = 0;
  let s = 1;
  let blur = 0;
  // Hidden during the title open, rises at 3.9 s.
  if (t < 3.9) {
    o = 0;
    ty = 120;
  } else if (t < 4.7) {
    const k = prog(t, 3.9, 4.6, easeOut);
    o = k;
    ty = (1 - k) * 160;
    s = 0.94 + 0.06 * k;
  }
  if (t >= 11.65 && t < M.D1) s *= 1 + 0.025 * prog(t, 11.65, M.D1 - 0.1, easeIn);
  if (t >= M.D1 && t < M.D1 + 0.6) s *= 1 + 0.03 * (1 - prog(t, M.D1, M.D1 + 0.6, easeOut));
  for (const [a, b, depth] of RECEDES) {
    const k = win(t, a, b, 0.45, 0.45) * depth;
    s *= 1 - 0.12 * k;
    blur = Math.max(blur, 7 * k);
    o *= 1 - 0.45 * k;
  }
  if (t >= M.HIT && t < M.HIT + 0.35) s *= 1 + 0.02 * (1 - (t - M.HIT) / 0.35);
  // punch on each drop: a quick 4 % kick that settles in 0.45 s
  for (const d of DROPS) if (t >= d && t < d + 0.45) s *= 1 + 0.04 * Math.pow(1 - (t - d) / 0.45, 2);
  if (t >= M.LOGO - 0.4) {
    const k = prog(t, M.LOGO - 0.4, M.LOGO + 0.6, easeInOut);
    o *= 1 - k;
    s *= 1 - 0.15 * k;
    blur = Math.max(blur, 10 * k);
  }
  let zs = 1;
  let zx = 810;
  let zy = 440;
  for (const [a, b, sc, ox, oy] of ZOOMS) {
    const k = Math.min(prog(t, a, a + 0.6, easeInOut), 1 - prog(t, b - 0.5, b, easeInOut));
    if (k > 0) {
      zs = 1 + (sc - 1) * k;
      zx = ox;
      zy = oy;
    }
  }
  const [jx, jy] = shakeAt(t, [...SHAKES, 15.55]);
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
    const k = prog(t, 0.6, 1.9, easeOut);
    m.x = lerp(2350, 1490, k);
    m.y = lerp(420, 640, k);
    m.s = 0.78;
    m.r = lerp(-10, 0, k);
    m.streak = 1 - prog(t, 1.4, 2.2);
    m.look = [-14, 4];
    if (t > 2.4) m.eyes = "happy";
  }
  // 3.9 – D1: watches the list, dizzy in the tab scramble, worried through the pain lines, wide-eyed at the question.
  else if (t < M.D1) {
    const k = prog(t, 3.9, 4.6, easeInOut);
    m.x = lerp(1490, 1780, k);
    m.y = lerp(640, 930, k);
    m.s = lerp(0.78, 0.42, k);
    m.r = lerp(0, -8, k);
    m.look = t < 7.6 ? [-6, 10 + Math.sin(t * 8) * 6] : [-12, 0];
    if (t > 7.8 && t < 9.55) {
      m.eyes = "squint";
      m.q = prog(t, 7.9, 8.3, easeOutBack) * (1 - prog(t, 9.3, 9.55));
      m.r = -8 + Math.sin(t * 26) * 5;
    }
    if (t >= 9.55 && t < 13.45) {
      const k2 = prog(t, 9.55, 10.1, easeOut);
      m.x = lerp(1780, 1520, k2);
      m.y = lerp(930, 720, k2);
      m.s = lerp(0.42, 0.62, k2);
      m.eyes = "worried";
      m.r = -6 + Math.sin(t * 30) * 2;
    }
    if (t >= 13.45) {
      const k3 = prog(t, 13.45, 14.2, easeOut);
      m.x = lerp(1520, 1700, k3);
      m.y = lerp(720, 880, k3);
      m.s = lerp(0.62, 0.5, k3);
      m.r = -16;
      m.eyes = t > 13.99 ? "wow" : "normal";
      m.look = [-16, -6];
    }
  }
  // D1 – 23.27: star eyes as Workflow Maps explodes, then the map.
  else if (t < 23.27) {
    const k = prog(t, M.D1 + 0.1, M.D1 + 0.9, easeOutBack);
    m.x = lerp(1700, 1640, k);
    m.y = lerp(880, 860, k);
    m.s = lerp(0.5, 0.56, k);
    m.r = -12;
    m.eyes = t < 19.4 ? "star" : "happy";
    m.sparkle = win(t, M.D1 + 0.1, 18.4, 0.2, 0.6) + win(t, 19.43, 21.0, 0.2, 0.5) * 0.6;
    m.look = [-18, -8];
  }
  // 23.27 – B2: Plan tours, peeking from the corner.
  else if (t < M.B2) {
    const k = prog(t, 23.27, 24.0, easeInOut);
    m.x = lerp(1640, 1830, k);
    m.y = lerp(860, 960, k);
    m.s = lerp(0.56, 0.36, k);
    m.r = -10;
    m.look = [-16, -8];
    if (t > 47.6 && t < 49.6) {
      m.eyes = "wow";
      m.sparkle = win(t, 47.6, 49.6, 0.2, 0.5);
    }
    if (t > 39.8 && t < 41.1) m.eyes = "happy";
    if (t >= M.STOP) {
      m.eyes = "wow";
      m.r = -10 + (t > M.HIT ? Math.sin((t - M.HIT) * 40) * 4 * (1 - prog(t, M.HIT, M.HIT + 0.4)) : 0);
    }
  }
  // B2 – D2: big, centre stage for "Plan it. Organise it. Troubleshoot it."
  else if (t < M.D2) {
    const k = prog(t, M.B2, M.B2 + 1.0, easeInOut);
    m.x = lerp(1830, 1480, k);
    m.y = lerp(960, 640, k);
    m.s = lerp(0.36, 0.86, k);
    m.r = lerp(-10, -4, k);
    m.look = t < 56.11 ? [-8, -14] : [-22, 0];
    m.eyes = t > 61.01 ? "wow" : t > 58.11 ? "happy" : "normal";
    if (t > M.SIL) {
      const sq = prog(t, M.SIL, M.D2, easeIn);
      m.s *= 1 - 0.06 * sq;
      m.y += 20 * sq;
    }
  }
  // D2 – 74.18: organise.
  else if (t < 83.29) {
    const k = prog(t, M.D2, M.D2 + 1.1, easeOut);
    m.x = lerp(1480, 1830, k);
    m.y = lerp(640, 960, k);
    m.s = lerp(0.86, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = win(t, M.D2, M.D2 + 0.9, 0.1, 0.4);
    if (t > 72.91 && t < 74.51) {
      m.eyes = "wow";
      m.look = [-24, -10];
    }
    if (t > 80.21 && t < 82.11) {
      m.eyes = "happy";
      m.sparkle = win(t, 80.21, 82.11, 0.2, 0.5);
    }
  }
  // 74.18 – GAP: troubleshoot, the contact journey ("Why did Jordan get this email?").
  else if (t < M.GAP) {
    corner();
    if (t < 84.41) m.streak = win(t, 83.29, 84.31, 0.1, 0.4);
    if (t > 86.71 && t < 97.21) m.eyes = "squint";
    if (t > 100.31) {
      m.eyes = "happy";
      m.sparkle = win(t, 100.31, 102.41, 0.2, 0.5);
    }
  }
  // GAP – D3: steps forward for "one more thing".
  else if (t < M.D3) {
    const k = prog(t, M.GAP, M.GAP + 0.7, easeInOut);
    m.x = lerp(1830, 1180, k);
    m.y = lerp(960, 600, k);
    m.s = lerp(0.38, 0.9, k);
    m.r = lerp(-10, 6, k);
    m.look = [0, -6];
    m.eyes = t > 107.01 ? "worried" : "normal";
  }
  // D3 – FIN: troubleshoot, find what's broken.
  else if (t < M.FIN) {
    const k = prog(t, M.D3, M.D3 + 1.0, easeOut);
    m.x = lerp(1180, 1830, k);
    m.y = lerp(600, 960, k);
    m.s = lerp(0.9, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = win(t, M.D3, M.D3 + 0.9, 0.1, 0.4);
    if (t > 110.11 && t < 116.51) m.eyes = "worried";
    if (t >= 116.51 && t < 119.41) {
      m.eyes = "happy";
      m.sparkle = win(t, 116.61, 118.71, 0.2, 0.5);
    }
    if (t >= 119.41) m.eyes = "wow";
  }
  // FIN – LOGO: finale.
  else if (t < M.LOGO) {
    corner();
    if (t > 125.4 && t < 127.55) m.eyes = "squint";
    if (t > 127.55) {
      m.eyes = "star";
      m.sparkle = win(t, 127.55, 130.11, 0.2, 0.6);
    }
    if (t > 129.26 && t < 131.68) {
      const k = prog(t, 129.26, 131.51, easeInOut);
      m.y = 960 - Math.abs(Math.sin(k * Math.PI * 2)) * 70;
      m.eyes = "happy";
      m.sparkle = 0.6;
    }
  }
  // LOGO – END: next to the lockup.
  else {
    const k = prog(t, M.LOGO, M.LOGO + 1.0, easeOut);
    m.x = lerp(1830, 1560, k);
    m.y = lerp(960, 780, k);
    m.s = lerp(0.38, 0.62, k);
    m.r = lerp(-10, -6, k);
    m.eyes = "happy";
    m.sparkle = win(t, M.LOGO + 0.3, M.END - 0.6, 0.4, 0.8);
    m.look = [-18, -4];
    m.o = 1 - prog(t, M.END - 0.9, M.END);
  }
  m.o = clamp(m.o ?? 1);
  return m;
}
