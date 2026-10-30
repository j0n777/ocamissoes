import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, hash01, lerp } from "./anim";
import { ARGILA, BARRO, CREME, Fonts, H, MATE, NOITE, PALHA, TERRA, URUCUM, W } from "./brand";

// The Missões landscape in flat 2D: rolling fields (coxilhas), the oca, the
// stone mission facade, the sky that served as a calendar. Everything is SVG,
// in world pixels (1080x1920 frame at zoom 1, y grows down).

export type Cam = { x: number; y: number; zoom: number }; // centre of view

export type Era = "antes" | "hoje";

// Sky colours per era: warm dusk for "antes", deep night-brown for "hoje".
const SKY: Record<Era, [string, string]> = {
  antes: ["#3a1f0e", "#b86a34"],
  hoje: [NOITE, "#3b2414"],
};

// The frame: sky gradient in screen space, world through the camera, then a
// screen-space overlay (labels, tags). `defs` lets scenes add SVG filters.
export const Stage = ({ cam, era, children, overlay, defs }: { cam: Cam; era: Era; children: ReactNode; overlay?: ReactNode; defs?: ReactNode }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SKY[era][0]} 0%, ${SKY[era][0]} 35%, ${SKY[era][1]} 75%)` }}>
    <Fonts />
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {defs && <defs>{defs}</defs>}
      <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
    </svg>
    {overlay}
  </AbsoluteFill>
);

// Hard cuts: the shot whose `from` is the latest one at or before `frame`.
export const pickShot = <T,>(frame: number, shots: { from: number; shot: T }[]) => shots.reduce((cur, s) => (frame >= s.from ? s : cur), shots[0]);

// Layered rolling hills. `parallax` shifts far layers less when the camera
// pans (pass cam.x). Colours go from light clay (far) to dark earth (near).
export const Hills = ({ ground = 1250, era = "antes", parallax = 0 }: { ground?: number; era?: Era; parallax?: number }) => {
  const layers = era === "antes" ? [ARGILA, BARRO, "#6b3c19"] : ["#3b2414", "#2f1c0f", "#26160b"];
  return (
    <g>
      {layers.map((c, k) => {
        const base = ground - 150 + k * 70;
        const shift = parallax * (0.15 + k * 0.2);
        const pts: string[] = [];
        for (let x = -1400; x <= 2600; x += 40) {
          const y = base - 60 * Math.sin((x + shift) / (260 + k * 90) + k * 1.7) - 30 * Math.sin((x + shift) / 97 + k);
          pts.push(`${x},${y}`);
        }
        return <polygon key={k} points={`-1400,3000 ${pts.join(" ")} 2600,3000`} fill={c} />;
      })}
      <rect x={-1400} y={ground} width={4000} height={2000} fill={era === "antes" ? TERRA : "#1c1008"} />
    </g>
  );
};

// Stars with a deterministic twinkle. `count` spread over a box.
export const Stars = ({ frame, box = [-600, -400, 1700, 900], count = 70, seed = 5, opacity = 1 }: { frame: number; box?: [number, number, number, number]; count?: number; seed?: number; opacity?: number }) => (
  <g opacity={opacity}>
    {Array.from({ length: count }, (_, i) => {
      const x = box[0] + hash01(i, seed) * (box[2] - box[0]);
      const y = box[1] + hash01(i, seed + 1) * (box[3] - box[1]);
      const r = 1.5 + hash01(i, seed + 2) * 2.5;
      const tw = 0.55 + 0.45 * Math.sin(frame / (6 + hash01(i, seed + 3) * 10) + i);
      return <circle key={i} cx={x} cy={y} r={r} fill={CREME} opacity={tw * 0.8} />;
    })}
  </g>
);

// The Pleiades: a tight cluster of seven stars. `glow` 0..1 brightens them,
// `link` 0..1 draws the connecting line (the "reading" of the sky).
const PLEIADES: [number, number][] = [[0, 0], [38, -14], [70, 6], [52, 40], [18, 34], [96, -30], [-28, 22]];
export const Pleiades = ({ x, y, frame, glow = 0, link = 0, color = CREME }: { x: number; y: number; frame: number; glow?: number; link?: number; color?: string }) => {
  const path = [6, 0, 1, 5, 2, 3, 4, 0].map((i) => PLEIADES[i]);
  let d = "";
  path.forEach(([px, py], k) => (d += `${k ? "L" : "M"} ${x + px} ${y + py} `));
  return (
    <g>
      {link > 0 && <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - link} opacity={0.7} />}
      {PLEIADES.map(([px, py], i) => {
        const tw = 0.8 + 0.2 * Math.sin(frame / 5 + i * 1.3);
        return (
          <g key={i}>
            <circle cx={x + px} cy={y + py} r={(10 + 14 * glow) * tw} fill={color} opacity={0.12 + 0.2 * glow} />
            <circle cx={x + px} cy={y + py} r={3.5 + 2.5 * glow} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

export const Moon = ({ x, y, r = 46, color = CREME }: { x: number; y: number; r?: number; color?: string }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.06} />
    <circle cx={x} cy={y} r={r} fill={color} opacity={0.9} />
  </g>
);

// The oca: a dome of thatch on a short wall, with a dark doorway.
export const Oca = ({ x, ground, w = 360, h = 230 }: { x: number; ground: number; w?: number; h?: number }) => {
  const l = x - w / 2, r = x + w / 2, top = ground - h;
  const thatch = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const px = lerp(l, r, t);
    const py = top + (h * 0.85) * (1 - Math.sin(Math.PI * t)) * 0.9;
    return <path key={i} d={`M ${px} ${py + 8} Q ${lerp(px, x, 0.15)} ${ground - h * 0.4} ${px + (t - 0.5) * 30} ${ground - 14}`} stroke={TERRA} strokeWidth={3} fill="none" opacity={0.35} />;
  });
  return (
    <g>
      <path d={`M ${l} ${ground} C ${l} ${top - h * 0.05}, ${r} ${top - h * 0.05}, ${r} ${ground} Z`} fill={PALHA} stroke={TERRA} strokeWidth={6} strokeLinejoin="round" />
      {thatch}
      <path d={`M ${x - 34} ${ground} L ${x - 34} ${ground - 70} Q ${x} ${ground - 104} ${x + 34} ${ground - 70} L ${x + 34} ${ground} Z`} fill={TERRA} />
    </g>
  );
};

// Stylised mission facade (a stone front with arches and a pediment), the
// visual shorthand for the Sete Povos ruins. Not a survey of a real building.
export const Ruina = ({ x, ground, w = 420, color = "#a7744a" }: { x: number; ground: number; w?: number; color?: string }) => {
  const h = w * 0.62, l = x - w / 2, top = ground - h;
  const arch = (cx: number, aw: number, ah: number) => `M ${cx - aw / 2} ${ground} L ${cx - aw / 2} ${ground - ah + aw / 2} A ${aw / 2} ${aw / 2} 0 0 1 ${cx + aw / 2} ${ground - ah + aw / 2} L ${cx + aw / 2} ${ground} Z`;
  return (
    <g>
      <path d={`M ${l} ${ground} L ${l} ${top + h * 0.25} L ${x - w * 0.18} ${top + h * 0.25} L ${x} ${top - h * 0.12} L ${x + w * 0.18} ${top + h * 0.25} L ${l + w} ${top + h * 0.25} L ${l + w} ${ground} Z`} fill={color} stroke={TERRA} strokeWidth={6} strokeLinejoin="round" />
      {[-1, 0, 1].map((k) => (
        <path key={k} d={arch(x + k * w * 0.3, w * (k ? 0.16 : 0.22), h * (k ? 0.45 : 0.6))} fill={TERRA} opacity={0.85} />
      ))}
      <circle cx={x} cy={top + h * 0.14} r={w * 0.035} fill={TERRA} opacity={0.85} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={l} x2={l + w} y1={top + h * 0.35 + i * h * 0.11} y2={top + h * 0.35 + i * h * 0.11} stroke={TERRA} strokeWidth={2} opacity={0.18} />
      ))}
    </g>
  );
};

// A sprout that grows from the ground: `grow` 0..1.
export const Sprout = ({ x, ground, grow, size = 1 }: { x: number; ground: number; grow: number; size?: number }) => {
  const g = easeOut(clamp01(grow));
  if (g <= 0) return null;
  const h = 90 * size * g;
  const leaf = (side: 1 | -1, at: number) => {
    const ly = ground - h * at;
    const lw = 34 * size * clamp01(g * 1.4 - at * 0.5);
    return <path d={`M ${x} ${ly} q ${side * lw * 0.5} ${-lw * 0.8} ${side * lw} ${-lw * 0.2} q ${-side * lw * 0.5} ${lw * 0.4} ${-side * lw} ${lw * 0.2} Z`} fill={MATE} stroke={TERRA} strokeWidth={3} />;
  };
  return (
    <g>
      <path d={`M ${x} ${ground} Q ${x + 6 * size} ${ground - h * 0.5} ${x} ${ground - h}`} stroke={MATE} strokeWidth={7 * size} fill="none" strokeLinecap="round" />
      {leaf(1, 0.55)}
      {leaf(-1, 0.8)}
      {g > 0.8 && leaf(1, 1)}
    </g>
  );
};

// Small campfire with flickering flames.
export const Fogueira = ({ x, ground, frame, size = 1 }: { x: number; ground: number; frame: number; size?: number }) => {
  const fl = (k: number) => 1 + 0.18 * Math.sin(frame / 2.3 + k * 2) + 0.08 * Math.sin(frame / 1.3 + k);
  return (
    <g>
      <circle cx={x} cy={ground - 30 * size} r={110 * size} fill={URUCUM} opacity={0.12} />
      <path d={`M ${x - 46 * size} ${ground} L ${x + 46 * size} ${ground - 18 * size} M ${x + 46 * size} ${ground} L ${x - 46 * size} ${ground - 18 * size}`} stroke={TERRA} strokeWidth={12 * size} strokeLinecap="round" />
      <path d={`M ${x - 30 * size} ${ground - 10 * size} Q ${x} ${ground - 110 * size * fl(0)} ${x + 30 * size} ${ground - 10 * size} Z`} fill={URUCUM} />
      <path d={`M ${x - 16 * size} ${ground - 10 * size} Q ${x} ${ground - 70 * size * fl(1)} ${x + 16 * size} ${ground - 10 * size} Z`} fill={PALHA} />
    </g>
  );
};

// A river band with drifting highlight dashes.
export const Rio = ({ y, frame, h = 70, color = "#5b6f73" }: { y: number; frame: number; h?: number; color?: string }) => (
  <g>
    <rect x={-1400} y={y} width={4000} height={h} fill={color} />
    {Array.from({ length: 24 }, (_, i) => {
      const x = ((hash01(i, 9) * 4000 + frame * (2 + hash01(i, 10) * 2)) % 4000) - 1400;
      return <line key={i} x1={x} x2={x + 40 + hash01(i, 11) * 60} y1={y + 12 + hash01(i, 12) * (h - 24)} y2={y + 12 + hash01(i, 12) * (h - 24)} stroke={CREME} strokeWidth={3} opacity={0.35} strokeLinecap="round" />;
    })}
  </g>
);
