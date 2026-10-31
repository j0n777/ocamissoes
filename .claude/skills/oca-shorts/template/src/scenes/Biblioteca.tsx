import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Fonts, H, Label, LUZ, MONO, PALHA, TERRA, URUCUM, W } from "../lib/brand";
import { CARRY, Figure, FRENTE, FRENTE_HOLD, FRENTE_OPEN, FRENTE_UP, FRENTE_WAVE, HOLD, KNEEL, LOOK_UP, type Pose, SIT, STAND, WAVE, walk } from "../lib/figure";
import { Grain, Particles, Portal } from "../lib/fx";
import { Antena, Celular, ChatBalao, CircuitRoots, DataMotes, Drone, EstacaoClima, GlowDef, Grafico, HoloPanel, Lampada, MapPin, Notebook, Nuvem, PainelSolar, QRCode, Rede, Satellite, Sensor, Trator } from "../lib/tech";
import { Canoa, Chuva, Cuia, Ema, Erval, Fogueira, Hills, Livro, Moon, Nuvens, Oca, OcaModerna, Pleiades, Prensa, QueroQuero, Rio, Roca, Ruina, SacoErva, Sol, Sprout, Stage, Stars, type Era, type Hora, type Plano, shot } from "../lib/world";
import { type Faz, ator, AtorFig } from "../lib/acoes";

// The visual library: model sheets of everything the skill can draw, to pick
// from when writing a scene and to show the team what exists. Each sheet is a
// still (render at frame 40). Rendered copies live in the skill's biblioteca/.

const Cap = ({ x, y, children, color = PALHA }: { x: number; y: number; children: ReactNode; color?: string }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontSize={22} letterSpacing={3} fill={color}>
    {children}
  </text>
);

const Sheet = ({ title, era = "antes", hora, children }: { title: string; era?: Era; hora?: Hora; children: ReactNode }) => (
  <AbsoluteFill>
    <Stage cam={{ x: W / 2, y: H / 2, zoom: 1 }} era={era} hora={hora} defs={<GlowDef />} overlay={<Label frame={40} y={130} size={52}>{title}</Label>}>
      {children}
    </Stage>
    <Grain frame={0} />
  </AbsoluteFill>
);

const p = (x: number, y: number, extra: Partial<Pose> = {}, base: Pose = STAND): Pose => ({ ...base, ...extra, x, y });

// 1. Characters in three views, plus the crowd.
export const BibPersonagens = () => (
  <Sheet title="personagens · 3 vistas">
    <Cap x={540} y={260} color={URUCUM}>A GUARDIÃ · RAIZ</Cap>
    {(["frente", "perfil", "costas"] as const).map((v, i) => (
      <g key={v}>
        <Figure pose={p(200 + i * 340, 720, {}, v === "perfil" ? STAND : FRENTE)} look="raiz" view={v} size={300} />
        <Cap x={200 + i * 340} y={770}>{v.toUpperCase()}</Cap>
      </g>
    ))}
    <Cap x={540} y={880} color={LUZ}>O INOVADOR · INOVA</Cap>
    {(["frente", "perfil", "costas"] as const).map((v, i) => (
      <g key={v}>
        <Figure pose={p(200 + i * 340, 1340, {}, v === "perfil" ? STAND : FRENTE)} look="inova" view={v} size={300} />
        <Cap x={200 + i * 340} y={1390}>{v.toUpperCase()}</Cap>
      </g>
    ))}
    <Cap x={540} y={1500}>POVO · TONS POR PROFUNDIDADE</Cap>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Figure key={i} pose={p(240 + i * 120, 1800, {}, i % 2 ? FRENTE : STAND)} view={i % 2 ? "frente" : "perfil"} look="povo" depth={i * 0.18} size={230} />
    ))}
  </Sheet>
);

