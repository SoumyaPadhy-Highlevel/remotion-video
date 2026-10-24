// Loads Inter and Poppins from public/fonts before any frame renders.
import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, number][] = [
  ["Inter", 400], ["Inter", 500], ["Inter", 600], ["Inter", 700],
  ["Poppins", 500], ["Poppins", 600], ["Poppins", 700], ["Poppins", 800],
];

let fontLoading: Promise<void> | undefined;
export function loadFonts() {
  if (typeof document === "undefined") return Promise.resolve();
  if (fontLoading) return fontLoading;
  const handle = delayRender("Loading fonts");
  fontLoading = Promise.all(
    FACES.map(([family, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${family.toLowerCase()}-${weight}.woff2`)}) format("woff2")`, { weight: String(weight) });
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Font loading failed", err);
      continueRender(handle);
    });
  return fontLoading;
}

export const GLOBAL_CSS = `
.poppins { font-family: var(--font-head, Poppins), Inter, sans-serif; }
.grad-text { background: linear-gradient(90deg, var(--grad-a, #155EEF) 0%, var(--grad-b, #2E90FA) 60%, var(--grad-c, #22CCEE) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
`;
