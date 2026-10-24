// Workflow Maps' Assistant panel (GridMapsChatPanel and what it renders), drawn the way the product draws it. Sizes,
// spacing and colours follow the Vue components' classes and scoped CSS (see tokens.ts for the sources); the panel is a
// pure function of `PanelState`, which assistant/shots.ts builds per frame. Window px, inside the 1620×880 app window.
import React from "react";
import { BIcon } from "../builder/Nodes";
import { ASSISTANT, ChatBlock, ChatPlan } from "../script";
import { BTN, FONT, HR, PANEL, SHADOW, V3 } from "./tokens";

// ── state ──
export type Chip = { kind: "workflows"; count: number } | { kind: "folder"; name: string };
export type PlanStatus = "pending" | "running" | "applied";
export type ChatItem =
  /** `k`: the bubble's entrance (v3-msg-in), 0 → 1 */
  | { kind: "user"; text: string; chips?: Chip[]; k?: number }
  /** the turn's live progress (WorkingHeader over BuildProgressCard); `step`: how far the ladder has got (0, 1) */
  | { kind: "progress"; step: number; k?: number }
  /** the bare "Working" line while a plan or a short turn runs */
  | { kind: "working"; k?: number }
  /** `chars`: how much of the reply has streamed (characters, all if absent); `feedback`: the closing row (last reply only) */
  | { kind: "assistant"; thought?: string; blocks?: ChatBlock[]; chars?: number; plan?: { spec: ChatPlan; status: PlanStatus; k?: number };
      feedback?: boolean; k?: number };
export type PanelState = {
  /** the zero state, with its message box's text */
  empty?: { draft?: string; caret?: boolean };
  items: ChatItem[];
  /** "Asking about" above the composer */
  selection?: Chip[];
  draft?: string; caret?: boolean;
  /** a turn is streaming: the composer's gradient border and stop button */
  loading?: boolean;
  /** "Edit History" (MapsChangeHistory) shows once a change was made */
  history?: boolean;
  /** a control under the cursor (hover) or being clicked (press), by id: `tile:<id>`, `send`, `apply`, `cancel` */
  hover?: string; press?: string;
  /** seconds, for the spinners and pulses */
  t: number;
};

// ── primitives ──
const txt = (size: number, color: string, weight = 400, lineHeight: number | string = 1.5): React.CSSProperties =>
  ({ fontFamily: FONT, fontSize: size, color, fontWeight: weight, lineHeight: typeof lineHeight === "number" && lineHeight > 3 ? `${lineHeight}px` : lineHeight });

/** HLButton: `secondary` (white, gray-300 border, shadow-xs), `primary` (primary-600), `ghost`/`text` (no chrome). */
const Button: React.FC<{ size: "2xs" | "xs"; variant: "secondary" | "primary"; tone?: "gray" | "green" | "red"; icon?: string; iconRight?: string;
  label?: string; square?: boolean; flex?: boolean; press?: boolean; hover?: boolean; style?: React.CSSProperties }> =
  ({ size, variant, tone = "gray", icon, iconRight, label, square, flex, press, hover, style }) => {
    const h = BTN[size], primary = variant === "primary";
    const border = primary ? HR.primary600 : tone === "green" ? HR.success200 : tone === "red" ? HR.error200 : HR.gray300;
    const color = primary ? HR.white : tone === "green" ? HR.success600 : tone === "red" ? HR.error600 : HR.gray700;
    const bg = primary ? (press ? HR.primary700 : hover ? "#004eeb" : HR.primary600) : press ? HR.gray100 : hover ? HR.gray50 : HR.white;
    return (
      <div style={{ height: h, width: square ? h : undefined, flex: flex ? 1 : "none", boxSizing: "border-box", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 6, padding: square ? 0 : size === "2xs" ? "0 10px" : "0 12px", borderRadius: 4, border: `1px solid ${border}`,
        background: bg, boxShadow: SHADOW.xs, transform: press ? "scale(0.98)" : undefined, ...style }}>
        {icon ? <BIcon name={icon} size={16} color={color} /> : null}
        {label ? <span style={{ ...txt(size === "2xs" ? 12 : 14, color, 600, size === "2xs" ? 18 : 20), whiteSpace: "nowrap" }}>{label}</span> : null}
        {iconRight ? <BIcon name={iconRight} size={16} color={color} /> : null}
      </div>
    );
  };

