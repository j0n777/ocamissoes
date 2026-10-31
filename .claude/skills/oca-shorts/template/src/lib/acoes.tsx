import { easeInOut, lerp, progress } from "./anim";
import { CARRY, Figure, FRENTE, FRENTE_HOLD, FRENTE_OPEN, FRENTE_UP, FRENTE_WAVE, HOLD, KNEEL, LOOK_UP, mixPose, type Pose, SIT, STAND, walk } from "./figure";
import { Sfx, type SfxName } from "./sound";

// Actions: describe what a character does and when, not the angle of each arm.
// A character is a base position plus a list of beats; `ator()` turns that into
// a pose for any frame and the list of sounds that go with it (steps, seeds,
// clicks), already on the right frames. Prefer this over hand-made poses: it
// is what keeps scenes consistent and free of broken limbs.
//
//   const g = ator({ x: 240, y: GROUND }, [
//     { de: 20, ate: 60, faz: "andar", x: 420 },
//     { de: 60, ate: 150, faz: "olhar-ceu" },
//     { de: 152, ate: 260, faz: "plantar" },
//   ]);
//   <Ator a={g} f={f} look="raiz" />      // in the world
//   <Sons a={g} />                         // with the other sounds
//
// Between beats the character holds the last pose. Each beat blends in over
// up to 12 frames. Beats with view "frente" switch view instantly: put them on
// a camera cut.

export type Faz =
  | "parado" // standing, breathing
  | "andar" // walk to `x` (turns to face it)
  | "olhar-ceu" // looks up and points at the sky
  | "apontar" // points forward, arm level
  | "ajoelhar" // kneels
  | "plantar" // kneels and pushes seeds into the ground, one per 24 frames
  | "colher" // reaches up to a tree and brings the hand down, one per 30 frames
  | "segurar" // holds an object at the chest (tablet, livro), looking at it
  | "digitar" // holds a tablet and taps it
  | "acenar" // waves
  | "carregar" // carries something in both arms
  | "sentar" // sits on the ground
  | "beber-mate" // sits and brings the cuia to the mouth now and then
  | "entregar" // extends the arm to hand something over
  | "virar" // turns to `facing` (instant)
  | "comemorar" // from the front, arms up, small hops
  | "acolher" // from the front, arms open
  | "mostrar" // from the front, holds an object at the chest
  | "acenar-frente"; // from the front, waves

export type Beat = { de: number; ate: number; faz: Faz; x?: number; facing?: 1 | -1 };
export type Base = { x: number; y: number; facing?: 1 | -1; view?: "perfil" | "frente" | "costas" };
export type Estado = { pose: Pose; view: "perfil" | "frente" | "costas" };
export type SomEvento = { name: SfxName; at: number; volume: number; length?: number };

const FRONT: Faz[] = ["comemorar", "acolher", "mostrar", "acenar-frente"];

// Target pose of an action at local frame t (0 at the beat start), from the
// pose the character had when the beat began.
const alvo = (b: Beat, t: number, p: Pose): Pose => {
  const at = (q: Partial<Pose>, base: Pose = STAND): Pose => ({ ...base, ...q, x: p.x, y: p.y, facing: p.facing });
  const dur = b.ate - b.de;
  switch (b.faz) {
    case "parado":
      return { ...at({}), lean: 0.02 * Math.sin(t / 30) };
    case "andar": {
      const to = b.x ?? p.x;
      const k = easeInOut(progress(t, 0, dur));
      const facing: 1 | -1 = to >= p.x ? 1 : -1;
      const stride = Math.min(1, 4 * k * (1 - k) + (k < 0.9 ? 0.6 : 0));
      return walk({ ...STAND, x: lerp(p.x, to, k), y: p.y, facing }, t / 20, k >= 1 ? 0 : stride);
    }
    case "olhar-ceu":
      return at(LOOK_UP);
    case "apontar":
      return at({ head: -0.1, armR: { a: 1.5, b: 0.05 } });
    case "ajoelhar":
      return at(KNEEL);
    case "plantar": {
      const pump = Math.max(0, Math.sin((Math.PI * (t % 24)) / 24));
      return at({ ...KNEEL, armR: { a: 0.75 + 0.35 * pump, b: 0.3 - 0.2 * pump } });
    }
    case "colher": {
      const reach = Math.max(0, Math.sin((Math.PI * (t % 30)) / 30));
      return at({ head: -0.3 * reach, armR: { a: lerp(0.4, 2.4, reach), b: 0.3 } });
    }
    case "segurar":
      return at(HOLD);
    case "digitar":
      return at({ ...HOLD, armR: { a: HOLD.armR!.a, b: HOLD.armR!.b + 0.12 * Math.max(0, Math.sin(t / 2.5)) } });
    case "acenar":
      return at({ armR: { a: 2.75 + 0.25 * Math.sin(t / 5), b: 0.35 } });
    case "carregar":
      return at(CARRY);
    case "sentar":
      return at(SIT);
    case "beber-mate": {
      const sip = Math.max(0, Math.sin((Math.PI * ((t % 90) - 30)) / 40)) * (t % 90 > 30 && t % 90 < 70 ? 1 : 0);
      return at({ ...SIT, head: -0.1 * sip, armR: { a: lerp(0.9, 1.25, sip), b: lerp(0.6, 2.2, sip) } });
    }
    case "entregar":
      return at({ lean: 0.08, armR: { a: 1.45, b: 0.05 } });
    case "virar":
      return { ...p, facing: b.facing ?? (-p.facing as 1 | -1) };
    case "comemorar":
      return { ...FRENTE, ...FRENTE_UP, x: p.x, y: p.y - Math.abs(Math.sin(t / 6)) * 10 };
    case "acolher":
      return { ...FRENTE, ...FRENTE_OPEN, x: p.x, y: p.y };
    case "mostrar":
      return { ...FRENTE, ...FRENTE_HOLD, x: p.x, y: p.y };
    case "acenar-frente":
      return { ...FRENTE, ...FRENTE_WAVE, armR: { a: 2.5 + 0.25 * Math.sin(t / 5), b: -0.4 }, x: p.x, y: p.y };
  }
};

