// Motion of the app window and the mascot, as pure functions of time t (seconds).
import { M } from "./script";
import { clamp, easeIn, easeInOut, easeOut, easeOutBack, lerp, prog, win } from "./anim";

// ── App window ───────────────────────────────────────────────────────────────

/** Moments the window recedes (shrinks, dims, blurs) behind a title. [start, end, depth] */
export const RECEDES: [number, number, number][] = [
  [19.39, 23.4, 1], // Introducing
  [M.B2, M.D2 + 0.1, 1], // build to drop 2
  ...[M.D2, 62.57, 74.18, 87.71, M.D3, 105.14].map((a): [number, number, number] => [a - 0.05, a + 1.25, 0.9]), // title cards
  [M.GAP, M.D3 + 0.1, 0.8], // one more thing
];

/** Push-ins so panels read at 1080p: [start, end, scale, originX, originY] in window px. */
export const ZOOMS: [number, number, number, number, number][] = [
  [27.45, 33.0, 1.2, 1620, 0],
  [38.85, 41.95, 1.2, 0, 0],
  [54.75, 57.0, 1.2, 1620, 0],
  [66.1, 73.8, 1.2, 1620, 0],
  [75.5, 78.95, 1.12, 810, 0],
];

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
  return { opacity: o, translateY: ty, scale: s, zoom: zs, zoomOrigin: [zx, zy] as [number, number], blur };
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
  // 3.9 – D1: watches the list, confused by tabs, worried at the delete dialog.
  else if (t < M.D1) {
    const k = prog(t, 3.9, 4.6, easeInOut);
    m.x = lerp(1490, 1780, k);
    m.y = lerp(640, 930, k);
    m.s = lerp(0.78, 0.42, k);
    m.r = lerp(0, -8, k);
    m.look = t < 7.6 ? [-6, 10 + Math.sin(t * 8) * 6] : [-12, 0];
    if (t > 7.9 && t < 9.7) {
      m.eyes = "squint";
      m.q = prog(t, 7.9, 8.3, easeOutBack) * (1 - prog(t, 9.4, 9.7));
    }
    if (t >= 9.7 && t < 11.65) {
      m.eyes = "worried";
      m.r = -8 + Math.sin(t * 30) * 2;
    }
    if (t >= 11.65) {
      const k2 = prog(t, 13.4, 14.4, easeOut);
      m.x = lerp(1780, 1700, k2);
      m.y = lerp(930, 880, k2);
      m.s = lerp(0.42, 0.5, k2);
      m.r = lerp(-8, -16, k2);
      m.eyes = t > 14.4 ? "wow" : "normal";
      m.look = [-16, -6];
    }
  }
  // D1 – 19.39: star eyes as the map appears.
  else if (t < 19.39) {
    const k = prog(t, M.D1 + 0.1, M.D1 + 0.9, easeOutBack);
    m.x = lerp(1700, 1640, k);
    m.y = lerp(880, 860, k);
    m.s = lerp(0.5, 0.56, k);
    m.r = -12;
    m.eyes = "star";
    m.sparkle = prog(t, M.D1 + 0.2, M.D1 + 2.6, (x) => x);
    m.look = [-18, -8];
  }
  // 19.39 – 23.27: Introducing.
  else if (t < 23.27) {
    const k = prog(t, 19.39, 20.2, easeOut);
    m.x = lerp(1640, 1560, k);
    m.y = lerp(860, 760, k);
    m.s = lerp(0.56, 0.62, k);
    m.r = -6;
    m.eyes = "happy";
    m.sparkle = win(t, 19.6, 22.6, 0.3, 0.6) * 0.8;
  }
  // 23.27 – B2: tour, peeking from the corner.
  else if (t < M.B2) {
    const k = prog(t, 23.27, 24.0, easeInOut);
    m.x = lerp(1560, 1830, k);
    m.y = lerp(760, 960, k);
    m.s = lerp(0.62, 0.36, k);
    m.r = -10;
    m.look = [-16, -8];
    if (t > 32.8 && t < 34.6) {
      m.eyes = "wow";
      m.sparkle = win(t, 32.8, 34.6, 0.2, 0.5);
    }
    if (t > 40.9 && t < 42.0) m.eyes = "happy";
    if (t >= M.STOP) {
      m.eyes = "wow";
      m.r = -10 + (t > M.HIT ? Math.sin((t - M.HIT) * 40) * 4 * (1 - prog(t, M.HIT, M.HIT + 0.4)) : 0);
    }
  }
  // B2 – D2: big, centre stage for the build.
  else if (t < M.D2) {
    const k = prog(t, M.B2, M.B2 + 1.0, easeInOut);
    m.x = lerp(1830, 1480, k);
    m.y = lerp(960, 640, k);
    m.s = lerp(0.36, 0.86, k);
    m.r = lerp(-10, -4, k);
    m.look = t < 47 ? [-8, -14] : [-22, 0];
    m.eyes = t > 51.9 ? "wow" : t > 49 ? "normal" : "squint";
    if (t > M.SIL) {
      const sq = prog(t, M.SIL, M.D2, easeIn);
      m.s *= 1 - 0.06 * sq;
      m.y += 20 * sq;
    }
  }
  // D2 – 62.57: linked workflows.
  else if (t < 62.57) {
    const k = prog(t, M.D2, M.D2 + 1.1, easeOut);
    m.x = lerp(1480, 1830, k);
    m.y = lerp(640, 960, k);
    m.s = lerp(0.86, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = win(t, M.D2, M.D2 + 0.9, 0.1, 0.4);
    if (t > 58.6 && t < 60.8) {
      m.eyes = "star";
      m.sparkle = win(t, 58.6, 60.8, 0.2, 0.5);
    }
  }
  // 62.57 – 74.18: errors.
  else if (t < 74.18) {
    corner();
    if (t < 63.9) m.streak = win(t, 62.57, 63.6, 0.1, 0.4);
    if (t > 66.4 && t < 71.7) m.eyes = "worried";
    if (t > 71.7) {
      m.eyes = "happy";
      m.sparkle = win(t, 71.8, 73.6, 0.2, 0.5);
    }
  }
  // 74.18 – 87.71: contact journey.
  else if (t < 87.71) {
    corner();
    if (t < 75.3) m.streak = win(t, 74.18, 75.2, 0.1, 0.4);
    if (t > 86.2) {
      m.eyes = "happy";
      m.sparkle = win(t, 86.2, 87.6, 0.2, 0.4);
    }
  }
  // 87.71 – GAP: organise.
  else if (t < M.GAP) {
    corner();
    if (t < 88.8) m.streak = win(t, 87.71, 88.7, 0.1, 0.4);
    if (t > 90.5 && t < 91.9) {
      m.eyes = "wow";
      m.look = [-24, -10];
    }
    if (t > 91.9) {
      m.eyes = "happy";
      m.sparkle = win(t, 91.9, 93.4, 0.2, 0.5);
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
    m.eyes = t > 98.6 ? "wow" : t > 97.9 ? "squint" : "normal";
  }
  // D3 – 105.14: colour.
  else if (t < 105.14) {
    const k = prog(t, M.D3, M.D3 + 1.0, easeOut);
    m.x = lerp(1180, 1830, k);
    m.y = lerp(600, 960, k);
    m.s = lerp(0.9, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = win(t, M.D3, M.D3 + 0.9, 0.1, 0.4);
    if (t > 100.8) {
      m.eyes = "star";
      m.sparkle = 0.5 + 0.5 * Math.sin(t * 3);
    }
  }
  // 105.14 – FIN: notes.
  else if (t < M.FIN) {
    corner();
    if (t < 106.2) m.streak = win(t, 105.14, 106.1, 0.1, 0.4);
    if (t > 107.4) m.eyes = "happy";
  }
  // FIN – LOGO: finale.
  else if (t < M.LOGO) {
    corner();
    if (t > 116.29 && t < 118.44) m.eyes = "squint";
    if (t > 118.44) {
      m.eyes = "star";
      m.sparkle = win(t, 118.44, 121, 0.2, 0.6);
    }
    if (t > 120.15 && t < 122.57) {
      const k = prog(t, 120.15, 122.4, easeInOut);
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
