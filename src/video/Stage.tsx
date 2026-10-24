// Everything outside the app window: background, titles, client message, flash. (The browser tabs are in Browser.tsx.)
import React from "react";
import { Img, staticFile } from "remotion";
import { mix, transform } from "motion";
import { easeIn, easeInOut, easeOut, linear, springAt } from "./anim";
import { KineticTitle } from "./Impact";
import { cardText, md, useCfg } from "./config";
import { BUILD_LINES, BUILD_LINES_START, CAPTIONS, CHAPTERS, FLASHES, HEADLINES, M, MESSAGE, TITLE_CARDS, WALLS } from "./script";

const INK = "var(--ink, #0B1B3A)";
const BLUE = "var(--accent, #155EEF)";
const hidden = (o: number): React.CSSProperties => ({ opacity: o, visibility: o <= 0.001 ? "hidden" : "visible" });
const html = (h: string) => ({ __html: h });

// ── Background: pale sky with a glowing planet rim along the bottom ──────────
export const Background: React.FC = () => {
  const B = useCfg().fx.background;
  return (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${B.skyTop} 0%, ${B.skyUpper} 40%, ${B.skyLower} 72%, ${B.skyBottom} 100%)` }} />
    {B.dots ? <div style={{
      position: "absolute", inset: 0, backgroundImage: [
        "radial-gradient(2px 2px at 12% 18%, rgba(21,94,239,.18) 50%, transparent 51%)",
        "radial-gradient(2px 2px at 82% 12%, rgba(21,94,239,.16) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 64% 30%, rgba(21,94,239,.18) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 30% 42%, rgba(21,94,239,.14) 50%, transparent 51%)",
        "radial-gradient(2px 2px at 92% 48%, rgba(21,94,239,.14) 50%, transparent 51%)",
        "radial-gradient(1.5px 1.5px at 6% 60%, rgba(21,94,239,.14) 50%, transparent 51%)",
      ].join(","),
    }} /> : null}
    {B.floor ? <><div style={{
      position: "absolute", left: "50%", top: 930, width: 3400, height: 1400, marginLeft: -1700, borderRadius: "50%",
      background: `radial-gradient(ellipse 50% 40% at 50% 0%, ${B.floorCentre} 0%, ${B.floorInner} 35%, ${B.floorMid} 70%, ${B.floorEdge} 100%)`,
      boxShadow: "0 -18px 60px rgba(66,140,255,.45), 0 -4px 14px rgba(255,255,255,.95)",
    }} />
    <div style={{
      position: "absolute", left: "50%", top: 926, width: 3400, height: 1400, marginLeft: -1700, borderRadius: "50%",
      borderTop: "3px solid rgba(255,255,255,.95)", filter: "blur(1px)",
    }} /></> : null}
  </div>
  );
};

/** `{20|50|100}` in a headline: one value at a time, each popping in on its beat (dropping 0.35 em into place from 1.25×, a
 * spring that bounces as it settles). */
const swapper = (h: string, beats: number[] | undefined, t: number) => h.replace(/\{([^}]+)\}/, (_, v: string) => {
  const vals = v.split("|"), at = beats ?? [];
  const i = Math.max(0, at.filter((b) => t >= b).length - 1), d = 1 - springAt(t, at[i] ?? 0, 0.35, 0.4);
  return `<span class="grad-text" style="display:inline-block;transform-origin:50% 100%;`
    + `transform:translateY(${(-0.35 * d).toFixed(4)}em) scale(${(1 + 0.25 * d).toFixed(4)})">${vals[Math.min(i, vals.length - 1)]}</span>`;
});

// ── Titles ───────────────────────────────────────────────────────────────────
/** Chapter pills are off: the statement cards name each section. */
const SHOW_CHAPTERS = false;
const SHOW_BUILD_LINES = false;

