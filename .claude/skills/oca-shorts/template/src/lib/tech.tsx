import { clamp01, easeInOut, easeOut, hash01, lerp } from "./anim";
import { CREME, LUZ, MONO, NOITE, TERRA } from "./brand";

// The "hoje" kit: screens, satellites, drones, data and the signature motif,
// roots that turn into circuits. Everything glows in LUZ and nothing else.
// World units, like world.tsx.

// SVG glow filter; put `<GlowDef />` in the Stage `defs` and use filter="url(#glow)".
export const GlowDef = () => (
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="7" result="b" />
    <feMerge>
      <feMergeNode in="b" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

// Floating panel ("holograma"): appears with a scan line, shows a bar chart
// whose bars rise in sequence; the best bar gets a check. `t` 0..1 is the reveal.
export const HoloPanel = ({ x, y, t, w = 420, h = 280, bars = [0.35, 0.5, 0.9, 0.7, 0.4], best = 2, title }: { x: number; y: number; t: number; w?: number; h?: number; bars?: number[]; best?: number; title?: string }) => {
  if (t <= 0) return null;
  const open = easeOut(clamp01(t / 0.25));
  const ph = h * open;
  const l = x - w / 2, top = y - ph / 2;
  const bw = (w - 80) / bars.length;
  return (
    <g>
      <rect x={l} y={top} width={w} height={ph} fill={LUZ} opacity={0.08} stroke={LUZ} strokeWidth={3} />
      {open > 0.95 && (
        <g>
          {title && (
            <text x={l + 24} y={top + 42} fill={LUZ} fontFamily={MONO} fontSize={22} letterSpacing={3}>
              {title}
            </text>
          )}
          {bars.map((v, i) => {
            const bt = easeOut(clamp01((t - 0.3 - i * 0.07) / 0.25));
            const bh = (h - 110) * v * bt;
            return <rect key={i} x={l + 40 + i * bw + 8} y={top + h - 30 - bh} width={bw - 16} height={bh} fill={LUZ} opacity={i === best ? 0.95 : 0.35} />;
          })}
          {t > 0.85 && (
            <path d={`M ${l + 40 + best * bw + bw / 2 - 18} ${top + 70} l 12 12 l 24 -26`} stroke={CREME} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - easeOut(clamp01((t - 0.85) / 0.12))} />
          )}
        </g>
      )}
      <line x1={l} x2={l + w} y1={top + ph * ((t * 3) % 1)} y2={top + ph * ((t * 3) % 1)} stroke={LUZ} strokeWidth={2} opacity={t < 0.6 ? 0.6 : 0} />
    </g>
  );
};

// A small satellite crossing the sky along a gentle arc, `t` 0..1. With
// `ping` it emits rings towards the ground point `to`.
export const Satellite = ({ from, to, t, ping = 0, target }: { from: [number, number]; to: [number, number]; t: number; ping?: number; target?: [number, number] }) => {
  const e = easeInOut(clamp01(t));
  const x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 60;
  return (
    <g>
      {target && ping > 0 && <line x1={x} y1={y} x2={target[0]} y2={target[1]} stroke={LUZ} strokeWidth={2} strokeDasharray="10 12" opacity={0.6 * clamp01(ping * 3)} />}
      {ping > 0 && [0, 1, 2].map((k) => {
        const r = ((ping * 2 + k / 3) % 1) * 120;
        return <circle key={k} cx={x} cy={y} r={r} fill="none" stroke={LUZ} strokeWidth={2} opacity={1 - r / 120} />;
      })}
      <g transform={`translate(${x} ${y}) rotate(-15)`}>
        <rect x={-46} y={-10} width={30} height={20} fill={LUZ} opacity={0.85} />
        <rect x={16} y={-10} width={30} height={20} fill={LUZ} opacity={0.85} />
        <rect x={-14} y={-14} width={28} height={28} rx={4} fill={CREME} stroke={TERRA} strokeWidth={3} />
      </g>
    </g>
  );
};

