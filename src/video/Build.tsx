// "How the map works": while the film builds the map, the window sits shrunk on the right and the left panel walks the
// three steps. Under the active step, the source list (folders, then Lead Capture's workflows, then their assets); each
// item lifts out of its row, flies across and lands where its node appears in the film (BUILD in script.ts).
import React from "react";
import { clamp, easeInOut, easeOut, prog } from "./anim";
import { WINDOW } from "./AppWindow";
import { BUILD } from "./script";

const INK = "#0B1B3A";
const BLUE = "#155EEF";
const S = BUILD.win.width / WINDOW.width;

/** Window split (0 = normal, 1 = shrunk right), on timeline time. */
export const splitAt = (t: number) => {
  const b = t - BUILD.at;
  return prog(b, 0, 0.6, easeInOut) * (1 - prog(b, BUILD.release[0], BUILD.release[1], easeInOut));
};
/** Wrapper transform for the window (and anything inside its frame). */
export const splitStyle = (t: number): React.CSSProperties => {
  const sp = splitAt(t);
  if (sp <= 0) return {};
  const s = 1 - (1 - S) * sp, dx = (BUILD.win.left - WINDOW.left) * sp, dy = (BUILD.win.top - WINDOW.top) * sp;
  return { transformOrigin: `${WINDOW.left}px ${WINDOW.top}px`, transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})` };
};

type Cam = { wx: number; wz: number; sx: number; sy: number; z: number };
const proj = (c: Cam, X: number, Y: number, Z: number): [number, number] => {
  const s = 79.2 * c.z, dx = X - c.wx, dz = Z - c.wz;
  return [c.sx + s * (0.753 * dx - 0.659 * dz), c.sy + s * (0.426 * dx + 0.486 * dz - 0.763 * Y)];
};
/** Where an item lands, in frame px (the window at full split). Islands land at their visible middle. */
const target = (it: (typeof BUILD.items)[number]): [number, number] => {
  let [x, y] = proj(BUILD.cams[it.step === 0 ? 0 : 1], it.x, it.y, it.z);
  x = Math.min(Math.max(x, 140), 1540); y = Math.min(Math.max(y, 150), 820);
  return [BUILD.win.left + x * S, BUILD.win.top + y * S];
};

// ── icons ──
const Folder = ({ c, s = 16 }: { c: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
);
const Node = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path fill="#2455D6" d="M12 1.8 21.2 6.6v10.8L12 22.2 2.8 17.4V6.6z" /><path fill="#fff" d="M9 7v3h1.4v1.6H7.6c-.6 0-1 .4-1 1V14H5.4v3h3v-3H7.8v-1.2h3.4V14h-.8v3h3v-3h-.8v-1.2h3.4V14H15v3h3v-3h-1.2v-1.4c0-.6-.4-1-1-1h-2.8V10H14V7z" /></svg>
);
const GLYPH: Record<string, string> = {
  Tag: "M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7m15.91 4.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.11 0-2 .89-2 2v7c0 .55.22 1.05.59 1.41l8.99 9c.37.36.87.59 1.42.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.56-.23-1.06-.59-1.42",
  Form: "M15 5h3l-1.5 2zM5 2h14a2 2 0 0 1 2 2v16c0 1.11-.89 2-2 2H5a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2m0 2v4h14V4zm0 16h14V10H5zm2-8h10v2H7zm0 4h10v2H7z",
  Funnel: "M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z",
};
/** An asset as the map and the drawer show it: its type's icon on a tile of its type's colour. */
const Asset = ({ c, kind, s = 22 }: { c: string; kind: string; s?: number }) => (
  <span style={{ width: s, height: s, borderRadius: s * 0.24, background: c, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={s * 0.66} height={s * 0.66} viewBox="0 0 24 24"><path fill="#fff" d={GLYPH[kind] ?? GLYPH.Tag} /></svg>
  </span>
);
const Check = ({ c = "#12B76A" }: { c?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const Ext = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M14 4h6v6M20 4l-9 9" /></svg>
);
const icon = (it: (typeof BUILD.items)[number], s?: number) => (it.kind === "folder" ? <Folder c={it.color} s={s} /> : it.kind === "workflow" ? <Node s={s} /> : <Asset c={it.color} kind={it.kind} s={s} />);

// ── layout ──
const PANEL = { left: 110, top: 214 };
const STEP0 = 410, STEP_H = 54, CARD_X = 160, CARD_W = 440, HEAD_H = 42;
const ROW_H = [38, 42, 44], GROUP_H = 36;
const FLY = 0.55;   // seconds in the air
type Item = (typeof BUILD.items)[number] & { group?: string };
const groupOf = (it: Item) => it.group;
/** Rows of a step's card, with a header row (the workflow) before each group of assets. */
const cardRows = (k: number) => {
  const out: ({ it: Item; y: number } | { group: string; y: number })[] = [];
  let y = HEAD_H, last: string | undefined;
  BUILD.items.filter((i) => i.step === k).forEach((it) => {
    const g = groupOf(it as Item);
    if (g && g !== last) { out.push({ group: g, y }); y += GROUP_H; last = g; }
    out.push({ it: it as Item, y }); y += ROW_H[k];
  });
  return { out, h: y };
};
const cardH = (k: number) => cardRows(k).h;

export const BuildOverlay: React.FC<{ t: number }> = ({ t }) => {
  const b = t - BUILD.at;
  if (b < 0 || b > BUILD.release[1] + 0.05) return null;
  const panelIn = prog(b, 0.45, 0.95, easeOut), panelOut = prog(b, BUILD.release[0] - 0.1, BUILD.release[1] - 0.1, easeInOut);
  const po = panelIn * (1 - panelOut);
  // active step and the eased layout between steps
  const st = BUILD.steps.reduce((a, s, i) => (b >= s.a ? i : a), 0);
  const tr = st > 0 ? prog(b, BUILD.steps[st].a, BUILD.steps[st].a + 0.4, easeInOut) : 1;
  const layout = (k: number) => BUILD.steps.map((_, j) => STEP0 + j * STEP_H + (j > k ? cardH(k) + 22 : 0));
  const L0 = layout(Math.max(0, st - 1)), L1 = layout(st);
  const stepY = L1.map((y, j) => L0[j] + (y - L0[j]) * tr);
  const cardY = (k: number) => stepY[k] + 52;
  const allDone = b >= BUILD.done;
  // the card on screen: the previous one fades out as the new one comes in
  const cards = [st - 1, st].filter((k) => k >= 0).map((k) => ({ k, o: k === st ? prog(b, BUILD.steps[k].a + 0.15, BUILD.steps[k].a + 0.45) : 1 - prog(b, BUILD.steps[st].a, BUILD.steps[st].a + 0.2) }));
  const rowCenter = (it: Item): [number, number] => {
    const r = cardRows(it.step).out.find((x) => "it" in x && x.it === it)!;
    return [CARD_X + 34 + 120, cardY(it.step) + r.y + ROW_H[it.step] / 2];
  };
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, opacity: po, transform: `translateX(${(-40 * (1 - panelIn) - 60 * panelOut).toFixed(1)}px)` }}>
        <div style={{ position: "absolute", left: PANEL.left, top: PANEL.top, display: "flex", alignItems: "center", gap: 14, fontSize: 18, fontWeight: 600, letterSpacing: 3, color: BLUE }}>
          <span style={{ width: 44, height: 2, background: BLUE, opacity: 0.6 }} />HOW THE MAP WORKS
        </div>
        <div className="poppins" style={{ position: "absolute", left: PANEL.left, top: PANEL.top + 40, fontSize: 54, lineHeight: 1.06, fontWeight: 700, color: INK, letterSpacing: -1.5 }}>
          Your list,<br /><span className="grad-text">drawn as a map.</span>
        </div>
        {BUILD.steps.map((s, j) => {
          const state = allDone || j < st ? "done" : j === st && b >= s.a - 0.6 ? "active" : "next";
          const pill = j === st && !allDone ? prog(b, s.a - 0.05, s.a + 0.3, easeOut) : 0;
          return (
            <div key={j} style={{ position: "absolute", left: PANEL.left, top: stepY[j], height: 48, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 34, display: "flex", justifyContent: "center", position: "relative", height: 16 }}>
                {state === "done" ? <Check c={allDone ? "#12B76A" : "#98A2B3"} /> : (
                  <div style={{ position: "absolute", top: 3.5, width: 9 + 21 * pill, height: 9, borderRadius: 5, background: pill > 0 ? BLUE : "#C3CDDC" }} />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: state === "active" ? BLUE : "#98A2B3", width: 26 }}>0{j + 1}</span>
              <span style={{ fontSize: 24 + 3 * pill, fontWeight: pill > 0.5 ? 600 : 500, color: state === "active" ? INK : allDone ? "#475467" : "#98A2B3" }}>{s.label}</span>
            </div>
          );
        })}
        {cards.map(({ k, o }) => o > 0.001 && (
          <div key={k} style={{
            position: "absolute", left: CARD_X, top: cardY(k), width: CARD_W, borderRadius: 12, background: "#fff", overflow: "hidden", opacity: o,
            transform: `translateY(${(10 * (1 - o)).toFixed(1)}px)`, boxShadow: "0 12px 28px -10px rgba(16,44,102,.25), 0 0 0 1px rgba(16,44,102,.08)",
          }}>
            <div style={{ height: HEAD_H, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 14, color: "#475467", background: "#F9FAFB" }}>
              {k === 0 ? null : k === 2 ? <Node s={18} /> : <Folder c="#3B82F6" />}
              <span style={{ fontWeight: 600, color: "#101828" }}>{BUILD.steps[k].head}</span><span style={{ marginLeft: "auto" }}>{BUILD.steps[k].count}</span>
            </div>
            {cardRows(k).out.map((r) => {
              if (!("it" in r)) return (
                <div key={r.group} style={{ height: GROUP_H, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", boxSizing: "border-box", borderTop: "1px solid #EAECF0", background: "#F5F8FF", fontSize: 13.5, fontWeight: 600, color: "#1D2939" }}>
                  <Node s={17} />{r.group}
                </div>
              );
              const it = r.it, gone = b >= it.land - FLY;
              return (
                <div key={it.name} style={{
                  height: ROW_H[k], display: "flex", alignItems: "center", gap: 9, padding: k === 2 ? "0 14px 0 36px" : "0 14px", boxSizing: "border-box", borderTop: "1px solid #EAECF0",
                  fontSize: 15, fontWeight: 500, color: gone ? "#98A2B3" : "#101828",
                }}>
                  <span style={{ width: k === 2 ? 22 : 18, display: "flex", justifyContent: "center", opacity: k === 2 && gone ? 0.45 : 1 }}>{k === 2 ? icon(it, 20) : gone && b >= it.land ? <Check /> : gone ? null : icon(it, 17)}</span>
                  <span>{it.name}</span>
                  {k === 1 && !gone ? <Ext /> : null}
                  {k === 1 ? <span style={{ marginLeft: "auto", height: 22, padding: "0 8px", borderRadius: 11, fontSize: 12, display: "flex", alignItems: "center", border: "1px solid #75E0A7", background: "#ECFDF3", color: "#067647", opacity: gone ? 0.4 : 1 }}>Published</span> : null}
                  {k === 2 ? <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: gone ? "#98A2B3" : it.color, fontWeight: 600 }}>{it.kind}{b >= it.land ? <Check /> : null}</span> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* flights: lift out of the row, arc across, shrink into the node, and a ring where it lands */}
      {BUILD.items.map((it, i) => {
        const t0 = it.land - FLY, u = (b - t0) / FLY;
        if (u < -0.05 || u > 1.6) return null;
        const [x0, y0] = rowCenter(it as Item), [x1, y1] = target(it);
        const ring = prog(b, it.land - 0.05, it.land + 0.45);
        const ringEl = ring > 0 && ring < 1 ? (
          <div style={{ position: "absolute", left: x1, top: y1, width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -26 * (0.6 + ring), top: -26 * (0.6 + ring), width: 52 * (0.6 + ring), height: 52 * (0.6 + ring), borderRadius: "50%", border: `2px solid ${it.kind === "folder" ? it.color : BLUE}`, opacity: 0.7 * (1 - ring) }} />
          </div>
        ) : null;
        if (u < 0 || u >= 1) return <React.Fragment key={i}>{ringEl}</React.Fragment>;
        const e = easeInOut(clamp(u));
        const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 70;
        const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * x1, y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * y1;
        const sc = 1 - 0.45 * e, fade = 1 - prog(u, 0.82, 1), textO = 1 - prog(u, 0.55, 0.85);
        return (
          <React.Fragment key={i}>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 0.5 * (1 - prog(u, 0.7, 1)) }}>
              <path d={`M${x0} ${y0} Q${cx} ${cy} ${x} ${y}`} fill="none" stroke={it.kind === "folder" ? it.color : BLUE} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
            </svg>
            <div style={{
              position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${sc.toFixed(3)})`, opacity: fade, display: "flex", alignItems: "center", gap: 8 * textO,
              height: 38, padding: `0 ${(14 * textO + 7).toFixed(1)}px 0 8px`, borderRadius: 19, background: "#fff", fontSize: 14, fontWeight: 600, color: "#101828", whiteSpace: "nowrap",
              boxShadow: `0 14px 30px -8px ${it.kind === "folder" ? it.color + "88" : "rgba(21,94,239,.45)"}, 0 0 0 1.5px ${it.kind === "folder" ? it.color + "66" : "rgba(21,94,239,.35)"}`,
            }}>
              {icon(it, 22)}
              <span style={{ opacity: textO, maxWidth: 300 * textO, overflow: "hidden" }}>{it.name}</span>
            </div>
            {ringEl}
          </React.Fragment>
        );
      })}
    </div>
  );
};