// 2. Poses and props.
export const BibPoses = () => {
  const cells: { label: string; node: (x: number, y: number) => ReactNode }[] = [
    { label: "STAND", node: (x, y) => <Figure pose={p(x, y)} look="raiz" prop="cesto" size={220} /> },
    { label: "LOOK_UP", node: (x, y) => <Figure pose={p(x, y, LOOK_UP)} look="raiz" size={220} /> },
    { label: "KNEEL", node: (x, y) => <Figure pose={p(x, y, KNEEL)} look="raiz" prop="semente" size={220} /> },
    { label: "SIT + CUIA", node: (x, y) => <Figure pose={p(x, y, SIT)} look="raiz" prop="cuia" size={220} /> },
    { label: "CARRY + LIVRO", node: (x, y) => <Figure pose={p(x, y, CARRY)} look="raiz" prop="livro" size={220} /> },
    { label: "WALK()", node: (x, y) => <Figure pose={walk(p(x, y), 0.25)} look="raiz" size={220} /> },
    { label: "HOLD + TABLET", node: (x, y) => <Figure pose={p(x, y, HOLD)} look="inova" prop="tablet" glow={1} size={220} /> },
    { label: "WAVE", node: (x, y) => <Figure pose={p(x, y, WAVE)} look="inova" size={220} /> },
    { label: "CELULAR", node: (x, y) => <Figure pose={p(x, y, { head: 0.3, armR: { a: 0.6, b: 1.6 } })} look="inova" prop="celular" glow={1} size={220} /> },
    { label: "FRENTE_UP", node: (x, y) => <Figure pose={p(x, y, FRENTE_UP, FRENTE)} look="inova" view="frente" size={220} /> },
    { label: "FRENTE_OPEN", node: (x, y) => <Figure pose={p(x, y, FRENTE_OPEN, FRENTE)} look="raiz" view="frente" size={220} /> },
    { label: "FRENTE_HOLD", node: (x, y) => <Figure pose={p(x, y, FRENTE_HOLD, FRENTE)} look="inova" view="frente" prop="tablet" glow={1} size={220} /> },
    { label: "FRENTE_WAVE", node: (x, y) => <Figure pose={p(x, y, FRENTE_WAVE, FRENTE)} look="raiz" view="frente" size={220} /> },
    { label: "SIT (INOVA)", node: (x, y) => <Figure pose={p(x, y, SIT)} look="inova" prop="celular" glow={1} size={220} /> },
    { label: "WALK() FASE 0,75", node: (x, y) => <Figure pose={walk(p(x, y), 0.75)} look="inova" size={220} /> },
  ];
  return (
    <Sheet title="poses e objetos de mão">
      {cells.map((c, i) => {
        const x = 190 + (i % 3) * 350, y = 520 + Math.floor(i / 3) * 300;
        return (
          <g key={c.label}>
            {c.node(x, y)}
            <Cap x={x} y={y + 40}>{c.label}</Cap>
          </g>
        );
      })}
    </Sheet>
  );
};

// 3. The ancestral world: dwellings, plants, objects.
export const BibAntes = () => {
  const f = useCurrentFrame();
  return (
    <Sheet title="antes · cenário e objetos" hora="dia">
      <Sol x={880} y={330} frame={f} r={50} />
      <Hills ground={700} era="antes" />
      <Oca x={260} ground={700} w={300} h={190} />
      <Ruina x={760} ground={700} w={340} />
      <Cap x={260} y={740} color={TERRA}>OCA</Cap>
      <Cap x={760} y={740} color={TERRA}>RUINA (FACHADA)</Cap>
      <Erval x={200} ground={1150} size={0.8} frame={f} />
      <Cap x={200} y={1190}>ERVAL</Cap>
      <Roca x={560} ground={1000} w={420} depth={140} />
      <Cap x={560} y={1190}>ROCA</Cap>
      <Sprout x={820} ground={1150} grow={1} size={1.6} />
      <Fogueira x={960} ground={1150} frame={f} size={0.55} />
      <Cap x={820} y={1190}>BROTO</Cap>
      <Cap x={960} y={1190}>FOGUEIRA</Cap>
      <Prensa x={190} ground={1620} size={0.75} press={0.5} />
      <Cap x={190} y={1660}>PRENSA</Cap>
      <Livro x={540} y={1470} size={1} lines={1} />
      <Cap x={540} y={1660}>LIVRO</Cap>
      <Cuia x={880} y={1580} size={0.9} steam={1} />
      <Cap x={880} y={1660}>CUIA</Cap>
      <Rio y={1740} frame={f} h={90} />
      <Canoa x={540} y={1780} frame={f} />
      <Cap x={540} y={1880}>RIO · CANOA</Cap>
    </Sheet>
  );
};

