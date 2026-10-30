import { AbsoluteFill } from "remotion";
import { Label } from "../lib/brand";
import { Figure, HOLD, KNEEL, LOOK_UP, STAND, WAVE } from "../lib/figure";
import { Grain } from "../lib/fx";
import { GlowDef } from "../lib/tech";
import { Hills, Oca, Ruina, Stage } from "../lib/world";

// Model sheet: both characters and the crowd look in their main poses, plus
// the key props. Render it as a still after any change to figure.tsx or world.tsx.
export const FigureSheet = () => (
  <AbsoluteFill>
    <Stage
      cam={{ x: 540, y: 960, zoom: 1 }}
      era="antes"
      defs={<GlowDef />}
      overlay={
        <Label frame={30} y={220} size={56}>
          raiz · inova · povo
        </Label>
      }
    >
      <Hills ground={1650} era="antes" />
      <Ruina x={820} ground={1650} w={360} />
      <Oca x={250} ground={1650} w={300} h={190} />
      <Figure pose={{ ...STAND, x: 200, y: 760 }} look="raiz" prop="cesto" />
      <Figure pose={{ ...STAND, ...LOOK_UP, x: 540, y: 760 }} look="raiz" />
      <Figure pose={{ ...STAND, ...KNEEL, x: 860, y: 760 }} look="raiz" prop="semente" />
      <Figure pose={{ ...STAND, x: 200, y: 1200, facing: -1 }} look="inova" />
      <Figure pose={{ ...STAND, ...HOLD, x: 540, y: 1200 }} look="inova" prop="tablet" glow={1} />
      <Figure pose={{ ...STAND, ...WAVE, x: 860, y: 1200 }} look="inova" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Figure key={i} pose={{ ...STAND, x: 380 + i * 80, y: 1580 }} look="povo" depth={0.15 + i * 0.17} size={220} />
      ))}
    </Stage>
    <Grain frame={0} />
  </AbsoluteFill>
);
