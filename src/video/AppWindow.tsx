// The app window. Its content is one footage clip per beat (public/footage/<beat id>.mp4,
// 1620×880). The window's own motion (rise, push-ins, receding behind titles) lives here. Through the intro the window is the
// screen of a device (Browser.tsx: bezel and tab strip around it), which moves with it.
import React from "react";
import { Freeze, getInputProps, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { mix, stagger, transform } from "motion";
import { easeInOut, springAt } from "./anim";
import { BROWSER, DeviceBezel, deviceOn, TabStrip } from "./Browser";
import { Callout } from "./Callout";
import { windowAt } from "./choreography";
import { introCalloutHtml, useCfg } from "./config";
import { APP_FILE, BEATS, CUT_LEN, EDITED_FILE, editedFootageTime, FPS, INTRO_BROWSE, INTRO_CALLOUTS, INTRO_CUT, introCalloutAt } from "./script";
import { BuilderScenes } from "./builder/scenes";

export const WINDOW = { left: 150, top: 118, width: 1620, height: 880 };
/** The intro callouts' later lines follow the card 0.45 s in, 0.5 s apart. */
const calloutLines = stagger(0.5, { startDelay: 0.45 });

/** `tn`: output time, for the intro's callouts (they hold while the timeline `t` stands still) and their push-in.
 * `chromeOnly`: just the device and its tabs (the editor's "tabs" layer). */
export const AppWindow: React.FC<{ t: number; tn?: number; plate?: boolean; chromeOnly?: boolean }> = ({ t, tn, plate, chromeOnly }) => {
  const cfg = useCfg();
  const device = deviceOn(t, cfg.show.browserTabs), r = BROWSER.screenRadius;
  const w = windowAt(t, plate, cfg.motion);
  const co = tn != null && cfg.show.introCallouts ? introCalloutAt(tn) : undefined, P = cfg.motion.introCallouts;
  if (co && !plate && !co.c.noPush) {
    const k = Math.min(transform(tn!, [co.o0, co.o0 + P.in], [0, 1], { ease: easeInOut }), transform(tn!, [co.o1 - P.out, co.o1], [1, 0], { ease: easeInOut }));
    w.zoom *= mix(1, P.push, k);
    w.zoomOrigin = co.c.focus;
  }
  return (
    <div style={{
      position: "absolute", left: WINDOW.left, top: WINDOW.top, width: WINDOW.width, height: WINDOW.height,
      transformOrigin: `${w.zoomOrigin[0]}px ${w.zoomOrigin[1]}px`,
      transform: `translate(${w.translateX}px, ${w.translateY}px) scale(${w.scale * w.zoom})`,
      opacity: w.opacity, visibility: w.opacity < 0.01 ? "hidden" : "visible",
      filter: w.blur > 0.05 ? `blur(${w.blur.toFixed(2)}px)` : undefined,
    }}>
      {device ? <><DeviceBezel width={WINDOW.width} height={WINDOW.height} /><TabStrip t={t} width={WINDOW.width} /></> : null}
      {chromeOnly ? null : <div style={{
        position: "absolute", inset: 0, background: "#fff", overflow: "hidden",
        borderRadius: device ? `0 0 ${r}px ${r}px` : cfg.fx.windowRadius,
        boxShadow: device ? undefined : "0 30px 80px rgba(16,44,102,.18), 0 6px 18px rgba(16,44,102,.10), 0 0 0 1px rgba(16,44,102,.06)",
      }}>
        {typeof getInputProps().filmStill === "string" ? <Img src={staticFile(getInputProps().filmStill as string)} style={{ position: "absolute", left: 0, top: 0, width: WINDOW.width, height: WINDOW.height }} />
        // the edited footage has one frame per video frame: show the one for this frame (inside the timeline's Freeze, so freeze again)
        : EDITED_FILE && tn != null && t >= 3.9 ? <Freeze frame={(() => { const e = editedFootageTime(tn); return Math.round((e < INTRO_CUT[0] ? e : e - CUT_LEN) * FPS); })()}>
          <OffthreadVideo src={staticFile(`footage/${EDITED_FILE}`)} muted style={{ position: "absolute", left: 0, top: 0, width: WINDOW.width, height: WINDOW.height, objectFit: "contain", background: "#fff" }} />
        </Freeze> : BEATS.map((b) => {
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
      {t >= INTRO_BROWSE.a && t < INTRO_BROWSE.b ? (
        <Freeze frame={0}>
          <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round((INTRO_BROWSE.film + t - INTRO_BROWSE.a) * FPS)} style={{ position: "absolute", left: 0, top: 0, width: WINDOW.width, height: WINDOW.height, background: "#fff" }} />
        </Freeze>
      ) : null}
      {/* the builder, redrawn over the film's builder shots (film time = t − 3.9) */}
      {t >= 3.9 ? <BuilderScenes ft={t >= INTRO_BROWSE.a && t < INTRO_BROWSE.b ? INTRO_BROWSE.film + t - INTRO_BROWSE.a : t - 3.9} /> : null}
      {co && !plate ? (() => {
        const lt = tn! - co.o0;
        return <Callout compact x={co.c.x} y={co.c.y} side={co.c.side} ax={co.c.ax} html={introCalloutHtml(cfg, INTRO_CALLOUTS.indexOf(co.c))}
          k={springAt(lt, 0, 0.4, 0.3)} opacity={transform(tn!, [co.o1 - 0.3, co.o1], [1, 0], { ease: easeInOut })} lineK={(i, n) => springAt(lt, calloutLines(i - 1, n - 1), 0.35, 0.2)} />;
      })() : null}
      </div>}
    </div>
  );
};
