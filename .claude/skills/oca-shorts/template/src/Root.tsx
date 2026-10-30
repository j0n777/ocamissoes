import { Composition } from "remotion";
import { H, W } from "./lib/brand";
import { BibAntes, BibCeus, BibHoje, BibPersonagens, BibPlanos, BibPoses } from "./scenes/Biblioteca";
import { FigureSheet } from "./scenes/FigureSheet";
import { DURATION, FPS, PleiadesIA } from "./scenes/PleiadesIA";

export const Root = () => (
  <>
    <Composition id="PleiadesIA" component={PleiadesIA} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="FigureSheet" component={FigureSheet} durationInFrames={1} fps={30} width={W} height={H} />
    {/* Visual library: model sheets, render as stills at frame 40 (scripts/biblioteca.sh). */}
    <Composition id="BibPersonagens" component={BibPersonagens} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibPoses" component={BibPoses} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibAntes" component={BibAntes} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibHoje" component={BibHoje} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibCeus" component={BibCeus} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="BibPlanos" component={BibPlanos} durationInFrames={60} fps={30} width={W} height={H} />
  </>
);
