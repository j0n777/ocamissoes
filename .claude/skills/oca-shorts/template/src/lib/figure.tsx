import { clamp01, lerp } from "./anim";
import { ARGILA, CREME, LUZ, TERRA, URUCUM } from "./brand";

// Flat 2D characters: thick rounded strokes over a dark outline (from the NF7
// flat kit), faceless, readable at phone size. Two recurring characters carry
// every story:
//   look "raiz"  : the ancestral guardian. Long hair, an urucum sash, a woven
//                  bag (`prop="cesto"`). Knowledge of the land, the sky, the river.
//   look "inova" : the innovator. Short hair, a LUZ visor line, a tablet
//                  (`prop="tablet"`). Today's tools, data, AI.
//   look "povo"  : plain figures for a community or a crowd (use `depth`).
// Respect rule: the ancestral figure is never a caricature. No headdress, no
// face paint clichés, no "primitive" poses; the character is an expert.
//
// World units are pixels of the 1080x1920 frame at zoom 1. SVG y grows down.

export type Limb = { a: number; b: number }; // a from straight down, + towards facing; b bends the joint
export type Pose = {
  x: number;
  y: number; // ground under the feet
  facing: 1 | -1;
  lean: number; // torso tilt, + towards facing
  head: number; // head tilt (+ looks down, - looks up)
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
};

export const STAND: Pose = {
  x: 0,
  y: 0,
  facing: 1,
  lean: 0,
  head: 0,
  armL: { a: -0.3, b: 0.15 },
  armR: { a: 0.3, b: 0.15 },
  legL: { a: -0.18, b: 0.05 },
  legR: { a: 0.18, b: 0.05 },
};

// Common poses, as offsets of STAND. Combine with `{ ...STAND, ...LOOK_UP, x, y }`.
export const LOOK_UP: Partial<Pose> = { head: -0.55, lean: -0.08, armR: { a: 2.3, b: 0.5 } }; // pointing at the sky
export const KNEEL: Partial<Pose> = { lean: 0.35, head: 0.4, legR: { a: 1.4, b: 1.4 }, legL: { a: 0, b: 1.5 }, armR: { a: 0.75, b: 0.3 }, armL: { a: 0.2, b: 0.6 } }; // front knee up, back knee on the ground
export const HOLD: Partial<Pose> = { head: 0.3, armR: { a: 0.55, b: 1.05 }, armL: { a: 0.4, b: 1.2 } }; // forearms level, looking at something held at chest height
export const WAVE: Partial<Pose> = { armR: { a: 2.9, b: 0.4 } };

const mixL = (p: Limb, q: Limb, t: number): Limb => ({ a: lerp(p.a, q.a, t), b: lerp(p.b, q.b, t) });
export const mixPose = (p: Pose, q: Pose, t: number): Pose => ({
  ...(t < 0.5 ? p : q),
  x: lerp(p.x, q.x, t),
  y: lerp(p.y, q.y, t),
  lean: lerp(p.lean, q.lean, t),
  head: lerp(p.head, q.head, t),
  armL: mixL(p.armL, q.armL, t),
  armR: mixL(p.armR, q.armR, t),
  legL: mixL(p.legL, q.legL, t),
  legR: mixL(p.legR, q.legR, t),
});

// Walk cycle: phase in cycles (1 = one full stride), `stride` 0..1 amplitude.
export const walk = (base: Pose, phase: number, stride = 1): Pose => {
  const s = Math.sin(phase * 2 * Math.PI) * stride;
  return {
    ...base,
    y: base.y - Math.abs(Math.cos(phase * 2 * Math.PI)) * 4 * stride,
    legL: { a: 0.45 * s, b: 0.15 + 0.35 * Math.max(0, -s) },
    legR: { a: -0.45 * s, b: 0.15 + 0.35 * Math.max(0, s) },
    armL: { a: -0.4 * s, b: 0.3 },
    armR: base.armR.a > 0.5 ? base.armR : { a: 0.4 * s, b: 0.3 },
  };
};

// Grey-brown for depth in a crowd: 0 is the front, 1 the farthest figure.
export const tone = (depth: number) => {
  const t = clamp01(depth);
  const mix = (a: number, b: number) => Math.round(lerp(a, b, t));
  return `rgb(${mix(248, 145)},${mix(244, 98)},${mix(225, 60)})`;
};

type Props = {
  pose: Pose;
  look?: "raiz" | "inova" | "povo";
  size?: number;
  depth?: number;
  prop?: "none" | "cesto" | "tablet" | "semente";
  glow?: number; // 0..1 brightness of the tablet screen / visor
};

