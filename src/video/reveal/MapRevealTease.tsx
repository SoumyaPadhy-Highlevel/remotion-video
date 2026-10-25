import React from "react";
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {GLOBAL_CSS, loadFonts} from "../fonts";
import {TitleText, titleRuns} from "../TitleText";
import {CfgProvider, DEFAULT_CFG, md, StyleCfg, styleVars} from "../config";
import {KineticTitle} from "../Impact";
import {MascotState, mascotAt} from "../choreography";
import {M, TITLE_DROP} from "../script";
import {RevealProps, RevealTiming, settleFrame} from "./reviewProps";
import {categoryOf} from "./assets";
import {Mascot} from "../Mascot";
import {BUILDER_ICONS} from "../builder/icons";
import {FILM_WORLDS} from "../map3d/filmMap";
import {EdgeLook, MapCamera, MapNode, MapScene, MapView, NodeLook, projectToCanvas} from "../map3d/MapScene";
import {MAP_REVEAL as R} from "./script";
import {revealWorld} from "./world";
import {fitRect, HANDOFF, Rect, titleExitFrame} from "./handoff";
import {mix} from "motion";
import {springAt} from "../anim";
import {activeCategory, categoryProgress, categoryWindow, folderAt, progress, smoothProgress, titleClock, workflowAt} from "./timing";

loadFonts();
// Keep the full product window. Chips float over its canvas rather than
// reserving a band above a smaller map. Coordinates follow the real capture.
const APP = {left: 90, top: 130, width: 1740, scale: 1740 / 1620};
const LEFT = APP.left + 60 * APP.scale, TOP = APP.top + 76 * APP.scale;
const W = 1548 * APP.scale, H = 792 * APP.scale;
const APP_RECT: Rect = {left: APP.left, top: APP.top, width: APP.width, height: 880 * APP.scale};
/** The next scene's first frame (local frame): the window receded behind a statement card, at `window` with `blur`, and the
 * mascot's pose there. The reveal's last frames move onto it (handoff.ts). */
export type RevealHandoff = {frame: number; window: Rect; blur: number; wash: number; mascot: MascotState};
const scene: MapScene = revealWorld(FILM_WORLDS.main);
const workflows = scene.nodes.filter((n) => n.kind === "workflow");
const points = scene.planes.flatMap((p) => [[p.x0, p.z0], [p.x1, p.z0], [p.x0, p.z1], [p.x1, p.z1]].map(([x, z]) => projectToCanvas({cx: 0, cy: 0, s: 1}, x, .2, z)));
const u0 = Math.min(...points.map((p) => p[0])), u1 = Math.max(...points.map((p) => p[0]));
const v0 = Math.min(...points.map((p) => p[1])), v1 = Math.max(...points.map((p) => p[1]));
const fit = Math.min(W * .96 / (u1 - u0), H * .78 / (v1 - v0));
const cameraAt = (frame: number, timing: RevealTiming): MapCamera => {
  const s = fit * (.95 + .05 * smoothProgress(frame, timing.foldersFrame, timing.assetsFrame));
  return {cx: W / 2 - s * (u0 + u1) / 2, cy: H * .54 - s * (v0 + v1) / 2, s};
};
const Icon: React.FC<{name: string; color: string; size?: number}> = ({name, color, size = 24}) => {
  const i = BUILDER_ICONS[name];
  return <svg width={size} height={size} viewBox={`0 0 ${i.w} ${i.h}`} style={{color, flex: "none"}} dangerouslySetInnerHTML={{__html: i.body}} />;
};
const TextCue: React.FC<{t: number; a: number; b: number; text: string; size: number; center?: boolean}> = ({t, a, b, text, size, center = false}) => {
  if (t < a || t >= b) return null;
  const enter = smoothProgress(t, a, a + .38), exit = smoothProgress(t, b - .3, b);
  return <div style={{position: "absolute", left: 100, right: 100, top: center ? "50%" : 44, textAlign: "center", fontFamily: "Poppins", fontSize: size,
    fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.12, textWrap: "balance", color: "#0B1B3A", opacity: enter * (1 - exit),
    transform: `translateY(${(center ? -50 : 0)}%) translateY(${18 * (1 - enter) - 8 * exit}px)`}}>
    <TitleText html={md(text)} fontKey={`Poppins-${size}`} />
  </div>;
};
/** The asset types as a legend card inside the map canvas (a little below its top edge): gray-bordered chips with small
 * type beside the coloured icon, in a bordered card (no shadow) hugging its two rows. The active type tints its chip and borders it in its icon colour. */
