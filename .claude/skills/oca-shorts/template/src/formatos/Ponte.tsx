import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { type Ator, AtorFig, ator, Sons } from "../lib/acoes";
import { easeInOut, easeOut, lerp, progress } from "../lib/anim";
import { CREME, EndCard, EraTag, Label, LUZ, MATE, PALHA, TERRA, URUCUM, Watermark } from "../lib/brand";
import { Figure, SIT, STAND } from "../lib/figure";
import { Grain, Particles, Portal, Vignette } from "../lib/fx";
import { Music, Sfx, TRAVESSIA_TURN } from "../lib/sound";
import { ChatBalao, CircuitRoots, DataMotes, Drone, GlowDef, Grafico, HoloPanel, MapPin, Notebook, Nuvem, QRCode, Rede, Satellite, Sensor } from "../lib/tech";
import { type Cam, Erval, Fogueira, Hills, Livro, Moon, Oca, OcaModerna, Pleiades, Prensa, Ruina, SacoErva, Sprout, Stage, Stars, type Hora } from "../lib/world";

// The Ponte format as a fill-in template. A video is a PonteSpec (data, no
// drawing code): pick one "antes" scene and one "hoje" scene from the menus
// below, write the texts, and the template does timing, portal, music, sounds
// and end card. Specs live in src/videos/ and are checked when they load: a
// rule broken (too many words, a dash, no source) stops the render with a
// clear message. Fixed timing (30 fps, 600 frames = 20 s):
//   0-270    ANTES: tag, hook (pergunta) on urucum, the saber scene, its frase
//   270-306  portal on the scene's focus point (turn on 288 = music turn)
//   288-470  HOJE: tag, the tool scene, its frase
//   470-560  encontro: the guardian walks in; cut to a closer shot on 500,
//            both face the camera; the two-line ponte
//   560-600  end card

export type CenaAntes = "ceu" | "lua" | "erval" | "prensa" | "fogueira";
export type CenaHoje = "satelite" | "sensor" | "rastreio" | "ia-texto" | "rede";

export type PonteSpec = {
  id: string; // composition id, PascalCase, e.g. "ErvaRastreio"
  pergunta: string; // the hook, up to 5 words, ends with "?"
  antes: {
    tag?: string; // era tag, default "HÁ SÉCULOS"
    cena: CenaAntes;
    rotulo?: string; // small mono label naming the saber, up to 3 words (e.g. "EIXU · PLÊIADES")
    frase: string; // up to 6 words, ends with "."
  };
  hoje: {
    cena: CenaHoje;
    frase: string; // up to 6 words, ends with "."
    painel?: string; // panel title for satelite/sensor/rastreio, up to 3 words
  };
  ponte: [string, string]; // the final two lines, up to 4 words each; the second shows in luz
  referencia: string; // the source of the saber, as in acervo.md (the caption repeats it)
};

export const PONTE_FRAMES = 600;
const GROUND = 1250;
const TURN = TRAVESSIA_TURN;

// ---------------------------------------------------------------- checks

const words = (s: string) => s.trim().split(/\s+/).filter((w) => w !== "·").length;
export const checaPonte = (s: PonteSpec) => {
  const err: string[] = [];
  const all = [s.pergunta, s.antes.tag ?? "", s.antes.rotulo ?? "", s.antes.frase, s.hoje.frase, s.hoje.painel ?? "", ...s.ponte];
  if (!/^[A-Z][A-Za-z0-9]+$/.test(s.id)) err.push(`id "${s.id}" deve ser PascalCase sem espaços`);
  if (words(s.pergunta) > 5 || !s.pergunta.trim().endsWith("?")) err.push(`pergunta: até 5 palavras terminando com "?" (${s.pergunta})`);
  if (words(s.antes.frase) > 6) err.push(`antes.frase: até 6 palavras (${s.antes.frase})`);
  if (words(s.hoje.frase) > 6) err.push(`hoje.frase: até 6 palavras (${s.hoje.frase})`);
  if (s.antes.rotulo && words(s.antes.rotulo) > 3) err.push(`antes.rotulo: até 3 palavras`);
  if (s.hoje.painel && words(s.hoje.painel) > 3) err.push(`hoje.painel: até 3 palavras`);
  s.ponte.forEach((l, i) => words(l) > 4 && err.push(`ponte[${i}]: até 4 palavras (${l})`));
  if (all.some((t) => /[–—]/.test(t))) err.push("sem travessões (— ou –)");
  if (all.some((t) => /\bíndios?\b/i.test(t))) err.push('use "Guarani" ou "Mbyá-Guarani", nunca "índio"');
  if (s.referencia.trim().length < 8) err.push("referencia: a fonte do saber é obrigatória (acervo.md)");
  if (err.length) throw new Error(`Spec ${s.id} inválido:\n- ${err.join("\n- ")}`);
  return s;
};