export const Titles: React.FC<{ t: number }> = ({ t }) => {
  const cfg = useCfg(), { text, show, style } = cfg;
  const logoO = show.opening && t < 3.9 ? transform(t, [0.2, 0.8, 3.6, 3.9], [0, 1, 1, 0], { ease: [easeOut, linear, easeInOut] }) : 0;
  const pillO = show.opening && t < 3.9 ? transform(t, [0.5, 1.0, 3.6, 3.9], [0, 1, 1, 0], { ease: [easeOut, linear, easeInOut] }) : 0;

  // the two headlines: the opening one and "What if something breaks across 20 / 50 / 100 workflows?", each with its own
  // text and switch
  const hi = HEADLINES.findIndex((h, i) => (i === 0 ? show.opening : show.breaksHeadline) && transform(t, [h.a, h.a + 0.5, h.b - 0.35, h.b], [0, 1, 1, 0]) > 0);
  const hl = hi >= 0 ? { ...HEADLINES[hi], html: swapper(md(hi === 0 ? text.opening.headline : text.breaksHeadline), HEADLINES[hi].beats, t) } : undefined;
  // after the intro the statement cards carry the text (WorkflowMapsVideo), so no caption or chapter pill competes with the visuals
  const cap = CAPTIONS.find((c) => c.a < M.D1 && transform(t, [c.a, c.a + 0.3, c.b - 0.25, c.b], [0, 1, 1, 0]) > 0);
  const chap = SHOW_CHAPTERS ? CHAPTERS.find((c) => transform(t, [c.a, c.a + 0.3, c.b - 0.3, c.b], [0, 1, 1, 0]) > 0) : undefined;
  const card = show.titleCards ? TITLE_CARDS.find((c) => transform(t, [c.a, c.a + 0.18, c.b - 0.3, c.b], [0, 1, 1, 0]) > 0) : undefined;
  // the build lines sit in timeline 93–100.6, which the edit skips; only a faint ghost leaked into the panel shot's fade, so they're off
  const buildOn = SHOW_BUILD_LINES && t >= M.B2 && t < M.D2;
  const lkIn = springAt(t, M.LOGO, 0.7, 0.35), lk = show.lockup ? lkIn * transform(t, [M.END - 0.9, M.END], [1, 0], { ease: easeInOut }) : 0;

  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, color: INK }}>
      {/* Opening brand */}
      <Img src={staticFile("brand/highlevel-logo-dark.png")} style={{ position: "absolute", left: 110, top: 78, height: 64, ...hidden(logoO) }} />
      <div style={{
        position: "absolute", left: 110, top: 170, height: 56, padding: "0 34px", borderRadius: 999, background: "var(--pill, #4A90F7)", color: INK,
        fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", letterSpacing: ".02em",
        transform: `translateY(${(1 - springAt(t, 0.5, 0.5, 0.3)) * 20}px)`, ...hidden(pillO),
      }}>{text.opening.pill}</div>

      {/* Headline (a kicker makes it a centred statement in the cards' type: 800, -0.03em, 1.12 leading) */}
      {hl ? (
        <div style={{
          position: "absolute", left: hl.center ? 0 : 106, width: hl.center ? 1920 : 1400, textAlign: hl.center ? "center" : "left", top: hl.top,
          transform: `translateY(${transform(t, [hl.a, hl.a + 0.6, hl.b - 0.35, hl.b], [hl.kicker ? 30 : 60, 0, 0, -40], { ease: [easeOut, linear, easeIn] })}px)`,
          ...hidden(transform(t, [hl.a, hl.a + 0.5, hl.b - 0.35, hl.b], [0, 1, 1, 0])),
        }}>
          {/* a soft glow of the page's sky behind a statement, so it reads over the receded map */}
          {hl.kicker ? <div style={{ position: "absolute", left: "50%", top: "50%", width: 1500, height: 520, marginLeft: -750, marginTop: -260, zIndex: -1,
            background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(244,248,255,0.94) 0%, rgba(244,248,255,0.86) 45%, rgba(244,248,255,0) 100%)" }} /> : null}
          {hl.kicker ? <div style={{ fontSize: Math.max(22, hl.size * 0.2), fontWeight: 600, color: BLUE, letterSpacing: "0.08em", marginBottom: hl.size * 0.12 }}>{hl.kicker}</div> : null}
          <div dangerouslySetInnerHTML={html(hl.html)} style={{ fontSize: hl.size, fontWeight: 800, lineHeight: hl.kicker ? 1.12 : 1.04, letterSpacing: hl.kicker ? "-0.03em" : "-0.02em" }} />
        </div>
      ) : null}

      {/* Caption above the window */}
      {cap ? (
        <div dangerouslySetInnerHTML={html(cap.html)} style={{
          position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontWeight: 700, fontSize: 40, letterSpacing: "-0.01em",
          transform: `translateY(${(1 - springAt(t, cap.a, 0.4, 0.25)) * 24}px)`, ...hidden(transform(t, [cap.a, cap.a + 0.3, cap.b - 0.25, cap.b], [0, 1, 1, 0])),
        }} />
      ) : null}

      {/* Chapter pill */}
      {chap ? (
        <div style={{
          position: "absolute", left: 150, top: 58, height: 46, padding: "0 20px 0 8px", display: "flex", alignItems: "center", gap: 12,
          borderRadius: 999, background: "#fff", boxShadow: "0 8px 24px rgba(16,44,102,.12), 0 0 0 1px rgba(16,44,102,.06)",
          fontWeight: 600, fontSize: 20, transform: `translateY(${transform(t, [chap.a, chap.a + 0.4], [1, 0], { ease: easeOut }) * -16}px)`,
          ...hidden(transform(t, [chap.a, chap.a + 0.3, chap.b - 0.3, chap.b], [0, 1, 1, 0])),
        }}>
          <span style={{ width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", background: BLUE }}>{chap.n}</span>
          {chap.text}
        </div>
      ) : null}

      {/* Title card */}
      {card ? <KineticTitle t={t} at={card.a} out={card.b - 0.25} {...cardText(cfg, card)} size={style.sizes.titleCard} pulse={WALLS} /> : null}

      {/* Build lines before drop 2 */}
      <div style={{ position: "absolute", left: 120, top: 300, fontWeight: 800, fontSize: 84, lineHeight: 1.12 }}>
        {BUILD_LINES.map((line, i) => {
          const a = BUILD_LINES_START + i * M.BAR;
          const k = buildOn ? transform(t, [a, a + 0.35], [0, 1], { ease: easeOut }) : 0;
          const o = k * (t > M.SIL ? transform(t, [M.SIL + 0.4, M.D2], [1, 0], { ease: easeInOut }) : 1);
          return (
            <div key={line} className={i === BUILD_LINES.length - 1 ? "grad-text" : undefined}
              style={{ opacity: o, transform: `translateX(${(1 - k) * -40}px)` }}>{line}</div>
          );
        })}
      </div>

      {/* Logo lockup */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${mix(0.9, 1, lkIn)})`, ...hidden(lk) }}>
        <Img src={staticFile("brand/highlevel-logo-dark.png")} style={{ height: 70 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 32, fontSize: style.sizes.lockup, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1 }}>
          {text.lockup.name} <span className="grad-text">{text.lockup.accent}</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", background: "var(--badge, #7F56D9)", borderRadius: 12, padding: "8px 14px", letterSpacing: ".04em", alignSelf: "flex-start", marginTop: 14 }}>{text.lockup.badge}</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 44, fontWeight: 600, color: "#344054" }}>{text.lockup.tagline}</div>
      </div>
    </div>
  );
};

// ── Client message bubble ────────────────────────────────────────────────────
export const Message: React.FC<{ t: number }> = ({ t }) => {
  const { text, show } = useCfg();
  if (!show.clientMessage) return null;
  let o = 0;
  let left = 980;
  let top = 250;
  let scale = 1;
  let origin = "0 0";
  let check = 0;
  if (t >= MESSAGE.from && t < MESSAGE.to) {
    const mk = springAt(t, MESSAGE.from, 0.45, 0.35);
    left = 1290;
    top = 24;
    o = mk * transform(t, [MESSAGE.to - 0.4, MESSAGE.to], [1, 0], { ease: easeInOut });
    scale = 0.8 * mix(0.85, 1, mk);
    origin = "100% 0";
    check = transform(t, [MESSAGE.answeredAt, MESSAGE.answeredAt + 0.3], [0, 1], { ease: easeInOut });
  }
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left, top, transformOrigin: origin, transform: `scale(${scale})`, opacity: o, whiteSpace: "nowrap",
      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 16, background: "#fff",
      boxShadow: "0 18px 50px rgba(16,24,40,.16), 0 0 0 1px rgba(16,24,40,.06)", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, background: "#FEF0C7", color: "#B54708", flexShrink: 0 }}>{text.clientMessage.initials}</div>
      <div>
        <div style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, color: "#667085" }}>{text.clientMessage.from}</div>
        <div style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "#101828" }}>{text.clientMessage.text}</div>
      </div>
      <div style={{ marginLeft: 8, marginTop: 4, width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "#12B76A", opacity: check }}>
        <svg width={16} height={16} viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" /></svg>
      </div>
    </div>
  );
};

// ── White flash on drops and hits ────────────────────────────────────────────
export const Flash: React.FC<{ t: number }> = ({ t }) => {
  const F = useCfg().fx.flash;
  const o = Math.max(0, ...FLASHES.map((d) => (t >= d && t < d + F.duration ? transform(t, [d, d + F.duration], [F.strength, 0]) : 0)));
  return o > 0 ? <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: o }} /> : null;
};
