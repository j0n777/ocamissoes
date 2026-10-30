#!/usr/bin/env node
// OCA Missões sound library, synthesized from scratch: oscillators, noise,
// filters and a small reverb. No samples, no AI audio, no third-party
// recordings, so every file is original and free to publish anywhere. Output
// is deterministic (seeded random), so a re-run gives the same files.
// The DSP core (osc, noise, filter, reverb, master) comes from the NF7 shorts
// engine; the instruments, beds and SFX below are the OCA theme: earth, bamboo,
// seeds, flute and forest for the ancestral side, clean digital for the new.
//
//   node scripts/audio.mjs [outDir] [names...]   -> outDir/music/*.wav, outDir/sfx/*.wav
//
// The catalogue (mood, BPM, use) lives in the skill's references/audio.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 48000;
const OUT = process.argv[2] ?? "public/audio";
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- core

const len = (sec) => Math.max(1, Math.round(sec * SR));
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const fnOf = (v) => (typeof v === "function" ? v : () => v);

const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

class Mix {
  constructor(sec) {
    this.L = new Float32Array(len(sec));
    this.R = new Float32Array(len(sec));
  }
  // Equal-power pan: -1 left, 0 centre, 1 right. `pan` may be a function of time.
  add(x, at = 0, gain = 1, pan = 0) {
    const o = Math.round(at * SR);
    const p = fnOf(pan);
    for (let i = 0; i < x.length; i++) {
      const j = o + i;
      if (j < 0) continue;
      if (j >= this.L.length) break;
      const a = ((p(i / SR) + 1) * Math.PI) / 4;
      this.L[j] += x[i] * gain * Math.cos(a);
      this.R[j] += x[i] * gain * Math.sin(a);
    }
    return this;
  }
}

function osc(sec, freq, type = "sine", phase = 0) {
  const out = new Float32Array(len(sec));
  const f = fnOf(freq);
  let ph = phase;
  for (let i = 0; i < out.length; i++) {
    ph += f(i / SR) / SR;
    ph -= Math.floor(ph);
    out[i] =
      type === "sine" ? Math.sin(TAU * ph)
      : type === "saw" ? 2 * ph - 1
      : type === "square" ? (ph < 0.5 ? 1 : -1)
      : 1 - 4 * Math.abs(ph - 0.5);
  }
  return out;
}

function noise(sec, color = "white", seed = 1) {
  const r = seeded(seed);
  const out = new Float32Array(len(sec));
  let b0 = 0, b1 = 0, b2 = 0, br = 0;
  for (let i = 0; i < out.length; i++) {
    const w = r() * 2 - 1;
    if (color === "white") out[i] = w;
    else if (color === "pink") {
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      out[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    } else {
      br = (br + w * 0.02) / 1.02;
      out[i] = br * 3.5;
    }
  }
  return out;
}

// RBJ biquad. `freq` may be a function of time for sweeps.
function filter(x, type, freq, q = 0.707) {
  const y = new Float32Array(x.length);
  const f = fnOf(freq);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  for (let i = 0; i < x.length; i++) {
    if (i % 32 === 0) {
      const fc = Math.min(Math.max(f(i / SR), 15), SR * 0.45);
      const w = (TAU * fc) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
      if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
      else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
      else [b0, b1, b2] = [al, 0, -al];
      b0 /= a0; b1 /= a0; b2 /= a0; a1 = (-2 * c) / a0; a2 = (1 - al) / a0;
    }
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

// Multiply by an envelope function of time.
const shape = (x, env) => {
  for (let i = 0; i < x.length; i++) x[i] *= env(i / SR);
  return x;
};
const sum = (...xs) => {
  const out = new Float32Array(Math.max(...xs.map((x) => x.length)));
  for (const x of xs) for (let i = 0; i < x.length; i++) out[i] += x[i];
  return out;
};
const scale = (x, g) => shape(x, () => g);

// Attack, exponential decay, short release at the end so nothing clicks.
const perc = (sec, attack, decay) => (t) =>
  Math.min(1, t / Math.max(attack, 1e-4)) * Math.exp(-Math.max(0, t - attack) / decay) * Math.min(1, (sec - t) / 0.01);
const swell = (sec, attack, release) => (t) => Math.min(1, t / attack, (sec - t) / release);

// Freeverb-style stereo reverb, in place.
function reverb(mix, { wet = 0.25, size = 0.84, damp = 0.35 } = {}) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116];
  const aps = [556, 441, 341, 225];
  const run = (x, spread) => {
    const out = new Float32Array(x.length);
    const cs = combs.map((l) => ({ b: new Float32Array(Math.round(((l + spread) * SR) / 44100)), i: 0, f: 0 }));
    const as = aps.map((l) => ({ b: new Float32Array(Math.round(((l + spread) * SR) / 44100)), i: 0 }));
    for (let k = 0; k < x.length; k++) {
      const inp = x[k] * 0.015;
      let s = 0;
      for (const c of cs) {
        const o = c.b[c.i];
        c.f = o * (1 - damp) + c.f * damp;
        c.b[c.i] = inp + c.f * size;
        c.i = (c.i + 1) % c.b.length;
        s += o;
      }
      for (const a of as) {
        const o = a.b[a.i];
        a.b[a.i] = s + o * 0.5;
        a.i = (a.i + 1) % a.b.length;
        s = o - s;
      }
      out[k] = s;
    }
    return out;
  };
  const wl = run(mix.L, 0), wr = run(mix.R, 23);
  for (let k = 0; k < mix.L.length; k++) {
    mix.L[k] = mix.L[k] * (1 - wet * 0.5) + wl[k] * wet * 3;
    mix.R[k] = mix.R[k] * (1 - wet * 0.5) + wr[k] * wet * 3;
  }
  return mix;
}

// Folds everything after `loopSec` back onto the start, so reverb tails wrap
// and the file loops without a seam.
function fold(mix, loopSec) {
  const n = len(loopSec);
  for (let i = n; i < mix.L.length; i++) {
    mix.L[i - n] += mix.L[i];
    mix.R[i - n] += mix.R[i];
  }
  mix.L = mix.L.slice(0, n);
  mix.R = mix.R.slice(0, n);
  return mix;
}

function master(mix, peakDb = -1, drive = 1.2) {
  let peak = 1e-9;
  for (const ch of [mix.L, mix.R]) for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]));
  const target = 10 ** (peakDb / 20);
  for (const ch of [mix.L, mix.R])
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.tanh((ch[i] / peak) * drive) / Math.tanh(drive)) * target;
  return mix;
}

