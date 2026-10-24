/** Static title plates. Premiere owns their entrance, hold and exit keyframes. */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { Cfg, CfgProvider, DEFAULT_CFG, styleVars } from "../src/video/config";
import { GLOBAL_CSS, loadFonts } from "../src/video/fonts";
import { KineticTitle } from "../src/video/Impact";

loadFonts();
type Props = { cfg: Cfg; title: { kicker: string; html: string; size: number; maxWidth: number } };
const Title: React.FC<Props> = ({cfg, title}) => <CfgProvider cfg={cfg}>
  <AbsoluteFill className="poppins premiere-study-title" style={{...styleVars(cfg.style), background: "transparent"}}>
    <style>{GLOBAL_CSS + `.premiere-study-title > div > div:last-child { max-width: ${title.maxWidth}px !important; }`}</style>
    <KineticTitle t={5} at={0} out={999} kicker={title.kicker} html={title.html} size={title.size} />
  </AbsoluteFill>
</CfgProvider>;
const Root = () => <Composition id="PremiereStudyTitle" component={Title} fps={30} width={1920} height={1080} durationInFrames={1}
  defaultProps={{cfg: DEFAULT_CFG, title: {kicker: "", html: "", size: 84, maxWidth: 1500}}} />;
registerRoot(Root);