/** HLTag (no border, not interactive): `sm` 22 px, `lg` 28 px. */
const Tag: React.FC<{ size: "sm" | "lg"; bg: string; color: string; children: React.ReactNode; close?: boolean }> = ({ size, bg, color, children, close }) => (
  <div style={{ height: size === "sm" ? 22 : 28, boxSizing: "border-box", display: "inline-flex", alignItems: "center", gap: 4, padding: size === "sm" ? "0 6px" : "0 8px",
    borderRadius: 4, background: bg, ...txt(size === "sm" ? 12 : 14, color, size === "sm" ? 400 : 500, size === "sm" ? 18 : 20), whiteSpace: "nowrap" }}>
    {children}
    {close ? <BIcon name="ghl:XClose" size={14} color={HR.gray400} style={{ marginLeft: 2 }} /> : null}
  </div>
);

/** MapsSubjectChips: a workflow count in the workflow hue (cobalt), a folder neutral with its folder glyph. */
const SubjectChip: React.FC<{ chip: Chip; close?: boolean }> = ({ chip, close }) => chip.kind === "workflows"
  ? <Tag size="lg" bg={HR.cobalt50} color={HR.cobalt800} close={close}><BIcon name="mdi:sitemap" size={14} color={HR.cobalt800} />{chip.count} workflows</Tag>
  : <Tag size="lg" bg={HR.gray100} color={HR.gray700} close={close}><BIcon name="ghl:Folder" size={14} color={HR.gray500} />{chip.name}</Tag>;

/** The v3 sparkle (WorkingHeader, ZeroStateHero). */
const Sparkle: React.FC<{ size: number; color: string; hero?: boolean; rotate?: number }> = ({ size, color, hero, rotate = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: "none", transform: `rotate(${rotate}deg)` }}>
    <path d={hero ? "M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" : "M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"} fill={color} />
  </svg>
);

/** v3-msg-in: 0 → 60 % rises past and settles (translateY 12 → −2 → 0, scale .97 → 1.005 → 1). */
const msgIn = (k = 1): React.CSSProperties => {
  if (k >= 1) return {};
  const a = Math.min(1, k / 0.6), b = Math.max(0, (k - 0.6) / 0.4);
  const y = k < 0.6 ? 12 + (-2 - 12) * a : -2 + 2 * b, s = k < 0.6 ? 0.97 + (1.005 - 0.97) * a : 1.005 - 0.005 * b;
  return { opacity: Math.min(1, a), transform: `translateY(${y}px) scale(${s})` };
};

