import { Composition } from "remotion";
import { PONTE_FRAMES, PonteVideo } from "./formatos/Ponte";
import { H, W } from "./lib/brand";
import { PONTES } from "./videos";
import { BibAcoes, BibAntes, BibCeus, BibComunidade, BibHoje, BibNatureza, BibPersonagens, BibPlanos, BibPoses } from "./scenes/Biblioteca";
import { FigureSheet } from "./scenes/FigureSheet";
import { DURATION, FPS, PleiadesIA } from "./scenes/PleiadesIA";

export const Root = () => (
  <>
    <Composition id="PleiadesIA" component={PleiadesIA} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    {/* Videos made from a ficha (src/videos). */}
    {PONTES.map((spec) => (
      <Composition key={spec.id} id={spec.id} component={PonteVideo} durationInFrames={PONTE_FRAMES} fps={30} width={W} height={H} defaultProps={{ spec }} />
    ))}
    <Composition id="FigureSheet" component={FigureSheet} durationInFrames={1} fps={30} width={W} height={H} />
    {/* Visual library: model sheets, render as stills at frame 40 (scripts/biblioteca.sh). */}
    <Composition id="BibPersonagens" component={BibPersonagens} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibPoses" component={BibPoses} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibAntes" component={BibAntes} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibHoje" component={BibHoje} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibCeus" component={BibCeus} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibPlanos" component={BibPlanos} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibNatureza" component={BibNatureza} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibComunidade" component={BibComunidade} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibAcoes" component={BibAcoes} durationInFrames={60} fps={30} width={W} height={H} />
  </>
);
