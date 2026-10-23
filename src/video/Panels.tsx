// Multi-panel shots (script.ts PANELS): the three-panel Organise shot and the Search + Filter pair. Each panel is a crop
// of the app footage; all panels sit on screen together, their labels and animations start one after another.
// Also the film clip window (a stretch of film shown in the app window, e.g. the hand-offs on the second drop).
import React from "react";
import { Freeze, OffthreadVideo, staticFile } from "remotion";
import { clamp, easeInOut, easeOut, lerp, prog } from "./anim";
import { PANEL_CLIPS } from "./panelCursor";
import { APP_FILE, FPS, PanelShot } from "./script";
import { WINDOW } from "./AppWindow";
import { KineticTitle } from "./Impact";
import { md, useCfg } from "./config";

const GAP = 30, TOP = 300;
const BLUE = "var(--accent, #155EEF)", INK = "var(--ink, #0B1B3A)";

export const Panels: React.FC<{ cfg: PanelShot; lt: number; kicker: string; html: string; fade: number }> = ({ cfg, lt, kicker, html, fade }) => {
  const [PW, PH] = cfg.size, N = cfg.panels.length;
  const x0 = (1920 - (PW * N + GAP * (N - 1))) / 2;
  const outAt = cfg.outro ? cfg.outro.at : cfg.dur + 1;
  const { text, show, style } = useCfg(), P = text.panelShots;
  const labels = N === 2 ? [P.searchLabel, P.filterLabel] : [P.colourLabel, P.notesLabel, P.renameLabel];
  const cap = show.panelCaptions ? 1 : 0;
  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, opacity: fade }}>
      {/* the line on top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: cap * prog(lt, 0, 0.4, easeOut) * (1 - prog(lt, outAt - 0.3, outAt)), transform: `translateY(${(1 - prog(lt, 0, 0.4, easeOut)) * 20}px)` }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: BLUE, letterSpacing: "0.12em" }}>{kicker}</div>
        <div style={{ fontSize: style.sizes.panelCaption, fontWeight: 800, letterSpacing: "-0.02em", color: INK, marginTop: 4 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {/* the closing line replaces it */}
      {cfg.outro && cap ? <KineticTitle t={lt} at={cfg.outro.at} out={cfg.dur + 1} kicker="" html={md(P.tidyOutro)} size={style.sizes.panelCaption} offsetY={-372} /> : null}
      {cfg.panels.map((p, i) => {
        const [cx, cy, cw] = p.crop, sc = PW / cw;
        const on = prog(lt, p.at, p.at + 0.35, easeOut);
        const pc = p.clip != null ? PANEL_CLIPS[p.clip] : null;
        const ft = pc ? pc.offset + clamp(lt - p.at - 0.3, 0, (pc.frames.length - 1) / FPS) : p.src[0] + clamp(lt - p.at - 0.3, 0, p.src[1] - p.src[0]);
        return (
          <div key={p.label} style={{ position: "absolute", left: x0 + i * (PW + GAP), top: TOP - 64 }}>
            <div style={{ height: 52, display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700, color: INK, opacity: on * cap, transform: `translateY(${(1 - on) * 14}px)` }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, background: BLUE, color: "#fff", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              {labels[i] ?? p.label}
            </div>
            <div style={{
              position: "relative", marginTop: 12, width: PW, height: PH, borderRadius: 16, overflow: "hidden", background: "#fff",
              boxShadow: `0 24px 60px rgba(16,44,102,${(0.08 + 0.12 * on).toFixed(3)}), 0 0 0 ${on > 0.5 ? 2 : 1}px rgba(21,94,239,${(0.08 + 0.5 * on).toFixed(3)})`,
              opacity: 0.45 + 0.55 * on, transform: `scale(${(0.97 + 0.03 * on).toFixed(4)})`,
            }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1620, height: 880, transformOrigin: "0 0", transform: `scale(${sc.toFixed(4)}) translate(${-cx}px, ${-cy}px)` }}>
                <Freeze frame={Math.round(ft * FPS)}>
                  <OffthreadVideo src={staticFile(`footage/${pc ? "organise-panels.mp4" : APP_FILE}`)} muted style={{ width: 1620, height: 880 }} />
                </Freeze>
              </div>
            </div>
          </div>
        );
      })}
      {cfg.cursor ? <PanelCursor cfg={cfg} lt={lt} x0={x0} /> : null}
    </div>
  );
};

