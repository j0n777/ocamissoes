# Técnicas de animação, efeitos e áudio de outros projetos

Levantamento feito em 2026-10-30 nos repositórios do Jonata que já fazem vídeo e animação, para trazer o que funciona para as skills da OCA. Nada foi copiado de código com licença incompatível; as ideias foram reimplementadas nas libs de `.claude/skills/oca-shorts/template/src/lib`.

| Repositório | O que é | Licença relevante |
|---|---|---|
| `j0n777/nf7alpha` (`.claude/skills/nf7-shorts`, `nf7-carousel`) | A base das duas skills: Remotion 2D/3D, áudio sintetizado, render HTML→PNG | do próprio autor |
| `j0n777/viral-skills` | Skills de edição de Shorts/YouTube com ffmpeg e Remotion; inclui a biblioteca **video-shotcraft** | shotcraft: Apache-2.0 |
| `j0n777/OpenMontage` (fork) | Framework de vídeo por agentes: ink-theater, partículas, regras de som e tipografia | **AGPL-3.0**: só ideias, nunca copiar código |
| `j0n777/biblia-video-engine` | Pipeline ffmpeg de vídeos longos e Shorts | do próprio autor |
| `j0n777/reels-editor` | Pipeline Python para reels de fala (Whisper, cortes, legendas) | do próprio autor |
| `j0n777/video-generator` | Esqueleto Remotion vazio | n/a |

## O que entrou nas skills da OCA

| Técnica | De onde veio | Onde está agora |
|---|---|---|
| Animação como função pura do quadro, `settle`, `hash01`, cortes com `pickShot` | nf7-shorts | `lib/anim.ts`, `lib/world.tsx` |
| Bonecos 2D de traço grosso com contorno escuro | nf7-shorts (`flat.tsx`) | `lib/figure.tsx` (com looks `raiz`, `inova`, `povo`) |
| Motor de síntese de áudio (osc, ruído, filtros, reverb, master) | nf7-shorts (`audio.mjs`) | `scripts/audio.mjs`, com instrumentos novos (flauta, chocalho, taquara, tambor, grilos) |
| Texto que entra com mola e giro e sai com colapso cúbico | viral-skills, `KeywordPop.tsx` | `Label` em `lib/brand.tsx` |
| Gancho em barra preenchida, na tela em até 0,5 s | viral-skills, `HookCard.tsx` e regras de hook | `Label bar=...` e checklist |
| Traço "fervendo" (feTurbulence + feDisplacementMap, semente a cada 3 quadros) | shotcraft, `LineBoil.tsx` | `BoilDef` em `lib/fx.tsx`; **desligado na cena modelo** desde 2026-10-30: na cena inteira lia como tremor no celular. Só pontual (estilo.md) |
| Máscara circular como transição | shotcraft, `InkBleedReveal.tsx` | `Portal` (o "o" do logo como íris) |
| Desenho de traço com `pathLength=1` e dashoffset | shotcraft, `DrawSvgTrace.tsx` | `Pleiades link`, `CircuitRoots`, check do `HoloPanel` |
| Partículas com semente (vaga-lumes, poeira, faíscas) | OpenMontage, `ParticleOverlay` (ideia) | `Particles` em `lib/fx.tsx` |
| Loudnorm em dois passos para -14 LUFS / -1,5 dBTP | biblia-video-engine `audio.js`; regras do OpenMontage | `scripts/master.sh` |
| Whoosh 1 a 2 quadros antes da mudança; riser terminando no impacto; 2 a 3 SFX por ideia | viral-skills e OpenMontage `sound-design.md` | `references/audio.md` |
| Movimento no quadro 1, mudança a cada 1 a 3 s, final em loop | OpenMontage `short-form.md` | checklist do SKILL.md |
| Render 2x + downscale lanczos + checagem de fonte carregada | nf7-carousel `render.mjs` | `oca-carrossel/template/scripts/render.mjs` |
| `@font-face` dividido por `unicode-range` (acentos do português) | nf7-carousel | os dois templates |

## Ideias guardadas para depois

- **Pincel variável** (`inkRibbon` do ink-theater): traço com largura que varia, para um look de xilogravura. Reimplementar se quiserem um estilo mais "desenhado".
- **IK 2D (FABRIK)** para braços que alcançam objetos com precisão.
- **Legendas palavra a palavra** (reels-editor, CaptionOverlay do OpenMontage) se um dia houver narração.
- **Riso/misregistro** (duas cores sobrepostas com multiply) como interrupção visual no "hoje".
- **Medir a trilha por vídeo** (`music_level.py` do viral-skills) se entrar narração: trilha 18 a 20 dB abaixo da voz.

