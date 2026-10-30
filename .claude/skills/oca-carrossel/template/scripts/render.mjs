// Renders every <section class="slide" id="sN"> of an HTML file to PNG.
//   node scripts/render.mjs slides.html out
// Each slide is shot at 2x (2160x2700), then downscaled to 1080x1350 with
// ffmpeg (lanczos) for crisp text. Without ffmpeg the 2x files are kept.
// Set CHROMIUM to use a specific browser binary (see browser.mjs).
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { launch } from "./browser.mjs";

const [html = "slides.html", outDir = "out", prefix = "oca-carrossel"] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 })).newPage();
await page.goto("file://" + resolve(html), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
if (!fonts.some((f) => f.includes("Outfit"))) console.warn("warning: Outfit did not load, check assets/");

const n = await page.locator(".slide").count();
let ffmpeg = true;
for (let i = 1; i <= n; i++) {
  const id = String(i).padStart(2, "0");
  const raw = `${outDir}/raw-${id}.png`;
  const final = `${outDir}/${prefix}-${id}.png`;
  await page.locator(`#s${i}`).screenshot({ path: raw });
  try {
    if (!ffmpeg) throw new Error();
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-vf", "scale=1080:1350:flags=lanczos", final]);
    rmSync(raw);
  } catch {
    ffmpeg = false;
    renameSync(raw, final);
  }
}
await browser.close();
console.log(`${n} slides -> ${outDir}/${prefix}-NN.png ${ffmpeg ? "(1080x1350)" : "(2160x2700, ffmpeg not found)"}`);
