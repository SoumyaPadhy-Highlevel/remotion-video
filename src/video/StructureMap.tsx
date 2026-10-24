import React from "react";
import { spring } from "remotion";
import { clamp, lerp, prog, win } from "./anim";
import { STRUCTURE_OPENING as S } from "./script";
import { STRUCTURE_ICONS } from "./StructureIcons";

type Point = { x: number; y: number };
type WorldPoint = { x: number; z: number };
type MapNode = WorldPoint & { id: string; label: string; icon: string; color: string; workflow: boolean };
const BLUE = "#4655F5";
const NODES: MapNode[] = [
  { id: "application", x: 3, z: -1.5, label: S.workflowNames[0], icon: "workflow", color: BLUE, workflow: true },
  { id: "enquiry", x: .1, z: .4, label: S.workflowNames[1], icon: "workflow", color: BLUE, workflow: true },
  { id: "payment", x: 5.7, z: -3.5, label: S.workflowNames[2], icon: "workflow", color: BLUE, workflow: true },
  { id: "tags", x: 6.1, z: .5, label: S.workflowNames[3], icon: "workflow", color: BLUE, workflow: true },
  { id: "video", x: .3, z: -3.3, label: S.workflowNames[4], icon: "workflow", color: BLUE, workflow: true },
  { id: "page", x: 1.3, z: -1.6, label: S.assetNames[0], icon: "file-document-multiple", color: "#EF725B", workflow: false },
  { id: "product", x: 3.2, z: -3.2, label: S.assetNames[1], icon: "package-variant", color: "#36BB8D", workflow: false },
  { id: "funnel", x: 5, z: -1, label: S.assetNames[2], icon: "filter", color: "#F79542", workflow: false },
  { id: "enrolment", x: 2, z: .2, label: S.assetNames[3], icon: "package-variant-closed", color: "#E6B834", workflow: false },
];
const ISLANDS = [
  { x: 3, z: -1.5, w: 8, h: 5.8, tint: "#EFF4FF", side: "#6B8BEE" },
  { x: -4.3, z: -5, w: 5.5, h: 3.6, tint: "#F1F9F7", side: "#6BB7A4" },
  { x: -5, z: .3, w: 5.5, h: 4.4, tint: "#F8F4FF", side: "#A18ACE" },
  { x: 1, z: 5.4, w: 7, h: 4, tint: "#F1F9F7", side: "#6BB7A4" },
  { x: -5.6, z: 6.1, w: 4.8, h: 3.8, tint: "#FFF8EC", side: "#D4AC71" },
];

/** A continuous orthographic camera; the same clock drives list morphs and selection. */
export const structureProject = (t: number, x: number, z: number, height = 0): Point => {
  const focus = prog(t, 6.8, 12.3);
  const detail = prog(t, 21.5, 22.9);
  const yaw = lerp(.10, .72, prog(t, 2.8, 6.1)) + Math.sin(t * .24) * .018 * prog(t, 5, 8);
  const tilt = lerp(.93, .62, prog(t, 2.8, 6.1));
  const scale = lerp(58, 112, focus) + 6 * prog(t, 15.1, 18.1) - 9 * detail;
  const dx = x - lerp(-.3, 3, focus);
  const dz = z - lerp(1.1, -1.5, focus);
  return { x: lerp(820, 600, detail) + (dx * Math.cos(yaw) - dz * Math.sin(yaw)) * scale,
    y: 475 + (dx * Math.sin(yaw) + dz * Math.cos(yaw)) * scale * tilt - height * scale * .88 };
};
const pts = (points: Point[]) => points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
const shade = (hex: string, k: number) => `rgb(${[1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k)).join(",")})`;
const appear = (t: number, at: number, fps: number) => t < at ? 0 : spring({ frame: (t - at) * fps, fps, config: { damping: 18, stiffness: 155, mass: .85 } });
export const ProductIcon: React.FC<{ name: string; x?: number; y?: number; size?: number; color?: string }> = ({ name, x = 0, y = 0, size = 24, color = "currentColor" }) => <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" color={color}><g dangerouslySetInnerHTML={{ __html: STRUCTURE_ICONS[name] ?? STRUCTURE_ICONS.workflow }} /></svg>;

