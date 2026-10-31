---
name: oca-shorts
description: Cria vídeos curtos verticais (Reels, Shorts, TikTok) para a OCA Missões, o ecossistema de inovação das Missões/RS, em animação 2D flat com as cores do logo (barro, creme, terra). Cada vídeo é uma ponte entre um saber ancestral Guarani ou missioneiro (o céu como calendário, a erva-mate, a imprensa de 1700, a taquara) e as ferramentas de hoje (satélite, sensores, dados, IA), com dois personagens fixos (a Guardiã "raiz" e o Inovador "inova"), transição "portal" com o "o" do logo, trilha e SFX temáticos sintetizados em código, 15 a 25 s, e sempre uma legenda que explica a referência com fonte. Tudo é feito em código com Remotion e SVG, sem modelos generativos de imagem, vídeo ou áudio. Use esta skill sempre que pedirem reel, vídeo curto, animação, "vídeo estilo NF7" ou conteúdo em vídeo para a OCA Missões, mesmo que só deem um tema ("faz um vídeo sobre erva-mate e IA").
---

# OCA Shorts

Vídeos curtos que mostram que a inovação sempre esteve nas Missões. Uma pergunta antiga, resolvida com o saber de quem vivia aqui; a mesma pergunta hoje, com satélite, dados e IA. O espectador entende sem som em 3 segundos, e a legenda conta a história com fonte.

Leia antes de criar:
- [references/fichas.md](references/fichas.md): **o caminho padrão.** Um vídeo Ponte é uma ficha de dados (menus de cenas "antes" e "hoje", textos, fonte); o template faz o resto e confere as regras. Também documenta as ações dos personagens.
- [references/ideacao.md](references/ideacao.md): o motor de ideias (pergunta, saber, ferramenta, ponte), pontuação e banco de conceitos. Comece aqui.
- [references/formatos.md](references/formatos.md): os cinco formatos (Ponte, Duelo de eras, Linha do tempo, Herança, Mutirão).
- [references/biblioteca.md](references/biblioteca.md) e a pasta [biblioteca/](biblioteca/): as folhas prontas de personagens (3 vistas), poses, objetos do "antes", kit do "hoje", céus e planos de câmera. Escolha daqui antes de desenhar algo novo.
- [references/estilo.md](references/estilo.md): paleta, personagens, cenário, movimento, texto, efeitos.
- [references/audio.md](references/audio.md): trilhas e SFX, mixagem, loudness e licenças.
- [references/legenda.md](references/legenda.md): a legenda obrigatória com a referência.
- [references/acervo.md](references/acervo.md): os únicos fatos e números permitidos, com fonte. Confira antes de escrever qualquer referência.

## 1. Regras que não mudam

- **Respeito.** O saber ancestral é ciência e engenharia, nunca "primitivo". A Guardiã é especialista, não alguém a ser salvo. O Inovador não "ensina" a Guardiã: os dois respondem à mesma pergunta com as ferramentas do seu tempo, e no fim aparecem juntos. Nada de cocar, pintura facial caricata, sons "tribais" genéricos, ou o povo Guarani no passado como se não existisse hoje.
- **Fatos.** Toda referência histórica ou cultural vem do acervo, com atribuição ("segundo..."). Números só com fonte. Nunca invente nome guarani, data ou costume.
- **Sem modelos generativos.** Formas em SVG feitas em código; trilha e SFX sintetizados por `scripts/audio.mjs`. Nunca coloque música comercial no arquivo (veja audio.md).
- **Paleta.** Barro `#915729`, creme `#f8f4e1`, terra `#4a2a12`, noite `#24140a`. Dois acentos que separam as eras: **urucum** `#c8462c` só no "antes", **luz** `#3fd6c6` só no "hoje". Os dois juntos só no quadro final, quando as eras se encontram.
- **Tipo.** Outfit (títulos, em minúsculas, como o logo) e JetBrains Mono (etiquetas de era e dados, em maiúsculas). Texto em português do Brasil.
- **Texto na tela.** No máximo 3 elementos por vez (etiqueta de era, frase, uma etiqueta pequena). Frase com até 6 palavras. Gancho em até 0,5 s, sobre barra urucum. Sem hashtag, link ou emoji na tela. Zero travessões.
- **Especificação.** 1080x1920, 30 fps, 15 a 25 s (450 a 750 quadros), H.264 com áudio, masterizado a -14 LUFS (`scripts/master.sh`).
- **Área segura.** Texto e ação entre y 220 e y 1500; margem lateral de 64 px.