const LEGEND_ROWS = [R.categories.slice(0, 6), R.categories.slice(6)];
const AssetLegend: React.FC<{frame: number; timing: RevealTiming}> = ({frame, timing}) => {
  const k = smoothProgress(frame, timing.assetsFrame, timing.assetsFrame + 10) * (1 - smoothProgress(frame, settleFrame(timing) - 4, settleFrame(timing)));
  if (k <= 0) return null;
  return <div style={{position: "absolute", left: 0, right: 0, top: TOP + 24, display: "flex", justifyContent: "center", opacity: k, translate: `0 ${(1 - k) * 12}px`}}>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 20, borderRadius: 8,
      background: "rgba(255,255,255,.95)", border: "1px solid #D0D5DD"}}>
      {LEGEND_ROWS.map((row, r) => <div key={r} style={{display: "flex", gap: 12}}>
        {row.map((c) => {
          const active = activeCategory(frame, timing) === c.key;
          const {start, end} = categoryWindow(c.key, timing), pulse = active ? Math.sin(Math.PI * progress(frame, start, end)) : 0;
          return <div key={c.key} style={{height: 36, padding: "0 12px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 8,
            border: `1px solid ${active ? c.color : "#D0D5DD"}`, borderRadius: 8, background: active ? `${c.color}14` : "white", scale: 1 + .045 * pulse,
            color: "#344054", fontFamily: "Inter", fontSize: 16, fontWeight: 600, whiteSpace: "nowrap"}}><Icon name={c.icon} color={c.color} size={20} />{c.label}</div>;
        })}
      </div>)}
    </div>
  </div>;
};
/** Real app chrome from the existing product capture. The live map covers
 * its captured canvas; clipping restores the original toolbar controls only. */
const AppChrome: React.FC<{opacity: number; blur: number}> = ({opacity, blur}) => {
  const style: React.CSSProperties = {position: "absolute", left: APP.left, top: APP.top,
    width: APP.width, height: 880 * APP.scale, filter: `blur(${blur}px)`, opacity};
  return <>
    <div style={{...style, overflow: "hidden", borderRadius: 18, boxShadow: "0 24px 70px rgba(36,85,214,.16),0 0 0 1px rgba(29,67,126,.08)"}}>
      {/* the header keeps the page's "Workflow Maps" title and description throughout, as the product shows them */}
      <Img src={staticFile("captures/reveal/map-chrome.jpg")} style={{width: "100%", height: "100%"}} />
    </div>
  </>;
};
const ChromeControls: React.FC<{frame: number; opacity: number; blur: number; timing: RevealTiming}> = ({frame, opacity, blur, timing}) => <>
  {[[76, 92, 768, 31], [76, 815, 223, 38], [1238, 815, 358, 38]].map(([x, y, w, h], i) => <div key={i}
    style={{position: "absolute", left: APP.left + x * APP.scale, top: APP.top + y * APP.scale, width: w * APP.scale, height: h * APP.scale,
      overflow: "hidden", opacity: opacity * (i === 0 ? 1 - smoothProgress(frame, timing.assetsFrame - 11, timing.assetsFrame) * (1 - smoothProgress(frame, settleFrame(timing), settleFrame(timing) + 20)) : 1), filter: `blur(${blur}px)`}}>
    <Img src={staticFile("captures/reveal/map-chrome.jpg")} style={{position: "absolute", left: -x * APP.scale, top: -y * APP.scale, width: APP.width, height: 880 * APP.scale}} />
  </div>)}
</>;
/** Play the original mascotAt choreography at its original speed. Only its
 * clock is offset so M.D1 lands on the selected drop frame. */
const RevealMascot: React.FC<{frame: number; fps: number; timing: RevealTiming; settings: RevealProps["mascot"]; handoff?: RevealHandoff}> = ({frame, fps, timing, settings, handoff}) => {
  const sourceTime = M.D1 + (frame - timing.titleFrame) / fps;
  const st = mascotAt(sourceTime);
  const own = {...st, x: st.x + settings.offsetX, y: st.y + settings.offsetY, s: st.s * settings.scale};
  // into the hand-off: it moves to where the next scene has it, with the title's exit
  const to = handoff?.mascot, k = to ? springAt(frame / fps, (handoff!.frame - HANDOFF.lead - 4) / fps, .55, .1) : 0;
  const pose = to && k > 0 ? {...own, x: mix(own.x, to.x, k), y: mix(own.y, to.y, k), s: mix(own.s, to.s, k), r: mix(own.r ?? 0, to.r ?? 0, k),
    look: [mix(own.look?.[0] ?? 0, to.look?.[0] ?? 0, k), mix(own.look?.[1] ?? 0, to.look?.[1] ?? 0, k)] as [number, number],
    sparkle: (own.sparkle ?? 0) * Math.max(0, 1 - k), eyes: k > .5 ? to.eyes : own.eyes} : own;
  return <Mascot t={sourceTime} st={{...pose, o: (st.o ?? 1) * smoothProgress(frame, timing.foldersFrame - 16, timing.foldersFrame)}} />;
};
/** Reuse the complete base entrance over the buildup, then its existing pulse
 * and exit. Only the source clock is stretched; no spring is truncated. */
