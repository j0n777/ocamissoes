import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, hash01, lerp } from "./anim";
import { ARGILA, BARRO, CREME, Fonts, H, LUZ, MATE, NOITE, PALHA, TERRA, URUCUM, W } from "./brand";

// The Missões landscape in flat 2D: rolling fields (coxilhas), the oca, the
// stone mission facade, the sky that served as a calendar. Everything is SVG,
// in world pixels (1080x1920 frame at zoom 1, y grows down).

export type Cam = { x: number; y: number; zoom: number }; // centre of view

export type Era = "antes" | "hoje";
export type Hora = "dia" | "entardecer" | "noite";

// Sky colours. By default "antes" is a warm dusk and "hoje" a deep night-brown;
// pass `hora` to Stage for a day or night version of either era.
const SKY: Record<Hora, [string, string]> = {
  dia: ["#e6c08f", "#f4dfb6"],
  entardecer: ["#3a1f0e", "#b86a34"],
  noite: [NOITE, "#3b2414"],
};
const DEFAULT_HORA: Record<Era, Hora> = { antes: "entardecer", hoje: "noite" };

// Camera presets around a subject point (world units): the shot grammar of
// the skill. aberto = context, medio = body and gesture, close = upper body,
// detalhe = hands or an object (pass that point, it is centred), ceu = tilt up
// to the sky above the subject.
export type Plano = "aberto" | "medio" | "close" | "detalhe" | "ceu";
export const shot = (kind: Plano, at: [number, number]): Cam => {
  const [x, y] = at;
  switch (kind) {
    case "aberto":
      return { x, y: y - 260, zoom: 0.95 };
    case "medio":
      return { x, y: y - 220, zoom: 1.35 };
    case "close":
      return { x, y: y - 330, zoom: 2.3 };
    case "detalhe":
      return { x, y, zoom: 3.2 };
    case "ceu":
      return { x, y: y - 820, zoom: 1.1 };
  }
};