## 2. O briefing

Gere candidatos com o motor de ideacao.md. Depois preencha:

```
Formato:    Ponte | Duelo de eras | Linha do tempo | Herança | Mutirão
Pergunta:   a pergunta de sempre, até 5 palavras ("quando plantar?")
Antes:      o saber ancestral + a linha do acervo que o sustenta
Hoje:       as ferramentas atuais (genéricas, ou com fonte se tiver número/marca)
Ponte:      a frase final, até 6 palavras ("mesma pergunta. novas ferramentas.")
Metáfora:   o objeto que atravessa as eras (as Plêiades, a semente, a página, a folha)
Beats:      quadros de cada bloco (gancho, antes, portal, hoje, encontro, end card)
Som:        trilha + ambiência + SFX por contato
Legenda:    rascunho seguindo legenda.md, com a fonte
```

Teste antes de construir: descreva o último quadro em uma frase. Se alguém, sem som, não entender a ponte só com ele, troque a metáfora.

## 3. Pipeline

`template/` é um projeto Remotion pronto, com:
- o formato Ponte por ficha (`src/formatos/Ponte.tsx`) e a ficha de exemplo `ErvaRastreio` (`src/videos/`);
- a cena feita à mão `PleiadesIA` (Ponte, 20 s, a primeira aprovada);
- o `FigureSheet` e as 9 folhas da biblioteca (`Bib*`, `bash scripts/biblioteca.sh`);
- `scripts/qa.sh`, o portão final (render, loudness, legenda, folha de contato).

Copie o template; nunca edite no lugar. `SKILL_DIR` é a pasta deste SKILL.md (no repo, `.claude/skills/oca-shorts`).

Requisitos: Node 18+, ffmpeg/ffprobe. Um Chromium é opcional: `render.sh` usa `/opt/pw-browsers/*/chrome-headless-shell` se existir; senão o Remotion baixa o dele.

```bash
cp -r "$SKILL_DIR/template" "$WORK/oca-shorts"   # WORK = scratchpad ou pasta de trabalho
cd "$WORK/oca-shorts"
npm install
npm run audio                     # gera public/audio/music/*.wav e public/audio/sfx/*.wav (~15 s)
```

**Caminho padrão (formato Ponte): ficha.** Siga fichas.md: crie `src/videos/<Id>.ts` e `<Id>.legenda.txt`, registre em `src/videos/index.ts`, confira 4 stills e rode `bash scripts/qa.sh <Id>`. Nada de código de cena.

**Caminho manual (outros formatos ou uma cena nova):**
1. **Escreva a cena** em `src/scenes/<Nome>.tsx`, partindo de `PleiadesIA.tsx`, usando as ações (`lib/acoes.tsx`) e as peças da biblioteca. Ponha o briefing e o mapa de beats no comentário do topo.
2. **Registre** em `src/Root.tsx` com `DURATION` e `FPS`. Rode `npx tsc --noEmit`.
3. **Stills primeiro** (uns 2 s cada): abertura, meio do "antes", o portal, meio do "hoje" e o quadro final.
   ```bash
   bash scripts/render.sh still <Nome> 30
   bash scripts/render.sh still <Nome> <quadro>
   ```
   Abra os PNGs e passe a checklist. Corrija e repita.
4. **Legenda** em `out/<Nome>.legenda.txt` (legenda.md).

**Portão final (os dois caminhos):**
```bash
bash scripts/qa.sh <Id>      # ~2 min: render, master -14 LUFS, checagens, legenda, out/<Id>-contato.png
```
Só entregue com **PASS** e depois de abrir a folha de contato.

## 4. Peças (`src/lib`)