// 4. The "hoje" kit.
export const BibHoje = () => {
  const f = useCurrentFrame();
  return (
    <Sheet title="hoje · tecnologia" era="hoje">
      <Satellite from={[240, 360]} to={[240, 360]} t={0} ping={0.6} />
      <Cap x={240} y={470}>SATELLITE</Cap>
      <Drone x={540} y={360} frame={f} scale={1.1} />
      <Cap x={540} y={470}>DRONE</Cap>
      <Nuvem x={840} y={360} frame={f} size={0.8} />
      <Cap x={840} y={470}>NUVEM</Cap>
      <Celular x={200} y={760} size={0.9} />
      <Cap x={200} y={990}>CELULAR</Cap>
      <HoloPanel x={590} y={760} t={1} w={380} h={260} title="HOLOPANEL" />
      <Cap x={590} y={990}>HOLOPANEL</Cap>
      <Antena x={930} ground={980} frame={f} h={300} />
      <Cap x={930} y={1020}>ANTENA</Cap>
      <Notebook x={220} y={1290} size={0.9} />
      <Cap x={220} y={1360}>NOTEBOOK</Cap>
      <PainelSolar x={560} ground={1320} size={0.9} />
      <Cap x={560} y={1360}>PAINELSOLAR</Cap>
      <Sensor x={890} ground={1320} frame={f} size={1.3} />
      <Cap x={890} y={1360}>SENSOR</Cap>
      <rect x={0} y={1580} width={W} height={340} fill="#1c1008" />
      <CircuitRoots seeds={[280, 420, 560, 700, 840]} ground={1580} t={1} depth={240} />
      {[280, 420, 560, 700, 840].map((x) => <Sprout key={x} x={x} ground={1580} grow={1} size={1} />)}
      <DataMotes x={760} y={1560} frame={f} start={0} count={10} spread={260} />
      <Cap x={540} y={1880} color={LUZ}>CIRCUITROOTS · DATAMOTES</Cap>
    </Sheet>
  );
};

// 5. Skies: the same place at three times of day, in both eras.
const Band = ({ top, h, era, hora, label, children }: { top: number; h: number; era: Era; hora: Hora; label: string; children?: ReactNode }) => (
  <div style={{ position: "absolute", left: 0, top, width: W, height: h, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: -(H - h) / 2, width: W, height: H }}>
      <Stage cam={{ x: W / 2, y: 1450, zoom: 1 }} era={era} hora={hora}>
        {children}
        <Hills ground={1650} era={hora === "noite" ? "hoje" : era} />
        <Oca x={760} ground={1650} w={240} h={150} />
      </Stage>
    </div>
    <div style={{ position: "absolute", left: 40, top: 30, fontFamily: MONO, fontSize: 24, letterSpacing: "0.2em", color: "#f8f4e1" }}>{label}</div>
  </div>
);

