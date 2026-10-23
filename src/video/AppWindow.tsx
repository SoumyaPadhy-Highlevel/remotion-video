// The app window. Its content is one footage clip per beat (public/footage/<beat id>.mp4,
// 1620×880). The window's own motion (rise, push-ins, receding behind titles) lives here.
import React from "react";
import { OffthreadVideo, Sequence, staticFile } from "remotion";
import { windowAt } from "./choreography";
import { useCfg } from "./config";
import { BEATS, FPS } from "./script";

export const WINDOW = { left: 150, top: 118, width: 1620, height: 880 };

export const AppWindow: React.FC<{ t: number; plate?: boolean }> = ({ t, plate }) => {
  const cfg = useCfg();
  const w = windowAt(t, plate, cfg.motion);
  return (
    <div style={{
      position: "absolute", left: WINDOW.left, top: WINDOW.top, width: WINDOW.width, height: WINDOW.height,
      borderRadius: cfg.fx.windowRadius, background: "#fff", overflow: "hidden",
      boxShadow: "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
      transformOrigin: `${w.zoomOrigin[0]}px ${w.zoomOrigin[1]}px`,
      transform: `translate(${w.translateX}px, ${w.translateY}px) scale(${w.scale * w.zoom})`,
      opacity: w.opacity, visibility: w.opacity < 0.01 ? "hidden" : "visible",
      filter: w.blur > 0.05 ? `blur(${w.blur.toFixed(2)}px)` : undefined,
    }}>
      {BEATS.map((b) => {
        const from = Math.round(b.start * FPS);
        const to = Math.round(b.end * FPS);
        const f = b.footage ?? { file: `${b.id}.mp4` };
        return (
          <Sequence key={b.id} name={`Footage · ${b.label}`} from={from} durationInFrames={to - from} layout="none">
            <OffthreadVideo src={staticFile(`footage/${f.file}`)} muted
              trimBefore={f.from ? Math.round(f.from * FPS) : undefined} playbackRate={f.speed ?? 1}
              style={{ position: "absolute", left: 0, top: 0, width: WINDOW.width, height: WINDOW.height, objectFit: "contain", background: "#fff" }} />
          </Sequence>
        );
      })}
    </div>
  );
};
