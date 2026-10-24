import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, mix, spring, transform } from "motion";
import { easeInOut } from "./anim";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { STRUCTURE_OPENING as S } from "./script";
import { Background } from "./Stage";
import { StructureMap, structureProject } from "./StructureMap";

loadFonts();
const BLUE = "#155EEF";
const capture = (file: string) => staticFile(`captures/structure/${file}.jpg`);
const settleSpring = spring({ keyframes: [0, 1], damping: 24, stiffness: 155, mass: .95 });
const settle = (t: number, at: number) => t < at ? 0 : settleSpring.next((t - at) * 1000).value;

const Cursor: React.FC<{ x: number; y: number; opacity: number; click?: number }> = ({ x, y, opacity, click = 0 }) => <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none", scale: String(1 - click * .15), filter: "drop-shadow(0 3px 3px #10182833)" }}><svg width="36" height="44" viewBox="0 0 38 46"><path d="M4 3L31 28L19 29L25 41L18 44L12 32L4 39Z" fill="white" stroke="#101828" strokeWidth="2.5" strokeLinejoin="round" /></svg></div>;

/** One continuous camera and independently moving islands, nodes, connections and panel. */
export const StructureOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const caption = S.captions.find((c) => t >= c.a && t < c.b) ?? S.captions[S.captions.length - 1];
  const words = caption.title.split(" ");
  const titleOut = transform(t, [caption.b - .18, caption.b], [1, 0], { ease: easeInOut });
  const listOut = transform(t, [2.92, 3.32], [0, 1], { ease: easeInOut });
  const morph = transform(t, [2.8, 5.4], [0, 1], { ease: easeInOut });
  const panelIn = settle(t, 21.8);
  const expanded = transform(t, [26.8, 27.15], [0, 1], { ease: easeInOut });
  const workflow = structureProject(t, 3, -1.5, .48);
  const cursorTravel = transform(t, [20.6, 21.48], [0, 1], { ease: easeInOut });
  const panelCursor = transform(t, [25.5, 26.55], [0, 1], { ease: easeInOut });
  const startScale = mix(.975, 1, settle(t, .1));
  const shadowWave = Math.sin(morph * Math.PI);
  const activeIndex = t < 11.2 ? 0 : t < 16.2 ? 1 : t < 26.5 ? 2 : 3;
  return <AbsoluteFill
    style={{ fontFamily: "Inter, sans-serif", color: "#0B1B3A", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}
  >
    <style>{GLOBAL_CSS}</style>
    <Background />
    <div className="poppins" style={{ position: "absolute", top: 24, width: 1920, textAlign: "center", opacity: titleOut }}>
      <div style={{ fontSize: 47, fontWeight: 750, letterSpacing: "-.028em", lineHeight: 1.2 }}>
        {words.map((word, i) => <span key={`${caption.a}-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: 5, marginRight: 12 }}><span style={{ display: "inline-block", translate: `0 ${(1 - settle(t, caption.a + i * .025)) * 64}px`, rotate: `${transform(t, [caption.a + i * .025, caption.a + i * .025 + .5], [1, 0], { ease: easeInOut }) * 3}deg`, opacity: transform(t, [caption.a + i * .025, caption.a + i * .025 + .18], [0, 1], { ease: easeInOut }) }}>{word}</span></span>)}
      </div>
      <div style={{ marginTop: 6, fontFamily: "Inter, sans-serif", fontSize: 22, color: "#475467", fontWeight: 500, opacity: transform(t, [caption.a + .14, caption.a + .5], [0, 1], { ease: easeInOut }), translate: `0 ${(1 - settle(t, caption.a + .14)) * 15}px` }}>{caption.detail}</div>
    </div>
    <div style={{ position: "absolute", left: 150, top: 138, width: 1620, height: 880, borderRadius: 20, background: "white", overflow: "hidden", transform: `perspective(1800px) rotateX(${shadowWave * 3.5}deg) rotateY(${-shadowWave * 1.8}deg)`, scale: String(startScale), translate: `0 ${(1 - settle(t, .1)) * 25}px`, boxShadow: `0 ${24 + shadowWave * 28}px ${75 + shadowWave * 30}px #102C6628, 0 0 0 1px #102C6615` }}>
      <Sequence name="Continuous map choreography" layout="none">
        <StructureMap t={t} />
      </Sequence>
      <Sequence name="Actual list becomes folder islands" durationInFrames={Math.round(3.5 * fps)} layout="none">
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 1 - listOut, filter: `blur(${listOut * 3}px)` }}>
          <Img src={capture("list")} style={{ position: "absolute", width: 1620 * (1620 / 1396), height: 880 * (1620 / 1396), left: -224 * (1620 / 1396), top: -92 * (1620 / 1396) }} />
          <div style={{ position: "absolute", left: 268, top: 40, width: 192, height: 52, border: `2px solid ${BLUE}`, borderRadius: 9, opacity: transform(t, [1.8, 2, 2.85, 3.15], [0, 1, 1, 0]), boxShadow: `0 0 0 ${6 + 14 * transform(t, [2.55, 3.15], [0, 1], { ease: easeInOut })}px #155EEF15` }} />
          <Cursor x={transform(t, [.8, 2.25], [930, 375], { ease: easeInOut })} y={transform(t, [.8, 2.25], [535, 65], { ease: easeInOut })} opacity={transform(t, [.65, .8, 2.95, 3.15], [0, 1, 1, 0])} click={transform(t, [2.5, 2.58, 2.65, 2.85], [0, 1, 1, 0])} />
        </div>
      </Sequence>
      <Sequence name="Workflow selection and real detail panel" from={Math.round(20.5 * fps)} layout="none">
        <Cursor x={mix(1150, workflow.x, cursorTravel)} y={mix(650, workflow.y, cursorTravel)} opacity={transform(t, [20.6, 20.75, 22.15, 22.45], [0, 1, 1, 0])} click={transform(t, [21.48, 21.56, 21.62, 21.82], [0, 1, 1, 0])} />
        <div style={{ position: "absolute", left: 1156, top: 76, width: 452, height: 792, overflow: "hidden", translate: `${(1 - panelIn) * 490}px 0`, borderRadius: 14, boxShadow: "-12px 0 35px #102C6612", opacity: clamp(0, 1, panelIn) }}>
          <Img src={capture("workflow-selected")} style={{ position: "absolute", left: -1156, top: -76, width: 1620, height: 880 }} />
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${(1 - expanded) * 100}% 0)` }}>
            <Img src={capture("asset-expanded")} style={{ position: "absolute", left: -1156, top: -76, width: 1620, height: 880 }} />
          </div>
          <div style={{ position: "absolute", left: 12, top: 352, width: 428, height: 38, borderRadius: 8, background: "#155EEF08", border: "2px solid #155EEF", opacity: transform(t, [23.0, 23.25, 25.1, 25.5], [0, 1, 1, 0]), scale: String(1.03 - .03 * transform(t, [23, 23.5], [0, 1], { ease: easeInOut })) }} />
          <svg width="452" height="792" style={{ position: "absolute", inset: 0 }}><rect x="12" y="557" width="428" height="154" rx="12" fill="none" stroke={BLUE} strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={transform(t, [27.2, 28.15], [1, 0], { ease: easeInOut })} opacity={transform(t, [27.1, 27.3], [0, 1], { ease: easeInOut })} /></svg>
        </div>
        <Cursor x={mix(1010, 1517, panelCursor)} y={mix(500, 657, panelCursor)} opacity={transform(t, [25.5, 25.7, 27.1, 27.35], [0, 1, 1, 0])} click={transform(t, [26.55, 26.63, 26.7, 26.9], [0, 1, 1, 0])} />
      </Sequence>
    </div>
    <Mascot t={t} st={{ x: transform(t, [3.9, 5.8], [2080, 1810], { ease: easeInOut }), y: 938 - 30 * Math.sin(transform(t, [3.9, 5.8], [0, 1], { ease: easeInOut }) * Math.PI), s: .32, r: transform(t, [3.9, 5.8], [-14, -6], { ease: easeInOut }), o: transform(t, [3.9, 4.4, 10.7, 11.2], [0, 1, 1, 0]), eyes: t < 6 ? "wow" : "happy", look: [-15, -10], sparkle: transform(t, [5.2, 5.5, 6.8, 7.5], [0, 1, 1, 0]) * .7, streak: transform(t, [3.9, 4.05, 5.2, 5.7], [0, 1, 1, 0]) }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1037, display: "flex", justifyContent: "center", gap: 34 }}>
      {S.progress.map((label, i) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, color: i === activeIndex ? BLUE : i < activeIndex ? "#475467" : "#98A2B3", fontSize: 17, fontWeight: 600 }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, fontSize: 12, background: i === activeIndex ? BLUE : i < activeIndex ? "#DCE8FF" : "#E8EEF7", color: i === activeIndex ? "white" : "#667085", scale: String(i === activeIndex ? 1 + .08 * Math.sin(t * 2) ** 2 : 1) }}>{i + 1}</span>{label}</div>)}
    </div>
  </AbsoluteFill>;
};

export const StructureOpeningPreview: React.FC = () => {
  const { fps } = useVideoConfig();
  return <><Audio src={staticFile("music.mp3")} volume={(f) => transform(f / fps, [S.end - .8, S.end], [1, 0])} /><StructureOpening /></>;
};