// ---------------------------------------------------------------- scenes

// Every scene returns what goes in the world, its characters (for sounds),
// extra sounds, and the screen point where the portal closes.
type Cena = { mundo: ReactNode; atores: Ator[]; sons?: ReactNode; foco: [number, number]; hora?: Hora; defs?: ReactNode };

const CAM: Cam = { x: 560, y: 1000, zoom: 1.18 };
const toScreen = (x: number, y: number): [number, number] => [540 + (x - CAM.x) * CAM.zoom, 960 + (y - CAM.y) * CAM.zoom];

const ANTES: Record<CenaAntes, (f: number) => Cena> = {
  // Reading the sky (the Pleiades) to know when to plant.
  ceu: (f) => {
    const g = ator({ x: 240, y: GROUND }, [
      { de: 20, ate: 60, faz: "andar", x: 420 },
      { de: 60, ate: 150, faz: "olhar-ceu" },
      { de: 152, ate: 262, faz: "plantar" },
    ]);
    return {
      atores: [g],
      foco: toScreen(635, 665),
      mundo: (
        <>
          <Stars frame={f} />
          <Pleiades x={600} y={660} frame={f} glow={easeOut(progress(f, 70, 30))} link={easeOut(progress(f, 90, 40))} />
          <Hills ground={GROUND} era="antes" />
          <Oca x={900} ground={GROUND} w={320} h={210} />
          {[560, 650, 740].map((x, i) => (
            <Sprout key={x} x={x} ground={GROUND} grow={progress(f, 190 + i * 14, 50)} size={1.5} />
          ))}
          <AtorFig a={g} f={f} look="raiz" size={340} prop={f < 150 ? "cesto" : "semente"} />
          <Particles frame={f} kind="vagalume" box={[100, 1000, 1050, 1230]} count={14} color={PALHA} />
        </>
      ),
      sons: <Sfx name="sparkle" at={72} volume={0.35} />,
    };
  },
  // The moon's phases to time the work.
  lua: (f) => {
    const g = ator({ x: 260, y: GROUND }, [
      { de: 20, ate: 60, faz: "andar", x: 430 },
      { de: 60, ate: 160, faz: "olhar-ceu" },
      { de: 162, ate: 262, faz: "colher" },
    ]);
    const phase = easeInOut(progress(f, 70, 80));
    return {
      atores: [g],
      foco: toScreen(620, 640),
      // The phase is a mask (a dark disc would show against the gradient sky).
      defs: (
        <mask id="fase-lua">
          <rect x={0} y={0} width={2000} height={2000} fill="white" />
          <circle cx={620 + 130 * (1 - phase)} cy={640} r={64} fill="black" />
        </mask>
      ),
      mundo: (
        <>
          <Stars frame={f} />
          <g mask="url(#fase-lua)">
            <Moon x={620} y={640} r={60} />
          </g>
          <Hills ground={GROUND} era="antes" />
          <Erval x={720} ground={GROUND} size={0.95} frame={f} />
          <AtorFig a={g} f={f} look="raiz" size={340} prop="cesto" />
        </>
      ),
      sons: <Sfx name="sparkle" at={72} volume={0.3} />,
    };
  },
  // Picking erva-mate (ka'a) from the erval.
  erval: (f) => {
    const g = ator({ x: 220, y: GROUND }, [
      { de: 20, ate: 70, faz: "andar", x: 560 },
      { de: 72, ate: 200, faz: "colher" },
      { de: 202, ate: 262, faz: "carregar" },
    ]);
    return {
      atores: [g],
      foco: toScreen(690, 960),
      hora: "dia",
      mundo: (
        <>
          <Hills ground={GROUND} era="antes" />
          <Erval x={700} ground={GROUND} size={1.2} frame={f} />
          <Erval x={980} ground={GROUND} size={0.8} frame={f + 30} />
          <AtorFig a={g} f={f} look="raiz" size={340} prop="cesto" />
          <Particles frame={f} kind="poeira" box={[560, 900, 820, 1240]} count={10} color={MATE} seed={6} />
        </>
      ),
    };
  },
  // The mission press: pulling the lever, a page comes out, a book is held up.
  prensa: (f) => {
    const g = ator({ x: 220, y: GROUND }, [
      { de: 20, ate: 60, faz: "andar", x: 470 },
      { de: 62, ate: 180, faz: "apontar" },
      { de: 182, ate: 262, faz: "segurar" },
    ]);
    const press = f >= 62 && f < 180 ? Math.max(0, Math.sin((Math.PI * ((f - 62) % 40)) / 40)) : 0;
    return {
      atores: [g],
      foco: toScreen(700, 1000),
      mundo: (
        <>
          <Stars frame={f} opacity={0.5} />
          <Hills ground={GROUND} era="antes" />
          <Ruina x={930} ground={GROUND} w={300} />
          <Prensa x={690} ground={GROUND} size={0.9} press={press} />
          <AtorFig a={g} f={f} look="raiz" size={340} prop={f >= 182 ? "livro" : "none"} />
        </>
      ),
      sons: (
        <>
          {[82, 122, 162].map((at) => (
            <Sfx key={at} name="madeira" at={at} volume={0.6} />
          ))}
          <Sfx name="page" at={184} volume={0.6} />
        </>
      ),
    };
  },
  // Knowledge passed by voice around the fire.
  fogueira: (f) => {
    const g = ator({ x: 330, y: GROUND, facing: 1 }, [
      { de: 30, ate: 150, faz: "apontar" },
      { de: 150, ate: 262, faz: "acenar" },
    ]);
    return {
      atores: [g],
      foco: toScreen(560, 1180),
      hora: "noite",
      mundo: (
        <>
          <Stars frame={f} />
          <Hills ground={GROUND} era="hoje" />
          <Fogueira x={560} ground={GROUND} frame={f} size={1.1} />
          {[0, 1, 2].map((i) => (
            <Figure key={i} pose={{ ...STAND, ...SIT, x: 690 + i * 110, y: GROUND, facing: -1 }} look="povo" depth={0.2 + i * 0.25} size={300} />
          ))}
          <AtorFig a={g} f={f} look="raiz" size={340} />
          <Particles frame={f} kind="brasa" box={[500, 1000, 620, 1230]} count={14} color={URUCUM} />
        </>
      ),
      sons: <Sfx name="fogueira" length={270} volume={0.25} />,
    };
  },
};

