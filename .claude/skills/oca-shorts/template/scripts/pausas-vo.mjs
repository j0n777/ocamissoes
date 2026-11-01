// Finds the pauses in a recorded narration and prints where each sentence and
// paragraph starts, in seconds and in frames (30 fps), so the scene beats can
// sit on the voice. Same idea as bang-motion's vo-pauses (MIT), with ffmpeg.
//   node scripts/pausas-vo.mjs public/audio/vo/locucao.wav [limiar_dB=-35] [pausa_min_s=0.25]
// Pauses of 0.7 s or more are treated as paragraph breaks (one paragraph = one
// scene). Writes <arquivo>.pausas.json next to the audio.
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [file, db = "-35", min = "0.25"] = process.argv.slice(2);
if (!file) {
  console.error("uso: node scripts/pausas-vo.mjs <audio> [limiar_dB] [pausa_min_s]");
  process.exit(1);
}
const FPS = 30;
const log = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=${db}dB:d=${min}`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim());
const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => ({ end: Number(m[1]), len: Number(m[2]) }));
const segs = [];
let cursor = ends.length && starts[0] === 0 ? ends.shift().end : 0;
if (starts[0] === 0) starts.shift();
for (let i = 0; i <= starts.length; i++) {
  const stop = i < starts.length ? starts[i] : dur;
  if (stop - cursor > 0.05) segs.push({ de: +cursor.toFixed(2), ate: +stop.toFixed(2), deQuadro: Math.round(cursor * FPS), ateQuadro: Math.round(stop * FPS), pausaDepois: ends[i] ? +ends[i].len.toFixed(2) : 0 });
  if (ends[i]) cursor = ends[i].end;
}
let par = 1;
segs.forEach((s, i) => {
  s.paragrafo = par;
  if (s.pausaDepois >= 0.7) par++;
  console.log(`${String(i + 1).padStart(2)}  §${s.paragrafo}  ${s.de.toFixed(2)}s → ${s.ate.toFixed(2)}s   quadros ${s.deQuadro} → ${s.ateQuadro}${s.pausaDepois >= 0.7 ? "   (fim de parágrafo)" : ""}`);
});
console.log(`duração ${dur.toFixed(2)}s = ${Math.ceil(dur * FPS)} quadros`);
writeFileSync(file.replace(/\.\w+$/, ".pausas.json"), JSON.stringify({ duracao: dur, fps: FPS, segmentos: segs }, null, 2));
