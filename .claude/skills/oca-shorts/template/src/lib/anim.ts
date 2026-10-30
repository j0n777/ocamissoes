// Timeline helpers. Everything is a pure function of the frame number, so any
// frame renders identically on its own (Remotion renders frames out of order).

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// Damped overshoot, for things that land (blocks, figures after a jump).
export const settle = (t: number) => {
  const x = clamp01(t);
  return 1 - Math.exp(-6 * x) * Math.cos(10 * x);
};

// 0..1 progress of `frame` inside [start, start + length).
export const progress = (frame: number, start: number, length: number) => clamp01((frame - start) / length);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Parabolic hop: 0 at t=0 and t=1, `height` at t=0.5.
export const arc = (t: number, height: number) => 4 * height * clamp01(t) * (1 - clamp01(t));

// Deterministic pseudo-random 0..1 for an integer index (use instead of
// Math.random so frames stay reproducible).
export const hash01 = (i: number, seed = 1) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
