// Structure fingerprint (idea from bang-motion's "sidik jari struktur", MIT):
// fichas make videos fast, and fast makes them alike. Compares every ficha in
// src/videos/ and warns when two share too much of the structure.
//   node scripts/compara-fichas.mjs
// Fingerprint: cena antes · cena hoje · tag · objeto/rotulo · pergunta (first word).
// Rule: a new video differs from each of the last 3 in at least 3 of the 5.
import { readdirSync, readFileSync } from "node:fs";

const dir = "src/videos";
const pick = (src, re) => (src.match(re)?.[1] ?? "").trim().toLowerCase();
const fichas = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .map((f) => {
    const s = readFileSync(`${dir}/${f}`, "utf8");
    const antes = s.slice(s.indexOf("antes:"), s.indexOf("hoje:"));
    const hoje = s.slice(s.indexOf("hoje:"));
    return {
      id: pick(s, /id:\s*"([^"]+)"/),
      impressao: [pick(antes, /cena:\s*"([^"]+)"/), pick(hoje, /cena:\s*"([^"]+)"/), pick(antes, /tag:\s*"([^"]+)"/) || "há séculos", pick(antes, /rotulo:\s*"([^"]+)"/), pick(s, /pergunta:\s*"(\S+)/)],
    };
  });
const order = readFileSync(`${dir}/index.ts`, "utf8").match(/PONTES[^=]*=\s*\[([^\]]*)\]/)?.[1].split(",").map((x) => x.trim().toLowerCase()).filter(Boolean) ?? [];
fichas.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
let warn = 0;
fichas.forEach((f, i) => {
  console.log(`${f.id.padEnd(22)} ${f.impressao.join(" · ")}`);
  for (const g of fichas.slice(Math.max(0, i - 3), i)) {
    const diff = f.impressao.filter((v, k) => v !== g.impressao[k]).length;
    if (diff < 3) {
      console.log(`  ATENÇÃO: muito parecido com ${g.id} (só ${diff} de 5 diferentes). Troque a cena, o objeto ou a pergunta.`);
      warn++;
    }
  }
});
process.exit(warn ? 1 : 0);