function writeWav(path, mix) {
  const n = mix.L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix.L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix.R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

// ---------------------------------------------------------------- instruments

const piano = (m, dur = 2.5, vel = 0.8) => {
  const f = mtof(m);
  const out = new Float32Array(len(dur));
  const partials = [[1, 1, 1], [2, 0.45, 1.7], [3, 0.22, 2.4], [4, 0.1, 3.2], [5, 0.05, 4], [6, 0.025, 5]];
  for (const [r, a, dm] of partials) {
    const fr = f * r * (1 + 0.0004 * r * r);
    if (fr > SR * 0.45) continue;
    const tau = (1.6 / dm) * (220 / Math.max(f, 110)) ** 0.35;
    for (let i = 0; i < out.length; i++) out[i] += a * Math.sin((TAU * fr * i) / SR) * Math.exp(-i / SR / tau);
  }
  return shape(out, (t) => Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.2) * vel * 0.3);
};

const epiano = (m, dur = 2, vel = 0.7) => {
  const f = mtof(m);
  const out = new Float32Array(len(dur));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const idx = 2 * Math.exp(-t / 0.25) + 0.25;
    const tine = 0.1 * Math.exp(-t / 0.04) * Math.sin(TAU * f * 14 * t);
    out[i] = (Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) + tine) * Math.exp(-t / 1.2);
  }
  return shape(out, (t) => Math.min(1, t / 0.003) * Math.min(1, (dur - t) / 0.12) * vel * 0.28);
};

const bell = (m, dur = 3, vel = 0.6, ratio = 3.5) => {
  const f = mtof(m);
  const out = new Float32Array(len(dur));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = Math.sin(TAU * f * t + 3 * Math.exp(-t / 0.4) * Math.sin(TAU * f * ratio * t)) * Math.exp(-t / (dur / 3));
  }
  return shape(out, (t) => Math.min(1, t / 0.002) * Math.min(1, (dur - t) / 0.1) * vel * 0.25);
};

const pad = (notes, dur, cutoff = 900, vel = 0.5) => {
  const raw = new Float32Array(len(dur));
  notes.forEach((m, k) => {
    for (const d of [-0.08, 0, 0.08]) {
      const s = osc(dur, mtof(m + d), "saw", (k * 0.31 + d) % 1 + 1);
      for (let i = 0; i < s.length; i++) raw[i] += s[i];
    }
  });
  const f = filter(raw, "lp", (t) => cutoff * (1 + 0.25 * Math.sin(TAU * 0.11 * t)), 0.7);
  const a = Math.min(1.5, dur / 3), r = Math.min(2, dur / 3);
  return shape(f, (t) => swell(dur, a, r)(t) * (vel * 0.18) / Math.sqrt(notes.length * 3));
};

const bass = (m, dur, vel = 0.7) => {
  const f = mtof(m);
  const body = sum(osc(dur, f), scale(filter(osc(dur, f, "saw"), "lp", f * 4), 0.35));
  return shape(body, (t) => Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.05) * (0.6 + 0.4 * Math.exp(-t / 0.3)) * vel * 0.5);
};

const pluck = (m, dur = 0.4, bright = 2500, vel = 0.6) => {
  const s = osc(dur, mtof(m), "saw");
  const f = filter(s, "lp", (t) => 200 + bright * Math.exp(-t / 0.08), 1.2);
  return shape(f, (t) => perc(dur, 0.003, 0.18)(t) * vel * 0.35);
};

const kick = (vel = 1, seed = 3) => {
  const d = 0.5;
  const body = osc(d, (t) => 46 + 110 * Math.exp(-t / 0.035));
  const click = shape(filter(noise(0.01, "white", seed), "hp", 2000), (t) => 1 - t / 0.01);
  return shape(sum(shape(body, perc(d, 0.001, 0.16)), scale(click, 0.3)), () => vel * 0.9);
};

const snare = (vel = 1, seed = 5) => {
  const d = 0.3;
  const n = shape(filter(noise(d, "white", seed), "bp", 1800, 0.6), perc(d, 0.001, 0.09));
  const tone = shape(osc(d, 190), perc(d, 0.001, 0.05));
  return shape(sum(scale(n, 1.4), scale(tone, 0.6)), () => vel * 0.6);
};

const hat = (vel = 1, open = false, seed = 7) => {
  const d = open ? 0.3 : 0.08;
  return shape(filter(noise(d, "white", seed), "hp", 7500), (t) => perc(d, 0.001, open ? 0.12 : 0.025)(t) * vel * 0.35);
};

const tick = (freq = 2400, vel = 1, seed = 9) => {
  const d = 0.06;
  const n = shape(filter(noise(d, "white", seed), "bp", freq * 1.4, 2), perc(d, 0.0005, 0.008));
  const t = shape(osc(d, freq), perc(d, 0.0005, 0.012));
  return shape(sum(n, scale(t, 0.5)), () => vel * 0.8);
};

// ---------------------------------------------------------------- OCA instruments

// Adds `x` into `out` at `at` seconds (mono helper for building one-shots).
const place = (out, x, at, g = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < x.length && o + i < out.length; i++) if (o + i >= 0) out[o + i] += x[i] * g;
  return out;
};