/** Bevelled nonagon workflows and smaller hexagonal assets, matching the product's visual grammar. */
const Node: React.FC<{ node: MapNode; t: number; fps: number }> = ({ node: n, t, fps }) => {
  const i = NODES.indexOf(n);
  const arrival = appear(t, 5.0 + i * .075, fps);
  const emphasis = n.workflow ? win(t, 11.2, 16.2, .6, .5) : win(t, 15.52, 21.4, .6, .5);
  const selected = n.id === "application" ? prog(t, 21.6, 22.2) : 0;
  const focusPage = n.id === "page" ? prog(t, 26.65, 27.5) : 0;
  const assetReveal = !n.workflow ? appear(t, 15.52 + (i - 5) * .13, fps) : 1;
  const baseSize = n.workflow ? .40 : .27;
  const r = baseSize * arrival * (1 + .12 * emphasis + .10 * selected) * (n.workflow ? 1 : .80 + .20 * assetReveal);
  const press = n.id === "application" ? win(t, 21.48, 21.82, .07, .22) : 0;
  const rise = (n.workflow ? .34 : .23) * arrival + emphasis * .13 + selected * .20 + focusPage * .22 - press * .13;
  const dim = n.id === "application" ? 1 : n.workflow ? 1 - .80 * prog(t, 15.52, 16.25) : 1;
  const opacity = clamp(arrival) * dim;
  const count = n.workflow ? 9 : 6;
  const ring = (radius: number, h: number) => Array.from({ length: count }, (_, j) => {
    const a = (j / count) * Math.PI * 2;
    return structureProject(t, n.x + Math.cos(a) * radius, n.z + Math.sin(a) * radius, h);
  });
  const bottom = ring(r, .04);
  const top = ring(r * .94, rise);
  const inner = ring(r * .83, rise + .018);
  const center = structureProject(t, n.x, n.z, rise + .022);
  const ground = structureProject(t, n.x, n.z, .01);
  const origin = structureProject(t, 0, 0);
  const scale = Math.hypot(structureProject(t, 1, 0).x - origin.x, structureProject(t, 0, 1).x - origin.x);
  const ripple = clamp((t - 21.55) / .95);
  const labelOn = prog(t, 10.8, 12.0) * (n.workflow && n.id !== "application" ? 1 - prog(t, 15.35, 16.15) : 1);
  const name = n.label.length > 27 ? `${n.label.slice(0, 25)}…` : n.label;
  const labelWidth = name.length * 7.3 + 22;
  return <g opacity={opacity}>
    {n.workflow && <polygon points={pts(ring(r * 1.14, .03))} fill="#35C96E" opacity={.75 + .25 * emphasis} />}
    <ellipse cx={ground.x} cy={ground.y + 5} rx={r * scale * 1.05} ry={r * scale * .35} fill="#172E5C" opacity=".11" filter="url(#node-shadow)" />
    {n.id === "application" && <ellipse cx={ground.x} cy={ground.y} rx={50 + ripple * 95} ry={26 + ripple * 40} fill="none" stroke="#155EEF" strokeWidth="3" opacity={(1 - ripple) * selected} />}
    {top.map((p, j) => <polygon key={j} points={pts([bottom[j], bottom[(j + 1) % count], top[(j + 1) % count], p])} fill={shade(n.color, .60 + .22 * ((j + 3) % count) / count)} />)}
    <polygon points={pts(top)} fill={n.color} />
    <polygon points={pts(inner)} fill="white" opacity=".055" />
    <polyline points={pts(top.slice(0, Math.ceil(count / 2)))} stroke="white" strokeWidth="1.4" fill="none" opacity=".36" />
    <g transform={`translate(${center.x},${center.y}) scale(${r * 1.2 * scale / 24},${r * .72 * scale / 24})`}>
      <ProductIcon name={n.icon} x={-12} y={-12} size={24} color="white" />
    </g>
    <g opacity={labelOn} transform={`translate(${ground.x},${ground.y + 37 + r * 25})`}>
      <rect x={-labelWidth / 2} y={-13} width={labelWidth} height={29} rx={14.5} fill="white" stroke="#E4E7EC" />
      <text textAnchor="middle" y={6} fill="#344054" fontSize="14" fontWeight="600">{name}</text>
    </g>
  </g>;
};

