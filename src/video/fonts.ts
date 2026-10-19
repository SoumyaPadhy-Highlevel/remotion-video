// Loads Inter and Poppins from public/fonts before any frame renders.
import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, number][] = [
  ["Inter", 400], ["Inter", 500], ["Inter", 600], ["Inter", 700],
  ["Poppins", 500], ["Poppins", 600], ["Poppins", 700], ["Poppins", 800],
];

let started = false;
export function loadFonts() {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading fonts");
  Promise.all(
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
}

export const GLOBAL_CSS = `
.poppins { font-family: Poppins, Inter, sans-serif; }
.grad-text { background: linear-gradient(90deg, #155EEF 0%, #2E90FA 60%, #22CCEE 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
`;
