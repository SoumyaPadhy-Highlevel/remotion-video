// Motion of the app window and the mascot, as pure functions of time t (seconds).
import { M, DROPS, INTRO_CARDS, SHAKES, TITLE_DROP } from "./script";
import { shakeAt } from "./Impact";
import { clamp, easeIn, easeInOut, easeOut, easeOutBack, lerp, prog, win } from "./anim";

// ── App window ───────────────────────────────────────────────────────────────

/** Moments the window recedes (shrinks, dims, blurs) behind a title. [start, end, depth] */
export const RECEDES: [number, number, number][] = [
  ...INTRO_CARDS.map((c): [number, number, number] => [c.a - 0.05, c.b, c.depth ?? 0.9]), // the intro's statement cards
  [54.25, 56.3, 0.45], // behind the exploding title; the map still shows through
  [M.B2, M.D2 + 0.1, 1], // build to drop 2
  ...[M.D2, 122.04, M.D3].map((a): [number, number, number] => [a - 0.05, a + 1.25, 0.9]), // title cards
  [M.GAP, M.D3 + 0.1, 0.8], // "and when something breaks?"
  [M.FIN - 0.05, 163.1, 0.9], // "One more thing: just ask your map"
];

/** Push-ins so panels read at 1080p: [start, end, scale, originX, originY] in window px. */
export const ZOOMS: [number, number, number, number, number][] = [
  [68.35, 76.2, 1.2, 1620, 0], // workflow drawer, then the asset drawer
  [76.7, 79.7, 1.2, 0, 0], // search panel
  [102.46, 105.46, 1.15, 0, 0], // cleanup panel
  [125.76, 132.26, 1.15, 1620, 0], // contact drawer: workflows, timeline
  [135.76, 139.46, 1.12, 1620, 220], // run: the email step's details
  [149.76, 151.76, 1.15, 0, 0], // "Need your attention" card
  [151.96, 154.86, 1.2, 1620, 0], // error executions in the drawer
  [163.3, 170.1, 1.12, 0, 300], // the Assistant's answer
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
  const [jx, jy] = shakeAt(t, [...SHAKES, TITLE_DROP.at]);
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
  // 3.9 – D1: watches the problem from the corner: wide-eyed as the list hits 100, puzzled when the hand-off link turns out
  // to be invisible, worried when one form change hits four workflows, dizzy in the tab scramble, worried through the questions.
  else if (t < M.D1) {
    const k = prog(t, 3.9, 4.6, easeInOut);
    m.x = lerp(1490, 1780, k);
    m.y = lerp(640, 930, k);
    m.s = lerp(0.78, 0.42, k);
    m.r = lerp(0, -8, k);
    m.look = t < 13.5 ? [-6, 10 + Math.sin(t * 2) * 3] : [-14, -4];
    if (t > 11.65 && t < 13.2) m.eyes = "wow";
    if (t > 20.0 && t < 23.2) m.eyes = "happy";
    if (t >= 23.3 && t < 25.1) {
      m.eyes = "squint";
      m.q = prog(t, 23.4, 23.8, easeOutBack) * (1 - prog(t, 24.8, 25.1));
    }
    if (t > 31.79 && t < 34.8) m.eyes = "worried";
    if (t > 36.9 && t < 40.6) m.eyes = "wow";
    if (t > 42.7 && t < 46.4) {
      m.eyes = "squint";
      m.q = prog(t, 43.05, 43.4, easeOutBack) * (1 - prog(t, 46.0, 46.4));
      m.r = -8 + Math.sin(t * 26) * 5;
    }
    if (t >= 46.4 && t < 52.1) {
      // "What if we could change all of this…" → watches the map take shape from its corner, more and more wide-eyed
      m.eyes = t < 48.85 ? "squint" : "wow";
      m.look = [-22, -6];
      m.sparkle = win(t, 50.5, 52.1, 0.6, 0.3) * 0.5;
    }
    if (t >= 52.1) {
      const k3 = prog(t, 52.1, 52.85, easeOut);
      m.x = lerp(1780, 1700, k3);
      m.y = lerp(930, 880, k3);
      m.s = lerp(0.42, 0.5, k3);
      m.r = -16;
      m.eyes = t > 52.74 ? "wow" : "normal";
      m.look = [-16, -6];
    }
  }
  // D1 – 46.52: star eyes as Workflow Maps explodes, then the map.
  else if (t < 62.02) {
    const k = prog(t, M.D1 + 0.1, M.D1 + 0.9, easeOutBack);
    m.x = lerp(1700, 1640, k);
    m.y = lerp(880, 860, k);
    m.s = lerp(0.5, 0.56, k);
    m.r = -12;
    m.eyes = t < 58.15 ? "star" : "happy";
    m.sparkle = win(t, M.D1 + 0.1, 57.15, 0.2, 0.6) + win(t, 58.18, 59.75, 0.2, 0.5) * 0.6;
    m.look = [-18, -8];
  }
  // 23.27 – B2: Plan tours, peeking from the corner.
  else if (t < M.B2) {
    const k = prog(t, 62.02, 62.75, easeInOut);
    m.x = lerp(1640, 1830, k);
    m.y = lerp(860, 960, k);
    m.s = lerp(0.56, 0.36, k);
    m.r = -10;
    m.look = [-16, -8];
    if (t > 86.35 && t < 88.35) {
      m.eyes = "wow";
      m.sparkle = win(t, 86.35, 88.35, 0.2, 0.5);
    }
    if (t > 78.55 && t < 79.85) m.eyes = "happy";
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
    m.look = t < 94.86 ? [-8, -14] : [-22, 0];
    m.eyes = t > 99.76 ? "wow" : t > 96.86 ? "happy" : "normal";
    if (t > M.SIL) {
      const sq = prog(t, M.SIL, M.D2, easeIn);
      m.s *= 1 - 0.06 * sq;
      m.y += 20 * sq;
    }
  }
  // D2 – 74.18: organise.
  else if (t < 122.04) {
    const k = prog(t, M.D2, M.D2 + 1.1, easeOut);
    m.x = lerp(1480, 1830, k);
    m.y = lerp(640, 960, k);
    m.s = lerp(0.86, 0.38, k);
    m.r = -10;
    m.look = [-16, -8];
    m.streak = win(t, M.D2, M.D2 + 0.9, 0.1, 0.4);
    if (t > 111.66 && t < 113.26) {
      m.eyes = "wow";
      m.look = [-24, -10];
    }
    if (t > 118.96 && t < 120.86) {
      m.eyes = "happy";
      m.sparkle = win(t, 118.96, 120.86, 0.2, 0.5);
    }
  }
  // 74.18 – GAP: troubleshoot, the contact journey ("Why did Jordan get this email?").
  else if (t < M.GAP) {
    corner();
    if (t < 123.16) m.streak = win(t, 122.04, 123.06, 0.1, 0.4);
    if (t > 125.46 && t < 135.96) m.eyes = "squint";
    if (t > 139.06) {
      m.eyes = "happy";
      m.sparkle = win(t, 139.06, 141.16, 0.2, 0.5);
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
    m.eyes = t > 145.76 ? "worried" : "normal";
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
    if (t > 148.86 && t < 155.26) m.eyes = "worried";
    if (t >= 155.26 && t < 158.16) {
      m.eyes = "happy";
      m.sparkle = win(t, 155.36, 157.46, 0.2, 0.5);
    }
    if (t >= 158.16) m.eyes = "wow";
  }
  // FIN – LOGO: finale.
  else if (t < M.LOGO) {
    corner();
    if (t > 164.15 && t < 166.3) m.eyes = "squint";
    if (t > 166.3) {
      m.eyes = "star";
      m.sparkle = win(t, 166.3, 168.86, 0.2, 0.6);
    }
    if (t > 168.01 && t < 170.43) {
      const k = prog(t, 168.01, 170.26, easeInOut);
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