export const Figure = ({ pose, look = "povo", size = 280, depth = 0, prop = "none", glow = 0.6 }: Props) => {
  const s = size / 260;
  const T = 70 * s, UL = 54 * s, LL = 54 * s, UA = 46 * s, FA = 44 * s, HR = 30 * s, SW = 24 * s;
  const f = pose.facing;
  const dir = (ang: number): [number, number] => [Math.sin(ang) * f, Math.cos(ang)];
  const legV = (l: Limb) => UL * Math.cos(l.a) + LL * Math.cos(l.a - l.b);
  const hipY = pose.y - Math.max(legV(pose.legL), legV(pose.legR));
  const hip: [number, number] = [pose.x, hipY];
  const up: [number, number] = [Math.sin(pose.lean) * f, -Math.cos(pose.lean)];
  const sh: [number, number] = [hip[0] + up[0] * T, hip[1] + up[1] * T];
  const ha = pose.lean + pose.head;
  const hd: [number, number] = [sh[0] + Math.sin(ha) * f * (HR + 6 * s), sh[1] - Math.cos(ha) * (HR + 6 * s)];
  const limb = (o: [number, number], l: Limb, a: number, b: number, knee = false) => {
    const d1 = dir(l.a + (knee ? 0 : pose.lean));
    const m: [number, number] = [o[0] + d1[0] * a, o[1] + d1[1] * a];
    const d2 = dir(l.a + (knee ? 0 : pose.lean) + (knee ? -l.b : l.b));
    return [o, m, [m[0] + d2[0] * b, m[1] + d2[1] * b]] as [number, number][];
  };
  const armRp = limb(sh, pose.armR, UA, FA);
  const armLp = limb(sh, pose.armL, UA, FA);
  const parts = [limb(hip, pose.legL, UL, LL, true), armLp, [hip, sh], limb(hip, pose.legR, UL, LL, true), armRp];
  const col = look === "povo" ? tone(depth) : CREME;
  const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");
  const hand = armRp[2];
  const handL = armLp[2];
  const back = -f; // hair falls behind the facing direction

  // Hair shapes, drawn behind the head.
  const hair =
    look === "raiz" ? (
      <path
        d={`M ${hd[0] - HR * 1.05} ${hd[1]} A ${HR * 1.05} ${HR * 1.05} 0 0 1 ${hd[0] + HR * 1.05} ${hd[1]} L ${hd[0] + HR * 0.95 + back * 6 * s} ${hd[1] + HR * 2.3} L ${hd[0] - HR * 0.95 + back * 6 * s} ${hd[1] + HR * 2.3} Z`}
        fill={TERRA}
        stroke={TERRA}
        strokeWidth={7 * s}
        strokeLinejoin="round"
      />
    ) : look === "inova" ? (
      <path d={`M ${hd[0] - HR * 1.08} ${hd[1] + 4 * s} A ${HR * 1.08} ${HR * 1.08} 0 0 1 ${hd[0] + HR * 1.08} ${hd[1] + 4 * s} Z`} fill={TERRA} stroke={TERRA} strokeWidth={7 * s} />
    ) : null;

  return (
    <g>
      {parts.map((p, i) => (
        <polyline key={`o${i}`} points={pts(p)} fill="none" stroke={TERRA} strokeWidth={SW + 8 * s} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx={hd[0]} cy={hd[1]} r={HR + 4 * s} fill={TERRA} />
      {hair}
      {parts.map((p, i) => (
        <polyline key={`c${i}`} points={pts(p)} fill="none" stroke={col} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx={hd[0]} cy={hd[1]} r={HR} fill={col} />
      {look === "inova" && (
        // hair cap over the skull, then the visor line
        <g>
          <path d={`M ${hd[0] - HR} ${hd[1] - 2 * s} A ${HR} ${HR} 0 0 1 ${hd[0] + HR} ${hd[1] - 2 * s} Z`} fill={TERRA} />
          <line x1={hd[0] - HR * 0.2 * f} y1={hd[1] + 6 * s} x2={hd[0] + HR * 1.05 * f} y2={hd[1] + 6 * s} stroke={LUZ} strokeWidth={8 * s} strokeLinecap="round" opacity={0.55 + 0.45 * glow} />
        </g>
      )}
      {look === "raiz" && (
        // hair cap and the urucum sash across the torso
        <g>
          <path d={`M ${hd[0] - HR} ${hd[1] - 4 * s} A ${HR} ${HR} 0 0 1 ${hd[0] + HR} ${hd[1] - 4 * s} Z`} fill={TERRA} />
          <line x1={lerp(sh[0], hip[0], 0.1) - 14 * s * f} y1={lerp(sh[1], hip[1], 0.1)} x2={lerp(sh[0], hip[0], 0.85) + 14 * s * f} y2={lerp(sh[1], hip[1], 0.85)} stroke={URUCUM} strokeWidth={10 * s} strokeLinecap="round" />
        </g>
      )}
      {prop === "tablet" && (
        <g>
          <rect x={(hand[0] + handL[0]) / 2 - 34 * s} y={Math.min(hand[1], handL[1]) - 46 * s} width={68 * s} height={48 * s} rx={6 * s} fill={TERRA} stroke={CREME} strokeWidth={4 * s} />
          <rect x={(hand[0] + handL[0]) / 2 - 26 * s} y={Math.min(hand[1], handL[1]) - 38 * s} width={52 * s} height={32 * s} rx={3 * s} fill={LUZ} opacity={0.35 + 0.65 * glow} />
        </g>
      )}
      {prop === "cesto" && (
        <g>
          <path d={`M ${handL[0] - 26 * s} ${handL[1]} q ${26 * s} ${46 * s} ${52 * s} 0 Z`} fill={ARGILA} stroke={TERRA} strokeWidth={5 * s} strokeLinejoin="round" />
          {[0.3, 0.6].map((k) => (
            <line key={k} x1={handL[0] - 22 * s} y1={handL[1] + 14 * s * k * 2} x2={handL[0] + 22 * s} y2={handL[1] + 14 * s * k * 2} stroke={TERRA} strokeWidth={3 * s} opacity={0.7} />
          ))}
        </g>
      )}
      {prop === "semente" && <circle cx={hand[0]} cy={hand[1] + 4 * s} r={7 * s} fill={ARGILA} stroke={TERRA} strokeWidth={3 * s} />}
    </g>
  );
};
