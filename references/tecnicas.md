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
| Traço "fervendo" (feTurbulence + feDisplacementMap, semente a cada 3 quadros) | shotcraft, `LineBoil.tsx` | `BoilDef` em `lib/fx.tsx` |
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
