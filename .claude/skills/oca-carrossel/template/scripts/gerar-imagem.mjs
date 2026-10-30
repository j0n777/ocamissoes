// Generates a reference illustration with the OpenAI Image API, already in
// the OCA style (references/imagens.md). Use it when the agent running the
// skill has no image tool of its own.
//   OPENAI_API_KEY=... node scripts/gerar-imagem.mjs <nome> <retrato|paisagem|quadrado> "<o que desenhar>"
// Writes assets/ia/<nome>.webp and assets/ia/<nome>.json (model, prompt, date).
// Model: OPENAI_IMAGE_MODEL, default gpt-image-2.5-flare (OpenAI image guide,
// checked 2026-10-30; gpt-image-2.5-sunburst is the one for edits).
// Quality: OPENAI_IMAGE_QUALITY, default "medium".
import { mkdirSync, writeFileSync } from "node:fs";

const [name, format = "retrato", ...words] = process.argv.slice(2);
const subject = words.join(" ");
const key = process.env.OPENAI_API_KEY;
if (!name || !subject) {
  console.error('uso: node scripts/gerar-imagem.mjs <nome> <retrato|paisagem|quadrado> "<o que desenhar>"');
  process.exit(1);
}
if (!key) {
  console.error("Falta OPENAI_API_KEY. Sem ela, gere a imagem com a ferramenta de imagem do próprio agente, usando o mesmo estilo de references/imagens.md.");
  process.exit(1);
}
const SIZES = { retrato: "1024x1536", paisagem: "1536x1024", quadrado: "1024x1024" };
const size = SIZES[format];
if (!size) throw new Error(`formato inválido: ${format}`);

// The house style. Keep it in sync with references/imagens.md.
const STYLE = [
  "Editorial flat illustration with a subtle printed-paper grain.",
  "Earthy palette only: terracotta #915729, cream #f8f4e1, dark brown #4a2a12, warm clay #b9773f, straw #d9b98a, muted green #6f8a3c.",
  "At most one small accent: urucum red #c8462c for the past, or teal light #3fd6c6 for technology.",
  "Simple bold shapes, soft shadows, calm composition with empty space at the bottom third for a headline.",
  "No text, no letters, no numbers, no logos, no watermarks, no frames.",
  "Respectful: no feathered headdresses, no face paint, no stereotypes; prefer hands, objects, landscapes and architecture to faces.",
].join(" ");
const prompt = `${subject}. ${STYLE}`;

const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare";
const r = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, prompt, size, quality: process.env.OPENAI_IMAGE_QUALITY || "medium", output_format: "webp", n: 1 }),
});
const body = await r.json();
if (!r.ok) {
  console.error(`OpenAI respondeu ${r.status}: ${body.error?.message ?? JSON.stringify(body)}`);
  process.exit(1);
}
mkdirSync("assets/ia", { recursive: true });
const file = `assets/ia/${name}.webp`;
writeFileSync(file, Buffer.from(body.data[0].b64_json, "base64"));
writeFileSync(`assets/ia/${name}.json`, JSON.stringify({ arquivo: file, modelo: model, tamanho: size, prompt, data: new Date().toISOString().slice(0, 10), credito: "Ilustração gerada com IA" }, null, 2));
console.log(`${file}  (${model}, ${size})`);
