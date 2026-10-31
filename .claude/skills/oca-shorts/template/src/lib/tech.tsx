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

// QR code (deterministic pattern with the three finder squares). Traceability.
export const QRCode = ({ x, y, size = 160, seed = 3 }: { x: number; y: number; size?: number; seed?: number }) => {
  const n = 13, c = size / n;
  const finder = (i: number, j: number) => (i < 4 && j < 4) || (i > n - 5 && j < 4) || (i < 4 && j > n - 5);
  return (
    <g>
      <rect x={x - size / 2 - c} y={y - size / 2 - c} width={size + 2 * c} height={size + 2 * c} fill={CREME} />
      {Array.from({ length: n * n }, (_, k) => {
        const i = k % n, j = Math.floor(k / n);
        if (finder(i, j)) return null;
        return hash01(k, seed) > 0.5 ? <rect key={k} x={x - size / 2 + i * c} y={y - size / 2 + j * c} width={c} height={c} fill={NOITE} /> : null;
      })}
      {[[0, 0], [n - 3, 0], [0, n - 3]].map(([i, j]) => (
        <g key={`${i}${j}`}>
          <rect x={x - size / 2 + i * c} y={y - size / 2 + j * c} width={3 * c} height={3 * c} fill="none" stroke={NOITE} strokeWidth={c * 0.8} />
          <rect x={x - size / 2 + (i + 1) * c} y={y - size / 2 + (j + 1) * c} width={c} height={c} fill={NOITE} />
        </g>
      ))}
    </g>
  );
};

// Map pin that drops in (`t` 0..1) with a ring on the ground.
export const MapPin = ({ x, y, t = 1, size = 1 }: { x: number; y: number; t?: number; size?: number }) => {
  const k = clamp01(t), s = size;
  const py = y - (1 - easeOut(k)) * 200;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <ellipse cx={x} cy={y + 4} rx={30 * s * k} ry={8 * s * k} fill="none" stroke={LUZ} strokeWidth={4} />
      <path d={`M ${x} ${py} C ${x - 10 * s} ${py - 30 * s}, ${x - 36 * s} ${py - 44 * s}, ${x - 36 * s} ${py - 70 * s} A ${36 * s} ${36 * s} 0 1 1 ${x + 36 * s} ${py - 70 * s} C ${x + 36 * s} ${py - 44 * s}, ${x + 10 * s} ${py - 30 * s}, ${x} ${py} Z`} fill={LUZ} stroke={NOITE} strokeWidth={4} />
      <circle cx={x} cy={py - 70 * s} r={13 * s} fill={NOITE} />
    </g>
  );
};

// Chat bubble: an AI answer typing in. `t` 0..1 reveals the lines; `de`
// "ia" (luz, left tail) or "pessoa" (creme, right tail).
export const ChatBalao = ({ x, y, t = 1, w = 380, lines = 3, de = "ia" }: { x: number; y: number; t?: number; w?: number; lines?: number; de?: "ia" | "pessoa" }) => {
  const k = clamp01(t);
  if (k <= 0) return null;
  const h = 40 + lines * 34;
  const fill = de === "ia" ? LUZ : CREME;
  const tail = de === "ia" ? `M ${x - w / 2 + 30} ${y + h / 2} l -20 30 l 50 -30 Z` : `M ${x + w / 2 - 30} ${y + h / 2} l 20 30 l -50 -30 Z`;
  return (
    <g opacity={easeOut(clamp01(k * 4))} transform={`translate(0 ${(1 - easeOut(clamp01(k * 4))) * 20})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={26} fill={fill} opacity={de === "ia" ? 0.2 : 0.95} stroke={fill} strokeWidth={4} />
      <path d={tail} fill={fill} opacity={de === "ia" ? 0.5 : 0.95} />
      {Array.from({ length: lines }, (_, i) => {
        const lt = clamp01(k * (lines + 1) - i - 0.5);
        const lw = (w - 60) * (i === lines - 1 ? 0.55 : 0.9) * lt;
        return <rect key={i} x={x - w / 2 + 30} y={y - h / 2 + 26 + i * 34} width={lw} height={14} rx={7} fill={de === "ia" ? LUZ : NOITE} opacity={0.85} />;
      })}
    </g>
  );
};

// Line chart drawing itself (`t` 0..1), the last point lit. Rising by default.
export const Grafico = ({ x, y, w = 380, h = 220, t = 1, pontos = [0.2, 0.3, 0.28, 0.45, 0.6, 0.85] }: { x: number; y: number; w?: number; h?: number; t?: number; pontos?: number[] }) => {
  const l = x - w / 2, b = y + h / 2;
  const pts = pontos.map((v, i) => [l + (i / (pontos.length - 1)) * w, b - v * h] as [number, number]);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"} ${px} ${py}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <g>
      <line x1={l} y1={b} x2={l + w} y2={b} stroke={CREME} strokeWidth={4} opacity={0.5} />
      <line x1={l} y1={b} x2={l} y2={b - h} stroke={CREME} strokeWidth={4} opacity={0.5} />
      <path d={d} fill="none" stroke={LUZ} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - easeOut(clamp01(t))} />
      {t >= 0.98 && <circle cx={last[0]} cy={last[1]} r={12} fill={LUZ} filter="url(#glow)" />}
    </g>
  );
};

// Tractor (side view) with turning wheels; `x` moves it, `frame` turns wheels.
export const Trator = ({ x, ground, frame, size = 1, facing = 1 }: { x: number; ground: number; frame: number; size?: number; facing?: 1 | -1 }) => {
  const s = size, rot = (frame * 6 * facing) % 360;
  const wheel = (cx: number, r: number) => (
    <g transform={`rotate(${rot} ${cx} ${ground - r})`}>
      <circle cx={cx} cy={ground - r} r={r} fill={NOITE} stroke={CREME} strokeWidth={5} />
      <line x1={cx - r * 0.7} y1={ground - r} x2={cx + r * 0.7} y2={ground - r} stroke={CREME} strokeWidth={4} />
      <line x1={cx} y1={ground - r * 1.7} x2={cx} y2={ground - r * 0.3} stroke={CREME} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1) translate(${-x} 0)`}>
      <rect x={x - 90 * s} y={ground - 150 * s} width={120 * s} height={70 * s} fill={CREME} stroke={TERRA} strokeWidth={5} />
      <rect x={x - 60 * s} y={ground - 230 * s} width={70 * s} height={80 * s} fill="none" stroke={CREME} strokeWidth={6} />
      <rect x={x + 30 * s} y={ground - 120 * s} width={70 * s} height={50 * s} fill={CREME} stroke={TERRA} strokeWidth={5} />
      <circle cx={x - 25 * s} cy={ground - 236 * s} r={10 * s} fill={LUZ} />
      {wheel(x - 60 * s, 62 * s)}
      {wheel(x + 70 * s, 36 * s)}
    </g>
  );
};

