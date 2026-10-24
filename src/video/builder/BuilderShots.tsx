// For checking the builder redraws: the app film on its own clock (frame = film frame), 1620×880, with the redraws over it
// (`overlay`: false shows the bare film to compare). Composition "BuilderShots".
import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { GLOBAL_CSS, loadFonts } from "../fonts";
import { APP_FILE, FPS } from "../script";
import { BuilderScenes } from "./scenes";

loadFonts();

export const BuilderShots: React.FC<{ overlay?: boolean }> = ({ overlay = true }) => {
  const ft = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{GLOBAL_CSS}</style>
      <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: 1620, height: 880 }} />
      {overlay ? <BuilderScenes ft={ft} /> : null}
    </AbsoluteFill>
  );
};
