# OCA Missões: conteúdo

Skills e referências para produzir os vídeos curtos e carrosséis do [@ocamissoes](https://www.instagram.com/ocamissoes/), o ecossistema de inovação das Missões/RS.

A linha editorial: **a inovação sempre esteve aqui.** Cada conteúdo liga um saber ancestral Guarani ou missioneiro (com fonte) às ferramentas de hoje, inclusive IA.

## Estrutura

```
.claude/skills/
  oca-shorts/        vídeos 2D (Remotion + SVG), trilhas e SFX sintetizados, legenda com referência
  oca-carrossel/     carrosséis 1080x1350 (HTML → PNG)
  oca-shorts/biblioteca/  folhas prontas: personagens, poses, objetos, tecnologia, céus, planos
brand/               logo, wordmarks vetorizados, paleta, fontes (OFL)
references/          análise do Instagram, técnicas trazidas de outros projetos
exemplos/            saídas aprovadas: o vídeo modelo (Plêiades → IA) e o carrossel modelo (imprensa de 1700)
conteudo/            registro do que já foi produzido (evita repetir temas)
```

## Como usar

Dentro deste repositório, o Claude Code carrega as skills sozinho. Peça, por exemplo:

- "faz um vídeo da OCA sobre erva-mate e rastreabilidade"
- "carrossel da OCA sobre o céu como calendário"

Cada skill tem um `SKILL.md` com regras, pipeline e checklist, e uma pasta `references/` com formatos, estilo, áudio, texto e o **acervo** (os únicos fatos permitidos, com fonte).

### Vídeo (manual)

```bash
cp -r .claude/skills/oca-shorts/template /tmp/oca-video && cd /tmp/oca-video
npm install && npm run audio
bash scripts/render.sh video PleiadesIA out/pleiades.mp4
bash scripts/master.sh out/pleiades.mp4
```

### Carrossel (manual)

```bash
cp -r .claude/skills/oca-carrossel/template /tmp/oca-carrossel && cd /tmp/oca-carrossel
npm install && node scripts/render.mjs slides.html out
```

## Princípios

- Vídeo sem modelos generativos: formas em código e som sintetizado, 100% próprios. A biblioteca visual pronta (personagens em 3 vistas, poses, objetos, céus, planos) fica em `.claude/skills/oca-shorts/biblioteca/`.
- Carrossel com 1 a 3 imagens de referência: documento ou foto real com licença livre, foto da OCA, ou ilustração de IA no estilo da casa, sempre com crédito.
- Todo fato com fonte (acervo); todo vídeo com legenda que explica a referência.
- Respeito: o saber Guarani é conhecimento vivo, nunca caricatura.
