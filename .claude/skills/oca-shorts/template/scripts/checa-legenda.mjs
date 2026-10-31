// Checks a caption against references/legenda.md.
//   node scripts/checa-legenda.mjs <arquivo.txt>
import { readFileSync } from "node:fs";

const file = process.argv[2];
const t = readFileSync(file, "utf8").trim();
const fails = [];
const tags = t.match(/#[\p{L}\p{N}_]+/gu) ?? [];
const paras = t.split(/\n\s*\n/).filter((p) => p.trim());
if (/[–—]/.test(t)) fails.push("tem travessão (— ou –)");
if (!/^Referência:\s*\S+/m.test(t)) fails.push('falta a linha "Referência: ..." com a fonte');
if (/\bíndios?\b/i.test(t.replace(/"[^"]*"/g, ""))) fails.push('use "Guarani" ou "Mbyá-Guarani", nunca "índio" (fora de títulos citados)');
if (tags.length > 5) fails.push(`${tags.length} hashtags (máximo 5)`);
if (!tags.some((h) => h.toLowerCase() === "#ocamissões" || h.toLowerCase() === "#ocamissoes")) fails.push("falta #OCAMissões");
if (t.length > 1100) fails.push(`${t.length} caracteres (até ~1100)`);
if (paras.length < 5) fails.push(`${paras.length} blocos (esperado: gancho, antes, hoje, ponte, referência e hashtags)`);
if (/\b(finalmente|agora sim|revolucion\w*|disruptiv\w*)\b/i.test(t)) fails.push('tom: evite "finalmente", "agora sim", "revolucionário", "disruptivo"');
if (fails.length) {
  for (const f of fails) console.log(`  FALHA legenda: ${f}`);
  process.exit(1);
}
console.log(`  OK    legenda (${t.length} caracteres, ${tags.length} hashtags)`);