// Breathy wooden flute: soft attack, delayed vibrato, breath noise on top.
const flute = (m, dur = 1.2, vel = 0.6, seed = 601) => {
  const f = mtof(m);
  const vib = (t) => 1 + 0.006 * Math.min(1, Math.max(0, (t - 0.18) / 0.25)) * Math.sin(TAU * 5.2 * t);
  const tone = sum(osc(dur, (t) => f * vib(t)), scale(osc(dur, (t) => 2 * f * vib(t)), 0.18), scale(osc(dur, (t) => 3 * f * vib(t)), 0.05));
  const breath = scale(filter(noise(dur, "white", seed), "bp", f * 2, 1.5), 0.35);
  const env = (t) => Math.min(1, t / 0.07) * Math.min(1, (dur - t) / 0.12) * (0.85 + 0.15 * Math.exp(-t / 0.1));
  return shape(sum(tone, breath), (t) => env(t) * vel * 0.3);
};

// Seed rattle: dense grains of high noise inside a shake envelope.
const rattle = (dur = 0.18, vel = 0.7, seed = 611) => {
  const r = seeded(seed), out = new Float32Array(len(dur));
  const grains = Math.round(dur * 260);
  for (let k = 0; k < grains; k++) {
    const at = Math.pow(r(), 1.4) * dur * 0.9, g = shape(filter(noise(0.006, "white", seed + k), "bp", 4500 + r() * 3500, 2), perc(0.006, 0.0004, 0.0015));
    place(out, g, at, 0.5 + r() * 0.5);
  }
  return shape(out, (t) => Math.min(1, t / 0.008) * Math.exp(-t / (dur * 0.5)) * vel * 1.6);
};

// Bamboo stamping tube struck on the ground: hollow low thump with a tube resonance.
const bamboo = (vel = 0.8, pitch = 1, seed = 621) => {
  const d = 0.6;
  const body = shape(osc(d, (t) => 105 * pitch * (1 + 0.35 * Math.exp(-t / 0.012))), perc(d, 0.001, 0.14));
  const tube = shape(filter(noise(d, "white", seed), "bp", 420 * pitch, 9), perc(d, 0.001, 0.09));
  const knock = shape(osc(d, 290 * pitch), perc(d, 0.0005, 0.03));
  return shape(sum(body, scale(tube, 3), scale(knock, 0.4)), () => vel * 0.7);
};

// Frame drum: soft skin, low.
const drum = (vel = 0.8, pitch = 1, seed = 631) => {
  const d = 0.7;
  const skin = shape(osc(d, (t) => 72 * pitch + 50 * Math.exp(-t / 0.03)), perc(d, 0.001, 0.22));
  const slap = shape(filter(noise(d, "pink", seed), "lp", 900), perc(d, 0.001, 0.04));
  return shape(sum(skin, scale(slap, 0.6)), () => vel * 0.8);
};

// Short dry wood knock (two partials of a struck stick).
const wood = (freq = 900, vel = 0.7, seed = 641) => {
  const d = 0.2;
  const a = shape(osc(d, freq), perc(d, 0.0005, 0.025));
  const b = shape(osc(d, freq * 2.57), perc(d, 0.0005, 0.012));
  const n = shape(filter(noise(d, "white", seed), "bp", freq * 1.8, 3), perc(d, 0.0003, 0.006));
  return shape(sum(a, scale(b, 0.4), scale(n, 0.6)), () => vel * 0.8);
};

// Night insects: pulsed narrow tones (crickets) in a loop.
const crickets = (sec, seed = 651, voices = 5) => {
  const r = seeded(seed), out = new Float32Array(len(sec));
  for (let v = 0; v < voices; v++) {
    const f = 3800 + r() * 1800, rate = 14 + r() * 10, ph = r() * 6, gate = 0.8 + r() * 1.6, off = r() * 3;
    const c = shape(osc(sec, f), (t) => Math.max(0, Math.sin(TAU * rate * t + ph)) ** 4 * (Math.sin(TAU * (t + off) / (gate * 2)) > 0 ? 1 : 0.1));
    place(out, c, 0, 0.12);
  }
  return out;
};

// Forest birds (fewer, softer and lower than the NF7 "birds").
const forestBirds = (sec, seed = 661) => {
  const r = seeded(seed), out = new Float32Array(len(sec));
  let t = 0.3;
  while (t < sec - 0.8) {
    const base = 1800 + r() * 1800, notes = 2 + Math.floor(r() * 3), dir = r() < 0.5 ? 1 : -1;
    for (let k = 0; k < notes; k++) {
      const nd = 0.06 + r() * 0.1;
      const c = shape(osc(nd, (u) => base * (1 + dir * 0.25 * (u / nd)) + 250 * Math.sin(TAU * 28 * u)), (u) => Math.sin((Math.PI * u) / nd) ** 1.5);
      place(out, c, t + k * (nd + 0.04), 0.25);
    }
    t += 0.7 + r() * 1.6;
  }
  return out;
};

// ---------------------------------------------------------------- OCA music

const beatOf = (bpm) => 60 / bpm;

// Chords as MIDI note lists.
const CH = {
  Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62], Dm: [50, 53, 57], E: [52, 56, 59],
  Am9: [45, 52, 59, 60], Fmaj7: [41, 48, 52, 57], Dm9: [50, 53, 57, 64], Esus: [40, 47, 52, 57],
};

// Pentatonic note pools (MIDI).
const A_PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76];
const C_PENTA = [60, 62, 64, 67, 69, 72, 74, 76, 79];

// Flute line from a seeded walk over a pool; `density` 0..1 is how many beats sing.
const fluteLine = (m, pool, bpm, bars, startBar, seed, density = 0.5, gain = 0.7) => {
  const r = seeded(seed), b = beatOf(bpm);
  let idx = 3;
  for (let q = startBar * 4; q < bars * 4; q++) {
    if (r() > density) continue;
    idx = Math.max(0, Math.min(pool.length - 1, idx + Math.round((r() - 0.5) * 3)));
    const long = r() < 0.35;
    m.add(flute(pool[idx], long ? 2 * b : b * 0.9, 0.55 + r() * 0.2, 700 + q), q * b, gain, Math.sin(q) * 0.2);
  }
};

