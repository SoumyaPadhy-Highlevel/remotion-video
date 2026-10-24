// The app window. Its content is one footage clip per beat (public/footage/<beat id>.mp4,
// 1620×880). The window's own motion (rise, push-ins, receding behind titles) lives here.
import React from "react";
import { OffthreadVideo, Sequence, staticFile } from "remotion";
import { mix, transform } from "motion";
import { easeInOut, easeOut } from "./anim";
import { Callout } from "./Callout";
import { windowAt } from "./choreography";
import { introCalloutHtml, useCfg } from "./config";
import { BEATS, FPS, INTRO_CALLOUTS, introCalloutAt } from "./script";

export const WINDOW = { left: 150, top: 118, width: 1620, height: 880 };

/** `tn`: output time, for the intro's callouts (they hold while the timeline `t` stands still) and their push-in. */
export const AppWindow: React.FC<{ t: number; tn?: number; plate?: boolean }> = ({ t, tn, plate }) => {
  const cfg = useCfg();
  const w = windowAt(t, plate, cfg.motion);
  const co = tn != null && cfg.show.introCallouts ? introCalloutAt(tn) : undefined, P = cfg.motion.introCallouts;
  if (co && !plate) {
    const k = Math.min(transform(tn!, [co.o0, co.o0 + P.in], [0, 1], { ease: easeInOut }), transform(tn!, [co.o1 - P.out, co.o1], [1, 0], { ease: easeInOut }));
    w.zoom *= mix(1, P.push, k);
    w.zoomOrigin = co.c.focus;
  }
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
      {co && !plate ? (() => {
        const lt = tn! - co.o0;
        return <Callout x={co.c.x} y={co.c.y} side={co.c.side} ax={co.c.ax} html={introCalloutHtml(cfg, INTRO_CALLOUTS.indexOf(co.c))}
          k={transform(lt, [0, 0.35], [0, 1], { ease: easeOut })} opacity={transform(tn!, [co.o1 - 0.3, co.o1], [1, 0], { ease: easeInOut })} lineK={(i) => transform(lt, [0.45 + 0.5 * (i - 1), 0.8 + 0.5 * (i - 1)], [0, 1], { ease: easeOut })} />;
      })() : null}
    </div>
  );
};
