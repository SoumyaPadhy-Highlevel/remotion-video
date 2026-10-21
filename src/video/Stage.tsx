// Everything outside the app window: background, browser tabs, titles, client message, flash.
import React from "react";
import { Img, staticFile } from "remotion";
import { easeIn, easeOut, easeOutBack, prog, win } from "./anim";
import { KineticTitle } from "./Impact";
import { BUILD_LINES, BUILD_LINES_START, CAPTIONS, CHAPTERS, FLASHES, HEADLINES, LOCKUP, M, MESSAGE, TABS, TITLE_CARDS, WALLS } from "./script";

const INK = "#0B1B3A";
const BLUE = "#155EEF";
const hidden = (o: number): React.CSSProperties => ({ opacity: o, visibility: o <= 0.001 ? "hidden" : "visible" });
const html = (h: string) => ({ __html: h });

// ── Background: pale sky with a glowing planet rim along the bottom ──────────
export const Background: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 40%, #DDEBFF 72%, #C9DFFF 100%)" }} />
    <div style={{
      position: "absolute", inset: 0, backgroundImage: [
        "radial-gradient(2px 2px at 12% 18%, rgba(21,94,239,.18) 50%, transparent 51%)",
        "radial-gradient(2px 2px at 82% 12%, rgba(21,94,239,.16) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 64% 30%, rgba(21,94,239,.18) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 30% 42%, rgba(21,94,239,.14) 50%, transparent 51%)",
        "radial-gradient(2px 2px at 92% 48%, rgba(21,94,239,.14) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 6% 60%, rgba(21,94,239,.14) 50%, transparent 51%)",
      ].join(","),
    }} />
    <div style={{
      position: "absolute", left: "50%", top: 930, width: 3400, height: 1400, marginLeft: -1700, borderRadius: "50%",
      background: "radial-gradient(ellipse 50% 40% at 50% 0%, #FFFFFF 0%, #E3EFFF 35%, #B9D5FF 70%, #9CC3FF 100%)",
      boxShadow: "0 -18px 60px rgba(66,140,255,.45), 0 -4px 14px rgba(255,255,255,.95)",
    }} />
    <div style={{
      position: "absolute", left: "50%", top: 926, width: 3400, height: 1400, marginLeft: -1700, borderRadius: "50%",
      borderTop: "3px solid rgba(255,255,255,.95)", filter: "blur(1px)",
    }} />
  </div>
);

// ── Browser tabs piling up above the window ──────────────────────────────────
const WorkflowIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, flexShrink: 0, display: "block" }}>
    <path fill="currentColor" d="M9 2v6h2v3H5c-1.11 0-2 .89-2 2v3H1v6h6v-6H5v-3h6v3H9v6h6v-6h-2v-3h6v3h-2v6h6v-6h-2v-3c0-1.11-.89-2-2-2h-6V8h2V2z" />
  </svg>
);

export const BrowserTabs: React.FC<{ t: number }> = ({ t }) => {
  const n = t < TABS.b ? TABS.times.filter((x) => t >= x).length : 0;
  const pop = n ? Math.min(1, (t - TABS.times[n - 1]) / 0.12) : 1;
  if (!n) return null;
  return (
    <div style={{ position: "absolute", left: 150, top: 70, width: 1620, height: 48, display: "flex", alignItems: "flex-end", gap: 2, paddingLeft: 10, boxSizing: "border-box" }}>
      {TABS.names.slice(0, n).map((name, i) => (
        <div key={name} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontSize: 12, fontWeight: 500, color: "#344054",
          overflow: "hidden", whiteSpace: "nowrap", height: 38, borderRadius: "10px 10px 0 0",
          background: i === n - 1 ? "#fff" : "#E4ECF7", boxShadow: "0 -1px 0 rgba(16,24,40,.06)", flex: "1 1 0", minWidth: 0, maxWidth: 220,
          transform: i === n - 1 ? `translateY(${(1 - pop) * 14}px)` : undefined, opacity: i === n - 1 ? pop : 1,
        }}>
          <WorkflowIcon size={14} color={BLUE} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
        </div>
      ))}
    </div>
  );
};

// ── Titles ───────────────────────────────────────────────────────────────────
/** Chapter pills are off: the statement cards name each section. */
const SHOW_CHAPTERS = false;

