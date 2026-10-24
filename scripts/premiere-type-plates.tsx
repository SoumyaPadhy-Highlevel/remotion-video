/** Static full-frame plates preserve typography; Premiere animates each phrase. */
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { Cfg, DEFAULT_CFG, styleVars } from "../src/video/config";
import { GLOBAL_CSS, loadFonts } from "../src/video/fonts";

loadFonts();
type Plate = {id: string; kicker: string; html: string; size: number; maxWidth: number; offsetY: number; part: string; kind: string; file: string};
type Props = {cfg: Cfg; plates: Plate[]};
const split = (html: string) => {
  const runs: {text: string; accent: boolean}[] = [];
  const re = /<span class="grad-text">(.*?)<\/span>/g;
  let last = 0, match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match.index > last) runs.push({text: html.slice(last, match.index), accent: false});
    runs.push({text: match[1], accent: true}); last = re.lastIndex;
  }
  if (last < html.length) runs.push({text: html.slice(last), accent: false});
  return runs;
};
const PlateBook: React.FC<Props> = ({cfg, plates}) => {
  const p = plates[useCurrentFrame()];
  const headline = p.kind === "headline";
  return <AbsoluteFill className="poppins" style={{...styleVars(cfg.style), background: "transparent"}}>
    <style>{GLOBAL_CSS}</style>
    <div style={headline ? {position: "absolute", left: 106, top: 440, width: 1400, textAlign: "left"} : {
      position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", transform: `translateY(${p.offsetY}px)`,
    }}>
      {p.kicker ? <div style={{fontSize: Math.max(22, p.size * .2), fontWeight: 600, color: "var(--accent)", letterSpacing: ".08em", visibility: p.part === "kicker" ? "visible" : "hidden"}}>{p.kicker}</div> : null}
      <div style={{fontSize: p.size, fontWeight: 800, letterSpacing: headline ? "-.02em" : "-.03em", lineHeight: headline ? 1.04 : 1.12,
        marginTop: headline ? 0 : p.size * .05, color: "var(--ink)", maxWidth: p.maxWidth}}>
        {split(p.html).map((run, ri) => run.text.split(/(\s+)/).map((word, wi) => /^\s+$/.test(word) ? <React.Fragment key={`${ri}-${wi}`}>{word}</React.Fragment> :
          <span key={`${ri}-${wi}`} className={run.accent ? "grad-text" : undefined} style={{display: "inline-block", whiteSpace: "nowrap",
            visibility: p.part === (run.accent ? "accent" : "main") ? "visible" : "hidden"}}>{word}</span>))}
      </div>
    </div>
  </AbsoluteFill>;
};
const Root = () => <Composition id="PremiereTypePlates" component={PlateBook} fps={30} width={1920} height={1080} durationInFrames={1}
  defaultProps={{cfg: DEFAULT_CFG, plates: [{id: "empty", kicker: "", html: "", size: 84, maxWidth: 1500, offsetY: 0, part: "main", kind: "support", file: "empty.png"}]}}
  calculateMetadata={({props}) => ({durationInFrames: props.plates.length})} />;
registerRoot(Root);