const MUSIC = {
  // Ancestral groove: bamboo stamps, seed rattles, a breathy flute over a low
  // drone. Earth, origin, "antes".
  raiz: () => {
    const bpm = 84, b = beatOf(bpm), bars = 8, loop = bars * 4 * b;
    const m = new Mix(loop + 4);
    m.add(pad([45, 52, 57], loop + 2, 500, 0.7), 0, 0.7);
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * 4 * b;
      m.add(bamboo(0.9, 1, 900 + bar), t0, 0.7, -0.15).add(bamboo(0.6, 1.33, 920 + bar), t0 + 1.5 * b, 0.55, 0.15);
      m.add(bamboo(0.85, 1, 940 + bar), t0 + 2 * b, 0.65, -0.15).add(bamboo(0.5, 1.5, 960 + bar), t0 + 3.5 * b, 0.5, 0.15);
      for (let e = 0; e < 8; e++) m.add(rattle(e % 2 ? 0.12 : 0.2, e % 2 ? 0.5 : 0.8, 1000 + bar * 8 + e), t0 + (e * b) / 2, 0.45, 0.3);
    }
    fluteLine(m, A_PENTA, bpm, bars, 2, 71, 0.45, 0.8);
    return { mix: fold(reverb(m, { wet: 0.3, size: 0.86 }), loop), bpm };
  },

  // Night sky: dark drone, crickets, a slow flute and star-like bells.
  // Contemplation, astronomy, "o céu ensinava".
  ceu: () => {
    const bpm = 60, b = beatOf(bpm), bars = 8, loop = bars * 4 * b;
    const m = new Mix(loop + 6);
    ["Am9", "Fmaj7", "Am9", "Esus"].forEach((c, k) => m.add(pad(CH[c], 8 * b + 2.5, 600, 0.9), k * 8 * b, 0.9));
    m.add(crickets(loop, 652), 0, 0.5);
    fluteLine(m, A_PENTA, bpm, bars, 1, 73, 0.3, 0.7);
    const r = seeded(74);
    for (let k = 0; k < 14; k++) m.add(bell([81, 84, 86, 88, 91][Math.floor(r() * 5)], 3, 0.22, 3.5), r() * (loop - 2), 0.45, r() * 1.4 - 0.7);
    for (let bar = 0; bar < bars; bar += 2) m.add(drum(0.6, 0.8, 760 + bar), bar * 4 * b, 0.35);
    return { mix: fold(reverb(m, { wet: 0.45, size: 0.9 }), loop), bpm };
  },

  // The crossing, plays once (about 24 s): bars 1 to 4 are pure ancestral
  // (bamboo, rattle, flute); on bar 5 (9.6 s = frame 288 at 30 fps) a synth
  // arpeggio and a kick enter and the filter opens. Built for the Ponte format:
  // put the era change on frame 288.
  travessia: () => {
    const bpm = 100, b = beatOf(bpm), bars = 10, total = bars * 4 * b;
    const m = new Mix(total + 4);
    const prog = ["Am", "Am", "F", "G", "Am", "F", "C", "G", "Am", "Am"];
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * 4 * b, chord = CH[prog[bar]], tech = bar >= 4;
      m.add(bamboo(0.85, 1, 1100 + bar), t0, 0.6).add(bamboo(0.6, 1.33, 1120 + bar), t0 + 2.5 * b, 0.5, 0.2);
      for (let e = 0; e < 8; e++) m.add(rattle(0.14, e % 2 ? 0.5 : 0.75, 1200 + bar * 8 + e), t0 + (e * b) / 2, tech ? 0.3 : 0.45, 0.3);
      m.add(pad(chord.map((x) => x - 12), 4 * b + 1, tech ? 1400 : 500, 0.6), t0, 0.6);
      if (tech) {
        const bright = 900 + 500 * (bar - 4);
        for (let s = 0; s < 16; s++) m.add(pluck(chord[s % 3] + 12 * (1 + (Math.floor(s / 3) % 2)), 0.28, bright, 0.5), t0 + (s * b) / 4, 0.55, s % 2 ? 0.35 : -0.35);
        m.add(kick(0.8), t0, 0.5).add(kick(0.7), t0 + 2 * b, 0.45);
        for (let e = 0; e < 8; e++) m.add(hat(e % 2 ? 0.6 : 0.3, false, 1300 + e), t0 + (e * b) / 2, 0.3, -0.25);
        m.add(bass(chord[0] - 24, 4 * b - 0.05, 0.6), t0, 0.45);
      }
    }
    fluteLine(m, A_PENTA, bpm, 4, 0, 75, 0.5, 0.8);
    m.add(sum(filter(noise(2.4, "white", 1400), "bp", (t) => 300 + 4000 * (t / 2.4) ** 2, 1.4)).map((v, i) => v * (i / len(2.4)) ** 2 * 0.25), 4 * 4 * b - 2.4, 1);
    const mix = reverb(m, { wet: 0.25 });
    shape(mix.L, swell(total + 4, 0.3, 3)); shape(mix.R, swell(total + 4, 0.3, 3));
    return { mix, bpm, once: true };
  },

  // Hybrid groove: bamboo and rattles under a warm synth arpeggio in C major
  // pentatonic. Optimistic, "raiz + futuro". The default bed for most videos.
  semente: () => {
    const bpm = 96, b = beatOf(bpm), bars = 8, loop = bars * 4 * b;
    const m = new Mix(loop + 3);
    const prog = ["C", "Am", "F", "G"];
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * 4 * b, chord = CH[prog[bar % 4]];
      m.add(bamboo(0.8, 1, 1500 + bar), t0, 0.55).add(bamboo(0.6, 1.5, 1520 + bar), t0 + 1.5 * b, 0.4, 0.2).add(bamboo(0.8, 1, 1540 + bar), t0 + 2 * b, 0.5);
      m.add(kick(0.6), t0, 0.3).add(kick(0.5), t0 + 2 * b, 0.25);
      for (let e = 0; e < 8; e++) m.add(rattle(0.13, e % 2 ? 0.45 : 0.7, 1600 + bar * 8 + e), t0 + (e * b) / 2, 0.35, 0.3);
      [0, 3, 6, 8, 11, 14].forEach((s, k) => m.add(pluck(chord[k % 3] + 24, 0.35, 1800, 0.45), t0 + (s * b) / 4, 0.6, k % 2 ? 0.3 : -0.3));
      m.add(bass(chord[0] - 12, 4 * b - 0.05, 0.55), t0, 0.4);
      if (bar % 2 === 0) m.add(pad(chord, 8 * b + 1, 1000, 0.5), t0, 0.55);
    }
    fluteLine(m, C_PENTA, bpm, bars, 4, 77, 0.3, 0.6);
    return { mix: fold(reverb(m, { wet: 0.2 }), loop), bpm };
  },

  // Clean tech with an earthy fingerprint: four on the floor, off-beat bass,
  // digital blips, rattles instead of hats. AI, data, "hoje".
  circuito: () => {
    const bpm = 112, b = beatOf(bpm), bars = 12, loop = bars * 4 * b;
    const m = new Mix(loop + 3);
    const r = seeded(1700);
    const notes = [69, 72, 74, 76, 79, 81];
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * 4 * b;
      for (let q = 0; q < 4; q++) {
        m.add(kick(0.75), t0 + q * b, 0.4);
        m.add(bass(33 + (bar % 4 === 3 ? 5 : 0), b / 2 - 0.03, 0.7), t0 + q * b + b / 2, 0.45);
      }
      for (let s = 0; s < 16; s++) m.add(rattle(0.07, s % 2 ? 0.7 : 0.35, 1800 + bar * 16 + s), t0 + (s * b) / 4, 0.3, 0.25);
      for (let s = 0; s < 16; s++)
        if (r() < 0.25) m.add(shape(filter(osc(0.09, mtof(notes[Math.floor(r() * 6)]), "square"), "lp", 3200), perc(0.09, 0.001, 0.03)), t0 + (s * b) / 4, 0.28, r() * 1.2 - 0.6);
      if (bar % 4 === 0) m.add(pad([57, 64, 69], 16 * b + 1, 1300, 0.5), t0, 0.5);
    }
    return { mix: fold(reverb(m, { wet: 0.14 }), loop), bpm };
  },

  // Resolution in a major key: bells, flute, pad, soft drum. The "depois",
  // the harvest, the payoff of a story.
  colheita: () => {
    const bpm = 90, b = beatOf(bpm), bars = 8, loop = bars * 4 * b;
    const m = new Mix(loop + 5);
    const prog = ["C", "G", "Am", "F"];
    const melody = [76, 79, 81, 79, 76, 74, 72, 74];
    prog.forEach((c, k) => {
      const t0 = k * 8 * b;
      m.add(pad(CH[c], 8 * b + 2, 1200, 0.7), t0, 0.75);
      m.add(bass(CH[c][0] - 24, 8 * b - 0.1, 0.5), t0, 0.55);
      melody.forEach((x, s) => m.add(bell(x, 2.5, 0.35, 2), t0 + s * b, 0.4, Math.sin(s) * 0.4));
      for (const q of [0, 3, 4, 7]) m.add(drum(0.6, 1, 1900 + k * 8 + q), t0 + q * b, 0.4);
    });
    fluteLine(m, C_PENTA, bpm, bars, 2, 79, 0.35, 0.6);
    return { mix: fold(reverb(m, { wet: 0.35 }), loop), bpm };
  },

  // Collective percussion: drums, bamboo, rattles and claps in interlocking
  // patterns. Many hands, community, ecosystem, "mutirão".
  mutirao: () => {
    const bpm = 104, b = beatOf(bpm), bars = 8, loop = bars * 4 * b;
    const m = new Mix(loop + 3);
    const s16 = b / 4;
    const clap = (seed) => {
      const out = new Float32Array(len(0.25));
      [0, 0.01, 0.021].forEach((o, k) => place(out, shape(filter(noise(0.2, "white", seed + k), "bp", 1300, 0.9), perc(0.2, 0.001, k === 2 ? 0.07 : 0.01)), o));
      return out;
    };
    for (let bar = 0; bar < bars; bar++) {
      const t0 = bar * 4 * b;
      for (const s of [0, 6, 8, 11]) m.add(drum(0.85, 1, 2000 + bar * 16 + s), t0 + s * s16, 0.55, -0.2);
      for (const s of [3, 7, 10, 14]) m.add(drum(0.6, 1.6, 2100 + bar * 16 + s), t0 + s * s16, 0.4, 0.25);
      for (const s of [2, 5, 9, 13]) m.add(bamboo(0.7, 1.33, 2200 + bar * 16 + s), t0 + s * s16, 0.45, 0.1);
      for (let s = 0; s < 16; s += 2) m.add(rattle(0.1, s % 4 ? 0.5 : 0.8, 2300 + bar * 16 + s), t0 + s * s16, 0.35, 0.35);
      if (bar >= 2) m.add(clap(2400 + bar), t0 + 4 * s16, 0.6).add(clap(2420 + bar), t0 + 12 * s16, 0.6);
    }
    m.add(pad([45, 52, 57, 60], loop + 2, 700, 0.5), 0, 0.4);
    fluteLine(m, A_PENTA, bpm, bars, 4, 81, 0.35, 0.55);
    return { mix: fold(reverb(m, { wet: 0.18 }), loop), bpm };
  },
};

