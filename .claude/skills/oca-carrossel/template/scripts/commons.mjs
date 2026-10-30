// Searches Wikimedia Commons for reference photos with a reusable licence and
// downloads candidates with their credit line.
//   node scripts/commons.mjs "ruínas São Miguel das Missões" [quantidade=6]
// Writes assets/ref/commons-<slug>-<n>.jpg plus a .json with title, author,
// licence, source page and the ready-to-use credit. Only free licences pass
// (public domain, CC0, CC BY, CC BY-SA). Commons rate-limits shared IPs: the
// script waits and retries a few times on HTTP 429.
import { mkdirSync, writeFileSync } from "node:fs";

const [query, howMany = "6"] = process.argv.slice(2);
if (!query) {
  console.error('uso: node scripts/commons.mjs "<busca>" [quantidade]');
  process.exit(1);
}
const OUT = "assets/ref";
const UA = "oca-missoes-carrossel/1.0 (https://www.instagram.com/ocamissoes/)";
const OK = /^(public domain|pd|cc0|cc by(-sa)? [\d.]+|cc by(-sa)?)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

async function get(url, binary = false) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) {
      const wait = Number(r.headers.get("retry-after")) || 15 * (i + 1);
      console.warn(`Commons pediu para esperar (429), tentando de novo em ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
    return binary ? Buffer.from(await r.arrayBuffer()) : r.json();
  }
  throw new Error("Commons continua limitando (429). Tente mais tarde ou baixe manualmente.");
}

const api = new URL("https://commons.wikimedia.org/w/api.php");
Object.entries({
  action: "query", format: "json", generator: "search", gsrnamespace: "6", gsrsearch: `${query} filetype:bitmap`,
  gsrlimit: String(Number(howMany) * 2), prop: "imageinfo", iiprop: "url|extmetadata|size", iiurlwidth: "1600",
}).forEach(([k, v]) => api.searchParams.set(k, v));

const data = await get(api);
const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
mkdirSync(OUT, { recursive: true });
let n = 0;
for (const p of pages) {
  if (n >= Number(howMany)) break;
  const ii = p.imageinfo?.[0];
  const m = ii?.extmetadata ?? {};
  const licence = strip(m.LicenseShortName?.value);
  if (!ii || !OK.test(licence)) continue;
  n++;
  const author = strip(m.Artist?.value) || "autor desconhecido";
  const file = `${OUT}/commons-${slug(query)}-${n}.jpg`;
  writeFileSync(file, await get(ii.thumburl, true));
  const meta = {
    arquivo: file, titulo: p.title, autor: author, licenca: licence, pagina: ii.descriptionurl, largura: ii.width, altura: ii.height,
    credito: `Foto: ${author}, ${licence}, via Wikimedia Commons`,
  };
  writeFileSync(file.replace(/\.jpg$/, ".json"), JSON.stringify(meta, null, 2));
  console.log(`${file}\n  ${p.title}\n  ${meta.credito}\n  ${ii.descriptionurl}`);
  await sleep(1200);
}
if (!n) console.log("Nenhuma imagem com licença livre para essa busca. Tente outros termos (em português, espanhol ou inglês).");
