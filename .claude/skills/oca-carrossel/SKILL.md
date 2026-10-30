---
name: oca-carrossel
description: Cria carrosséis para Instagram/LinkedIn da OCA Missões, o ecossistema de inovação das Missões/RS. Conteúdo educativo, útil ou de reflexão que sempre liga um saber ancestral Guarani ou missioneiro (com fonte) a uma ferramenta ou ideia de inovação de hoje, inclusive IA. Tipografia grande, poucas palavras, as cores do logo (barro, creme, terra, noite) com o acento urucum para o "antes" e luz para o "hoje", renderizado de HTML para PNGs 1080x1350. Use esta skill sempre que pedirem carrossel, post de slides, post educativo ou conteúdo estático para a OCA Missões, mesmo que só deem um tema ("faz um carrossel sobre erva-mate e rastreabilidade").
---

# OCA Carrossel

Um carrossel que ensina algo útil em 8 deslizadas e deixa uma ideia: **a inovação sempre esteve aqui**. Cada slide tem uma ideia em tipo grande. Juntos, contam um saber das Missões, o que existe hoje e o que o leitor pode fazer com isso.

Leia antes de escrever:
- [references/copy.md](references/copy.md): o arco (gancho, fato, contexto, destaque, ponte, reflexão, útil, CTA), regras de texto, ângulos e legenda.
- [references/slides.md](references/slides.md): os arquétipos de slide do `template/slides.html` e como criar novos.
- [references/acervo.md](references/acervo.md): os únicos fatos permitidos, com fonte. Confira antes de qualquer data, nome ou número.

## 1. Regras que não mudam

- **Poucas palavras, tipo grande.** Título de 3 a 10 palavras, 84 a 150 px. No máximo uma linha de apoio de até 25 palavras. Se precisa de parágrafo, são dois slides.
- **Sempre as duas eras.** Todo carrossel tem pelo menos um slide de saber ancestral (com fonte) e um de ferramenta/ideia de hoje. O slide "Ponte" (antes | hoje) é o coração.
- **Fatos com fonte.** Todo slide com fato histórico ou número traz a fonte em mono pequeno no rodapé (`.src`), tirada do acervo. Nunca invente data, nome guarani ou estatística. Atribua ("segundo...") quando a confiança é média.
- **Respeito.** O saber Guarani é conhecimento, não curiosidade exótica. Diga Guarani ou Mbyá-Guarani conforme a fonte, nunca "os índios". Use o presente quando o saber está vivo. O "hoje" continua o "antes", não o supera: nada de "finalmente", "agora sim".
- **Útil.** Pelo menos um slide que o leitor pode aplicar (lista de 3 passos, ferramenta, pergunta para refletir).
- **Identidade.**
  - Fundos do logo, alternados: barro `#915729`, creme `#f8f4e1`, noite `#24140a`.
  - Texto creme no escuro, terra `#4a2a12` no creme.
  - Acentos: urucum `#c8462c` no "antes", luz `#3fd6c6` no "hoje". Um acento por slide (uma palavra, a pontuação ou uma forma); os dois só no slide Ponte.
  - Outfit para texto, JetBrains Mono para etiquetas e fontes.
  - O anel do "o" do logo como forma decorativa; textura de papel em todos os slides.
  - Wordmark no canto superior esquerdo de todo slide.
- **Imagens.** Só formas em HTML/SVG. Nada de banco de imagens, nada de imagem de IA. Fotos da OCA (eventos) só se a equipe enviar, e com o filtro `.photo` (veja slides.md).
- **Texto visível** sem travessões. Use espaço não separável (`&nbsp;`) para evitar palavra sozinha na última linha.
- **Tamanho.** 1080x1350 (4:5), 6 a 10 slides. O primeiro é o gancho, o último o CTA.

## 2. Pipeline

```bash
cp -r "$SKILL_DIR/template" "$WORK/carrossel"   # SKILL_DIR = pasta deste SKILL.md
cd "$WORK/carrossel"
npm install                                      # Playwright
node scripts/render.mjs slides.html out          # -> out/oca-carrossel-01..NN.png, 1080x1350
```

Requisitos: Node 18+, ffmpeg (para o downscale 2x) e um Chromium (`browser.mjs` encontra um, ou peça `npx playwright install chromium`).

Passos:
1. **Briefing.** Escreva antes: ângulo, a pergunta, o saber (linha do acervo), a ferramenta de hoje, os 6 a 10 títulos em ordem e a fonte de cada fato.
2. **Edite `slides.html`.** Troque o texto, reordene, duplique ou apague `<section>`s. Mantenha os ids `s1..sN` em sequência.
3. **Renderize**, abra todos os PNGs e passe a checklist.
4. **Legenda** (copy.md), salva como `legenda.txt` junto dos PNGs, com a referência.
5. **Entregue** os PNGs e a legenda. Anote em `conteudo/carrosseis.md` no repo (data, ângulo, saber, fonte).

## 3. Checklist

- [ ] Teste do deslize: lendo só os títulos, o slide 1 dá vontade de ver o 2, e o último diz o que fazer.
- [ ] Há saber ancestral com fonte, ferramenta de hoje e um slide útil.
- [ ] Cada fato e número está no acervo e tem `.src` no slide; nenhum "primeiro do mundo" sem fonte forte.
- [ ] Um acento por slide (urucum no antes, luz no hoje); fundos alternados; wordmark no topo.
- [ ] Nenhum estereótipo; Guarani nomeado corretamente; tom de continuidade.
- [ ] Nenhuma palavra sozinha na última linha, nada encostando na margem de 80 px, zero travessões.
- [ ] Arquivos 1080x1350 PNG numerados e `legenda.txt` presente.