// ---------------------------------------------------------------- OCA sfx

const whoosh = (d = 0.7, lo = 300, hi = 2600, seed = 101) =>
  shape(filter(noise(d, "white", seed), "bp", (t) => lo + (hi - lo) * Math.sin((Math.PI * t) / d), 1.1), (t) => Math.sin((Math.PI * t) / d) ** 2 * 0.9);

const SFX = {
  // Ambiences (loop)
  mata: () => {
    const d = 10;
    const wind = shape(filter(noise(d, "pink", 2501), "bp", (t) => 450 + 200 * Math.sin(TAU * 0.11 * t), 0.8), (t) => 0.5 + 0.3 * Math.sin(TAU * 0.2 * t));
    const hum = shape(filter(noise(d, "white", 2502), "bp", 6200, 6), (t) => 0.4 + 0.3 * Math.sin(TAU * 0.07 * t));
    return { x: shape(sum(scale(wind, 0.6), scale(hum, 0.15), forestBirds(d, 2503)), swell(d, 1, 1)), loop: true, wet: 0.2 };
  },
  noite: () => {
    const d = 8, r = seeded(2510), frogs = new Float32Array(len(d));
    for (let k = 0; k < 10; k++) {
      const f = 380 + r() * 260, n = 2 + Math.floor(r() * 3), at = r() * (d - 1);
      for (let j = 0; j < n; j++) place(frogs, shape(osc(0.06, f, "square"), perc(0.06, 0.003, 0.02)), at + j * 0.09, 0.08);
    }
    return { x: shape(sum(crickets(d, 2511, 6), scale(filter(frogs, "lp", 1500), 1), scale(filter(noise(d, "brown", 2512), "lp", 300), 0.3)), swell(d, 1, 1)), loop: true, wet: 0.3 };
  },
  rio: () => {
    const d = 8, r = seeded(2520), bub = new Float32Array(len(d));
    const bed = filter(filter(noise(d, "pink", 2521), "lp", 2200), "hp", 200);
    for (let k = 0; k < d * 40; k++) {
      const f = 400 + r() * 1200, bd = 0.03 + r() * 0.05;
      place(bub, shape(osc(bd, (t) => f * (1 + 1.8 * t / bd)), (t) => Math.sin((Math.PI * t) / bd)), r() * (d - bd), 0.12);
    }
    return { x: shape(sum(scale(bed, 0.8), bub), swell(d, 0.8, 0.8)), loop: true, wet: 0.2 };
  },
  fogueira: () => {
    const d = 8, r = seeded(2530), cr = new Float32Array(len(d));
    for (let k = 0; k < d * 30; k++) {
      const p = shape(filter(noise(0.02, "white", 2531 + k), "bp", 1500 + r() * 4000, 2), perc(0.02, 0.0003, 0.003 + r() * 0.004));
      place(cr, p, r() * (d - 0.03), 0.3 + r() * 0.7);
    }
    const roar = filter(noise(d, "brown", 2532), "lp", 500);
    return { x: shape(sum(cr, scale(roar, 0.7)), swell(d, 0.8, 0.8)), loop: true };
  },
  chuva: () => {
    const d = 8, r = seeded(2540);
    const bed = filter(filter(noise(d, "pink", 2541), "hp", 900), "lp", 7000);
    const drops = new Float32Array(len(d));
    for (let k = 0; k < d * 90; k++) {
      const at = Math.floor(r() * (drops.length - 400)), g = 0.3 + r() * 0.7, f = 2500 + r() * 2500;
      for (let i = 0; i < 300; i++) drops[at + i] += Math.sin((TAU * f * i) / SR) * Math.exp(-i / 50) * g * 0.3;
    }
    return { x: shape(sum(scale(bed, 0.6), drops), swell(d, 0.8, 0.8)), loop: true, wet: 0.2 };
  },
  vento: () => {
    const d = 8;
    const n = filter(noise(d, "pink", 2550), "bp", (t) => 500 + 350 * Math.sin(TAU * 0.13 * t) + 200 * Math.sin(TAU * 0.37 * t), 0.9);
    return { x: shape(n, (t) => (0.6 + 0.4 * Math.sin(TAU * 0.25 * t)) * swell(d, 1, 1)(t)), loop: true };
  },
  "tech-hum": () => {
    const d = 6;
    const hum = sum(osc(d, 60), scale(osc(d, 120), 0.5), scale(osc(d, 180), 0.2));
    const air = filter(noise(d, "pink", 2560), "bp", 1800, 0.7);
    return { x: shape(sum(scale(hum, 0.4), scale(air, 0.25)), swell(d, 0.8, 0.8)), loop: true, gain: 0.7 };
  },

  // Ancestral one-shots
  bambu: () => ({ x: bamboo(1, 1, 2601), wet: 0.2 }),
  chocalho: () => ({ x: rattle(0.35, 1, 2602), wet: 0.15, pan: 0.15 }),
  tambor: () => ({ x: drum(1, 1, 2603), wet: 0.25 }),
  flauta: () => {
    const out = new Float32Array(len(2.2));
    [[69, 0, 0.35], [72, 0.33, 0.35], [76, 0.66, 1.3]].forEach(([m, at, d], k) => place(out, flute(m, d, 0.7, 2604 + k), at));
    return { x: out, wet: 0.4 };
  },
  "pau-de-chuva": () => {
    const d = 2.4, r = seeded(2605), out = new Float32Array(len(d));
    for (let k = 0; k < 900; k++) {
      const at = Math.pow(r(), 0.9) * (d - 0.05), g = Math.sin((Math.PI * at) / d) * (0.4 + r() * 0.6);
      place(out, shape(filter(noise(0.01, "white", 2606 + k), "bp", 3000 + r() * 5000, 3), perc(0.01, 0.0003, 0.002)), at, g);
    }
    return { x: scale(out, 1.4), wet: 0.3, pan: (t) => -0.4 + 0.35 * t };
  },
  madeira: () => ({ x: wood(900, 1, 2607), wet: 0.15 }),
  pedra: () => ({ x: shape(sum(wood(2100, 0.9, 2608), scale(filter(noise(0.2, "white", 2609), "bp", 3500, 1.5), 0.2)), perc(0.2, 0.0005, 0.03)), wet: 0.2 }),
  palha: () => ({ x: shape(filter(noise(0.6, "white", 2610), "bp", (t) => 2500 + 1500 * Math.sin(TAU * 3 * t), 0.9), (t) => swell(0.6, 0.05, 0.2)(t) * (0.5 + 0.5 * Math.abs(Math.sin(TAU * 9 * t))) * 0.8) }),
  semente: () => {
    const out = new Float32Array(len(0.7)), r = seeded(2611);
    for (let k = 0; k < 6; k++) place(out, wood(1800 + r() * 1400, 0.6, 2612 + k), k * 0.06 + r() * 0.04 + (k > 2 ? 0.08 : 0), 1 - k * 0.12);
    return { x: out, wet: 0.1 };
  },
  brasa: () => {
    const d = 1, r = seeded(2620), out = new Float32Array(len(d));
    for (let k = 0; k < 14; k++) place(out, shape(filter(noise(0.02, "white", 2621 + k), "bp", 2000 + r() * 4000, 2), perc(0.02, 0.0003, 0.004)), Math.pow(r(), 1.5) * 0.8, 0.5 + r() * 0.5);
    place(out, shape(filter(noise(0.6, "brown", 2640), "lp", 600), perc(0.6, 0.02, 0.2)), 0, 0.8);
    return { x: out, wet: 0.1 };
  },
  "passo-terra": () => ({ x: shape(filter(sum(osc(0.3, 75), scale(noise(0.3, "pink", 2641), 0.6)), "lp", 1200), (t) => perc(0.3, 0.002, 0.05)(t) * 2) }),

  // Tech one-shots
  scan: () => ({ x: shape(sum(osc(1.1, (t) => 600 + 1600 * (t / 1.1)), scale(filter(noise(1.1, "white", 2701), "bp", (t) => 2000 + 3000 * (t / 1.1), 4), 0.4)), (t) => Math.min(1, t / 0.05) * Math.min(1, (1.1 - t) / 0.15) * (0.6 + 0.4 * Math.sin(TAU * 12 * t)) * 0.4), wet: 0.2 }),
  holo: () => {
    const out = new Float32Array(len(1.2)), r = seeded(2702);
    for (let k = 0; k < 7; k++) place(out, bell(84 + [0, 3, 7, 10, 12, 15, 19][k], 0.5, 0.4, 3), k * 0.045 + r() * 0.01);
    place(out, shape(filter(noise(0.6, "white", 2703), "bp", (t) => 3000 + 4000 * t, 2), perc(0.6, 0.15, 0.15)), 0, 0.3);
    return { x: out, wet: 0.3, pan: (t) => -0.3 + 0.6 * t };
  },
  dados: () => {
    const out = new Float32Array(len(1)), r = seeded(2704);
    for (let k = 0; k < 12; k++) place(out, shape(osc(0.05, mtof(84 + Math.floor(r() * 14)), "square"), perc(0.05, 0.001, 0.015)), k * 0.07 + r() * 0.02, 0.25);
    return { x: filter(out, "lp", 6000), wet: 0.1, pan: (t) => Math.sin(TAU * 2 * t) * 0.4 };
  },
  ia: () => {
    const d = 1.8, out = new Float32Array(len(d));
    const notes = [72, 76, 79, 83, 84, 88, 91];
    for (let k = 0; k < 14; k++) place(out, bell(notes[k % 7], 0.6, 0.3 + 0.03 * k, 2), k * 0.09, 0.5);
    const shimmer = shape(filter(noise(d, "white", 2705), "bp", (t) => 5000 + 2000 * Math.sin(TAU * 1.5 * t), 3), (t) => swell(d, 0.4, 0.5)(t) * 0.25);
    return { x: sum(out, shimmer), wet: 0.35, pan: (t) => 0.5 * Math.sin(TAU * 0.7 * t) };
  },
  drone: () => {
    const d = 2.5;
    const motor = sum(osc(d, (t) => 180 + 6 * Math.sin(TAU * 3 * t), "saw"), scale(osc(d, (t) => 363 + 9 * Math.sin(TAU * 3.3 * t), "saw"), 0.6));
    return { x: shape(filter(motor, "lp", 1600), (t) => swell(d, 0.3, 0.5)(t) * 0.25), pan: (t) => -0.6 + 0.5 * t };
  },
  satelite: () => {
    const out = new Float32Array(len(1.6));
    for (const [at, m] of [[0, 93], [0.35, 93], [0.7, 98]]) place(out, shape(osc(0.12, mtof(m)), perc(0.12, 0.002, 0.05)), at, 0.6);
    return { x: out, wet: 0.45 };
  },
  "power-up": () => ({ x: shape(sum(osc(0.9, (t) => 200 * 2 ** (3 * t / 0.9), "square"), scale(osc(0.9, (t) => 300 * 2 ** (3 * t / 0.9)), 0.6)), (t) => Math.min(1, t / 0.02) * Math.min(1, (0.9 - t) / 0.1) * 0.12), wet: 0.2 }),
  click: () => ({ x: tick(3200, 1, 2706) }),
  tick: () => ({ x: tick(2200, 1, 2707) }),
  notify: () => {
    const out = new Float32Array(len(0.7));
    place(out, shape(osc(0.5, mtof(81)), perc(0.5, 0.002, 0.08)), 0);
    place(out, shape(osc(0.5, mtof(88)), perc(0.5, 0.002, 0.12)), 0.09);
    return { x: out, wet: 0.15 };
  },
  success: () => {
    const m = new Float32Array(len(1.4));
    [72, 76, 79, 84].forEach((x, k) => place(m, bell(x, 1.2, 0.6, 2), k * 0.07));
    return { x: m, wet: 0.25 };
  },
  glitch: () => {
    const r = seeded(2708), d = 0.6, out = new Float32Array(len(d));
    for (let k = 0; k < 10; k++) {
      const sd = 0.02 + r() * 0.05, o = len(r() * (d - sd));
      const s = r() < 0.5 ? osc(sd, 200 + r() * 2000, "square") : noise(sd, "white", 2709 + k);
      for (let i = 0; i < s.length; i++) out[o + i] = (Math.round(s[i] * 4) / 4) * 0.5;
    }
    return { x: out };
  },
  typing: () => {
    const r = seeded(2720), d = 2.2, out = new Float32Array(len(d));
    let t = 0.05;
    while (t < d - 0.1) {
      place(out, sum(scale(tick(1800 + r() * 1500, 1, Math.floor(r() * 1e6)), 0.6), shape(osc(0.05, 160 + r() * 60), perc(0.05, 0.001, 0.01))), t, 0.6 + r() * 0.4);
      t += 0.06 + r() * 0.12 + (r() < 0.1 ? 0.25 : 0);
    }
    return { x: out };
  },

  // Transitions and accents
  portal: () => {
    const d = 2;
    const suck = shape(filter(noise(d, "white", 2801), "bp", (t) => 300 + 3500 * (t / 1.2) ** 2, 1.2), (t) => (t < 1.2 ? (t / 1.2) ** 3 : Math.exp(-(t - 1.2) / 0.08)));
    const shimmer = new Float32Array(len(d));
    for (let k = 0; k < 10; k++) place(shimmer, bell(79 + k * 2, 0.8, 0.3, 3), 0.4 + k * 0.08);
    const hit = shape(osc(d, (t) => (t < 1.2 ? 0 : 40 + 50 * Math.exp(-(t - 1.2) / 0.05))), (t) => (t < 1.2 ? 0 : Math.exp(-(t - 1.2) / 0.3)));
    return { x: sum(scale(suck, 0.8), scale(shimmer, 0.5), hit), wet: 0.35 };
  },
  whoosh: () => ({ x: whoosh(0.7), pan: (t) => -0.6 + 1.7 * t }),
  "whoosh-short": () => ({ x: whoosh(0.3, 600, 3500, 102), pan: (t) => -0.5 + 3.3 * t }),
  "whoosh-reverse": () => ({ x: shape(filter(noise(0.8, "white", 103), "bp", (t) => 300 + 3000 * (t / 0.8) ** 2, 1.2), (t) => (t / 0.8) ** 3 * Math.min(1, (0.8 - t) / 0.02)) }),
  riser: () => ({ x: shape(sum(filter(noise(2.5, "white", 104), "bp", (t) => 300 + 5000 * (t / 2.5) ** 2, 1.5), scale(osc(2.5, (t) => 100 + 700 * (t / 2.5) ** 2, "saw"), 0.08)), (t) => (t / 2.5) ** 2 * Math.min(1, (2.5 - t) / 0.03)), wet: 0.2 }),
  boom: () => ({ x: shape(osc(2.5, (t) => 32 + 30 * Math.exp(-t / 0.08)), perc(2.5, 0.005, 0.8)), wet: 0.4 }),
  "impact-soft": () => ({ x: shape(filter(sum(osc(0.5, (t) => 60 + 60 * Math.exp(-t / 0.02)), scale(noise(0.5, "pink", 302), 0.4)), "lp", 1200), perc(0.5, 0.001, 0.1)), wet: 0.15 }),
  "tape-stop": () => {
    const d = 0.7, f = (t) => 220 * Math.pow(1 - t / d, 2.2) + 15;
    const tone = sum(osc(d, f, "saw"), osc(d, (t) => f(t) * 1.5, "saw"), scale(osc(d, (t) => f(t) / 2), 2));
    return { x: shape(filter(tone, "lp", (t) => 3000 * (1 - t / d) + 150), (t) => Math.min(1, t / 0.005) * (1 - t / d) * 0.6) };
  },
  sparkle: () => {
    const r = seeded(405), out = new Float32Array(len(1.5));
    for (let k = 0; k < 9; k++) place(out, bell(91 + Math.floor(r() * 12), 0.6, 0.4, 3), k * 0.08 + r() * 0.03);
    return { x: out, wet: 0.3, pan: (t) => -0.6 + t };
  },
  pop: () => ({ x: shape(osc(0.12, (t) => 300 + 900 * Math.exp(-t / 0.015)), perc(0.12, 0.001, 0.03)) }),
  ding: () => ({ x: sum(bell(88, 2.5, 0.8, 2), scale(bell(100, 1.5, 0.5, 2), 0.3)), wet: 0.25 }),
  page: () => ({ x: shape(filter(noise(0.4, "white", 411), "bp", (t) => 1500 + 3500 * Math.sin((Math.PI * t) / 0.4), 0.8), (t) => Math.sin((Math.PI * t) / 0.4) ** 3 * (0.7 + 0.3 * Math.sin(TAU * 40 * t))) }),
};

