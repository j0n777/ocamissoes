import type { PonteSpec } from "../formatos/Ponte";

// Exemplo de vídeo por ficha (formato Ponte). Legenda: ErvaRastreio.legenda.txt
export const ErvaRastreio: PonteSpec = {
  id: "ErvaRastreio",
  pergunta: "de onde vem a erva?",
  antes: {
    cena: "erval",
    rotulo: "KA'A · ERVA-MATE",
    frase: "os Guarani já conheciam a ka'a.",
  },
  hoje: {
    cena: "rastreio",
    frase: "um QR conta a origem.",
  },
  ponte: ["a mesma folha.", "mais longe."],
  referencia: "Univali, RBTS: erva-mate e os Guarani (caá)",
};