export const BibCeus = () => {
  const f = useCurrentFrame();
  const h = H / 4;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fonts />
      <Band top={0} h={h} era="antes" hora="dia" label='ANTES · hora="dia"'>
        <Sol x={880} y={1310} frame={f} r={50} />
      </Band>
      <Band top={h} h={h} era="antes" hora="entardecer" label="ANTES · ENTARDECER (PADRÃO)">
        <Stars frame={f} box={[0, 1230, 1080, 1420]} count={20} opacity={0.6} />
      </Band>
      <Band top={2 * h} h={h} era="antes" hora="noite" label='ANTES · hora="noite"'>
        <Stars frame={f} box={[0, 1230, 1080, 1450]} count={50} />
        <Moon x={880} y={1310} r={36} />
        <Particles frame={f} kind="vagalume" box={[0, 1540, 1080, 1640]} count={10} color={PALHA} />
      </Band>
      <Band top={3 * h} h={h} era="hoje" hora="noite" label="HOJE · NOITE (PADRÃO)">
        <Stars frame={f} box={[0, 1230, 1080, 1450]} count={50} />
        <Pleiades x={800} y={1300} frame={f} glow={0.6} link={1} />
      </Band>
      <Grain frame={0} />
    </AbsoluteFill>
  );
};

// 6. Shots: the same moment through the five camera presets, plus the portal.
const SUBJECT: [number, number] = [520, 1250];
const PlanoScene = ({ cam, f }: { cam: { x: number; y: number; zoom: number }; f: number }) => (
  <Stage cam={cam} era="antes">
    <Stars frame={f} />
    <Pleiades x={560} y={420} frame={f} glow={0.8} link={1} />
    <Hills ground={1250} era="antes" />
    <Oca x={860} ground={1250} w={320} h={210} />
    <Erval x={180} ground={1250} size={0.9} frame={f} />
    {[600, 680].map((x) => <Sprout key={x} x={x} ground={1250} grow={1} size={1.5} />)}
    <Figure pose={p(SUBJECT[0], SUBJECT[1], KNEEL)} look="raiz" prop="semente" size={340} />
  </Stage>
);

const Mini = ({ x, y, label, children }: { x: number; y: number; label: string; children: ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div style={{ width: W * 0.31, height: H * 0.31, overflow: "hidden", border: "3px solid #f8f4e1" }}>
      <div style={{ width: W, height: H, transform: "scale(0.31)", transformOrigin: "0 0" }}>{children}</div>
    </div>
    <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 24, letterSpacing: "0.15em", color: "#f8f4e1", textAlign: "center" }}>{label}</div>
  </div>
);

export const BibPlanos = () => {
  const f = useCurrentFrame();
  const kinds: Plano[] = ["aberto", "medio", "close", "detalhe", "ceu"];
  return (
    <AbsoluteFill style={{ background: "#24140a" }}>
      <Fonts />
      <div style={{ position: "absolute", top: 70, width: W, textAlign: "center", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: 52, color: "#f8f4e1" }}>planos: shot(tipo, sujeito)</div>
      {kinds.map((k, i) => (
        <Mini key={k} x={20 + (i % 3) * 352} y={190 + Math.floor(i / 3) * 860} label={`"${k}"`}>
          <PlanoScene cam={shot(k, k === "detalhe" ? [SUBJECT[0] + 110, SUBJECT[1] - 90] : SUBJECT)} f={f} />
        </Mini>
      ))}
      <Mini x={20 + 2 * 352} y={190 + 860} label="PORTAL (MEIO)">
        <Portal frame={18} at={0} cx={540} cy={700} before={<PlanoScene cam={shot("aberto", SUBJECT)} f={f} />} after={<PlanoScene cam={shot("aberto", SUBJECT)} f={f} />} />
      </Mini>
    </AbsoluteFill>
  );
};

