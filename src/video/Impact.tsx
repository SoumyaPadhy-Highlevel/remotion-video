// Beat-synced impact layer: the "Workflow Maps" title explosion on the first drop, particle bursts on the
// other drops and the logo, and the Plan / Organise / Troubleshoot pain lines in the intro.
import React from "react";
import { clamp, easeOut, lerp, prog, rand } from "./anim";
import { BURSTS, M, PAINS, TITLE_DROP } from "./script";

const INK = "#0B1B3A";
const BLUE = "#155EEF";
// product node colours: workflow cobalt and the asset types
const COLORS = ["#2455d6", "#2455d6", "#3b82f6", "#f45d48", "#10b981", "#f97316", "#a855f7", "#e9a40b", "#0ea5e9", "#14b8a6"];

/** n-gon points around (0,0), radius r, rotated a. */
const poly = (n: number, r: number, a: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = a + (i / n) * Math.PI * 2;
    return `${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`;
  }).join(" ");

/** A burst of map nodes flung out from (cx, cy) at time `at`, plus a shockwave ring. */
const Burst: React.FC<{ t: number; at: number; cx: number; cy: number; count: number; power: number; seed: number; ring?: boolean }> = ({ t, at, cx, cy, count, power, seed, ring = true }) => {
  const dt = t - at;
  if (dt < 0 || dt > 1.8) return null;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a = rand(seed + i) * Math.PI * 2;
    const sp = power * (0.35 + 0.65 * rand(seed + i + 101));
    const d = sp * (1 - Math.exp(-dt * 3.2));                 // fast out, decelerating
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.62 + 60 * dt * dt * rand(seed + i + 7);
    const size = 9 + 24 * rand(seed + i + 202);
    const life = 0.9 + 0.8 * rand(seed + i + 303);
    const o = clamp(1 - dt / life) * clamp(dt / 0.04);
    const spin = (rand(seed + i + 404) - 0.5) * 8 * dt;
    const n = rand(seed + i + 505) > 0.45 ? 6 : 9;
    const col = COLORS[Math.floor(rand(seed + i + 606) * COLORS.length)];
    parts.push(
      <g key={i} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(spin * 57.3).toFixed(1)})`} opacity={o.toFixed(3)}>
        <polygon points={poly(n, size, rand(seed + i) * 3)} fill={col} />
        <polygon points={poly(n, size * 0.62, rand(seed + i) * 3)} fill="#fff" opacity={0.22} />
      </g>,
    );
  }
  const rp = clamp(dt / 0.75);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {ring ? <>
        <ellipse cx={cx} cy={cy} rx={lerp(40, 1250, easeOut(rp))} ry={lerp(25, 780, easeOut(rp))} fill="none" stroke="#84adff" strokeWidth={lerp(26, 2, rp)} opacity={(0.7 * (1 - rp)).toFixed(3)} />
        <ellipse cx={cx} cy={cy} rx={lerp(20, 900, easeOut(clamp((dt - 0.08) / 0.7)))} ry={lerp(12, 560, easeOut(clamp((dt - 0.08) / 0.7)))} fill="none" stroke="#2f54eb" strokeWidth={lerp(10, 1, rp)} opacity={(0.5 * (1 - clamp((dt - 0.08) / 0.7))).toFixed(3)} />
      </> : null}
      {parts}
    </svg>
  );
};

export const Impact: React.FC<{ t: number }> = ({ t }) => {
  // ── The first drop: "Workflow Maps" explodes onto the screen ──
  const D = TITLE_DROP;
  const inT = t >= D.at - 0.02 && t < D.out + 0.35;
  const k = clamp((t - D.at) / 0.28);
  const expo = 1 - Math.pow(2, -10 * k);                       // ease-out expo: slams in
  const wall = t >= D.wall && t < D.wall + 0.35 ? 0.07 * Math.pow(1 - (t - D.wall) / 0.35, 2) : 0;
  const leave = prog(t, D.out, D.out + 0.28, (x) => x * x);
  const shake = t >= D.at && t < D.at + 0.5 ? (1 - (t - D.at) / 0.5) * 14 : 0;
  const sx = shake * Math.sin(t * 97), sy = shake * Math.cos(t * 83);
  const scale = lerp(2.6, 1, expo) * (1 + wall) * lerp(1, 1.18, leave);
  const op = clamp((t - D.at) / 0.06) * (1 - leave);
  const blur = lerp(14, 0, expo) + 10 * leave;

  // ── Pain lines (intro): each lands on a hit with a punch ──
  const painOn = t >= PAINS.from && t < PAINS.to + 0.4;

  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* burst behind the title on the drop, a second one on the wall of sound */}
      <Burst t={t} at={D.at} cx={960} cy={560} count={90} power={1050} seed={11} />
      <Burst t={t} at={D.wall} cx={960} cy={560} count={46} power={760} seed={71} ring={false} />
      {inT ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
          transform: `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${scale.toFixed(4)})`, opacity: op, filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined,
        }}>
          <div style={{ fontSize: 34, fontWeight: 600, color: BLUE, letterSpacing: ".08em", opacity: clamp((t - D.at - 0.12) / 0.2) }}>INTRODUCING</div>
          <div style={{ fontSize: 168, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, marginTop: 6, color: INK, textShadow: "0 18px 60px rgba(21,94,239,.25)" }}>
            Workflow <span className="grad-text">Maps</span>
          </div>
        </div>
      ) : null}
      {/* Plan / Organise / Troubleshoot */}
      {painOn ? (
        <div style={{ position: "absolute", left: 120, top: 250, display: "flex", flexDirection: "column", gap: 26 }}>
          {PAINS.lines.map((p, i) => {
            const a = prog(t, p.at, p.at + 0.32, easeOut) * (1 - prog(t, PAINS.to, PAINS.to + 0.35));
            const punch = t >= p.at && t < p.at + 0.3 ? 0.12 * Math.pow(1 - (t - p.at) / 0.3, 2) : 0;
            return (
              <div key={p.word} style={{ opacity: a, transform: `translateX(${(-40 * (1 - a)).toFixed(1)}px) scale(${(1 + punch).toFixed(3)})`, transformOrigin: "0 50%" }}>
                <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.0, color: INK }}><span className="grad-text">{p.word}</span></div>
                <div style={{ fontSize: 30, fontWeight: 600, color: "#475467", marginTop: 6, fontFamily: "Inter, sans-serif" }}>{p.line}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** Bursts on the other big hits, drawn behind the title cards (placed before <Titles>). */
export const ImpactBack: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {BURSTS.map((b, i) => <Burst key={i} t={t} at={b.at} cx={b.x} cy={b.y} count={b.n} power={b.p} seed={200 + i * 50} />)}
  </div>
);

/** Window shake on the intro's scramble hits and the first drop. */
export const shakeAt = (t: number, hits: number[]) => {
  let x = 0, y = 0;
  for (const h of hits) if (t >= h && t < h + 0.22) {
    const k = 1 - (t - h) / 0.22;
    x += Math.sin((t - h) * 90) * 9 * k; y += Math.cos((t - h) * 70) * 5 * k;
  }
  return [x, y];
};
export { M };
