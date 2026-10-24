// For reviewing the Assistant section on its own (composition "AssistantSection"): the film with the redraw over it, paced
// as the edit plays it (timing.ts SECTION_SEGS), without the cards between. 1620×880, the app window's own pixels.
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { GLOBAL_CSS, loadFonts } from "../fonts";
import { BuilderScenes } from "../builder/scenes";
import { APP_FILE, FPS } from "../script";
import { sectionFilmAt } from "./timing";

loadFonts();

export { SECTION_LEN } from "./timing";

export const AssistantSection: React.FC = () => {
  const ft = sectionFilmAt(useCurrentFrame() / FPS);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{GLOBAL_CSS}</style>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(ft * FPS)} style={{ width: 1620, height: 880 }} />
      </Freeze>
      <BuilderScenes ft={ft} />
    </AbsoluteFill>
  );
};
