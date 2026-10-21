// Multi-panel shots (script.ts PANELS): the three-panel Organise shot and the Search + Filter pair. Each panel is a crop
// of the app footage; all panels sit on screen together, their labels and animations start one after another.
// Also the film clip window (a stretch of film shown in the app window, e.g. the hand-offs on the second drop).
import React from "react";
import { Freeze, OffthreadVideo, staticFile } from "remotion";
import { clamp, easeOut, prog } from "./anim";
import { APP_FILE, FPS, PanelShot } from "./script";
import { WINDOW } from "./AppWindow";
import { KineticTitle } from "./Impact";

const GAP = 30, TOP = 300;
const BLUE = "#155EEF";

export const Panels: React.FC<{ cfg: PanelShot; lt: number; kicker: string; html: string; fade: number }> = ({ cfg, lt, kicker, html, fade }) => {
  const [PW, PH] = cfg.size, N = cfg.panels.length;
  const x0 = (1920 - (PW * N + GAP * (N - 1))) / 2;
  const outAt = cfg.outro ? cfg.outro.at : cfg.dur + 1;
  return (
    <div className="poppins" style={{ position: "absolute", inset: 0, opacity: fade }}>
      {/* the line on top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: prog(lt, 0, 0.4, easeOut) * (1 - prog(lt, outAt - 0.3, outAt)), transform: `translateY(${(1 - prog(lt, 0, 0.4, easeOut)) * 20}px)` }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: BLUE, letterSpacing: "0.12em" }}>{kicker}</div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em", color: "#0B1B3A", marginTop: 4 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {/* the closing line replaces it */}
      {cfg.outro ? <KineticTitle t={lt} at={cfg.outro.at} out={cfg.dur + 1} kicker="" html={cfg.outro.html} size={56} offsetY={-372} /> : null}
      {cfg.panels.map((p, i) => {
        const [cx, cy, cw] = p.crop, sc = PW / cw;
        const on = prog(lt, p.at, p.at + 0.35, easeOut);
        const ft = p.src[0] + clamp(lt - p.at - 0.3, 0, p.src[1] - p.src[0]);
        return (
          <div key={p.label} style={{ position: "absolute", left: x0 + i * (PW + GAP), top: TOP - 64 }}>
            <div style={{ height: 52, display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700, color: "#0B1B3A", opacity: on, transform: `translateY(${(1 - on) * 14}px)` }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, background: BLUE, color: "#fff", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              {p.label}
            </div>
            <div style={{
              position: "relative", marginTop: 12, width: PW, height: PH, borderRadius: 16, overflow: "hidden", background: "#fff",
              boxShadow: `0 24px 60px rgba(16,44,102,${(0.08 + 0.12 * on).toFixed(3)}), 0 0 0 ${on > 0.5 ? 2 : 1}px rgba(21,94,239,${(0.08 + 0.5 * on).toFixed(3)})`,
              opacity: 0.45 + 0.55 * on, transform: `scale(${(0.97 + 0.03 * on).toFixed(4)})`,
            }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1620, height: 880, transformOrigin: "0 0", transform: `scale(${sc.toFixed(4)}) translate(${-cx}px, ${-cy}px)` }}>
                <Freeze frame={Math.round(ft * FPS)}>
                  <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: 1620, height: 880 }} />
                </Freeze>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** A stretch of film in the app window (same frame as AppWindow), with an optional line above it. */
export const ClipWindow: React.FC<{ film: number; lt: number; kicker: string; html: string; fade: number }> = ({ film, lt, kicker, html, fade }) => (
  <>
    <div style={{
      position: "absolute", left: WINDOW.left, top: WINDOW.top, width: WINDOW.width, height: WINDOW.height, borderRadius: 18, background: "#fff", overflow: "hidden", opacity: fade,
      boxShadow: "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
    }}>
      <Freeze frame={Math.round(film * FPS)}>
        <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: WINDOW.width, height: WINDOW.height }} />
      </Freeze>
    </div>
    <div className="poppins" style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: fade * prog(lt, 0.1, 0.5, easeOut), transform: `translateY(${((1 - prog(lt, 0.1, 0.5, easeOut)) * 20).toFixed(1)}px)` }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: BLUE, letterSpacing: "0.12em", marginBottom: 2 }}>{kicker}</div>
      <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.01em", color: "#0B1B3A" }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </>
);