const BaseTitle: React.FC<{frame: number; fps: number; timing: RevealTiming; settings: RevealProps["title"]; brandStyle: StyleCfg; handoffFrame?: number}> = ({frame, fps, timing, settings, brandStyle, handoffFrame}) => {
  const cfg = {...DEFAULT_CFG, style: brandStyle, motion: {...DEFAULT_CFG.motion, titles: settings.motion}};
  const total = titleRuns(md(settings.text)).reduce((n, run) => n + run.text.length, 0);
  const entrance = settings.motion.mode === "calm" ? .3 : .08
    + Math.min(settings.motion.letterDelay, .55 / Math.max(1, total)) * Math.max(0, total - 1)
    + settings.motion.duration * .8;
  const clock = titleClock(frame, timing, entrance, fps);
  return <CfgProvider cfg={cfg}>
    <div className="poppins" style={{position: "absolute", inset: 0, ...styleVars(cfg.style)}}>
      <KineticTitle t={clock} at={0} kickerAt={0}
        out={entrance + (titleExitFrame(timing, settings.motion.duration, handoffFrame) - timing.titleFrame) / fps}
        kicker={settings.kicker} html={md(settings.text)} size={settings.size} pulse={[entrance, entrance + TITLE_DROP.wall - TITLE_DROP.at]} />
    </div>
  </CfgProvider>;
};

