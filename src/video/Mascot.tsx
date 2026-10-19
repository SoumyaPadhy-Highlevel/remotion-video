import React from "react";
import { Img, staticFile } from "remotion";
import { clamp, rand } from "./anim";
import type { MascotState } from "./choreography";

// Eye centres in the 840×580 mascot artwork (public/brand/mascot-noeyes.png).
const EYES = [
  { cx: 521, cy: 261, rx: 22, ry: 42, rot: 12 },
  { cx: 619, cy: 300, rx: 17, ry: 40, rot: 10 },
];
const SPARK_COLOURS = ["#FFBC00", "#37CA37", "#188BF6", "#22CCEE"];

export const Mascot: React.FC<{ t: number; st: MascotState }> = ({ t, st }) => {
  const { x, y, s, r = 0, o = 1, eyes = "normal", look = [0, 0], sparkle = 0, streak = 0, q = 0 } = st;
  const bob = Math.sin(t * 2.2) * 8;
  const sway = Math.sin(t * 1.3) * 2;
  // Blink every ~3.4 s for 0.14 s.
  const ph = (t + 0.7) % 3.4;
  const blink = ph < 0.14 ? Math.abs(Math.sin((ph / 0.14) * Math.PI)) : 0;

  const eyeEls = EYES.map((e, i) => {
    const cx = e.cx + look[0] * (i ? 0.85 : 1);
    const cy = e.cy + look[1];
    const rot = `rotate(${e.rot} ${cx} ${cy})`;
    if (eyes === "happy") {
      return (
        <path key={i} d={`M ${cx - e.rx * 1.1} ${cy + 8} Q ${cx} ${cy - e.ry * 0.9} ${cx + e.rx * 1.1} ${cy + 8}`}
          stroke="url(#eyefill)" strokeWidth={13} strokeLinecap="round" fill="none" transform={rot} />
      );
    }
    if (eyes === "star") {
      const R = e.ry * 0.95;
      const rr = R * 0.45;
      let p = "";
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5 + t * 1.5;
        const rad = k % 2 ? rr : R;
        p += `${k ? "L" : "M"} ${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad} `;
      }
      return <path key={i} d={`${p}Z`} fill="url(#eyefill)" />;
    }
    let sx = 1;
    let sy = 1;
    if (eyes === "wow") { sx = 1.25; sy = 1.18; }
    if (eyes === "squint") sy = 0.35;
    if (eyes === "worried") { sy = 0.8; sx = 0.9; }
    sy *= 1 - blink * 0.92;
    return (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={e.rx * sx} ry={e.ry * sy} fill="url(#eyefill)" transform={rot} />
        {eyes === "worried" ? (
          <path d={`M ${cx - e.rx * 1.3} ${cy - e.ry * (i ? 0.95 : 1.15)} L ${cx + e.rx * 1.2} ${cy - e.ry * (i ? 1.2 : 0.9)}`}
            stroke="#8FF2FF" strokeWidth={6} strokeLinecap="round" transform={rot} />
        ) : null}
      </g>
    );
  });

  const sparks: React.ReactNode[] = [];
  if (sparkle > 0.01) {
    for (let k = 0; k < 7; k++) {
      const a = rand(k) * Math.PI * 2;
      const d = 230 + rand(k + 9) * 90;
      const ph2 = clamp(sparkle * 1.4 - k * 0.06);
      const cx = 560 + Math.cos(a) * d * (0.6 + ph2 * 0.4);
      const cy = 270 + Math.sin(a) * d * 0.7 * (0.6 + ph2 * 0.4);
      const R = (18 + rand(k + 3) * 18) * Math.sin(ph2 * Math.PI) * (0.8 + 0.2 * Math.sin(t * 9 + k));
      if (R <= 0.5) continue;
      sparks.push(
        <path key={k} fill={SPARK_COLOURS[k % 4]}
          d={`M ${cx} ${cy - R} Q ${cx + R * 0.18} ${cy - R * 0.18} ${cx + R} ${cy} Q ${cx + R * 0.18} ${cy + R * 0.18} ${cx} ${cy + R} Q ${cx - R * 0.18} ${cy + R * 0.18} ${cx - R} ${cy} Q ${cx - R * 0.18} ${cy - R * 0.18} ${cx} ${cy - R} Z`} />,
      );
    }
  }

  return (
    <div style={{
      position: "absolute", left: 0, top: 0, width: 840, height: 580, transformOrigin: "50% 50%",
      opacity: o, visibility: o < 0.01 ? "hidden" : "visible",
      transform: `translate(${x - 420}px, ${y - 290 + bob}px) scale(${s}) rotate(${r + sway}deg)`,
    }}>
      <div style={{
        position: "absolute", left: -520, top: 160, width: 760, height: 300, opacity: streak,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(160,210,255,0) 30%, rgba(130,195,255,.35) 75%, rgba(255,255,255,.75) 100%)",
        filter: "blur(22px)", borderRadius: 150, transform: "rotate(-14deg) scaleY(.55)",
      }} />
      <Img src={staticFile("brand/mascot-noeyes.png")} style={{ position: "absolute", left: 0, top: 0, width: 840, height: 580 }} />
      <svg viewBox="0 0 840 580" width={840} height={580} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <filter id="eyeglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="eyefill" cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#E9FFFF" />
            <stop offset="55%" stopColor="#8FF2FF" />
            <stop offset="100%" stopColor="#3FD3F5" />
          </radialGradient>
        </defs>
        <g filter="url(#eyeglow)">{eyeEls}</g>
        <g>{sparks}</g>
      </svg>
      <div className="poppins" style={{
        position: "absolute", left: 600, top: -40, fontSize: 150, fontWeight: 800, color: "#155EEF",
        opacity: q, textShadow: "0 8px 24px rgba(21,94,239,.35)",
        transform: `translateY(${(1 - q) * 30}px) rotate(${Math.sin(t * 6) * 8}deg)`,
      }}>?</div>
    </div>
  );
};