// The frame: sky gradient in screen space, world through the camera, then a
// screen-space overlay (labels, tags). `defs` lets scenes add SVG filters.
export const Stage = ({ cam, era, hora, children, overlay, defs }: { cam: Cam; era: Era; hora?: Hora; children: ReactNode; overlay?: ReactNode; defs?: ReactNode }) => {
  const sky = SKY[hora ?? DEFAULT_HORA[era]];
  return (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[0]} 35%, ${sky[1]} 75%)` }}>
    <Fonts />
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {defs && <defs>{defs}</defs>}
      <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
    </svg>
    {overlay}
  </AbsoluteFill>
  );
};

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
      const tw = 0.7 + 0.3 * Math.sin(frame / (24 + hash01(i, seed + 3) * 30) + i); // slow twinkle: fast flicker reads as jitter
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
        const tw = 0.92 + 0.08 * Math.sin(frame / 20 + i * 1.3);
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

// Sun with soft rays that turn slowly.
export const Sol = ({ x, y, frame, r = 70 }: { x: number; y: number; frame: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.4} fill={CREME} opacity={0.12} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + frame / 240;
      return <line key={i} x1={x + Math.cos(a) * r * 1.3} y1={y + Math.sin(a) * r * 1.3} x2={x + Math.cos(a) * r * 1.75} y2={y + Math.sin(a) * r * 1.75} stroke={CREME} strokeWidth={8} strokeLinecap="round" opacity={0.6} />;
    })}
    <circle cx={x} cy={y} r={r} fill={CREME} />
  </g>
);

// Erva-mate tree (erval): short trunk, rounded leafy crown. `sway` moves the leaves.
export const Erval = ({ x, ground, size = 1, frame = 0 }: { x: number; ground: number; size?: number; frame?: number }) => {
  const h = 230 * size, sw = Math.sin(frame / 25) * 4 * size;
  const blobs: [number, number, number][] = [[0, -h, 90], [-70, -h + 50, 70], [70, -h + 45, 72], [-30, -h + 95, 60], [40, -h + 100, 58]];
  return (
    <g>
      <path d={`M ${x - 14 * size} ${ground} L ${x - 8 * size} ${ground - h + 60 * size} L ${x + 8 * size} ${ground - h + 60 * size} L ${x + 14 * size} ${ground} Z`} fill={TERRA} />
      {blobs.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx * size + sw} cy={ground + dy * size} r={r * size} fill={i % 2 ? MATE : "#5f7833"} stroke={TERRA} strokeWidth={5} />
      ))}
      {blobs.map(([dx, dy], i) => (
        <ellipse key={`l${i}`} cx={x + (dx + 18) * size + sw} cy={ground + (dy - 12) * size} rx={14 * size} ry={7 * size} fill={PALHA} opacity={0.35} transform={`rotate(-25 ${x + (dx + 18) * size + sw} ${ground + (dy - 12) * size})`} />
      ))}
    </g>
  );
};

// Planted field (roça) in simple perspective: rows that converge to the horizon.
export const Roca = ({ x, ground, w = 700, depth = 160, rows = 6, grow = 1 }: { x: number; ground: number; w?: number; depth?: number; rows?: number; grow?: number }) => (
  <g>
    <path d={`M ${x - w / 2} ${ground + depth} L ${x - w * 0.3} ${ground} L ${x + w * 0.3} ${ground} L ${x + w / 2} ${ground + depth} Z`} fill="#6b3c19" />
    {Array.from({ length: rows }, (_, i) => {
      const t = (i + 0.5) / rows;
      const xb = x - w / 2 + w * t, xt = x - w * 0.3 + w * 0.6 * t;
      return (
        <g key={i}>
          <line x1={xb} y1={ground + depth} x2={xt} y2={ground} stroke={TERRA} strokeWidth={6} />
          {grow > 0 &&
            [0.15, 0.45, 0.8].map((k) => (
              <circle key={k} cx={lerp(xt, xb, k)} cy={ground + depth * k - 10 * k * grow} r={(4 + 10 * k) * clamp01(grow)} fill={MATE} />
            ))}
        </g>
      );
    })}
  </g>
);

// Wooden printing press (the mission press, stylised): frame, screw, platen.
export const Prensa = ({ x, ground, size = 1, press = 0 }: { x: number; ground: number; size?: number; press?: number }) => {
  const w = 260 * size, h = 360 * size, l = x - w / 2, top = ground - h;
  const py = top + 120 * size + 40 * size * clamp01(press);
  return (
    <g stroke={TERRA} strokeWidth={6} strokeLinejoin="round">
      <rect x={l} y={top} width={28 * size} height={h} fill={ARGILA} />
      <rect x={l + w - 28 * size} y={top} width={28 * size} height={h} fill={ARGILA} />
      <rect x={l - 10 * size} y={top} width={w + 20 * size} height={34 * size} fill={ARGILA} />
      <rect x={x - 9 * size} y={top + 34 * size} width={18 * size} height={py - top - 34 * size} fill={PALHA} />
      <line x1={x - 70 * size} y1={top + 70 * size} x2={x + 70 * size} y2={top + 70 * size} strokeWidth={10 * size} stroke={TERRA} strokeLinecap="round" />
      <rect x={x - 80 * size} y={py} width={160 * size} height={22 * size} fill={PALHA} />
      <rect x={l + 20 * size} y={ground - 150 * size} width={w - 40 * size} height={30 * size} fill={ARGILA} />
      <rect x={x - 70 * size} y={ground - 172 * size} width={140 * size} height={22 * size} fill={CREME} />
    </g>
  );
};

// Open book; `lines` 0..1 writes the lines in.
export const Livro = ({ x, y, size = 1, lines = 1 }: { x: number; y: number; size?: number; lines?: number }) => (
  <g>
    <path d={`M ${x} ${y} q ${-60 * size} ${-26 * size} ${-130 * size} ${-8 * size} l 0 ${110 * size} q ${70 * size} ${-18 * size} ${130 * size} ${8 * size} q ${60 * size} ${-26 * size} ${130 * size} ${-8 * size} l 0 ${-110 * size} q ${-70 * size} ${-18 * size} ${-130 * size} ${8 * size} Z`} fill={CREME} stroke={TERRA} strokeWidth={6} strokeLinejoin="round" />
    <line x1={x} y1={y} x2={x} y2={y + 110 * size} stroke={TERRA} strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) =>
      [-1, 1].map((side) => {
        const t = clamp01(lines * 5 - i);
        if (t <= 0) return null;
        const yy = y + (14 + i * 18) * size;
        return <line key={`${i}${side}`} x1={x + side * 20 * size} y1={yy} x2={x + side * (20 + 90 * t) * size} y2={yy} stroke={TERRA} strokeWidth={4} opacity={0.6} strokeLinecap="round" />;
      }),
    )}
  </g>
);

// Canoe on the water line, rocking gently.
export const Canoa = ({ x, y, frame, size = 1 }: { x: number; y: number; frame: number; size?: number }) => {
  const rock = Math.sin(frame / 14) * 2;
  return (
    <g transform={`rotate(${rock} ${x} ${y})`}>
      <path d={`M ${x - 150 * size} ${y - 20 * size} Q ${x} ${y + 40 * size} ${x + 150 * size} ${y - 20 * size} L ${x + 120 * size} ${y - 6 * size} Q ${x} ${y + 18 * size} ${x - 120 * size} ${y - 6 * size} Z`} fill={ARGILA} stroke={TERRA} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

// Close-up gourd (cuia) of chimarrão, for detail shots.
export const Cuia = ({ x, y, size = 1, steam = 0 }: { x: number; y: number; size?: number; steam?: number }) => (
  <g>
    {steam > 0 &&
      [0, 1].map((k) => <path key={k} d={`M ${x + (k ? 20 : -20) * size} ${y - 110 * size} q ${12 * size} ${-25 * size} 0 ${-50 * size} q ${-12 * size} ${-25 * size} 0 ${-50 * size}`} stroke={CREME} strokeWidth={5} fill="none" opacity={0.35 * steam} strokeLinecap="round" />)}
    <line x1={x + 10 * size} y1={y - 70 * size} x2={x + 45 * size} y2={y - 190 * size} stroke={PALHA} strokeWidth={10 * size} strokeLinecap="round" />
    <path d={`M ${x - 75 * size} ${y - 80 * size} q ${-20 * size} ${130 * size} ${75 * size} ${135 * size} q ${95 * size} ${-5 * size} ${75 * size} ${-135 * size} Z`} fill={MATE} stroke={TERRA} strokeWidth={7} strokeLinejoin="round" />
    <ellipse cx={x} cy={y - 80 * size} rx={75 * size} ry={16 * size} fill="#4d6328" stroke={TERRA} strokeWidth={6} />
  </g>
);

// Drifting clouds (slow, never jittery). `tone` "dia" for light clouds,
// "noite" for dark ones.
export const Nuvens = ({ frame, y = 300, count = 4, tone = "dia", seed = 2 }: { frame: number; y?: number; count?: number; tone?: "dia" | "noite"; seed?: number }) => (
  <g opacity={tone === "dia" ? 0.85 : 0.5}>
    {Array.from({ length: count }, (_, i) => {
      const w = 160 + hash01(i, seed) * 160;
      const x = ((hash01(i, seed + 1) * 1600 + frame * (0.3 + hash01(i, seed + 2) * 0.3)) % 1800) - 400;
      const cy = y + hash01(i, seed + 3) * 160;
      const c = tone === "dia" ? CREME : "#3b2414";
      return (
        <g key={i}>
          <ellipse cx={x} cy={cy} rx={w / 2} ry={w * 0.16} fill={c} />
          <circle cx={x - w * 0.15} cy={cy - w * 0.1} r={w * 0.2} fill={c} />
          <circle cx={x + w * 0.12} cy={cy - w * 0.14} r={w * 0.24} fill={c} />
        </g>
      );
    })}
  </g>
);

// Rain: slanted streaks falling at a steady speed (motion, not flicker).
export const Chuva = ({ frame, box = [-200, -200, 1300, 1300], count = 70, seed = 4 }: { frame: number; box?: [number, number, number, number]; count?: number; seed?: number }) => (
  <g stroke={CREME} strokeWidth={3} strokeLinecap="round" opacity={0.35}>
    {Array.from({ length: count }, (_, i) => {
      const [x0, y0, x1, y1] = box;
      const h = y1 - y0;
      const y = y0 + ((hash01(i, seed) * h + frame * 28) % h);
      const x = x0 + hash01(i, seed + 1) * (x1 - x0) - (y - y0) * 0.15;
      return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 46} />;
    })}
  </g>
);

// Rhea (ema): the bird of the Guarani winter constellation. `walk` 0..1 phase.
export const Ema = ({ x, ground, size = 1, facing = 1, frame = 0 }: { x: number; ground: number; size?: number; facing?: 1 | -1; frame?: number }) => {
  const s = size, step = Math.sin(frame / 6) * 0.25;
  const leg = (a: number, dx: number) => `M ${x + dx * s} ${ground - 90 * s} l ${Math.sin(a) * 40 * s * facing} ${Math.cos(a) * 90 * s}`;
  return (
    <g>
      <path d={leg(step + 0.15, -12)} stroke={TERRA} strokeWidth={8 * s} strokeLinecap="round" />
      <path d={leg(-step - 0.15, 12)} stroke={TERRA} strokeWidth={8 * s} strokeLinecap="round" />
      <ellipse cx={x} cy={ground - 120 * s} rx={70 * s} ry={45 * s} fill={PALHA} stroke={TERRA} strokeWidth={6} />
      <path d={`M ${x + 40 * s * facing} ${ground - 140 * s} q ${30 * s * facing} ${-60 * s} ${20 * s * facing} ${-120 * s}`} stroke={PALHA} strokeWidth={16 * s} fill="none" strokeLinecap="round" />
      <path d={`M ${x + 40 * s * facing} ${ground - 140 * s} q ${30 * s * facing} ${-60 * s} ${20 * s * facing} ${-120 * s}`} stroke={TERRA} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.4} />
      <circle cx={x + 62 * s * facing} cy={ground - 262 * s} r={14 * s} fill={PALHA} stroke={TERRA} strokeWidth={5} />
      <path d={`M ${x + 74 * s * facing} ${ground - 262 * s} l ${20 * s * facing} ${4 * s}`} stroke={TERRA} strokeWidth={6 * s} strokeLinecap="round" />
    </g>
  );
};

// Quero-quero (southern lapwing), the bird of the pampa, standing or flying.
export const QueroQuero = ({ x, y, size = 1, voando = false, frame = 0, facing = 1 }: { x: number; y: number; size?: number; voando?: boolean; frame?: number; facing?: 1 | -1 }) => {
  const s = size;
  if (voando) {
    const flap = Math.sin(frame / 4) * 22 * s;
    return <path d={`M ${x - 46 * s} ${y + flap} Q ${x - 20 * s} ${y - 10 * s} ${x} ${y} Q ${x + 20 * s} ${y - 10 * s} ${x + 46 * s} ${y + flap}`} stroke={TERRA} strokeWidth={6 * s} fill="none" strokeLinecap="round" />;
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${facing * s} ${s})`}>
      <line x1={-4} y1={0} x2={-8} y2={-34} stroke={TERRA} strokeWidth={4} />
      <line x1={6} y1={0} x2={4} y2={-34} stroke={TERRA} strokeWidth={4} />
      <ellipse cx={0} cy={-50} rx={30} ry={18} fill="#8a8f86" stroke={TERRA} strokeWidth={4} />
      <ellipse cx={8} cy={-44} rx={18} ry={10} fill={CREME} />
      <circle cx={26} cy={-72} r={12} fill="#8a8f86" stroke={TERRA} strokeWidth={4} />
      <path d={`M 22 -82 q -18 -6 -26 -2`} stroke={TERRA} strokeWidth={4} fill="none" />
      <path d={`M 36 -72 l 14 3`} stroke={TERRA} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// A bag of erva-mate (a product of the region); `tag` shows a QR label (hoje).
