import React, { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFonts } from "./fonts";

/** Markup shared by animated titles and Premiere's separate main/accent plates. */
export const titleRuns = (html: string) => {
  const runs: { text: string; accent: boolean }[] = [];
  const re = /<span class="grad-text">(.*?)<\/span>/gs;
  let last = 0, match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match.index > last) runs.push({ text: html.slice(last, match.index), accent: false });
    runs.push({ text: match[1], accent: true });
    last = re.lastIndex;
  }
  if (last < html.length) runs.push({ text: html.slice(last), accent: false });
  return runs;
};

/** Each moving glyph samples its position in ONE phrase-wide gradient. Measuring the
 * untransformed advance after fonts load keeps the colours independent of animation,
 * wrapping, and export resolution. The render waits for this static layout pass. */
const GradientPhrase: React.FC<{ text: string; fontKey: string; children: React.ReactNode }> = ({ text, fontKey, children }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [handle] = useState(() => delayRender("Laying out title gradient"));
  useLayoutEffect(() => {
    let active = true;
    loadFonts().then(() => {
      if (!active || !ref.current) return;
      const glyphs = [...ref.current.querySelectorAll<HTMLElement>("[data-title-glyph]")];
      const widths = glyphs.map((el) => parseFloat(getComputedStyle(el).width));
      ref.current.style.setProperty("--gradient-width", `${widths.reduce((a, b) => a + b, 0)}px`);
      let offset = 0;
      glyphs.forEach((el, i) => {
        el.style.setProperty("--gradient-offset", `${-offset}px`);
        offset += widths[i];
      });
      continueRender(handle);
    });
    return () => { active = false; continueRender(handle); };
  }, [handle, text, fontKey]);
  return <span ref={ref} data-gradient-phrase>{children}</span>;
};

export const TitleText: React.FC<{
  html: string;
  fontKey: string;
  part?: "main" | "accent" | "kicker";
  glyphStyle?: (index: number) => React.CSSProperties;
}> = ({ html, fontKey, part, glyphStyle }) => {
  let index = 0;
  return <>{titleRuns(html).map((run, ri) => {
    const words = run.text.split(/(<br\s*\/?>|\s+)/);
    const content = words.map((word, wi) => {
      if (/^<br\s*\/?>$/.test(word)) return <br key={wi} />;
      const letters = [...word].map((char, ci) => <span key={ci} data-title-glyph
        className={run.accent ? "grad-text" : undefined}
        style={{ display: "inline-block", whiteSpace: "pre", ...glyphStyle?.(index++),
          ...(run.accent ? { backgroundSize: "var(--gradient-width, 100%) 100%", backgroundPosition: "var(--gradient-offset, 0px) 0px", backgroundRepeat: "no-repeat" } : {}),
        }}>{char}</span>);
      return /^\s+$/.test(word) ? <span key={wi}>{letters}</span>
        : <span key={wi} data-title-word style={{ display: "inline-block", whiteSpace: "nowrap" }}>{letters}</span>;
    });
    const visible = part == null || part === (run.accent ? "accent" : "main");
    return <span key={ri} style={{ visibility: visible ? undefined : "hidden" }}>
      {run.accent ? <GradientPhrase text={run.text} fontKey={fontKey}>{content}</GradientPhrase> : content}
    </span>;
  })}</>;
};