type RevealSceneProps = RevealProps & {audioEnabled?: boolean; background?: React.ReactNode; brandStyle?: StyleCfg; handoff?: RevealHandoff};
export const MapRevealTease: React.FC<RevealSceneProps> = ({preview, layer, timing, title, mascot, copy = R, audioEnabled = true, background, brandStyle = DEFAULT_CFG.style, handoff}) => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = R.start + frame / fps, camera = cameraAt(frame, timing);
  const settled = settleFrame(timing);
  const mapIn = smoothProgress(frame, timing.foldersFrame - 16, timing.foldersFrame);
  const looks: Record<string, NodeLook> = {};
  for (const n of scene.nodes) {
    let k: number;
    if (n.kind === "workflow") {
      const at = workflowAt(workflows.indexOf(n), workflows.length, timing);
      k = smoothProgress(frame, at, Math.min(timing.assetsFrame, at + (timing.assetsFrame - timing.workflowsFrame) * .4));
    } else {
      k = categoryProgress(frame, categoryOf(n), timing);
    }
    looks[n.id] = {opacity: k, lift: (n.kind === "workflow" ? .8 : 2.4) * (1 - k)};
  }
  const planeLooks = Object.fromEntries(scene.planes.map((p, i) => {
    const at = folderAt(i, scene.planes.length, timing), k = smoothProgress(frame, at, Math.min(timing.workflowsFrame, at + (timing.workflowsFrame - timing.foldersFrame) * .5));
    return [p.id, {opacity: k, lift: (1 - k) * 5}];
  }));
  const arrival = (n: MapNode) => n.kind === "workflow" ? timing.assetsFrame : categoryWindow(categoryOf(n), timing).end;
  const edgeLooks: Record<string, EdgeLook> = Object.fromEntries(scene.edges.map((e, i) => {
    const a = scene.nodes.find((n) => n.id === e.from)!, b = scene.nodes.find((n) => n.id === e.to)!;
    const start = Math.max(settled - 38 + i / Math.max(1, scene.edges.length - 1) * 12, arrival(a), arrival(b));
    const opacity = smoothProgress(frame, start, settled);
    return [`${e.from}>${e.to}`, {hidden: opacity === 0, opacity}];
  }));
  // into the hand-off the window recedes onto the next scene's receded window, as the title lifts away
  const hp = handoff ? smoothProgress(frame, handoff.frame - HANDOFF.lead, handoff.frame) : 0, fit = handoff ? fitRect(APP_RECT, handoff.window) : undefined;
  const titleWash = mix(.65 * smoothProgress(frame, settled, timing.titleFrame), handoff?.wash ?? 0, hp);
  const appBlur = mix(.65 * smoothProgress(frame, settled, timing.titleFrame) * 5, handoff?.blur ?? 0, hp);
  const showMap = layer === "review" || layer === "map";
  // styling layers only: kept out of Studio's timeline, where every AbsoluteFill otherwise gets its own row
  return <AbsoluteFill showInTimeline={false} style={{...styleVars(brandStyle), background: showMap ? "linear-gradient(180deg,#fbfdff 0%,#f2f7ff 60%,#dceaff 100%)" : "transparent", overflow: "hidden", fontFamily: "Inter"}}>
    <style>{GLOBAL_CSS}</style>
    {preview && audioEnabled && layer === "review" ? <Audio src={staticFile("intro-music.wav")} trimBefore={Math.round(R.start * fps)} /> : null}
    {showMap ? <>
    <AbsoluteFill showInTimeline={false} style={{opacity: 1 - mapIn}}>
      <AbsoluteFill showInTimeline={false} style={{filter: `blur(${2 * smoothProgress(t, 25.2, 25.6)}px)`}}>
        {background ?? <Img src={staticFile("captures/reveal/context.png")} style={{width: 1920, height: 1080}} />}
      </AbsoluteFill>
      <AbsoluteFill showInTimeline={false} style={{background: "#f4f8ff", opacity: .3 * smoothProgress(t, 25.2, 25.6)}} />
    </AbsoluteFill>
    {/* the horizon sits behind the app window, as the main video's floor does, never across its toolbar */}
    <div style={{position: "absolute", left: "50%", top: 1010, width: 3400, height: 1400, marginLeft: -1700, borderRadius: "50%",
      background: "radial-gradient(ellipse 50% 35% at 50% 0%,rgba(255,255,255,.45),rgba(149,197,255,.38) 65%,rgba(129,182,255,.2))",
      borderTop: "3px solid rgba(255,255,255,.85)", opacity: mapIn}} />
    <TextCue t={t} a={R.start} b={R.start + (timing.questionEndFrame ?? 111) / fps} text={copy.question} size={88} center />
    <TextCue t={t} a={R.start + (timing.imagineStartFrame ?? 115.5) / fps} b={R.start + timing.foldersFrame / fps} text={copy.imagine} size={86} center />
    <AbsoluteFill showInTimeline={false} style={fit && hp > 0 ? {transformOrigin: `${APP_RECT.left + APP_RECT.width / 2}px ${APP_RECT.top + APP_RECT.height / 2}px`,
      transform: `translate(${(fit.dx * hp).toFixed(2)}px, ${(fit.dy * hp).toFixed(2)}px) scale(${mix(1, fit.scale, hp).toFixed(4)})`} : undefined}>
    <AppChrome opacity={mapIn} blur={appBlur} />
    <div style={{position: "absolute", left: LEFT, top: TOP, width: W, height: H, opacity: mapIn, background: "#fff", overflow: "hidden", borderRadius: 12,
      filter: `blur(${appBlur}px)`}}>
      <MapView scene={scene} width={W} height={H} camera={camera} t={Math.min(t, R.start + settled / fps)} looks={looks} planeLooks={planeLooks} edgeLooks={edgeLooks} pixelRatio={1.5} zoomH={H} />
    </div>
    <ChromeControls timing={timing} frame={frame} opacity={mapIn} blur={appBlur} />
    </AbsoluteFill>
    <div style={{position: "absolute", left: 100, right: 100, top: 15, textAlign: "center", fontSize: 18, fontWeight: 650, letterSpacing: ".17em", color: "#155EEF", opacity: progress(frame, timing.foldersFrame, timing.foldersFrame + 10) * (1 - progress(frame, settled - 12, settled))}}>IMAGINE A NEW WAY TO SEE YOUR WORKFLOWS</div>
    <TextCue t={t} a={R.start + timing.foldersFrame / fps} b={R.start + timing.workflowsFrame / fps} text={copy.folders} size={58} />
    <TextCue t={t} a={R.start + timing.workflowsFrame / fps} b={R.start + timing.assetsFrame / fps} text={copy.workflows} size={60} />
    <TextCue t={t} a={R.start + timing.assetsFrame / fps} b={R.start + settled / fps} text={copy.assets} size={60} />
    <AssetLegend timing={timing} frame={frame} />
    <AbsoluteFill showInTimeline={false} style={{background: "#fff", opacity: titleWash}} />
    </> : null}
    {preview && (layer === "review" || layer === "titles") ? <BaseTitle frame={frame} fps={fps} timing={timing} settings={title} brandStyle={brandStyle} handoffFrame={handoff?.frame} /> : null}
    {preview && mascot.visible && (layer === "review" || layer === "mascot") ? <RevealMascot frame={frame} fps={fps} timing={timing} settings={mascot} handoff={handoff} /> : null}
  </AbsoluteFill>;
};
