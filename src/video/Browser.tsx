// The device the app runs in during the intro: a tablet-style bezel around a desktop browser's tab strip and the app.
// Drawn inside the app window's own transform (AppWindow), in window px, so it rises, pushes in and recedes with the footage.
import React from "react";
import { transform } from "motion";
import { blend, springAt } from "./anim";
import { useCfg } from "./config";
import { M, TABS } from "./script";

/** Tab strip height and bezel width (window px); the screen's corner radius. */
export const BROWSER = { tabH: 44, bezel: 30, screenRadius: 12 };
const TABS_X = 116, TAB_MAX = 240;
const STRIP = "#DEE3EA", SEP = "#A8AFBA";

/** The device is on through the intro and gone from the first drop (under its white flash). */
export const deviceOn = (t: number, show: boolean) => show && t < M.D1;

const activeAt = (x: number) => {
  const m = TABS.times.filter((y) => x >= y).length;
  let a = Math.max(0, m - 1);
  TABS.flips.forEach(([at, i]) => { if (x >= at && at >= TABS.times[m - 1] && i < m) a = i; });
  return a;
};

/** The tabs right now: names, width (0–1: a new tab grows in, they all close back to one at TABS.b), and the active one. */
export const tabsAt = (t: number, names: readonly string[]) => {
  const open = TABS.times.filter((x) => t >= x).length, closed = t >= TABS.b;
  const close = transform(t, [TABS.b, TABS.b + 0.25], [1, 0]);
  // the first workflow opens in the same tab (its title changes); the rest open as new tabs
  const tabs = [{ name: open && !closed ? names[0] : TABS.home, k: 1 }];
  for (let i = 1; i < open; i++) {
    const k = springAt(t, TABS.times[i], 0.3, 0.1) * close;
    if (k > 0.001) tabs.push({ name: names[i] ?? TABS.names[i], k });
  }
  const active = closed ? 0 : activeAt(t);
  // on each switch the old tab's white fades into the new one over 0.15 s
  const opened = TABS.times[Math.max(0, open - 1)];
  const switched = Math.max(opened, ...TABS.flips.map(([at]) => at).filter((at) => at <= t && at >= opened));
  const was = closed ? 0 : activeAt(switched - 0.001), sw = transform(t, [switched, switched + 0.15], [0, 1]);
  return tabs.map((tab, i) => ({ ...tab, white: i === active ? (i === was ? 1 : sw) : i === was ? 1 - sw : 0 }));
};

export const WorkflowIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, flexShrink: 0, display: "block" }}>
    <path fill="currentColor" d="M9 2v6h2v3H5c-1.11 0-2 .89-2 2v3H1v6h6v-6H5v-3h6v3H9v6h6v-6h-2v-3h6v3h-2v6h6v-6h-2v-3c0-1.11-.89-2-2-2h-6V8h2V2z" />
  </svg>
);

const Icon: React.FC<{ d: string; size?: number }> = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0, display: "block" }}>
    <path d={d} fill="none" stroke="#474C55" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** One tab: the white of the active tab flows into the page through two concave feet at its bottom corners. */
const Tab: React.FC<{ name: string; k: number; white: number; sep: boolean }> = ({ name, k, white, sep }) => {
  const bg = blend(STRIP, "#FFFFFF", white);
  const foot = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute", bottom: 0, [side]: -10, width: 10, height: 10, opacity: white,
    background: `radial-gradient(circle at ${side === "left" ? "0 0" : "100% 0"}, transparent 9.5px, #fff 10px)`,
  });
  return (
    <div style={{ position: "relative", flex: `${k} 1 0`, maxWidth: TAB_MAX * k, minWidth: 0, height: 36, alignSelf: "flex-end" }}>
      {sep ? <div style={{ position: "absolute", left: 0, top: 9, width: 1, height: 18, background: SEP, opacity: (1 - white) * Math.min(1, k * 2) }} /> : null}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "10px 10px 0 0", background: white > 0.001 ? bg : "transparent",
        display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 12px", overflow: "hidden", opacity: Math.min(1, k * 1.6),
      }}>
        <WorkflowIcon size={16} color="#155EEF" />
        <span style={{
          flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 500, color: white > 0.5 ? "#1F2329" : "#474C55",
          WebkitMaskImage: "linear-gradient(90deg, #000 calc(100% - 22px), transparent)", maskImage: "linear-gradient(90deg, #000 calc(100% - 22px), transparent)",
        }}>{name}</span>
        <Icon d="M5 5l6 6M11 5l-6 6" />
      </div>
      {white > 0.001 ? <><div style={foot("left")} /><div style={foot("right")} /></> : null}
    </div>
  );
};

/** The browser's tab strip: window controls, the tab-search chevron, the tabs and the new-tab button. */
export const TabStrip: React.FC<{ t: number; width: number }> = ({ t, width }) => {
  const { text } = useCfg();
  const tabs = tabsAt(t, text.browserTabs);
  const lights = ["#FF5F57", "#FEBC2E", "#28C840"];
  return (
    <div style={{ position: "absolute", left: 0, top: -BROWSER.tabH, width, height: BROWSER.tabH, background: STRIP, fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: `${BROWSER.screenRadius}px ${BROWSER.screenRadius}px 0 0`, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
        {lights.map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.18)" }} />)}
      </div>
      <div style={{ marginLeft: 18, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.55)" }}>
        <Icon d="M4.5 6.5L8 10l3.5-3.5" />
      </div>
      <div style={{ position: "absolute", left: TABS_X, right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flex: `0 1 ${TAB_MAX * tabs.reduce((s, x) => s + x.k, 0)}px`, minWidth: 0, height: "100%" }}>
          {tabs.map((tab, i) => <Tab key={i} name={tab.name} k={tab.k} white={tab.white} sep={i > 0 && tabs[i - 1].white < 0.5} />)}
        </div>
        <div style={{ marginLeft: 6, width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon d="M8 3.5v9M3.5 8h9" />
        </div>
      </div>
    </div>
  );
};

/** The bezel: brushed-aluminium rim, black glass, a camera dot; its screen (tab strip + app) is the window's rect plus the strip. */
export const DeviceBezel: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const B = BROWSER.bezel, top = BROWSER.tabH + B;
  return (
    <div style={{
      position: "absolute", left: -B - 3, top: -top - 3, width: width + 2 * B + 6, height: height + top + B + 6, borderRadius: 40,
      background: "linear-gradient(160deg, #E9ECF0 0%, #B9BFC7 45%, #D9DDE2 100%)", padding: 3, boxSizing: "border-box",
      boxShadow: "0 40px 90px rgba(16,44,102,.28), 0 10px 24px rgba(16,44,102,.16)",
    }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 37, background: "linear-gradient(180deg, #1C1E22 0%, #0E0F11 100%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
        <div style={{ position: "absolute", left: "50%", top: B / 2 - 4, width: 8, height: 8, marginLeft: -4, borderRadius: 4, background: "radial-gradient(circle at 35% 35%, #3B4A5E 0%, #121A24 70%)" }} />
      </div>
    </div>
  );
};
