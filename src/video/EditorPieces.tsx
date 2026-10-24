// Single pieces of the video for an editor (DaVinci Resolve breakdown, scripts/resolve-dissect.*): each renders one element on
// its own, at full frame (1920×1080) with alpha where it sits over something else.
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { APP_FILE, editTime, FPS, uncut } from "./script";
import { WINDOW } from "./AppWindow";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Background } from "./Stage";
import { BuilderScenes } from "./builder/scenes";

loadFonts();

export type Piece = "background" | "frame";

export const EditorPieces: React.FC<{ piece?: Piece }> = ({ piece = "background" }) => (
  <AbsoluteFill style={{ background: piece === "background" ? "#F4F8FF" : "transparent" }}>
    <style>{GLOBAL_CSS}</style>
    {piece === "background" ? <Background /> : null}
    {/* the app window at rest: white, rounded, with its shadow; the footage sits inside it */}
    {piece === "frame" ? (
      <div style={{
        position: "absolute", left: WINDOW.left, top: WINDOW.top, width: WINDOW.width, height: WINDOW.height, borderRadius: 18, background: "#fff",
        boxShadow: "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
      }} />
    ) : null}
  </AbsoluteFill>
);

/** The app footage exactly as the edit plays it (frozen behind titles, slowed where the edit slows it), 1620×880, with no
 * window, motion or titles: the editor puts it in the window frame and applies the motion keyframes. */
export const FootageAsEdited: React.FC = () => {
  const { t } = editTime(uncut(useCurrentFrame() / FPS));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Freeze frame={Math.round(t * FPS)}>
        <Sequence from={Math.round(3.9 * FPS)} layout="none">
          <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: 1620, height: 880, display: "block" }} />
        </Sequence>
        {t >= 3.9 ? <div style={{ position: "absolute", inset: 0 }}><BuilderScenes ft={t - 3.9} /></div> : null}
      </Freeze>
    </AbsoluteFill>
  );
};