// The innovator's beats in every "hoje" scene end standing at x 430 by frame
// 466, so the encontro can place the guardian beside them.
const HOJE: Record<CenaHoje, (f: number, painel: string) => Cena> = {
  satelite: (f, painel) => {
    const i = ator({ x: 400, y: GROUND }, [{ de: TURN + 10, ate: 466, faz: "digitar" }]);
    return {
      atores: [i],
      foco: [0, 0],
      defs: <GlowDef />,
      mundo: (
        <>
          <Stars frame={f} opacity={0.8} />
          <Satellite from={[90, 790]} to={[1040, 770]} t={progress(f, TURN + 12, 260)} ping={f > 330 && f < 460 ? (f - 330) / 60 : 0} target={[650, GROUND]} />
          <Hills ground={GROUND} era="hoje" />
          <CircuitRoots seeds={[560, 650, 740]} ground={GROUND} t={progress(f, 345, 70)} depth={210} />
          {[560, 650, 740].map((x) => (
            <Sprout key={x} x={x} ground={GROUND} grow={1} size={1.5} />
          ))}
          <HoloPanel x={735} y={890} w={400} t={progress(f, 362, 90)} title={painel} />
          <AtorFig a={i} f={f} look="inova" size={340} prop="tablet" glow={0.8} />
        </>
      ),
      sons: (
        <>
          <Sfx name="satelite" at={330} length={84} volume={0.5} />
          <Sfx name="ia" at={362} length={90} volume={0.45} />
          <Sfx name="success" at={438} length={78} volume={0.5} />
        </>
      ),
    };
  },
  sensor: (f, painel) => {
    const i = ator({ x: 400, y: GROUND }, [{ de: TURN + 10, ate: 466, faz: "segurar" }]);
    return {
      atores: [i],
      foco: [0, 0],
      defs: <GlowDef />,
      mundo: (
        <>
          <Stars frame={f} opacity={0.6} />
          <Drone x={lerp(150, 900, easeInOut(progress(f, TURN, 200)))} y={700} frame={f} scale={0.9} />
          <Hills ground={GROUND} era="hoje" />
          {[600, 760, 920].map((x, k) => (
            <Sensor key={x} x={x} ground={GROUND} frame={f} size={1.1} on={progress(f, 320 + k * 15, 20)} />
          ))}
          <Grafico x={735} y={860} w={360} h={200} t={progress(f, 370, 70)} />
          <AtorFig a={i} f={f} look="inova" size={340} prop="celular" glow={0.9} />
        </>
      ),
      sons: (
        <>
          <Sfx name="drone" at={TURN} length={90} volume={0.25} />
          <Sfx name="notify" at={335} volume={0.5} />
          <Sfx name="dados" at={370} length={66} volume={0.35} />
          <Sfx name="success" at={440} length={78} volume={0.5} />
        </>
      ),
    };
  },
  rastreio: (f) => {
    const i = ator({ x: 400, y: GROUND }, [{ de: TURN + 10, ate: 466, faz: "segurar" }]);
    const scan = progress(f, 330, 40);
    return {
      atores: [i],
      foco: [0, 0],
      defs: <GlowDef />,
      mundo: (
        <>
          <Stars frame={f} opacity={0.6} />
          <Hills ground={GROUND} era="hoje" />
          <SacoErva x={700} ground={GROUND} size={1.3} tag />
          {scan > 0 && scan < 1 && <line x1={470} y1={1090} x2={760} y2={1090 + (scan - 0.5) * 60} stroke={LUZ} strokeWidth={4} opacity={0.8} />}
          {f >= 372 && <line x1={735} y1={1100} x2={760} y2={840} stroke={LUZ} strokeWidth={3} strokeDasharray="8 8" opacity={0.7} />}
          <QRCode x={760} y={760} size={150 * easeOut(progress(f, 372, 14))} />
          <MapPin x={920} y={980} t={progress(f, 400, 20)} />
          <AtorFig a={i} f={f} look="inova" size={340} prop="celular" glow={0.9} />
        </>
      ),
      sons: (
        <>
          <Sfx name="scan" at={330} length={60} volume={0.4} />
          <Sfx name="pop" at={372} volume={0.5} />
          <Sfx name="impact-soft" at={418} volume={0.5} />
          <Sfx name="success" at={430} length={78} volume={0.5} />
        </>
      ),
    };
  },
  "ia-texto": (f) => {
    const i = ator({ x: 400, y: GROUND }, [{ de: TURN + 10, ate: 466, faz: "digitar" }]);
    return {
      atores: [i],
      foco: [0, 0],
      defs: <GlowDef />,
      mundo: (
        <>
          <Stars frame={f} opacity={0.6} />
          <Hills ground={GROUND} era="hoje" />
          <ChatBalao x={740} y={760} t={progress(f, 320, 30)} de="pessoa" lines={2} w={340} />
          <ChatBalao x={700} y={930} t={progress(f, 360, 50)} de="ia" lines={3} w={400} />
          <Nuvem x={760} y={560} frame={f} size={0.6} />
          <DataMotes x={760} y={700} frame={f} start={410} count={10} spread={140} />
          <AtorFig a={i} f={f} look="inova" size={340} prop="tablet" glow={0.9} />
        </>
      ),
      sons: (
        <>
          <Sfx name="typing" at={318} length={60} volume={0.35} />
          <Sfx name="ia" at={360} length={90} volume={0.45} />
          <Sfx name="success" at={436} length={78} volume={0.5} />
        </>
      ),
    };
  },
  rede: (f) => {
    const i = ator({ x: 400, y: GROUND }, [{ de: TURN + 10, ate: 466, faz: "apontar" }]);
    const nos: [number, number][] = [[560, 900], [700, 820], [860, 880], [900, 1020], [740, 1060], [600, 1030]];
    return {
      atores: [i],
      foco: [0, 0],
      defs: <GlowDef />,
      mundo: (
        <>
          <Stars frame={f} opacity={0.6} />
          <Hills ground={GROUND} era="hoje" />
          <OcaModerna x={760} ground={GROUND} w={420} h={250} lit={progress(f, 320, 30)} />
          <Rede nos={nos} t={progress(f, 340, 90)} frame={f} />
          <AtorFig a={i} f={f} look="inova" size={340} />
        </>
      ),
      sons: (
        <>
          <Sfx name="power-up" at={320} volume={0.35} />
          <Sfx name="dados" at={350} length={66} volume={0.35} />
          <Sfx name="success" at={430} length={78} volume={0.5} />
        </>
      ),
    };
  },
};