/** The one cursor of a panel shot: inside a playing panel it follows the film cursor's recorded path (mapped through the
 * panel's crop and scale); between panels it glides from where one action ended to where the next begins. */
const PanelCursor: React.FC<{ cfg: PanelShot; lt: number; x0: number }> = ({ cfg, lt, x0 }) => {
  const [PW] = cfg.size;
  const legs = cfg.panels.map((p, i) => {
    const pc = PANEL_CLIPS[p.clip!], [cx, cy, cw] = p.crop, sc = PW / cw, left = x0 + i * (PW + GAP);
    const map = (f: number[]) => [left + (f[0] - cx) * sc, TOP + (f[1] - cy) * sc];
    return { t0: p.at + 0.3, t1: p.at + 0.3 + (pc.frames.length - 1) / FPS, pc, sc, map };
  });
  let x = 0, y = 0, sc = 1, op = 1, ring = 0;
  const first = legs[0], f0 = first.map(first.pc.frames[0]);
  if (lt < first.t0) {
    const k = prog(lt, 0, first.t0, easeInOut);
    x = lerp(960, f0[0], k); y = lerp(1120, f0[1], k) - 60 * Math.sin(Math.PI * k); sc = lerp(1, first.sc, k);
  } else {
    for (let i = 0; i < legs.length; i++) {
      const L = legs[i];
      if (lt <= L.t1 || i === legs.length - 1) {
        const fr = L.pc.frames[Math.min(L.pc.frames.length - 1, Math.max(0, Math.round((lt - L.t0) * FPS)))];
        [x, y] = L.map(fr); sc = L.sc; op = fr[2]; ring = fr[3];
        break;
      }
      const N = legs[i + 1];
      if (lt < N.t0) {
        // glide to the next panel (a slight arc), resizing to its scale
        const a = L.map(L.pc.frames[L.pc.frames.length - 1]), b = N.map(N.pc.frames[0]), k = prog(lt, L.t1, N.t0, easeInOut);
        x = lerp(a[0], b[0], k); y = lerp(a[1], b[1], k) - 50 * Math.sin(Math.PI * k); sc = lerp(L.sc, N.sc, k);
        break;
      }
    }
  }
  const rg = ring > 0 ? 1 - ring / 0.55 : -1;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`, transformOrigin: "0 0", opacity: op }}>
      {rg >= 0 ? <div style={{ position: "absolute", left: 3, top: 3, width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 22, border: "3px solid #155EEF", opacity: ring, transform: `scale(${(0.3 + rg * 0.9).toFixed(3)})` }} /> : null}
      <svg width="26" height="32" viewBox="0 0 26 32" style={{ display: "block" }}><path d="M2 2 L2 25 L8 19.5 L12.2 28.6 L16.2 26.8 L12.1 18 L20 18 Z" fill="#101828" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
    </div>
  );
};

/** A stretch of film in the app window (same frame as AppWindow), with an optional line above it. */
export const ClipWindow: React.FC<{ film: number; lt: number; kicker: string; html: string; fade: number }> = ({ film, lt, kicker, html, fade }) => {
  const { show, style } = useCfg();
  return <>
    <div style={{
      position: "absolute", left: WINDOW.left, top: WINDOW.top, width: WINDOW.width, height: WINDOW.height, borderRadius: 18, background: "#fff", overflow: "hidden", opacity: fade,
      boxShadow: "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
    }}>
      <Freeze frame={Math.round(film * FPS)}>
        <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: WINDOW.width, height: WINDOW.height }} />
      </Freeze>
    </div>
    <div className="poppins" style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: (show.panelCaptions ? 1 : 0) * fade * prog(lt, 0.1, 0.5, easeOut), transform: `translateY(${((1 - prog(lt, 0.1, 0.5, easeOut)) * 20).toFixed(1)}px)` }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: BLUE, letterSpacing: "0.12em", marginBottom: 2 }}>{kicker}</div>
      <div style={{ fontSize: style.sizes.topLine, fontWeight: 700, letterSpacing: "-0.01em", color: INK }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </>;
};
