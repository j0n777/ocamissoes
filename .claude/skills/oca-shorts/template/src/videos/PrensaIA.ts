import type { PonteSpec } from "../formatos/Ponte";

// Ficha: a imprensa missioneira (1700) e a IA que transcreve e traduz.
export const PrensaIA: PonteSpec = {
  id: "PrensaIA",
  pergunta: "como guardar o saber?",
  antes: {
    tag: "EM 1700",
    cena: "prensa",
    rotulo: "PRENSA MISSIONEIRA",
    frase: "as Missões já imprimiam livros.",
  },
  hoje: {
    cena: "ia-texto",
    frase: "a IA transcreve e traduz.",
  },
  ponte: ["mesma vontade.", "outro ritmo."],
  referencia: "Misiones Online, 08/09/2026; Archive.org, Yapuguay (1724)",
};
