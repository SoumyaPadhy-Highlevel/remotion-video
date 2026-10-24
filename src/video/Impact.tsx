// Beat-synced type layer: the kinetic "Workflow Maps" title on the first drop, the kinetic title cards and the
// suspense lines before the reveal. Type only — no particles.
import React from "react";
import { mix, stagger, transform } from "motion";
import { springAt } from "./anim";
import { INTRO_CARDS, M, TITLE_DROP } from "./script";
import { introCardHtml, md, useCfg } from "./config";

const INK = "var(--ink, #0B1B3A)";
const BLUE = "var(--accent, #155EEF)";
/** Splits `Plain <span class="grad-text">Accent</span>` into parts. */
const parts = (html: string) => {
  const out: { text: string; accent: boolean }[] = [];
  const re = /<span class="grad-text">(.*?)<\/span>/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(html))) { if (m.index > last) out.push({ text: html.slice(last, m.index), accent: false }); out.push({ text: m[1], accent: true }); last = m.index + m[0].length; }
  if (last < html.length) out.push({ text: html.slice(last), accent: false });
  return out;
};

/** Kinetic type: letters spring up one after another (a little blur and tilt), the accent word sweeps in
 *  as one piece, the kicker's tracking closes up; on `out` the letters lift away in the same order. */
export const KineticTitle: React.FC<{ t: number; at: number; out: number; kicker: string; html: string; size: number; pulse?: number[]; offsetY?: number }> = ({ t, at, out, kicker, html, size, pulse = [], offsetY = 0 }) => {
  const T = useCfg().motion.titles;
  if (t < at - 0.05 || t > out + 0.6) return null;
  const total = parts(html).reduce((n, p) => n + p.text.length, 0);
  // the cascade: letters start `enter` apart (the whole line within 0.55 s) and lift away `leave` apart
  const enter = stagger(Math.min(T.letterDelay, 0.55 / Math.max(1, total)), { startDelay: 0.08 }), leave = stagger(Math.min(0.016, 0.3 / Math.max(1, total)));
  let i = 0;
  const glyph = (ch: string, key: string, accent = false) => {
    const k = i++;
    const p = springAt(t, at + enter(k, total), T.duration * 0.8, 0.2);
    const q0 = out + leave(k, total), q = transform(t, [q0, q0 + 0.3], [0, 1]);
    const y = (1 - p) * T.rise - q * T.exitLift, o = p * (1 - q);
    return (
      <span key={key} className={accent ? "grad-text" : undefined} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${y.toFixed(3)}em) rotate(${((1 - p) * T.tilt).toFixed(2)}deg)`, opacity: o, filter: (1 - p) * T.blur + q * 6 > 0.3 ? `blur(${((1 - p) * T.blur + q * 6).toFixed(1)}px)` : undefined }}>{ch}</span>
    );
  };
  const pul = pulse.reduce((s, w) => s + (t >= w && t < w + 0.35 ? T.pulse * transform(t, [w, w + 0.35], [1, 0]) ** 2 : 0), 0);
  const kp = springAt(t, at, 0.5, 0.15), kq = transform(t, [out, out + 0.25], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `translateY(${offsetY}px) scale(${(1 + pul).toFixed(4)})` }}>
      {kicker ? <div style={{ fontSize: Math.max(22, size * 0.2), fontWeight: 600, color: BLUE, letterSpacing: `${mix(0.5, 0.08, kp).toFixed(3)}em`, opacity: kp * (1 - kq) }}>{kicker}</div> : null}
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, marginTop: size * 0.05, color: INK, maxWidth: 1500 }}>
        {parts(html).map((pt, j) => pt.text.split(/(\s+)/).map((w, wi) => /^\s+$/.test(w)
          ? <span key={`${j}-s${wi}`}>{w.split("").map((c, n) => glyph(c, `${j}-${wi}-${n}`, pt.accent))}</span>
          : <span key={`${j}-w${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>{w.split("").map((c, n) => glyph(c, `${j}-${wi}-${n}`, pt.accent))}</span>))}
      </div>
    </div>
  );
};

export const Impact: React.FC<{ t: number }> = ({ t }) => {
  const D = TITLE_DROP, cfg = useCfg(), { text, show, style } = cfg;
  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* the first drop: "Workflow Maps" in kinetic type, a pulse on the wall of sound, lifts away in the break */}
      {show.titleDrop ? <KineticTitle t={t} at={D.at} out={D.out} kicker={text.titleDrop.kicker} html={md(text.titleDrop.title)} size={style.sizes.titleDrop} pulse={[D.wall]} /> : null}
      {/* the intro's statement cards (say), before each visual (show) */}
      {show.introCards && INTRO_CARDS.map((c, i) => <KineticTitle key={c.a} t={t} at={c.a} out={c.b - 0.3} kicker="" html={introCardHtml(cfg, i)} size={c.y ? style.sizes.introCardRaised : style.sizes.introCard} offsetY={c.y ?? 0} />)}

    </div>
  );
};

/** Bursts on the other big hits, drawn behind the title cards (placed before <Titles>). */
/** (Particle bursts removed: titles are type-only.) */
export const ImpactBack: React.FC<{ t: number }> = () => null;

/** Window shake on the intro's scramble hits and the first drop. */
export const shakeAt = (t: number, hits: number[], sh = { x: 9, y: 5, duration: 0.22 }) => {
  let x = 0, y = 0;
  for (const h of hits) if (t >= h && t < h + sh.duration) {
    const k = transform(t, [h, h + sh.duration], [1, 0]);
    x += Math.sin((t - h) * 90) * sh.x * k; y += Math.cos((t - h) * 70) * sh.y * k;
  }
  return [x, y];
};
export { M };
