import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeInOut, easeOut, hash01, lerp } from "./anim";
import { CREME, H, NOITE, TERRA, W } from "./brand";

// Finishing effects. All deterministic (pure functions of the frame).
// Ideas ported from the survey of other projects (references/tecnicas.md):
// line boil and ink/paper textures from video-shotcraft (Apache-2.0), seeded
// particles from openmontage (re-implemented, not copied: AGPL).

// Paper/clay grain over the whole frame. The noise seed changes every
// `every` frames so the texture "lives" without flickering.
export const Grain = ({ frame, opacity = 0.09, every = 3 }: { frame: number; opacity?: number; every?: number }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
    <svg width={W} height={H}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / every)} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// Soft dark edges, for focus and a printed look.
export const Vignette = ({ strength = 0.55 }: { strength?: number }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(20,10,4,${strength}) 100%)` }} />
);

// Hand-drawn wobble for SVG strokes ("line boil"): a displacement filter whose
// seed changes every 3 frames. Put <BoilDef frame={f}/> in the Stage defs and
// wrap the drawing in <g filter="url(#boil)">. Turn it off (`on={false}`) during
// holds you want perfectly still.
export const BoilDef = ({ frame, on = true, scale = 5 }: { frame: number; on?: boolean; scale?: number }) => (
  <filter id="boil">
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed={on ? Math.floor(frame / 3) : 0} />
    <feDisplacementMap in="SourceGraphic" scale={on ? scale : 0} />
  </filter>
);

// The OCA portal: the "o" of the logo as an iris between eras. From `at` the
// frame closes into a creme ring around (cx, cy); at `at + half` the ring is
// the logo's "o" (creme ring, dark centre) and the scene underneath switches;
// then the ring opens on the new era. Render `before` and `after` as full
// scenes; the portal decides which one shows and masks it.
export const Portal = ({ frame, at, half = 18, cx = W / 2, cy = 820, before, after }: { frame: number; at: number; half?: number; cx?: number; cy?: number; before: ReactNode; after: ReactNode }) => {
  const mid = at + half;
  const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40;
  const closing = frame < mid;
  const t = closing ? easeInOut(clamp01((frame - at) / half)) : easeInOut(clamp01((frame - mid) / half));
  const r = closing ? maxR * (1 - t) + 70 * t : 70 + (maxR - 70) * t;
  const active = frame >= at && frame < mid + half;
  const ring = closing ? lerp(24, 60, t) : lerp(60, 24, t);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: NOITE }} />
      <AbsoluteFill style={{ clipPath: active ? `circle(${r}px at ${cx}px ${cy}px)` : undefined }}>{closing ? before : after}</AbsoluteFill>
      {active && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <circle cx={cx} cy={cy} r={r + ring / 2 - 2} fill="none" stroke={CREME} strokeWidth={ring} />
          {Math.abs(frame - mid) < 4 && <circle cx={cx} cy={cy} r={r - 2} fill={TERRA} />}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// Seeded particles in world units. Kinds:
//   "brasa"   embers rising from a fire (warm, "antes")
//   "poeira"  red-earth dust drifting (warm, "antes")
//   "vagalume" fireflies blinking (night, "antes")
//   "dados"   small squares drifting up (LUZ, "hoje")
export const Particles = ({ frame, kind, box, count = 30, color, seed = 1 }: { frame: number; kind: "brasa" | "poeira" | "vagalume" | "dados"; box: [number, number, number, number]; count?: number; color: string; seed?: number }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const r = (k: number) => hash01(i * 7 + k, seed);
      const [x0, y0, x1, y1] = box;
      const speed = kind === "poeira" ? 0.4 : kind === "vagalume" ? 0.25 : 1;
      const life = ((frame * speed) / 90 + r(0)) % 1;
      const x = x0 + r(1) * (x1 - x0) + Math.sin(frame / 20 + i) * (kind === "poeira" ? 30 : 12);
      const rise = kind === "poeira" ? (life - 0.5) * 80 : life * (y1 - y0);
      const y = kind === "vagalume" ? y0 + r(2) * (y1 - y0) + Math.sin(frame / 15 + i * 2) * 20 : y1 - rise;
      const fade = kind === "vagalume" ? Math.max(0, Math.sin(frame / (8 + r(3) * 8) + i)) : Math.sin(Math.PI * life);
      const size = kind === "dados" ? 6 : kind === "brasa" ? 3 + r(4) * 4 : 2 + r(4) * 3;
      return kind === "dados" ? (
        <rect key={i} x={x} y={y} width={size} height={size} fill={color} opacity={fade * 0.8} />
      ) : (
        <circle key={i} cx={x} cy={y} r={size} fill={color} opacity={fade * (kind === "poeira" ? 0.35 : 0.85)} />
      );
    })}
  </g>
);

// Reveal text letter by letter (typewriter); returns the visible substring.
export const typed = (text: string, frame: number, start: number, perChar = 1.5) => text.slice(0, Math.max(0, Math.floor((frame - start) / perChar)));

// Draw-on progress for a stroke with pathLength={1} and strokeDasharray="1".
export const drawOffset = (frame: number, start: number, length = 40) => 1 - easeOut(clamp01((frame - start) / length));
