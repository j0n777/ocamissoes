import { Composition } from "remotion";
import { H, W } from "./lib/brand";
import { FigureSheet } from "./scenes/FigureSheet";
import { DURATION, FPS, PleiadesIA } from "./scenes/PleiadesIA";

export const Root = () => (
  <>
    <Composition id="PleiadesIA" component={PleiadesIA} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="FigureSheet" component={FigureSheet} durationInFrames={1} fps={30} width={W} height={H} />
  </>
);
