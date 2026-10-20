// Beat-synced type layer: the kinetic "Workflow Maps" title on the first drop, the kinetic title cards and the
// Plan / Organise / Troubleshoot pain lines in the intro. Type only — no particles.
import React from "react";
import { clamp, easeOut, lerp, prog } from "./anim";
import { M, PAINS, TITLE_DROP } from "./script";

const INK = "#0B1B3A";
const BLUE = "#155EEF";
/** Splits `Plain <span class="grad-text">Accent</span>` into parts. */
const parts = (html: string) => {
  const out: { text: string; accent: boolean }[] = [];
  const re = /<span class="grad-text">(.*?)<\/span>/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(html))) { if (m.index > last) out.push({ text: html.slice(last, m.index), accent: false }); out.push({ text: m[1], accent: true }); last = m.index + m[0].length; }
  if (last < html.length) out.push({ text: html.slice(last), accent: false });
  return out;
};

/** Kinetic type: letters rise in one after another (expo ease, a little blur and tilt), the accent word sweeps in
 *  as one piece, the kicker's tracking closes up; on `out` the letters lift away in the same order. */
export const KineticTitle: React.FC<{ t: number; at: number; out: number; kicker: string; html: string; size: number; pulse?: number[] }> = ({ t, at, out, kicker, html, size, pulse = [] }) => {
  if (t < at - 0.05 || t > out + 0.6) return null;
  const ex = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)));
  let i = 0;
  const glyph = (ch: string, key: string, accent = false) => {
    const k = i++;
    const p = ex((t - at - 0.08 - k * 0.032) / 0.45);
    const q = clamp((t - out - k * 0.016) / 0.3);
    const y = (1 - p) * 0.85 - q * 0.45, o = p * (1 - q);
    return (
      <span key={key} className={accent ? "grad-text" : undefined} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${y.toFixed(3)}em) rotate(${((1 - p) * 7).toFixed(2)}deg)`, opacity: o, filter: (1 - p) * 8 + q * 6 > 0.3 ? `blur(${((1 - p) * 8 + q * 6).toFixed(1)}px)` : undefined }}>{ch}</span>
    );
  };
  const pul = pulse.reduce((s, w) => s + (t >= w && t < w + 0.35 ? 0.045 * Math.pow(1 - (t - w) / 0.35, 2) : 0), 0);
  const kp = ex((t - at) / 0.5), kq = clamp((t - out) / 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `scale(${(1 + pul).toFixed(4)})` }}>
      <div style={{ fontSize: size * 0.2, fontWeight: 600, color: BLUE, letterSpacing: `${lerp(0.5, 0.08, kp).toFixed(3)}em`, opacity: kp * (1 - kq) }}>{kicker}</div>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: size * 0.05, color: INK }}>
        {parts(html).map((pt, j) => pt.accent
          ? <span key={j} style={{ display: "inline-block" }}>{pt.text.split("").map((c, n) => glyph(c, `${j}-${n}`, true))}</span>
          : pt.text.split("").map((c, n) => glyph(c, `${j}-${n}`)))}
      </div>
    </div>
  );
};

export const Impact: React.FC<{ t: number }> = ({ t }) => {
  const D = TITLE_DROP;
  // ── Pain lines (intro): each lands on a hit ──
  const painOn = t >= PAINS.from && t < PAINS.to + 0.4;
  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* the first drop: "Workflow Maps" in kinetic type, a pulse on the wall of sound, lifts away in the break */}
      <KineticTitle t={t} at={D.at} out={D.out} kicker="INTRODUCING" html={`Workflow <span class="grad-text">Maps</span>`} size={168} pulse={[D.wall]} />
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
/** (Particle bursts removed: titles are type-only.) */
export const ImpactBack: React.FC<{ t: number }> = () => null;

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