export const Titles: React.FC<{ t: number }> = ({ t }) => {
  const logoO = t < 3.9 ? prog(t, 0.2, 0.8, easeOut) * (1 - prog(t, 3.6, 3.9)) : 0;
  const pillO = t < 3.9 ? prog(t, 0.5, 1.0, easeOut) * (1 - prog(t, 3.6, 3.9)) : 0;

  const hl = HEADLINES.find((h) => win(t, h.a, h.b, 0.5, 0.35) > 0);
  // after the intro the statement cards carry the text (WorkflowMapsVideo), so no caption or chapter pill competes with the visuals
  const cap = CAPTIONS.find((c) => c.a < M.D1 && win(t, c.a, c.b, 0.3, 0.25) > 0);
  const chap = SHOW_CHAPTERS ? CHAPTERS.find((c) => win(t, c.a, c.b, 0.3, 0.3) > 0) : undefined;
  const card = TITLE_CARDS.find((c) => win(t, c.a, c.b, 0.18, 0.3) > 0);
  const buildOn = t >= M.B2 && t < M.D2;
  const lk = prog(t, M.LOGO, M.LOGO + 0.7, easeOutBack) * (1 - prog(t, M.END - 0.9, M.END));

  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, color: INK }}>
      {/* Opening brand */}
      <Img src={staticFile("brand/highlevel-logo-dark.png")} style={{ position: "absolute", left: 110, top: 78, height: 64, ...hidden(logoO) }} />
      <div style={{
        position: "absolute", left: 110, top: 170, height: 56, padding: "0 34px", borderRadius: 999, background: "#4A90F7", color: INK,
        fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", letterSpacing: ".02em",
        transform: `translateY(${(1 - prog(t, 0.5, 1.0, easeOut)) * 20}px)`, ...hidden(pillO),
      }}>WORKFLOWS</div>

      {/* Headline */}
      {hl ? (
        <div dangerouslySetInnerHTML={html(hl.html)} style={{
          position: "absolute", left: hl.center ? 0 : 106, width: hl.center ? 1920 : 1400, textAlign: hl.center ? "center" : "left",
          top: hl.top, fontSize: hl.size, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.02em",
          transform: `translateY(${(1 - prog(t, hl.a, hl.a + 0.6, easeOut)) * 60 - prog(t, hl.b - 0.35, hl.b, easeIn) * 40}px)`,
          ...hidden(win(t, hl.a, hl.b, 0.5, 0.35)),
        }} />
      ) : null}

      {/* Caption above the window */}
      {cap ? (
        <div dangerouslySetInnerHTML={html(cap.html)} style={{
          position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontWeight: 700, fontSize: 40, letterSpacing: "-0.01em",
          transform: `translateY(${(1 - prog(t, cap.a, cap.a + 0.4, easeOut)) * 24}px)`, ...hidden(win(t, cap.a, cap.b, 0.3, 0.25)),
        }} />
      ) : null}

      {/* Chapter pill */}
      {chap ? (
        <div style={{
          position: "absolute", left: 150, top: 58, height: 46, padding: "0 20px 0 8px", display: "flex", alignItems: "center", gap: 12,
          borderRadius: 999, background: "#fff", boxShadow: "0 8px 24px rgba(16,44,102,.12), 0 0 0 1px rgba(16,44,102,.06)",
          fontWeight: 600, fontSize: 20, transform: `translateY(${(1 - prog(t, chap.a, chap.a + 0.4, easeOut)) * -16}px)`,
          ...hidden(win(t, chap.a, chap.b, 0.3, 0.3)),
        }}>
          <span style={{ width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", background: BLUE }}>{chap.n}</span>
          {chap.text}
        </div>
      ) : null}

      {/* Title card */}
      {card ? <KineticTitle t={t} at={card.a} out={card.b - 0.25} kicker={card.kicker} html={card.html} size={120} pulse={WALLS} /> : null}

      {/* Build lines before drop 2 */}
      <div style={{ position: "absolute", left: 120, top: 300, fontWeight: 800, fontSize: 84, lineHeight: 1.12 }}>
        {BUILD_LINES.map((line, i) => {
          const a = BUILD_LINES_START + i * M.BAR;
          const k = buildOn ? prog(t, a, a + 0.35, easeOut) : 0;
          const o = k * (t > M.SIL ? 1 - prog(t, M.SIL + 0.4, M.D2) : 1);
          return (
            <div key={line} className={i === BUILD_LINES.length - 1 ? "grad-text" : undefined}
              style={{ opacity: o, transform: `translateX(${(1 - k) * -40}px)` }}>{line}</div>
          );
        })}
      </div>

      {/* Logo lockup */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.9 + 0.1 * lk})`, ...hidden(lk) }}>
        <Img src={staticFile("brand/highlevel-logo-dark.png")} style={{ height: 70 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 32, fontSize: 132, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1 }}>
          {LOCKUP.name} <span className="grad-text">{LOCKUP.accent}</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", background: "#7F56D9", borderRadius: 12, padding: "8px 14px", letterSpacing: ".04em", alignSelf: "flex-start", marginTop: 14 }}>{LOCKUP.badge}</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 44, fontWeight: 600, color: "#344054" }}>{LOCKUP.tagline}</div>
      </div>
    </div>
  );
};

// ── Client message bubble ────────────────────────────────────────────────────
export const Message: React.FC<{ t: number }> = ({ t }) => {
  let o = 0;
  let left = 980;
  let top = 250;
  let scale = 1;
  let origin = "0 0";
  let check = 0;
  if (t >= MESSAGE.from && t < MESSAGE.to) {
    const mk = prog(t, MESSAGE.from, MESSAGE.from + 0.4, easeOutBack);
    left = 1290;
    top = 24;
    o = mk * (1 - prog(t, MESSAGE.to - 0.4, MESSAGE.to));
    scale = 0.8 * (0.85 + 0.15 * mk);
    origin = "100% 0";
    check = prog(t, MESSAGE.answeredAt, MESSAGE.answeredAt + 0.3);
  }
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left, top, transformOrigin: origin, transform: `scale(${scale})`, opacity: o, whiteSpace: "nowrap",
      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 16, background: "#fff",
      boxShadow: "0 18px 50px rgba(16,24,40,.16), 0 0 0 1px rgba(16,24,40,.06)", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, background: "#FEF0C7", color: "#B54708", flexShrink: 0 }}>{MESSAGE.initials}</div>
      <div>
        <div style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, color: "#667085" }}>{MESSAGE.who}</div>
        <div style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "#101828" }}>{MESSAGE.text}</div>
      </div>
      <div style={{ marginLeft: 8, marginTop: 4, width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "#12B76A", opacity: check }}>
        <svg width={16} height={16} viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" /></svg>
      </div>
    </div>
  );
};

// ── White flash on drops and hits ────────────────────────────────────────────
export const Flash: React.FC<{ t: number }> = ({ t }) => {
  const o = Math.max(0, ...FLASHES.map((d) => (t >= d && t < d + 0.45 ? 0.75 * (1 - (t - d) / 0.45) : 0)));
  return o > 0 ? <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: o }} /> : null;
};