// The sounds an action makes, at absolute frames.
const sonsDe = (b: Beat): SomEvento[] => {
  const ev: SomEvento[] = [];
  const every = (step: number, name: SfxName, volume: number, offset = 0) => {
    for (let at = b.de + offset; at < b.ate; at += step) ev.push({ name, at: Math.round(at), volume });
  };
  switch (b.faz) {
    case "andar":
      every(10, "passo-terra", 0.4, 4);
      break;
    case "ajoelhar":
      ev.push({ name: "palha", at: b.de + 4, volume: 0.45 });
      break;
    case "plantar":
      ev.push({ name: "palha", at: b.de + 4, volume: 0.4 });
      every(24, "semente", 0.5, 12);
      break;
    case "colher":
      every(30, "palha", 0.4, 14);
      break;
    case "digitar":
      every(8, "click", 0.2, 6);
      break;
    case "sentar":
      ev.push({ name: "impact-soft", at: b.de + 10, volume: 0.4 });
      break;
    case "entregar":
      ev.push({ name: "whoosh-short", at: b.de + 4, volume: 0.35 });
      break;
    case "comemorar":
      ev.push({ name: "pop", at: b.de, volume: 0.4 });
      break;
  }
  return ev;
};

export type Ator = { estado: (f: number) => Estado; sons: SomEvento[]; beats: Beat[] };

export const ator = (base: Base, beats: Beat[]): Ator => {
  const sorted = [...beats].sort((a, b) => a.de - b.de);
  const start: Pose = { ...(base.view && base.view !== "perfil" ? FRENTE : STAND), x: base.x, y: base.y, facing: base.facing ?? 1 };
  const startView = base.view ?? "perfil";
  const estado = (f: number): Estado => {
    let pose = start;
    let view = startView;
    for (const b of sorted) {
      if (f < b.de) break;
      const front = FRONT.includes(b.faz);
      const nextView = front ? "frente" : b.faz === "virar" || view !== "frente" ? view : "perfil";
      const t = Math.min(f, b.ate) - b.de;
      const target = alvo(b, t, pose);
      const blend = b.faz === "andar" || nextView !== view ? 1 : easeInOut(progress(t, 0, Math.min(12, b.ate - b.de)));
      const now = blend >= 1 ? target : mixPose(pose, target, blend);
      view = nextView;
      if (f < b.ate) return { pose: now, view };
      // Finished: keep the end pose (a walk ends standing at its target).
      pose = b.faz === "andar" ? { ...STAND, x: b.x ?? pose.x, y: pose.y, facing: target.facing } : alvo(b, b.ate - b.de, pose);
    }
    return { pose, view };
  };
  return { estado, sons: sorted.flatMap(sonsDe), beats: sorted };
};

// Draws a character driven by an Ator. Extra props pass through to Figure.
export const AtorFig = ({ a, f, ...rest }: { a: Ator; f: number } & Omit<Parameters<typeof Figure>[0], "pose" | "view">) => {
  const { pose, view } = a.estado(f);
  return <Figure pose={pose} view={view} {...rest} />;
};

// The sounds of one or more characters.
export const Sons = ({ a }: { a: Ator | Ator[] }) => (
  <>
    {(Array.isArray(a) ? a : [a]).flatMap((x) => x.sons).map((s, i) => (
      <Sfx key={`${s.name}-${s.at}-${i}`} name={s.name} at={s.at} volume={s.volume} length={s.length ?? 60} />
    ))}
  </>
);