- **`anim.ts`**: funções puras do quadro: `progress`, `easeInOut`, `easeOut`, `settle` (pouso com overshoot), `lerp`, `arc`, `hash01`. Nunca use estado nem `Math.random()`.
- **`acoes.tsx`**: `ator(base, batidas)` com 19 ações (`andar`, `olhar-ceu`, `plantar`, `colher`, `segurar`, `digitar`, `entregar`, `comemorar`, `acolher`...), `<AtorFig>` e `<Sons>` (sons automáticos de cada ação). Tabela em fichas.md.
- **`brand.tsx`**: cores, `Fonts`, `Label` (entra com mola e leve giro, sai com colapso cúbico; `bar` vira gancho; texto simples quebra linha com `\n` e encolhe sozinho para caber), `EraTag` ("HÁ SÉCULOS", "HOJE"), `Watermark` (@OCAMISSOES), `EndCard` (wordmark + "ecossistema de inovação das Missões").
- **`figure.tsx`**: `Figure` com `look` `raiz` | `inova` | `povo`, `view` `perfil` | `frente` | `costas`, `prop` `cesto` | `semente` | `cuia` | `livro` | `tablet` | `celular`; poses de perfil `STAND`, `LOOK_UP`, `KNEEL`, `SIT`, `CARRY`, `HOLD`, `WAVE`, `walk()`, e de frente `FRENTE`, `FRENTE_UP`, `FRENTE_OPEN`, `FRENTE_HOLD`, `FRENTE_WAVE`; `mixPose()`.
- **`world.tsx`**: `Stage` (céu por era e `hora` `dia` | `entardecer` | `noite`, câmera), `shot(tipo, ponto)` (planos `aberto`, `medio`, `close`, `detalhe`, `ceu`), `pickShot` (cortes secos), `Hills`, `Stars`, `Pleiades`, `Moon`, `Sol`, `Oca`, `Ruina`, `Erval`, `Roca`, `Sprout`, `Fogueira`, `Rio`, `Canoa`, `Prensa`, `Livro`, `Cuia`, `SacoErva`, `OcaModerna`, `Nuvens`, `Chuva`, `Ema`, `QueroQuero`.
- **`tech.tsx`**: `GlowDef`, `HoloPanel`, `Satellite` (com `ping`), `Drone`, `Nuvem`, `Celular`, `Notebook`, `Antena`, `PainelSolar`, `Sensor`, `CircuitRoots` (raízes que viram circuito: a assinatura visual), `DataMotes`, `QRCode`, `MapPin`, `ChatBalao`, `Grafico`, `Trator`, `EstacaoClima`, `Lampada`, `Rede`.
- **`fx.tsx`**: `Grain` (textura de papel fixa), `Vignette`, `Portal` (o "o" do logo como íris entre eras), `Particles` (`brasa`, `poeira`, `vagalume`, `dados`), `typed`, `drawOffset`, e `BoilDef` (traço vibrando: só num elemento, por menos de 1 s, veja estilo.md).
- **`sound.tsx`**: `<Music name volume stopAt>`, `<Sfx name at volume length>`, `beatFrames()`, `TRAVESSIA_TURN` (quadro 288, onde a trilha `travessia` vira para o "hoje"). Nomes tipados: erro de digitação quebra o `tsc`.

## 5. Checklist (cada still e o arquivo final)

- [ ] Sem som, a ponte é clara em 3 s, e o último quadro sozinho conta a história.
- [ ] Gancho na tela até 0,5 s; algo se move já no primeiro quadro; mudança visual a cada 1 a 3 s.
- [ ] No máximo 3 textos, frases com até 6 palavras, tudo dentro da área segura.
- [ ] Urucum só no "antes", luz só no "hoje" (os dois juntos só no encontro final).
- [ ] A Guardiã aparece como especialista; nenhum estereótipo; os dois personagens se encontram no fim.
- [ ] Personagens nunca cortados pela borda, nunca flutuando, nunca atravessando objetos.
- [ ] Nada treme: grão fixo, sem `BoilDef` na cena inteira, brilhos lentos (mais de 20 quadros por ciclo), câmera sem chacoalhar.
- [ ] Pelo menos 2 vistas ou 2 planos diferentes no vídeo (biblioteca.md), para não ficar tudo no mesmo enquadramento.
- [ ] Cada contato tem som no mesmo quadro; ambiência ligada; trilha abaixo dos SFX.
- [ ] Toda referência está no acervo; nenhum número sem fonte; zero travessões.
- [ ] Arquivo 1080x1920, 30 fps, 15 a 25 s, -14 LUFS, pico até -1 dB.
- [ ] Legenda pronta (legenda.md) com a fonte, e `scripts/qa.sh` deu PASS.

## 6. Entrega

- O MP4 masterizado (`*-final.mp4`).
- Se quiserem áudio em alta do Instagram: uma versão sem `<Music>` (só SFX), para pôr o som no app na hora de postar.
- A legenda (`legenda.txt`) seguindo legenda.md, com a referência e a fonte.
- Anote a ideia em `conteudo/videos.md` no repo (data, formato, pergunta, saber, ferramenta) para não repetir.