export const SacoErva = ({ x, ground, size = 1, tag = false }: { x: number; ground: number; size?: number; tag?: boolean }) => {
  const s = size;
  return (
    <g>
      <path d={`M ${x - 60 * s} ${ground} q ${-10 * s} ${-80 * s} ${6 * s} ${-150 * s} l ${108 * s} 0 q ${16 * s} ${70 * s} ${6 * s} ${150 * s} Z`} fill={PALHA} stroke={TERRA} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${x - 54 * s} ${ground - 150 * s} q ${54 * s} ${-26 * s} ${108 * s} 0`} fill="none" stroke={TERRA} strokeWidth={6} />
      <path d={`M ${x - 20 * s} ${ground - 70 * s} q ${20 * s} ${-30 * s} ${40 * s} 0 q ${-20 * s} ${16 * s} ${-40 * s} 0 Z`} fill={MATE} />
      {tag && <rect x={x + 8 * s} y={ground - 120 * s} width={40 * s} height={40 * s} fill={CREME} stroke={TERRA} strokeWidth={3} />}
      {tag && [0, 1, 2].map((i) => [0, 1, 2].map((j) => ((i * 3 + j) % 2 === 0 ? <rect key={`${i}${j}`} x={x + (13 + i * 11) * s} y={ground - (115 - j * 11) * s} width={8 * s} height={8 * s} fill={TERRA} /> : null)))}
    </g>
  );
};

// The OCA today: a modern dome (the oca shape) in glass and wood, windows lit
// in LUZ, the hub where people meet. Use it for the ecosystem and the Mutirão.
export const OcaModerna = ({ x, ground, w = 460, h = 280, lit = 1 }: { x: number; ground: number; w?: number; h?: number; lit?: number }) => {
  const l = x - w / 2, r = x + w / 2, top = ground - h;
  const ribs = [0.2, 0.35, 0.5, 0.65, 0.8];
  return (
    <g>
      <path d={`M ${l} ${ground} C ${l} ${top - h * 0.05}, ${r} ${top - h * 0.05}, ${r} ${ground} Z`} fill="#3b2414" stroke={CREME} strokeWidth={6} />
      {ribs.map((t) => {
        const px = lerp(l, r, t);
        return <path key={t} d={`M ${px} ${ground} Q ${lerp(px, x, 0.35)} ${top + h * 0.1} ${x} ${top + h * 0.02}`} stroke={CREME} strokeWidth={3} fill="none" opacity={0.5} />;
      })}
      {[0.28, 0.5, 0.72].map((t, i) => (
        <rect key={t} x={lerp(l, r, t) - 26} y={ground - h * 0.45} width={52} height={h * 0.3} rx={6} fill={LUZ} opacity={(0.3 + 0.7 * lit) * (i === 1 ? 1 : 0.8)} />
      ))}
      <path d={`M ${x - 40} ${ground} L ${x - 40} ${ground - 90} Q ${x} ${ground - 124} ${x + 40} ${ground - 90} L ${x + 40} ${ground} Z`} fill={CREME} opacity={0.9} />
    </g>
  );
};