// 7. Nature of the pampa and the Missões: clouds, rain, birds.
export const BibNatureza = () => {
  const f = useCurrentFrame();
  return (
    <Sheet title="natureza" hora="dia">
      <Nuvens frame={f} y={260} count={4} />
      <Cap x={540} y={520} color={TERRA}>NUVENS (DIA)</Cap>
      <Hills ground={1000} era="antes" />
      <Ema x={260} ground={980} size={1} frame={f} />
      <Cap x={260} y={1040}>EMA</Cap>
      <QueroQuero x={620} y={980} size={1.6} />
      <QueroQuero x={760} y={700} size={1.3} voando frame={f} />
      <Cap x={680} y={1040}>QUEROQUERO (PARADO E VOANDO)</Cap>
      <rect x={0} y={1120} width={W} height={800} fill="#3b2414" />
      <Nuvens frame={f} y={1180} count={3} tone="noite" seed={5} />
      <Chuva frame={f} box={[0, 1200, 1080, 1860]} count={60} />
      <Erval x={540} ground={1800} size={0.9} frame={f} />
      <Cap x={540} y={1880} color={PALHA}>CHUVA · NUVENS (NOITE)</Cap>
    </Sheet>
  );
};

// 8. Community and business today: the modern oca, networks, AI, data, field.
export const BibComunidade = () => {
  const f = useCurrentFrame();
  return (
    <Sheet title="hoje · comunidade e negócio" era="hoje">
      <OcaModerna x={290} ground={560} w={400} h={240} />
      <Cap x={290} y={600}>OCAMODERNA</Cap>
      <Rede nos={[[640, 330], [780, 280], [920, 340], [900, 480], [760, 520], [640, 460]]} t={1} frame={f} />
      <Cap x={780} y={600}>REDE</Cap>
      <ChatBalao x={300} y={740} t={1} de="pessoa" lines={2} w={360} />
      <ChatBalao x={300} y={900} t={1} de="ia" lines={3} w={400} />
      <Cap x={300} y={1020}>CHATBALAO (PESSOA · IA)</Cap>
      <Lampada x={790} y={760} t={1} />
      <Cap x={790} y={900}>LAMPADA</Cap>
      <Grafico x={280} y={1180} w={360} h={200} t={1} />
      <Cap x={280} y={1330}>GRAFICO</Cap>
      <QRCode x={640} y={1170} size={150} />
      <Cap x={640} y={1330}>QRCODE</Cap>
      <MapPin x={900} y={1250} t={1} />
      <Cap x={900} y={1330}>MAPPIN</Cap>
      <SacoErva x={170} ground={1780} size={1} tag />
      <Cap x={170} y={1830}>SACOERVA</Cap>
      <Trator x={500} ground={1780} frame={f} size={1} />
      <Cap x={500} y={1830}>TRATOR</Cap>
      <EstacaoClima x={880} ground={1780} frame={f} h={280} />
      <Cap x={880} y={1830}>ESTACAOCLIMA</Cap>
    </Sheet>
  );
};

// 9. Actions (lib/acoes.tsx): each verb shown mid-way through a 60-frame beat.
const ACOES: Faz[] = ["parado", "andar", "olhar-ceu", "apontar", "ajoelhar", "plantar", "colher", "segurar", "digitar", "acenar", "carregar", "sentar", "beber-mate", "entregar", "comemorar", "acolher", "mostrar", "acenar-frente"];
const PROP: Partial<Record<Faz, "cesto" | "tablet" | "semente" | "cuia" | "celular" | "livro">> = { plantar: "semente", colher: "cesto", segurar: "livro", digitar: "tablet", carregar: "livro", "beber-mate": "cuia", mostrar: "tablet" };
export const BibAcoes = () => (
  <Sheet title='ações: ator(base, [{ de, ate, faz }])'>
    {ACOES.map((faz, i) => {
      const x = 150 + (i % 4) * 260, y = 470 + Math.floor(i / 4) * 330;
      const a = ator({ x, y }, [{ de: 0, ate: 60, faz, x: x + 60 }]);
      return (
        <g key={faz}>
          <AtorFig a={a} f={faz === "beber-mate" ? 55 : 30} look={i % 2 ? "inova" : "raiz"} size={200} prop={PROP[faz] ?? "none"} glow={1} />
          <Cap x={x + (faz === "andar" ? 30 : 0)} y={y + 40}>{`"${faz}"`}</Cap>
        </g>
      );
    })}
  </Sheet>
);