// ── header (V3Header, Chat only) ──
const Header: React.FC = () => (
  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${V3.headerLine}`, flex: "none" }}>
    <div style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ width: 24, display: "flex", justifyContent: "center" }}><BIcon name="ghl:Plus" size={16} color={V3.muted} /></div>
      <div style={{ display: "flex", background: V3.pill, borderRadius: 22, padding: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 18, background: V3.tabBg, ...txt(12.5, V3.tabText, 600, 1.5) }}>
          <BIcon name="ghl:MessageChatSquare" size={15} color={V3.tabText} />{ASSISTANT.title}
        </div>
      </div>
      <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="ghl:XClose" size={20} color={V3.muted} /></div>
    </div>
  </div>
);

// ── zero state (MapsEmptyState: ZeroStateHero, ZeroStateInput, use-case rows) ──
const TILE_ICONS: Record<string, [string, string]> = {
  summarize: ["ghl:Map01", HR.blue600], issues: ["ghl:AlertCircle", HR.pink500], organize: ["ghl:FolderPlus", HR.orange500],
  cleanup: ["ghl:Eraser", HR.teal500], views: ["ghl:Save01", HR.yellow500], chain: ["ghl:Lightning01", HR.purple500], build: ["ghl:Dataflow01", HR.green500],
};
const Caret: React.FC<{ t: number; on?: boolean }> = ({ t, on }) => on && Math.floor(t * 1.9) % 2 === 0
  ? <span style={{ display: "inline-block", width: 1.5, height: 17, background: HR.gray800, verticalAlign: "-3px", marginLeft: 1 }} /> : null;

const SendButton: React.FC<{ enabled: boolean; press?: boolean; zero?: boolean }> = ({ enabled, press, zero }) => (
  <div style={{ width: 28, height: 28, borderRadius: 14, background: V3.send, display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
    opacity: enabled ? 1 : zero ? 0.4 : 0.35, boxShadow: enabled && zero ? "0 2px 8px rgba(124,58,237,.3)" : undefined, transform: press ? "scale(0.95)" : undefined }}>
    <BIcon name="ghl:ArrowUp" size={14} color="#fff" style={{ strokeWidth: 2.5 }} />
  </div>
);
const MicButton: React.FC = () => (
  <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><BIcon name="ghl:Microphone01" size={16} color={HR.gray500} /></div>
);

const EmptyState: React.FC<{ s: PanelState }> = ({ s }) => {
  const draft = s.empty?.draft ?? "";
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)", boxShadow: "0 4px 16px rgba(124,58,237,.3)" }}><Sparkle size={24} color="#fff" hero /></div>
        <div style={txt(18, HR.gray800, 600, 1.375)}>{ASSISTANT.empty.title}</div>
      </div>
      <div style={{ marginTop: -8, marginBottom: 16, textAlign: "center", ...txt(14, HR.gray500, 400, 1.5) }}>{ASSISTANT.empty.description}</div>
      <div style={{ border: `1px solid ${s.empty?.caret ? "#bdb4fe" : HR.gray200}`, borderRadius: 12, padding: "12px 14px 8px", background: HR.white, marginBottom: 20 }}>
        <div style={{ minHeight: 48, ...txt(14, draft ? HR.gray800 : HR.gray400, 400, 1.5) }}>{draft || (s.empty?.caret ? "" : ASSISTANT.placeholder)}<Caret t={s.t} on={s.empty?.caret} /></div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 4 }}>
          <MicButton /><SendButton enabled={!!draft.trim()} zero press={s.press === "send"} />
        </div>
      </div>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...txt(14, HR.gray400, 500, 1.5) }}>
        <BIcon name="ghl:Lightbulb02" size={16} color={HR.gray400} />{ASSISTANT.empty.useCases}
      </div>
      <div>
        {ASSISTANT.empty.tiles.map((tile) => {
          const [icon, color] = TILE_ICONS[tile.id], id = `tile:${tile.id}`;
          return (
            <div key={tile.id} style={{ borderTop: `1px solid ${HR.gray100}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 10px",
                background: s.press === id ? HR.gray100 : s.hover === id ? HR.gray50 : undefined, borderRadius: 0 }}>
                <BIcon name={icon} size={20} color={color} style={{ marginTop: 2 }} />
                <span style={{ flex: 1, minWidth: 0, ...txt(14, HR.gray700, 400, 1.5) }}>
                  <span style={{ fontWeight: 600, color: HR.gray900 }}>{tile.title}</span>
                  <span style={{ margin: "0 4px", color: HR.gray400 }}>–</span>
                  <span style={{ color: HR.gray500 }}>{tile.description}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, marginBottom: 8, ...txt(12, HR.gray500, 400, 1.5) }}>{ASSISTANT.empty.hint}</div>
    </div>
  );
};

// ── transcript ──
const UserBubble: React.FC<{ text: string; chips?: Chip[]; k?: number }> = ({ text, chips, k }) => (
  <div style={{ display: "flex", flexDirection: "column", ...msgIn(k) }}>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "82%", background: V3.bubble, borderRadius: "16px 16px 4px 16px", boxShadow: "0 2px 8px rgba(124,58,237,.18)",
        padding: "10px 14px", ...txt(13, "#fff", 400, 1.8), whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</div>
    </div>
    {/* MapsAskedSubjectLabel: -mt-2 on the transcript's 12 px gap */}
    {chips?.length ? <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 4, marginRight: 4 }}>{chips.map((c, i) => <SubjectChip key={i} chip={c} />)}</div> : null}
  </div>
);

const WorkingHeader: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
    <Sparkle size={15} color={V3.sparkle} rotate={(t / 2.5) * 360} />
    <span style={{ ...txt(14, HR.purple800, 600, 1) }}>{ASSISTANT.working}</span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 2, marginTop: 2 }}>
      {[0, 0.2, 0.4].map((d) => {
        const p = (((t - d) % 1.2) + 1.2) % 1.2 / 1.2, w = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
        return <span key={d} style={{ width: 4, height: 4, borderRadius: 2, background: HR.purple400, opacity: 0.3 + 0.7 * w, transform: `scale(${0.8 + 0.3 * w})` }} />;
      })}
    </span>
  </div>
);