// Quadcopter drone hovering with spinning rotor marks.
export const Drone = ({ x, y, frame, scale = 1 }: { x: number; y: number; frame: number; scale: number }) => {
  const bob = Math.sin(frame / 8) * 6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${scale})`}>
      <line x1={-60} x2={60} y1={0} y2={0} stroke={CREME} strokeWidth={8} strokeLinecap="round" />
      {[-60, 60].map((px) => (
        <ellipse key={px} cx={px} cy={-10} rx={34 * Math.abs(Math.cos(frame / 1.5 + px))} ry={5} fill={CREME} opacity={0.7} />
      ))}
      <rect x={-26} y={-12} width={52} height={26} rx={10} fill={CREME} stroke={TERRA} strokeWidth={4} />
      <circle cx={0} cy={18} r={8} fill={LUZ} />
    </g>
  );
};

// Roots that become circuits: from each seed point, a path goes down and
// branches at right angles, drawn on with `t` 0..1, nodes light up at the ends.
// The OCA signature: the ancestral root and the new circuit are one line.
export const CircuitRoots = ({ seeds, ground, t, depth = 260, seed = 4 }: { seeds: number[]; ground: number; t: number; depth?: number; seed?: number }) => (
  <g filter="url(#glow)">
    {seeds.map((sx, i) => {
      const r = (k: number) => hash01(i * 10 + k, seed);
      const side = r(0) < 0.5 ? -1 : 1;
      const y1 = ground + depth * (0.3 + 0.2 * r(1));
      const x2 = sx + side * (60 + 80 * r(2));
      const y3 = ground + depth * (0.75 + 0.25 * r(3));
      const d = `M ${sx} ${ground} L ${sx} ${y1} L ${x2} ${y1 + 40} L ${x2} ${y3}`;
      const bt = clamp01((t - i * 0.08) / 0.7);
      return (
        <g key={i}>
          <path d={d} stroke={LUZ} strokeWidth={5} fill="none" strokeLinejoin="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - easeOut(bt)} />
          {bt > 0.95 && <circle cx={x2} cy={y3} r={10} fill={NOITE} stroke={LUZ} strokeWidth={5} />}
          {bt > 0.5 && <circle cx={sx} cy={y1} r={6} fill={LUZ} />}
        </g>
      );
    })}
  </g>
);

// Data motes rising from a point, for "the system is thinking".
export const DataMotes = ({ x, y, frame, start, count = 16, spread = 200 }: { x: number; y: number; frame: number; start: number; count?: number; spread?: number }) => {
  const t = frame - start;
  if (t < 0) return null;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const life = (t / 30 + hash01(i, 21)) % 1;
        const px = x + (hash01(i, 22) - 0.5) * spread;
        const py = y - life * 220;
        return <rect key={i} x={px} y={py} width={6} height={6} fill={LUZ} opacity={(1 - life) * clamp01(t / 10)} />;
      })}
    </g>
  );
};

// A phone seen big (close-up): screen with a header bar and content rows.
export const Celular = ({ x, y, size = 1, t = 1, glow = 0.8 }: { x: number; y: number; size?: number; t?: number; glow?: number }) => {
  const w = 220 * size, h = 420 * size;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={28 * size} fill={NOITE} stroke={CREME} strokeWidth={8} />
      <rect x={x - w / 2 + 16 * size} y={y - h / 2 + 40 * size} width={w - 32 * size} height={h - 80 * size} rx={10 * size} fill={LUZ} opacity={0.12 + 0.1 * glow} />
      <rect x={x - w / 2 + 30 * size} y={y - h / 2 + 60 * size} width={(w - 60 * size) * clamp01(t * 2)} height={20 * size} fill={LUZ} opacity={0.9} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x - w / 2 + 30 * size} y={y - h / 2 + (110 + i * 50) * size} width={(w - 60 * size) * (0.6 + 0.4 * ((i * 37) % 10) / 10) * clamp01(t * 3 - i * 0.4)} height={14 * size} rx={4} fill={CREME} opacity={0.55} />
      ))}
    </g>
  );
};

// Soil sensor: a stake in the ground with an antenna and signal arcs.
export const Sensor = ({ x, ground, frame, size = 1, on = 1 }: { x: number; ground: number; frame: number; size?: number; on?: number }) => (
  <g>
    <rect x={x - 8 * size} y={ground - 70 * size} width={16 * size} height={110 * size} fill={CREME} stroke={TERRA} strokeWidth={4} />
    <rect x={x - 22 * size} y={ground - 100 * size} width={44 * size} height={34 * size} rx={6 * size} fill={CREME} stroke={TERRA} strokeWidth={4} />
    <circle cx={x} cy={ground - 83 * size} r={6 * size} fill={LUZ} opacity={on * (0.5 + 0.5 * Math.sin(frame / 5))} />
    <line x1={x + 12 * size} y1={ground - 100 * size} x2={x + 12 * size} y2={ground - 140 * size} stroke={CREME} strokeWidth={4} />
    {on > 0 &&
      [0, 1, 2].map((k) => {
        const r = (((frame / 30 + k / 3) % 1) * 50 + 10) * size;
        return <path key={k} d={`M ${x + 12 * size - r * 0.7} ${ground - 140 * size - r * 0.7} A ${r} ${r} 0 0 1 ${x + 12 * size + r * 0.7} ${ground - 140 * size - r * 0.7}`} stroke={LUZ} strokeWidth={4} fill="none" opacity={on * (1 - r / (60 * size))} />;
      })}
  </g>
);

// Radio/telecom tower with blinking light.
export const Antena = ({ x, ground, frame, h = 420 }: { x: number; ground: number; frame: number; h?: number }) => (
  <g stroke={CREME} strokeWidth={5} fill="none">
    <path d={`M ${x - 60} ${ground} L ${x} ${ground - h} L ${x + 60} ${ground}`} />
    {[0.25, 0.5, 0.75].map((k) => (
      <line key={k} x1={x - 60 * (1 - k)} y1={ground - h * k} x2={x + 60 * (1 - k)} y2={ground - h * k} />
    ))}
    <circle cx={x} cy={ground - h - 10} r={10} fill={LUZ} stroke="none" opacity={frame % 30 < 15 ? 1 : 0.25} />
  </g>
);

// Laptop seen from the side-front, with a glowing screen.
export const Notebook = ({ x, y, size = 1, glow = 0.8 }: { x: number; y: number; size?: number; glow?: number }) => (
  <g>
    <path d={`M ${x - 120 * size} ${y} L ${x + 120 * size} ${y} L ${x + 140 * size} ${y + 18 * size} L ${x - 140 * size} ${y + 18 * size} Z`} fill={CREME} stroke={TERRA} strokeWidth={5} />
    <rect x={x - 110 * size} y={y - 150 * size} width={220 * size} height={145 * size} rx={8 * size} fill={NOITE} stroke={CREME} strokeWidth={6} />
    <rect x={x - 96 * size} y={y - 136 * size} width={192 * size} height={117 * size} fill={LUZ} opacity={0.15 + 0.25 * glow} />
  </g>
);

// Solar panel on a stand.
export const PainelSolar = ({ x, ground, size = 1 }: { x: number; ground: number; size?: number }) => (
  <g stroke={TERRA} strokeWidth={5}>
    <line x1={x} y1={ground} x2={x} y2={ground - 90 * size} stroke={CREME} strokeWidth={8} />
    <g transform={`translate(${x} ${ground - 110 * size}) rotate(-18)`}>
      <rect x={-110 * size} y={-50 * size} width={220 * size} height={100 * size} fill="#2c3a4a" stroke={CREME} strokeWidth={5} />
      {[-1, 0, 1].map((k) => <line key={k} x1={k * 55 * size} y1={-50 * size} x2={k * 55 * size} y2={50 * size} stroke={LUZ} strokeWidth={2} opacity={0.6} />)}
      <line x1={-110 * size} y1={0} x2={110 * size} y2={0} stroke={LUZ} strokeWidth={2} opacity={0.6} />
    </g>
  </g>
);

// Cloud of data: a rounded cloud outline with dots flowing up into it.
export const Nuvem = ({ x, y, frame, size = 1 }: { x: number; y: number; frame: number; size?: number }) => (
  <g>
    <path d={`M ${x - 110 * size} ${y + 40 * size} a ${50 * size} ${50 * size} 0 0 1 ${10 * size} ${-95 * size} a ${70 * size} ${70 * size} 0 0 1 ${130 * size} ${-20 * size} a ${55 * size} ${55 * size} 0 0 1 ${85 * size} ${70 * size} a ${40 * size} ${40 * size} 0 0 1 ${-15 * size} ${45 * size} Z`} fill="none" stroke={LUZ} strokeWidth={6} filter="url(#glow)" />
    {Array.from({ length: 8 }, (_, i) => {
      const life = (frame / 40 + i / 8) % 1;
      return <rect key={i} x={x - 60 * size + i * 16 * size} y={y + 160 * size - life * 140 * size} width={7 * size} height={7 * size} fill={LUZ} opacity={1 - life} />;
    })}
  </g>
);