export const StructureMap: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const morph = prog(t, 2.8, 5.4);
  const gridOn = prog(t, 3.05, 5.3);
  const node0 = NODES[0];
  const assetFocus = prog(t, 15.52, 16.15);
  const folderFocus = win(t, 6, 11, .6, .5);
  return <svg width="1620" height="880" viewBox="0 0 1620 880" style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
    <defs>
      <clipPath id="map-viewport"><rect x="58" y="76" width="1550" height="792" rx="14" /></clipPath>
      <filter id="island-shadow" x="-30%" y="-60%" width="170%" height="230%"><feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#15386F" floodOpacity=".10" /></filter>
      <filter id="node-shadow" x="-70%" y="-150%" width="240%" height="400%"><feGaussianBlur stdDeviation="4" /></filter>
      <marker id="map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#98A2B3" /></marker>
    </defs>
    <rect width="1620" height="880" fill="#F9FBFF" />
    <g clipPath="url(#map-viewport)">
      <rect x="58" y="76" width="1550" height="792" fill="white" />
      <g opacity={gridOn * .68}>
        {Array.from({ length: 65 }, (_, i) => i - 32).map((n) => {
          const a = structureProject(t, n, -35), b = structureProject(t, n, 35);
          const c = structureProject(t, -35, n), d = structureProject(t, 35, n);
          return <g key={n} stroke="#E7ECF3" strokeWidth={n % 5 === 0 ? 1.25 : .6}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} /><line x1={c.x} y1={c.y} x2={d.x} y2={d.y} /></g>;
        })}
      </g>
      {[1, 2, 4, 3, 0].map((idx) => {
        const island = ISLANDS[idx];
        const k = prog(t, 2.8 + idx * .10, 5.0 + idx * .10);
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        const target = corners.map(([a, b]) => structureProject(t, island.x + a * island.w / 2, island.z + b * island.h / 2));
        const start = [{ x: 35, y: 299 + idx * 78 }, { x: 1585, y: 299 + idx * 78 }, { x: 1585, y: 377 + idx * 78 }, { x: 35, y: 377 + idx * 78 }];
        const points = target.map((p, j) => ({ x: lerp(start[j].x, p.x, k), y: lerp(start[j].y, p.y, k) }));
        const lower = points.map((p) => ({ x: p.x, y: p.y + 8 * k }));
        const dim = idx === 0 ? 1 : 1 - .78 * prog(t, 9.7, 12.2);
        return <g key={idx} opacity={dim}>
          <polygon points={pts(lower)} fill={island.side} filter="url(#island-shadow)" />
          <polygon points={pts(points)} fill={island.tint} stroke={idx === 0 ? "#A9C0F8" : "#D4DFE8"} strokeWidth="1.1" />
          {idx === 0 && <polygon points={pts(points)} fill="none" stroke="#5280ED" strokeWidth={2.5 + 1.5 * Math.sin(t * 2) ** 2} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog(t, 6.15, 7.25)} opacity={folderFocus} />}
        </g>;
      })}
      <g opacity={prog(t, 5.3, 6.3)}>
        {NODES.filter((n) => !n.workflow).map((asset, i) => {
          const draw = prog(t, 5.7 + i * .13, 6.8 + i * .13);
          const ax = asset.x - node0.x, az = asset.z - node0.z;
          const len = Math.hypot(ax, az);
          const a = structureProject(t, node0.x + ax / len * .48, node0.z + az / len * .48, .06);
          const b = structureProject(t, asset.x - ax / len * .34, asset.z - az / len * .34, .06);
          const pageFocus = asset.id === "page" ? prog(t, 26.6, 27.3) : 0;
          const phase = ((t - 16.1 - i * .23) % 2.5 + 2.5) % 2.5 / 2.5;
          const dot = { x: lerp(b.x, a.x, phase), y: lerp(b.y, a.y, phase) };
          return <g key={asset.id}>
            <path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} stroke="#CAD2DD" strokeWidth="2.3" fill="none" />
            <path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog(t, 15.52 + i * .15, 16.4 + i * .15)} stroke={pageFocus > .1 ? "#155EEF" : "#A9CBFF"} strokeWidth={3 + pageFocus * 1.5} fill="none" opacity={assetFocus} />
            <circle cx={dot.x} cy={dot.y} r={4 + pageFocus * 1.5} fill="#2876F6" opacity={assetFocus * win(phase, 0, 1, .08, .13)} />
            <circle cx={lerp(b.x, a.x, clamp(phase - .04))} cy={lerp(b.y, a.y, clamp(phase - .04))} r="3" fill="#75ABFF" opacity={assetFocus * .5 * win(phase, .04, 1, .06, .13)} />
          </g>;
        })}
      </g>
      {[...NODES].sort((a, b) => (a.x + a.z) - (b.x + b.z)).map((n) => <Node key={n.id} node={n} t={t} fps={fps} />)}
      {ISLANDS.map((island, idx) => {
        const k = prog(t, 2.8 + idx * .10, 5 + idx * .10);
        const p = structureProject(t, island.x, island.z + island.h / 2 + .32);
        const x = lerp(172, p.x, k), y = lerp(344 + idx * 78, p.y, k);
        const width = S.folders[idx].length * 8.3 + 48;
        return <g key={idx} transform={`translate(${x},${y})`} opacity={idx === 0 ? 1 : 1 - .78 * prog(t, 9.7, 12.2)}>
          <rect x={lerp(-38, -width / 2, k)} y={-20} width={width} height={36} rx={18 * k} fill="white" opacity={k} stroke="#E4E7EC" />
          <g transform={`translate(${lerp(-32, -width / 2 + 12, k)},-12)`}><ProductIcon name="folder-outline" size={22} color={idx === 0 ? "#155EEF" : "#667085"} /></g>
          <text x={lerp(0, -width / 2 + 42, k)} y={5} fill={idx === 0 ? "#155EEF" : "#344054"} fontSize={lerp(18, 17, k)} fontWeight={idx === 0 ? 650 : 500}>{S.folders[idx]}</text>
        </g>;
      })}
      <g opacity={win(t, 7.2, 10.8, .4, .4)}>
        <rect x="130" y="635" width="350" height="97" rx="18" fill="white" stroke="#DBE5F5" />
        <text x="155" y="672" fontSize="23" fontWeight="700" fill="#155EEF">{S.folder}</text>
        <text x="155" y="705" fontSize="19" fill="#667085">{S.labels.folderCount}</text>
      </g>
    </g>
    {/* Only the product controls stay fixed while the scene camera moves. */}
    <g opacity={morph}>
      <rect width="1620" height="64" fill="white" />
      <line x1="0" y1="64" x2="1620" y2="64" stroke="#EAECF0" />
      <ProductIcon name="arrow-left" x={22} y={21} size={21} color="#667085" />
      <text x="52" y="37" fontSize="15" fontWeight="600" fill="#344054">{S.ui.back}</text>
      <text x="790" y="28" fontSize="20" textAnchor="middle" fontWeight="700" fill="#101828">{S.ui.title}</text>
      <rect x="879" y="12" width="44" height="23" rx="5" fill="#F2EAFF" /><text x="901" y="28" fontSize="11" fontWeight="600" textAnchor="middle" fill="#6941C6">{S.ui.beta}</text>
      <text x="790" y="49" fontSize="12" textAnchor="middle" fill="#667085">{S.captions[1].detail}</text>
      <rect x="1500" y="13" width="101" height="37" rx="8" fill="#B4C5FB" /><text x="1550" y="37" textAnchor="middle" fill="white" fontSize="15" fontWeight="600">{S.ui.save}</text>
      <rect x="75" y="93" width="478" height="35" rx="8" fill="white" stroke="#D0D5DD" />
      {[S.ui.published, S.ui.draft, S.ui.tags, S.ui.forms, S.ui.pipelines].map((label, i) => <text key={label} x={92 + i * 93} y="115" fill={i === 0 ? "#24A36A" : "#475467"} fontSize="13" fontWeight="600">{label}</text>)}
      <ProductIcon name="magnify" x={18} y={84} size={24} color="#667085" /><ProductIcon name="filter-variant" x={18} y={130} size={24} color="#667085" />
      <rect x="76" y="816" width="162" height="38" rx="8" fill="white" stroke="#D0D5DD" /><text x="95" y="842" fontSize="23" fill="#667085">⛶ − ＋</text>
      <rect x="251" y="816" width="61" height="38" rx="8" fill="white" stroke="#D0D5DD" /><ProductIcon name="cube-outline" x={260} y={825} size={20} color="#667085" /><text x="282" y="841" fontSize="13" fill="#475467">2D</text>
    </g>
  </svg>;
};