/** BuildProgressCard in its single-tool ladder: group dividers, a done dot (purple, check) and the active ring. */
const ProgressCard: React.FC<{ step: number; t: number }> = ({ step, t }) => (
  <div>
    <WorkingHeader t={t} />
    <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={txt(12.5, "#374151", 600, 1.5)}>{ASSISTANT.progress.title}</span>
        <span style={txt(11, "#9ca3af", 400, 1.5)}>{ASSISTANT.progress.stage}</span>
      </div>
      <div style={{ padding: "10px 14px" }}>
        {ASSISTANT.progress.steps.slice(0, step + 1).map(([group, label], i) => {
          const done = i < step, last = i === step;
          const pulse = 0.5 - 0.5 * Math.cos(((t % 1.5) / 1.5) * Math.PI * 2);
          return (
            <div key={i}>
              <div style={{ ...txt(9.5, "#9ca3af", 700, 1.5), letterSpacing: "0.06em", padding: i === 0 ? "0 0 4px 20px" : "6px 0 4px 20px" }}>{group}</div>
              <div style={{ display: "flex", alignItems: "stretch", gap: 8, minHeight: 20 }}>
                <div style={{ width: 12, paddingTop: 2, display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                  {done ? <div style={{ width: 12, height: 12, borderRadius: 6, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={7} height={7} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                    : <div style={{ width: 12, height: 12, boxSizing: "border-box", borderRadius: 6, background: "#fff", border: "2px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 0 ${3 * pulse}px rgba(124,58,237,${0.25 * (1 - pulse)})` }}><span style={{ width: 4, height: 4, borderRadius: 2, background: "#7c3aed", opacity: 0.5 + 0.5 * pulse }} /></div>}
                  {!last ? <div style={{ width: 1.5, flex: 1, minHeight: 8, marginTop: 2, background: "#7c3aed", opacity: 0.13 }} /> : null}
                </div>
                <div style={{ ...txt(12, done ? "#6b7280" : "#374151", 400, 1.4), paddingBottom: 7 }}>{label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/** ThinkingSummary, collapsed. */
const Thought: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6, ...txt(12.5, HR.gray400, 400, 1) }}>
    {text}<BIcon name="ghl:ChevronDown" size={14} color={HR.gray400} />
  </div>
);

/** `**bold**` runs of one line. */
const runs = (s: string) => s.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((r, i) => r.startsWith("**") ? <strong key={i} style={{ fontWeight: 600 }}>{r.slice(2, -2)}</strong> : <React.Fragment key={i}>{r}</React.Fragment>);

/** The reply's markdown (RenderMarkdown in .v3-assistant-text: 13 px / 1.8, p 0 0 8, lists 16 px in, li 3 px apart), cut at `chars`. */
const Markdown: React.FC<{ blocks: ChatBlock[]; chars?: number }> = ({ blocks, chars = Infinity }) => {
  let left = chars;
  const cut = (s: string) => { const out = s.slice(0, Math.max(0, left)); left -= s.length; return out; };
  const out: React.ReactNode[] = [];
  blocks.forEach((b, i) => {
    if (left <= 0) return;
    if (typeof b === "string") {
      const s = cut(b.replace(/\*\*/g, "\u0000")).replace(/\u0000/g, "**");
      // a cut inside a bold run leaves an odd "**": close it so the part shown is still bold
      const fixed = (s.match(/\*\*/g)?.length ?? 0) % 2 ? `${s}**` : s;
      out.push(<p key={i} style={{ margin: i === blocks.length - 1 ? 0 : "0 0 8px", whiteSpace: "pre-line" }}>{runs(fixed)}</p>);
    } else {
      out.push(
        <ul key={i} style={{ margin: "4px 0 8px", padding: 0, listStyle: "none" }}>
          {b.map((li, j) => {
            if (left <= 0) return null;
            return <li key={j} style={{ position: "relative", margin: "3px 0", paddingLeft: 36 }}>
              <span style={{ position: "absolute", left: 18, top: 10, width: 5, height: 5, borderRadius: 3, background: "#9ca3af" }} />{runs(cut(li))}
            </li>;
          })}
        </ul>,
      );
    }
  });
  return <div style={{ ...txt(13, V3.text, 400, 1.8) }}>{out}</div>;
};

// ── plan card (MapsPlanCard) ──
const STEP_LOOK = {
  pending: { bg: HR.gray100, color: HR.gray500, icon: "ghl:Clock" },
  running: { bg: HR.primary100, color: HR.primary700, icon: "ghl:Loading01" },
  applied: { bg: HR.success100, color: HR.success700, icon: "ghl:CheckCircle" },
};
const PlanCard: React.FC<{ spec: ChatPlan; status: PlanStatus; s: PanelState; k?: number }> = ({ spec, status, s, k }) => {
  const look = STEP_LOOK[status], pending = status === "pending";
  const title = pending ? ASSISTANT.plan.review : status === "applied" ? ASSISTANT.plan.done : "Planned changes";
  return (
    <div style={{ minWidth: 0, borderRadius: 8, border: `1px solid ${HR.gray200}`, boxShadow: SHADOW.card, background: HR.white, ...msgIn(k) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${HR.gray200}`, padding: 10 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={txt(14, HR.gray900, 500, 20)}>{title}</span>
          <span style={txt(12, HR.gray500, 400, 18)}>· {spec.steps.length} step{spec.steps.length === 1 ? "" : "s"}</span>
        </div>
        {status === "applied" && spec.undoable ? <Button size="2xs" variant="secondary" icon="ghl:ReverseLeft" label={ASSISTANT.plan.undo} /> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10 }}>
        {pending ? <div style={txt(12, HR.gray600, 400, 1.5)}>{ASSISTANT.plan.hint}</div> : null}
        {spec.steps.map((st, i) => (
          <div key={i} style={{ position: "relative", paddingLeft: 36, paddingTop: 1, minHeight: 24 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 24, height: 24, borderRadius: 12, background: look.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BIcon name={look.icon} size={16} color={look.color} style={status === "running" ? { transform: `rotate(${s.t * 360}deg)` } : undefined} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <span style={{ flex: 1, minWidth: 0, ...txt(14, HR.gray800, 500, 20) }}>{st.label}</span>
              {status === "running" ? <Tag size="sm" bg={HR.primary50} color={HR.primary700}>
                <BIcon name="ghl:Loading01" size={12} color={HR.primary700} style={{ transform: `rotate(${s.t * 360}deg)` }} />{ASSISTANT.plan.running}</Tag> : null}
            </div>
            {st.reason ? <div style={{ marginTop: 2, ...txt(12, HR.gray500, 400, 18) }}>{st.reason}</div> : null}
          </div>
        ))}
        {pending && spec.reasons.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{spec.reasons.map((r) => <Tag key={r} size="sm" bg={HR.gray100} color={HR.gray700}>{r}</Tag>)}</div>
        ) : null}
        {pending ? (
          <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${HR.gray100}`, paddingTop: 8 }}>
            <Button size="xs" variant="secondary" label={spec.offer ? ASSISTANT.plan.notNow : ASSISTANT.plan.cancel} flex hover={s.hover === "cancel"} press={s.press === "cancel"} />
            <Button size="xs" variant="primary" label={spec.offer ? ASSISTANT.plan.showOnMap : ASSISTANT.plan.apply} flex hover={s.hover === "apply"} press={s.press === "apply"} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** The reply's closing row: Clear chat, then the reactions (FeedbackReactions, 2xs green/red). */
const FeedbackRow: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, marginTop: 10, borderTop: `1px solid ${V3.headerLine}`, width: "100%" }}>
    <Button size="2xs" variant="secondary" label={ASSISTANT.clearChat} style={{ marginTop: 8 }} />
    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 8 }}>
      <Button size="2xs" variant="secondary" tone="green" icon="ghl:ThumbsUp" square />
      <Button size="2xs" variant="secondary" tone="red" icon="ghl:ThumbsDown" square />
    </div>
  </div>
);

const AssistantBubble: React.FC<{ item: Extract<ChatItem, { kind: "assistant" }>; s: PanelState }> = ({ item, s }) => (
  <div style={{ padding: "0 2px", width: "100%", boxSizing: "border-box", ...msgIn(item.k) }}>
    {item.thought ? <Thought text={item.thought} /> : null}
    {item.blocks ? <Markdown blocks={item.blocks} chars={item.chars} /> : null}
    {item.plan ? <div style={{ paddingTop: item.blocks ? 12 : 0 }}><PlanCard spec={item.plan.spec} status={item.plan.status} s={s} k={item.plan.k} /></div> : null}
    {item.feedback ? <FeedbackRow /> : null}
  </div>
);

// ── controls (maps-chat-controls: selection pill, V3ChatFooter on the grid, MapsActionModeToggle) ──
const SelectionPill: React.FC<{ chips: Chip[] }> = ({ chips }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, borderRadius: 8, border: `1px solid ${HR.gray200}`, padding: 10 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={txt(12, HR.gray700, 600, 18)}>{ASSISTANT.askingAbout}</span>
      <BIcon name="ghl:XClose" size={16} color={HR.gray500} style={{ marginRight: 6 }} />
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{chips.map((c, i) => <SubjectChip key={i} chip={c} close />)}</div>
  </div>
);

const Composer: React.FC<{ s: PanelState }> = ({ s }) => {
  const draft = s.draft ?? "", g = (s.t / 3) % 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: 10, boxSizing: "border-box",
      ...(s.loading
        ? { border: "1px solid transparent", backgroundImage: "linear-gradient(#f9fafb, #f9fafb), linear-gradient(90deg, #7c3aed, #ec4899, #7c3aed)",
          backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box", backgroundSize: "100% 100%, 200% 100%", backgroundPosition: `0 0, ${g * 200}% center` }
        : { background: HR.gray50, border: `1px solid ${s.caret ? "#a78bfa" : HR.gray200}`, boxShadow: s.caret ? "0 0 0 3px rgba(167,139,250,.2)" : undefined }) }}>
      <div style={{ flex: 1, minWidth: 0, ...txt(14, draft ? HR.gray700 : HR.gray400, 400, 1.5) }}>{draft || (s.caret ? "" : ASSISTANT.placeholder)}<Caret t={s.t} on={s.caret} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
        <MicButton />
        {s.loading
          ? <div style={{ width: 28, height: 28, borderRadius: 14, background: V3.stop, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: "#fff" }} /></div>
          : <SendButton enabled={!!draft.trim()} press={s.press === "send"} />}
      </div>
    </div>
  );
};

const ModeRow: React.FC<{ history?: boolean }> = ({ history }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>{history ? <Button size="xs" variant="secondary" icon="ghl:ClockRewind" label={ASSISTANT.editHistory} /> : null}</div>
    <Button size="xs" variant="secondary" label={ASSISTANT.reviewFirst} iconRight="ghl:ChevronDown" />
  </div>
);

// ── the panel ──
export const AssistantPanel: React.FC<{ s: PanelState; style?: React.CSSProperties }> = ({ s, style }) => {
  const empty = !!s.empty;
  return (
    <div style={{ position: "absolute", left: PANEL.left, top: PANEL.top, width: PANEL.width, height: PANEL.height, boxSizing: "border-box", display: "flex",
      flexDirection: "column", overflow: "hidden", borderRadius: PANEL.radius, border: `1px solid ${HR.gray200}`, background: HR.white, boxShadow: PANEL.shadow,
      fontFamily: FONT, WebkitFontSmoothing: "antialiased", ...style }}>
      <Header />
      {/* the transcript sticks to its bottom once it overflows (useStickToBottom): column-reverse with a spacer; the zero
          state reads from the top */}
      <div style={{ flex: 1, minHeight: 120, display: "flex", flexDirection: empty ? "column" : "column-reverse", overflow: "hidden", padding: "16px 14px 0" }}>
        {empty ? null : <div style={{ flex: "1 1 auto" }} />}
        <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
          {empty ? <EmptyState s={s} /> : s.items.map((it, i) =>
            it.kind === "user" ? <UserBubble key={i} text={it.text} chips={it.chips} k={it.k} />
            : it.kind === "progress" ? <div key={i} style={{ padding: "0 2px", ...msgIn(it.k) }}><ProgressCard step={it.step} t={s.t} /></div>
            : it.kind === "working" ? <div key={i} style={{ padding: "0 2px", ...msgIn(it.k) }}><WorkingHeader t={s.t} /></div>
            : <AssistantBubble key={i} item={it} s={s} />)}
        </div>
      </div>
      <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${HR.gray200}`, background: HR.white, padding: 14 }}>
        {!empty && s.selection?.length ? <SelectionPill chips={s.selection} /> : null}
        {!empty ? <Composer s={s} /> : null}
        <ModeRow history={s.history} />
      </div>
    </div>
  );
};