// ---------------------------------------------------------------- composition

export const PonteVideo = ({ spec }: { spec: PonteSpec }) => {
  const s = checaPonte(spec);
  const f = useCurrentFrame();
  const antes = ANTES[s.antes.cena](f);
  const hoje = HOJE[s.hoje.cena](f, s.hoje.painel ?? "");
  const [fx, fy] = antes.foco;
  // Day scenes have a light sky: text turns terra so it stays readable.
  const ink = antes.hora === "dia" ? TERRA : CREME;

  // Encontro: the guardian walks in; on 500 a cut to a closer shot and both
  // turn to the camera.
  const guardia = ator({ x: 60, y: GROUND }, [
    { de: 470, ate: 498, faz: "andar", x: 180 },
    { de: 500, ate: 560, faz: "acolher" },
  ]);
  const inovEnc = ator({ x: 400, y: GROUND }, [{ de: 500, ate: 560, faz: s.hoje.cena === "rede" ? "acolher" : "mostrar" }]);
  const encontro = f >= 500;
  const camHoje: Cam = encontro ? { x: 300, y: 1060, zoom: 1.5 } : { ...CAM, zoom: CAM.zoom * lerp(1, 1.05, easeInOut(progress(f, TURN, 200))) };
  const propHoje = s.hoje.cena === "satelite" || s.hoje.cena === "ia-texto" ? "tablet" : s.hoje.cena === "rede" ? "none" : "celular";

  const before = (
    <Stage
      cam={{ ...CAM, zoom: CAM.zoom * lerp(1, 1.06, easeInOut(progress(f, 0, 270))) }}
      era="antes"
      hora={antes.hora}
      defs={antes.defs}
      overlay={
        <>
          <EraTag frame={f} text={s.antes.tag ?? "HÁ SÉCULOS"} accent={URUCUM} color={ink} />
          <Label frame={f} at={6} out={140} y={380} size={78} bar={URUCUM}>
            {s.pergunta}
          </Label>
          <Label frame={f} at={150} y={380} size={70} color={ink}>
            {s.antes.frase}
          </Label>
          {s.antes.rotulo && (
            <Label frame={f} at={112} y={700} size={26} mono color={antes.hora === "dia" ? TERRA : PALHA}>
              {s.antes.rotulo}
            </Label>
          )}
          <Watermark color={ink} />
        </>
      }
    >
      {antes.mundo}
    </Stage>
  );

  const after = (
    <Stage
      cam={camHoje}
      era="hoje"
      defs={hoje.defs}
      overlay={
        <>
          <EraTag frame={f} at={TURN + 8} text="HOJE" accent={LUZ} />
          <Label frame={f} at={TURN + 30} out={466} y={380} size={70}>
            {s.hoje.frase}
          </Label>
          <Label frame={f} at={478} y={380} size={70}>
            {s.ponte[0]}
          </Label>
          <Label frame={f} at={486} y={470} size={70} color={LUZ}>
            {s.ponte[1]}
          </Label>
          <Watermark />
        </>
      }
    >
      {encontro ? (
        <>
          <Stars frame={f} opacity={0.8} />
          <Hills ground={GROUND} era="hoje" />
          <CircuitRoots seeds={[560, 650, 740]} ground={GROUND} t={1} depth={210} />
          <AtorFig a={guardia} f={f} look="raiz" size={340} />
          <AtorFig a={inovEnc} f={f} look="inova" size={340} prop={propHoje} glow={0.9} />
        </>
      ) : (
        <>
          {hoje.mundo}
          {f >= 470 && <AtorFig a={guardia} f={f} look="raiz" size={340} />}
        </>
      )}
    </Stage>
  );

  return (
    <AbsoluteFill>
      <Portal frame={f} at={TURN - 18} cx={fx} cy={fy} before={before} after={after} />
      <Vignette />
      <Grain frame={f} />
      <EndCard frame={f} start={560} />

      <Music name="travessia" volume={0.32} fadeOut={30} />
      <Sfx name={antes.hora === "dia" ? "mata" : "noite"} length={290} volume={0.22} />
      <Sfx name="tech-hum" at={TURN} length={272} volume={0.1} />
      <Sfx name="madeira" at={6} volume={0.5} />
      <Sfx name="madeira" at={150} volume={0.45} />
      <Sons a={[...antes.atores, ...hoje.atores, guardia]} />
      {antes.sons}
      <Sfx name="portal" at={TURN - 36} length={96} volume={0.7} />
      <Sfx name="holo" at={TURN + 8} volume={0.45} />
      {hoje.sons}
      <Sfx name="whoosh-short" at={499} volume={0.35} />
      <Sfx name="ding" at={480} length={80} volume={0.35} />
      <Sfx name="whoosh" at={552} volume={0.35} />
      <Sfx name="bambu" at={564} length={36} volume={0.6} />
    </AbsoluteFill>
  );
};
