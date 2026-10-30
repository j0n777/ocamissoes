import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, easeOut, lerp, progress } from "../lib/anim";
import { EndCard, EraTag, Label, LUZ, PALHA, URUCUM, Watermark } from "../lib/brand";
import { Figure, HOLD, KNEEL, LOOK_UP, mixPose, type Pose, STAND, walk } from "../lib/figure";
import { Grain, Particles, Portal, Vignette } from "../lib/fx";
import { Music, Sfx, TRAVESSIA_TURN } from "../lib/sound";
import { CircuitRoots, DataMotes, GlowDef, HoloPanel, Satellite } from "../lib/tech";
import { type Cam, Hills, Oca, Pleiades, Sprout, Stage, Stars } from "../lib/world";

// Format: Ponte (antes -> hoje), flat 2D. Sample scene of the skill.
// Truth: a pergunta de quando plantar é antiga; as ferramentas é que mudam.
// Reference (caption): segundo o astrônomo Germano Afonso, os Guarani usam as
// Plêiades (Eixu, "favo de abelhas") para marcar o tempo de preparar o solo,
// plantar e colher. Hoje: satélite, sensores de solo e IA. See acervo.md.
//
// Beats (30 fps, 600 frames = 20 s):
//   0-20     tag HÁ SÉCULOS, hook "quando plantar?" on an urucum bar
//   20-60    the guardian walks in by the oca
//   60-140   looks up; the Pleiades brighten, the line between them is drawn
//   150-260  "o céu marcava o tempo."; kneels, plants, sprouts grow
//   270-306  PORTAL: the frame closes into the logo "o" on the Pleiades and
//            opens on HOJE (frame 288 = the music's turn, TRAVESSIA_TURN)
//   300-460  the innovator: satellite ping, roots become circuits, the panel
//            picks the planting window (check)
//   470-560  the guardian joins; both under the same sky. "mesma pergunta.
//            novas ferramentas."
//   560-600  end card
// Music: travessia (ancestral for 4 bars, tech enters on 288).

export const FPS = 30;
export const DURATION = 600;

const GROUND = 1250;
const STARS_AT: [number, number] = [600, 660];
const SIZE = 340; // figure size
const ZOOM = 1.18;
const SEEDS = [560, 650, 740];
const TURN = TRAVESSIA_TURN;
const PORTAL_AT = TURN - 18;

// --- Antes ----------------------------------------------------------------------

const guardianAntes = (f: number): Pose => {
  const start: Pose = { ...STAND, x: 240, y: GROUND, facing: 1 };
  if (f < 20) return start;
  if (f < 60) {
    const t = progress(f, 20, 40);
    return walk({ ...start, x: lerp(240, 420, easeInOut(t)) }, (f - 20) / 20, 1 - t * t);
  }
  const stand: Pose = { ...STAND, x: 420, y: GROUND, facing: 1 };
  const up: Pose = { ...stand, ...LOOK_UP };
  if (f < 150) return mixPose(stand, up, easeInOut(progress(f, 60, 14)));
  const kneel: Pose = { ...stand, ...KNEEL, x: 480 };
  return mixPose(up, kneel, easeInOut(progress(f, 152, 14)));
};

const Antes = ({ f }: { f: number }) => {
  const cam: Cam = { x: 560, y: 1000, zoom: ZOOM * lerp(1, 1.06, easeInOut(progress(f, 0, 270))) };
  return (
    <Stage
      cam={cam}
      era="antes"
      overlay={
        <>
          <EraTag frame={f} text="HÁ SÉCULOS" accent={URUCUM} />
          <Label frame={f} at={6} out={140} y={380} size={78} bar={URUCUM}>
            quando plantar?
          </Label>
          <Label frame={f} at={150} y={380} size={70}>
            o céu marcava o tempo.
          </Label>
          <Label frame={f} at={112} y={700} size={26} mono color={PALHA}>
            Eixu · Plêiades
          </Label>
          <Watermark />
        </>
      }
    >
      <Stars frame={f} />
      <Pleiades x={STARS_AT[0]} y={STARS_AT[1]} frame={f} glow={easeOut(progress(f, 70, 30))} link={easeOut(progress(f, 90, 40))} />
      <Hills ground={GROUND} era="antes" />
      <g>
        <Oca x={900} ground={GROUND} w={320} h={210} />
        {SEEDS.map((x, i) => (
          <Sprout key={x} x={x} ground={GROUND} grow={progress(f, 190 + i * 14, 50)} size={1.5} />
        ))}
        <Figure pose={guardianAntes(f)} look="raiz" size={SIZE} prop={f < 150 ? "cesto" : "semente"} />
      </g>
      <Particles frame={f} kind="vagalume" box={[100, 1000, 1050, 1230]} count={14} color={PALHA} />
    </Stage>
  );
};

// --- Hoje -----------------------------------------------------------------------

