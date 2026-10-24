// The music settings as composition props, so Remotion Studio shows them as editable fields (right-hand Props panel):
// change a value, hear it, and "Save" writes it back to the defaultProps in src/Composition.tsx. The track itself is
// MUSIC in script.ts.
import { z } from "zod";
import { fxSchema, motionSchema, showSchema, styleSchema, textSchema } from "./config";

export const musicSchema = z.object({
  volume: z.number().min(0).max(2).step(0.05).describe("Music level (1 = as mixed)"),
  offset: z.number().min(-5).max(5).step(0.01).describe("Nudge the music later (+) or earlier (−) against the picture (s); 0 = drop on the drop"),
  loopToDrop: z.boolean().describe("Where the video outruns the track, jump back to the drop on a bar line"),
  endFade: z.number().min(0).max(10).step(0.1).describe("Fade-out at the very end (s)"),
});
export type MusicSettings = z.infer<typeof musicSchema>;

export const LAYERS = ["all", "base", "titles", "panel", "flash", "mascot", "audio", "titles-clean", "panels", "buildpanel", "flight", "message", "tabs"] as const;
export const workflowMapsSchema = z.object({
  steadyMotion: z.boolean().optional().describe("Keep the app frame steady between text cards; use gentle title fades"),
  music: musicSchema,
  text: textSchema,
  style: styleSchema,
  show: showSchema,
  motion: motionSchema,
  fx: fxSchema,
  layer: z.enum(LAYERS).optional().describe("Editor export only: render one layer (leave empty for the video)"),
  item: z.number().optional().describe("Editor export only: which flying item"),
});

/** The settings the video is synced with. */
export const DEFAULT_MUSIC: MusicSettings = { volume: 1, offset: 0, loopToDrop: true, endFade: 1.6 };
