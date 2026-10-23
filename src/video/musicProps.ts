// The music settings as composition props, so Remotion Studio shows them as editable fields (right-hand Props panel):
// change a value, hear it, and "Save" writes it back to the defaultProps in src/Composition.tsx. Times are seconds of the
// finished video.
import { z } from "zod";
import { MUSIC } from "./script";
import { showSchema, styleSchema, textSchema } from "./config";

export const musicSchema = z.object({
  percussionVolume: z.number().min(0).max(2).step(0.05).describe("Percussion level (1 = as recorded)"),
  percussionFadeOutStart: z.number().min(0).max(60).step(0.1).describe("Percussion starts fading out (s)"),
  percussionFadeOutEnd: z.number().min(0).max(60).step(0.1).describe("Percussion silent from (s)"),
  originalStart: z.number().min(0).max(60).step(0.01).describe("Original track starts (s); 32.94 puts its drop on the video's drop"),
  originalVolume: z.number().min(0).max(2).step(0.05).describe("Original track level (1 = as recorded)"),
  originalFadeInStart: z.number().min(0).max(60).step(0.1).describe("Original starts fading in (s)"),
  originalFadeInEnd: z.number().min(0).max(60).step(0.1).describe("Original at full level from (s)"),
  endFade: z.number().min(0).max(10).step(0.1).describe("Fade-out at the very end (s)"),
});
export type MusicSettings = z.infer<typeof musicSchema>;

export const LAYERS = ["all", "base", "titles", "panel", "flash", "mascot", "audio", "titles-clean", "panels", "buildpanel", "flight", "message", "tabs"] as const;
export const workflowMapsSchema = z.object({
  music: musicSchema,
  text: textSchema,
  style: styleSchema,
  show: showSchema,
  layer: z.enum(LAYERS).optional().describe("Editor export only: render one layer (leave empty for the video)"),
  item: z.number().optional().describe("Editor export only: which flying item"),
});

/** The settings the video was cut with (MUSIC in script.ts). */
export const DEFAULT_MUSIC: MusicSettings = {
  percussionVolume: 1, percussionFadeOutStart: MUSIC.xfade[0], percussionFadeOutEnd: MUSIC.xfade[1],
  originalStart: +MUSIC.mainAt.toFixed(2), originalVolume: 1, originalFadeInStart: MUSIC.xfade[0], originalFadeInEnd: MUSIC.xfade[1],
  endFade: 1.6,
};