// ---------------------------------------------------------------- build

mkdirSync(join(OUT, "music"), { recursive: true });
mkdirSync(join(OUT, "sfx"), { recursive: true });
const only = process.argv.slice(3);

for (const [name, make] of Object.entries(MUSIC)) {
  if (only.length && !only.includes(name)) continue;
  const { mix, bpm, once } = make();
  mix.L = filter(mix.L, "hp", 35);
  mix.R = filter(mix.R, "hp", 35);
  writeWav(join(OUT, "music", `${name}.wav`), master(mix, -1, 1.3));
  console.log(`music/${name}.wav  ${(mix.L.length / SR).toFixed(1)}s  ${bpm} bpm${once ? "  (plays once)" : "  (loops)"}`);
}

for (const [name, make] of Object.entries(SFX)) {
  if (only.length && !only.includes(name)) continue;
  const { x, wet = 0, pan = 0, gain = 1, loop = false } = make();
  const tail = wet ? 1.2 : 0.02;
  let m = new Mix(x.length / SR + tail).add(x, 0, gain, pan);
  if (wet) reverb(m, { wet, size: 0.78 });
  if (loop) m = fold(m, x.length / SR);
  writeWav(join(OUT, "sfx", `${name}.wav`), master(m, -1 - (1 - gain) * 6, 1));
  console.log(`sfx/${name}.wav  ${(m.L.length / SR).toFixed(2)}s`);
}