// Weather station: mast, spinning anemometer cups, a small solar plate.
export const EstacaoClima = ({ x, ground, frame, h = 300 }: { x: number; ground: number; frame: number; h?: number }) => {
  const a = frame / 4;
  return (
    <g>
      <line x1={x} y1={ground} x2={x} y2={ground - h} stroke={CREME} strokeWidth={8} />
      <rect x={x - 26} y={ground - h * 0.55} width={52} height={40} fill={CREME} stroke={TERRA} strokeWidth={4} />
      <circle cx={x} cy={ground - h * 0.55 + 20} r={6} fill={LUZ} />
      {[0, 1, 2].map((k) => {
        const ang = a + (k * Math.PI * 2) / 3;
        const cx = x + Math.cos(ang) * 46, cy = ground - h - 6;
        return (
          <g key={k}>
            <line x1={x} y1={ground - h} x2={cx} y2={cy} stroke={CREME} strokeWidth={4} />
            <circle cx={cx} cy={cy} r={10 * (0.6 + 0.4 * Math.abs(Math.sin(ang)))} fill={CREME} />
          </g>
        );
      })}
    </g>
  );
};

// Light bulb "idea": lights up with `t` 0..1 and short rays.
export const Lampada = ({ x, y, t = 1, size = 1 }: { x: number; y: number; t?: number; size?: number }) => {
  const k = clamp01(t), s = size;
  return (
    <g>
      {k > 0.5 &&
        Array.from({ length: 8 }, (_, i) => {
          const ang = (i / 8) * Math.PI * 2;
          return <line key={i} x1={x + Math.cos(ang) * 70 * s} y1={y + Math.sin(ang) * 70 * s} x2={x + Math.cos(ang) * (70 + 30 * easeOut((k - 0.5) * 2)) * s} y2={y + Math.sin(ang) * (70 + 30 * easeOut((k - 0.5) * 2)) * s} stroke={LUZ} strokeWidth={6} strokeLinecap="round" />;
        })}
      <circle cx={x} cy={y} r={52 * s} fill={k > 0.5 ? LUZ : NOITE} stroke={CREME} strokeWidth={6} opacity={0.4 + 0.6 * k} filter={k > 0.5 ? "url(#glow)" : undefined} />
      <rect x={x - 22 * s} y={y + 48 * s} width={44 * s} height={34 * s} rx={6} fill={CREME} />
    </g>
  );
};

// Network: nodes (people, companies) joined by lines that draw in with `t`.
// Pass the points; by default every node links to the next two.
export const Rede = ({ nos, t = 1, frame = 0 }: { nos: [number, number][]; t?: number; frame?: number }) => {
  const links: [number, number][] = [];
  nos.forEach((_, i) => {
    links.push([i, (i + 1) % nos.length]);
    if (nos.length > 3) links.push([i, (i + 2) % nos.length]);
  });
  return (
    <g filter="url(#glow)">
      {links.map(([a, b], k) => {
        const lt = clamp01(t * links.length * 0.6 - k * 0.6);
        const [x1, y1] = nos[a], [x2, y2] = nos[b];
        return lt > 0 ? <line key={k} x1={x1} y1={y1} x2={lerp(x1, x2, easeOut(lt))} y2={lerp(y1, y2, easeOut(lt))} stroke={LUZ} strokeWidth={4} opacity={0.75} /> : null;
      })}
      {nos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={12 + 2 * Math.sin(frame / 20 + i)} fill={LUZ} opacity={clamp01(t * 3 - i * 0.2)} />
      ))}
    </g>
  );
};