const innovator = (f: number): Pose => {
  const stand: Pose = { ...STAND, x: 400, y: GROUND, facing: 1 };
  const hold: Pose = { ...stand, ...HOLD };
  const up: Pose = { ...stand, ...LOOK_UP, armR: HOLD.armR!, armL: HOLD.armL! };
  if (f < 500) return mixPose(stand, hold, easeInOut(progress(f, TURN + 10, 12)));
  return mixPose(hold, up, easeInOut(progress(f, 500, 14)));
};

const guardianHoje = (f: number): Pose => {
  const t = progress(f, 470, 30);
  const base: Pose = { ...STAND, x: lerp(60, 230, easeInOut(t)), y: GROUND, facing: 1 };
  if (t < 1) return walk(base, (f - 470) / 20, 1 - t * t);
  return mixPose({ ...base, x: 230 }, { ...base, x: 230, ...LOOK_UP }, easeInOut(progress(f, 500, 14)));
};

const Hoje = ({ f }: { f: number }) => {
  const cam: Cam = { x: 560, y: 1000, zoom: ZOOM * lerp(1, 1.05, easeInOut(progress(f, TURN, 270))) };
  const glow = 0.6 + 0.4 * Math.sin(f / 6);
  return (
    <Stage
      cam={cam}
      era="hoje"
      defs={<GlowDef />}
      overlay={
        <>
          <EraTag frame={f} at={TURN + 8} text="HOJE" accent={LUZ} />
          <Label frame={f} at={TURN + 30} out={466} y={380} size={70}>
            satélite, sensores e IA.
          </Label>
          <Label frame={f} at={478} y={380} size={70}>
            mesma pergunta.
            <br />
            <span style={{ color: LUZ }}>novas ferramentas.</span>
          </Label>
          <Watermark />
        </>
      }
    >
      <Stars frame={f} opacity={0.8} />
      <Pleiades x={STARS_AT[0]} y={STARS_AT[1]} frame={f} glow={0.6} link={f >= 500 ? 1 : 0.35} />
      <Satellite from={[90, 790]} to={[1040, 770]} t={progress(f, TURN + 12, 260)} ping={f > 330 && f < 460 ? (f - 330) / 60 : 0} target={[SEEDS[1], GROUND]} />
      <Hills ground={GROUND} era="hoje" />
      <CircuitRoots seeds={SEEDS} ground={GROUND} t={progress(f, 345, 70)} depth={210} />
      {SEEDS.map((x) => (
        <Sprout key={x} x={x} ground={GROUND} grow={1} size={1.5} />
      ))}
      <HoloPanel x={735} y={890} w={400} t={progress(f, 362, 90)} title="JANELA DE PLANTIO" />
      <DataMotes x={430} y={1080} frame={f} start={350} count={12} spread={120} />
      {f >= 470 && <Figure pose={guardianHoje(f)} look="raiz" size={SIZE} />}
      <Figure pose={innovator(f)} look="inova" size={SIZE} prop="tablet" glow={glow} />
      <Particles frame={f} kind="dados" box={[100, 800, 1050, 1240]} count={12} color={LUZ} seed={3} />
    </Stage>
  );
};

// --- Composition -------------------------------------------------------------------

export const PleiadesIA = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Portal frame={f} at={PORTAL_AT} cx={628} cy={566} before={<Antes f={f} />} after={<Hoje f={f} />} />
      <Vignette />
      <Grain frame={f} />
      <EndCard frame={f} start={560} />

      <Music name="travessia" volume={0.32} fadeOut={30} />
      <Sfx name="noite" length={290} volume={0.22} />
      <Sfx name="tech-hum" at={TURN} length={272} volume={0.1} />
      <Sfx name="noite" at={TURN} length={272} volume={0.1} />
      <Sfx name="madeira" at={6} volume={0.5} />
      {[24, 34, 44, 54].map((at) => (
        <Sfx key={at} name="passo-terra" at={at} volume={0.45} />
      ))}
      <Sfx name="sparkle" at={72} volume={0.35} />
      <Sfx name="madeira" at={150} volume={0.45} />
      <Sfx name="palha" at={154} volume={0.5} />
      <Sfx name="semente" at={168} volume={0.6} />
      <Sfx name="pau-de-chuva" at={190} length={110} volume={0.35} />
      <Sfx name="portal" at={TURN - 36} length={96} volume={0.7} />
      <Sfx name="holo" at={TURN + 8} volume={0.45} />
      <Sfx name="satelite" at={330} length={84} volume={0.5} />
      <Sfx name="scan" at={345} length={70} volume={0.3} />
      <Sfx name="ia" at={362} length={90} volume={0.45} />
      <Sfx name="dados" at={390} length={66} volume={0.3} />
      <Sfx name="success" at={438} length={78} volume={0.55} />
      <Sfx name="passo-terra" at={478} volume={0.4} />
      <Sfx name="passo-terra" at={490} volume={0.4} />
      <Sfx name="ding" at={480} length={80} volume={0.35} />
      <Sfx name="whoosh" at={552} volume={0.35} />
      <Sfx name="bambu" at={564} length={36} volume={0.6} />
    </AbsoluteFill>
  );
};