## Bibliotecas de áudio encontradas

- `viral-skills/assets/sfx_shotcraft`: ~149 SFX, a maioria com licença Mixkit (uso comercial). Cerca de 6 marcados "fonte desconhecida": não usar sem conferir `ATTRIBUTION.md`.
- `viral-skills/assets/sfx`: origem desconhecida. Não usar.
- `viral-skills/musicas`: músicas comerciais com direitos. **Nunca usar.**
- As skills da OCA usam só áudio sintetizado (`audio.mjs`), sem nenhum desses arquivos.

## Alerta de segurança (fora deste repo)

`j0n777/reels-editor/pipeline/config.json` tem chaves de API em texto puro (Gemini e Pollinations). Recomenda-se revogar e remover do repositório. Os valores não foram copiados para cá.

## bang-motion (Bang Tutorial, MIT), estudado em 2026-10-31

[github.com/bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion), v1.19.0. Skill de motion graphics em HTML + GSAP, com regras "anti-PPT" verificáveis no código, menus de conceitos e estilos, 7 starters e scripts de verificação. É MIT: ideias e trechos podem ser reaproveitados com crédito. O stack é outro (HTML/GSAP, 16:9); aqui entrou o que vale para Remotion 9:16 e para o nosso estilo.

| Lição | De onde (no bang-motion) | Onde entrou |
|---|---|---|
| "Zoom" é trocar o tamanho do plano (aberto, médio, close) a cada batida, com push lento no hold e zoom em escala log | `references/techniques.md` §3b (v1.19) | `camera(f, chaves)` em `lib/world.tsx`; plano por cena no `Ponte` |
| Nada de miniatura: zoom mínimo, personagem grande no quadro | `references/kartun-panggung.md` Hukum 1 | estilo.md "Câmera"; fichas com zoom de 1,3 a 2,2 |
| Pelo menos 10 coisas vivas por palco (aqui, 6 no 9:16) | `kartun-panggung.md` Hukum 3 | `Capim`, `Fumaca`, `Passaros`, `LuzesLonge`, `AnelFundo`; checklist |
| Respiração do personagem parado (tronco, cabeça, braços, fase própria) | `kartun-panggung.md` Hukum 4 | `idle` em `lib/acoes.tsx` |
| Sombra elíptica de contato sob os pés | `kartun-panggung.md` Hukum 4 | `Figure` (`sombra`) |
| Troca de palco: sai 96 px em 0,28 s, corte, entra em 0,42 s, desfoque até 10 px | `kartun-panggung.md` Hukum 2 | `Deslize` em `lib/fx.tsx` |
| Texto do mundo (diegético) em vez de mais um nível de texto na tela | `kartun-panggung.md` Hukum 6; `anti-ppt.md` | `RotuloMundo`; rótulo do Ponte |
| Entrada e saída assimétricas, desfoque direcional no texto | `anti-ppt.md` princípio 9; `techniques.md` §2 | `Label` em `lib/brand.tsx` |
| Fundo nunca parado, com forma da marca girando devagar | `techniques.md` §7c (#6) | `AnelFundo` |
| Três candidatos, um escolhido; impressão digital da estrutura para não repetir | `references/opener-konsep.md` (Hukum kerangka) | briefing do SKILL.md; `scripts/compara-fichas.mjs` |
| Teste rápido de "isto é um slide?" | `anti-ppt.md` "Kalibrasi rasa" | checklist do SKILL.md |
| Fluxo de explainer com voz: roteiro na mensagem, gravação humana, pausas para sincronizar | `references/explainer.md` "Penyerahan"; `scripts/vo-pauses.html` | formato 6 em formatos.md; `scripts/pausas-vo.mjs`; `<Locucao>` |
| Jornalismo visual: elipse tracejada e etiqueta sobre a foto-prova, marca-texto | `assets/starter-explainer-jurnalisme.html` | `.anota`, `.anota-tag`, `.marca` no carrossel |

**Não trazido (por escolha):** WebGL/Three.js e glow (fora do nosso estilo flat), cabeças raster geradas por IA com expressões (nossos personagens são sem rosto, e a regra do vídeo é sem geração), ponte com After Effects, legendas sem ponto final (mantivemos a frase com ponto, estilo aprovado da casa).

**Ideias guardadas:** a regra "toda entidade citada aparece na tela" (`explainer.md`) para o formato narrado; o menu de 12 movimentos de fundo e 9 famílias de render (`techniques.md` §7c e §7e) se um dia houver séries com outra estética; "instrumentos" de explicação (mapa com rota, perfil, velocímetro) como cenas novas do menu.
