// Static mock of the "list → map" build (one frame, for review): the app window shrinks to the right on a zoomed map, the
// left panel walks through the three steps, and list items fly across and become map nodes. Mid-way through step 2 here.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Background } from "./Stage";
import { GLOBAL_CSS, loadFonts } from "./fonts";

loadFonts();

const INK = "#0B1B3A";
const BLUE = "#155EEF";
const WIN = { left: 680, top: 214, width: 1180 };
const S = WIN.width / 1620;
const H = 880 * S;
// New Enquiry Form Submitted's spot in Lead Capture (film px, from the map projection)
const TARGET: [number, number] = [WIN.left + 640 * S, WIN.top + 411 * S];

const Ext = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M14 4h6v6M20 4l-9 9" />
  </svg>
);
const Check = ({ c = "#12B76A" }: { c?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const Node = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#2455D6" d="M12 1.8 21.2 6.6v10.8L12 22.2 2.8 17.4V6.6z" /><path fill="#fff" d="M9 7v3h1.4v1.6H7.6c-.6 0-1 .4-1 1V14H5.4v3h3v-3H7.8v-1.2h3.4V14h-.8v3h3v-3h-.8v-1.2h3.4V14H15v3h3v-3h-1.2v-1.4c0-.6-.4-1-1-1h-2.8V10H14V7z" /></svg>
);

const Row: React.FC<{ name: string; state: "landed" | "flying" | "waiting" }> = ({ name, state }) => (
  <div style={{
    height: 42, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", boxSizing: "border-box",
    borderTop: "1px solid #EAECF0", fontSize: 15, color: state === "landed" ? "#98A2B3" : "#101828", fontWeight: 500,
    background: state === "flying" ? "repeating-linear-gradient(135deg, #F5F8FF 0 8px, #fff 8px 16px)" : "#fff",
  }}>
    {state === "landed" ? <Check /> : state === "flying" ? <span style={{ width: 16 }} /> : <span style={{ width: 16 }} />}
    <span style={{ opacity: state === "flying" ? 0.35 : 1 }}>{name}</span>
    {state !== "landed" && <span style={{ opacity: state === "flying" ? 0.35 : 1, display: "flex" }}><Ext /></span>}
    <span style={{
      marginLeft: "auto", height: 22, padding: "0 8px", borderRadius: 11, fontSize: 12, display: "flex", alignItems: "center",
      border: "1px solid #75E0A7", background: "#ECFDF3", color: "#067647", opacity: state === "waiting" ? 1 : 0.35,
    }}>Published</span>
  </div>
);

const Step: React.FC<{ n: string; text: React.ReactNode; state: "done" | "active" | "next" }> = ({ n, text, state }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, height: 48 }}>
    <div style={{ width: 34, display: "flex", justifyContent: "center" }}>
      {state === "done" ? <Check c="#98A2B3" /> : state === "active"
        ? <div style={{ width: 30, height: 9, borderRadius: 5, background: BLUE }} />
        : <div style={{ width: 9, height: 9, borderRadius: 5, background: "#C3CDDC" }} />}
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: state === "active" ? BLUE : "#98A2B3", width: 26 }}>{n}</span>
    <span style={{ fontSize: state === "active" ? 27 : 24, fontWeight: state === "active" ? 600 : 500, color: state === "active" ? INK : "#98A2B3" }}>{text}</span>
  </div>
);

export const MapBuildMock: React.FC = () => {
  // flight: from the empty slot in the stack to the node's spot on the map, drawn ~60% of the way
  const from: [number, number] = [575, 664], to = TARGET;
  const ctrl: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 90];
  const at = (u: number) => [0, 1].map((k) => (1 - u) * (1 - u) * from[k] + 2 * (1 - u) * u * ctrl[k] + u * u * to[k]);
  const [fx, fy] = at(0.5);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      <Background />
      {/* the app window, shrunk to the right, on the zoomed map */}
      <div style={{
        position: "absolute", left: WIN.left, top: WIN.top, width: WIN.width, height: H, borderRadius: 16, overflow: "hidden", background: "#fff",
        boxShadow: "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
      }}>
        <Img src={staticFile("mock-map.png")} style={{ width: WIN.width, height: H, display: "block" }} />
      </div>
      {/* left panel */}
      <div style={{ position: "absolute", left: 110, top: 214, width: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 18, fontWeight: 600, letterSpacing: 3, color: BLUE }}>
          <span style={{ width: 44, height: 2, background: BLUE, opacity: 0.6 }} /><span>HOW THE MAP WORKS</span>
        </div>
        <div className="poppins" style={{ marginTop: 18, fontSize: 54, lineHeight: 1.06, fontWeight: 700, color: INK, letterSpacing: -1.5 }}>
          Your list,<br /><span className="grad-text">drawn as a map.</span>
        </div>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 6 }}>
          <Step n="01" state="done" text="Folders become islands" />
          <Step n="02" state="active" text="Workflows become blue nodes" />
          {/* the source: Lead Capture's workflows, flying out one by one */}
          <div style={{ margin: "10px 0 14px 50px", width: 440, borderRadius: 12, background: "#fff", overflow: "hidden", boxShadow: "0 12px 28px -10px rgba(16,44,102,.25), 0 0 0 1px rgba(16,44,102,.08)" }}>
            <div style={{ height: 42, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 14, color: "#475467", background: "#F9FAFB" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              <span style={{ fontWeight: 600, color: "#101828" }}>01 · Lead Capture</span><span style={{ marginLeft: "auto" }}>5 workflows</span>
            </div>
            <Row name="Tag New Enquiries" state="landed" />
            <Row name="Program Application Submitted" state="landed" />
            <Row name="New Enquiry Form Submitted" state="flying" />
            <Row name="Program Payment Received" state="waiting" />
            <Row name="Training Video Engagement" state="waiting" />
          </div>
          <Step n="03" state="next" text="Assets become coloured nodes" />
        </div>
      </div>
      {/* the flight: a dotted arc, the row shrinking into a node, and the landing ring */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={`M${from[0]} ${from[1]} Q${ctrl[0]} ${ctrl[1]} ${to[0]} ${to[1]}`} fill="none" stroke={BLUE} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx={to[0]} cy={to[1]} r={22} fill="none" stroke={BLUE} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="4 4" />
        <ellipse cx={to[0]} cy={to[1] + 6} rx={18} ry={9} fill={BLUE} opacity={0.12} />
      </svg>
      <div style={{
        position: "absolute", left: fx, top: fy, transform: "translate(-50%,-50%) scale(0.86)", display: "flex", alignItems: "center", gap: 8,
        height: 38, padding: "0 14px 0 8px", borderRadius: 19, background: "#fff", fontSize: 14, fontWeight: 600, color: "#101828", whiteSpace: "nowrap",
        boxShadow: "0 14px 30px -8px rgba(21,94,239,.45), 0 0 0 1.5px rgba(21,94,239,.35)",
      }}>
        <Node size={24} />New Enquiry Form Submitted
      </div>
    </AbsoluteFill>
  );
};
