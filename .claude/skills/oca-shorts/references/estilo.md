# Estilo visual

Regras para todo vídeo parecer da OCA, qualquer que seja o formato. Na dúvida, tire algo.

## Paleta (do logo)

| Nome | Hex | Uso |
|---|---|---|
| barro | `#915729` | cor da marca: end card, coxilhas do meio, carrossel |
| creme | `#f8f4e1` | personagens, texto, estrelas |
| terra | `#4a2a12` | contornos, cabelo, chão do "antes" |
| noite | `#24140a` | fundo do "hoje", fundo do portal |
| argila | `#b9773f` | coxilhas ao longe |
| palha | `#d9b98a` | a oca, texto secundário em fundo escuro |
| mate | `#6f8a3c` | só plantas |
| **urucum** | `#c8462c` | acento do "antes": gancho, faixa da Guardiã, fogo |
| **luz** | `#3fd6c6` | acento do "hoje": telas, visor, circuitos, dados |

- Cada era tem um acento. Urucum e luz só aparecem juntos no encontro final.
- O acento é pouco (menos de 8% do quadro) e marca o que importa.
- Céu: gradiente quente ao entardecer no "antes", noite marrom no "hoje" (`Stage era`). Nunca azul, nunca outras cores de marca.

## Personagens

- **A Guardiã** (`look="raiz"`): cabelo longo, faixa urucum no peito, cesto ou semente. É a especialista do "antes": lê o céu, conhece a terra, planta, guarda o saber.
- **O Inovador** (`look="inova"`): cabelo curto, visor de luz, tablet. Usa as ferramentas de hoje.
- **Povo** (`look="povo"`): figuras sem detalhe, em tons de argila pela profundidade, para comunidade e plateia.
- Sem rosto (como no logo, a forma basta). Traço grosso arredondado com contorno terra, para ler bem no celular.
- Respeito: nada de cocar, pintura caricata, poses de "primitivo" ou de "salvador". Os dois personagens se encontram no fim, lado a lado, no mesmo tamanho.
- Poses: exagere 20% sobre o natural. Pés no chão (`y` é a altura dos pés). Folha de modelo: `FigureSheet`.

## Cenário

- Coxilhas em camadas (`Hills`), a oca (`Oca`), a fachada missioneira (`Ruina`, estilizada, não é levantamento do monumento), céu com estrelas e as Plêiades.
- No "hoje" o cenário é o mesmo, à noite: o lugar não muda, as ferramentas sim.
- Assinatura visual: **raízes que viram circuitos** (`CircuitRoots`) saindo das plantas. Use em todo "hoje" que tenha terra.

## Composição

- Quadro 1080x1920. Ação entre y 700 e y 1400; textos entre y 220 e y 700; horizonte entre y 1150 e y 1260; nada importante abaixo de y 1500.
- Câmera: `zoom` por volta de 1,2 e `y` 1000 no mundo (como na cena modelo), para os personagens ficarem grandes.
- No máximo 2 personagens + 1 tipo de objeto por cena (o povo conta como um).
- Gramática de planos: contínua (padrão, com push-in leve) ou cortes secos a cada 1,2 a 2,7 s (`pickShot`), alternando aberto e fechado. Nunca tremida de câmera.
- O último quadro é a capa: mostra a ponte e a frase final.

## Câmera: planos, não miniatura

Lições do bang-motion (MIT, `references/tecnicas.md` no repo), adaptadas ao 9:16:
- **A câmera vai até o elemento que está contando a história.** "Dar zoom" é trocar o tamanho do plano (aberto, médio, close, detalhe) a cada batida, não um push de 5% que ninguém vê. Padrão: segura 0,5 s, um movimento por batida, segura (com um push lento de até 3% para o quadro não morrer). Use `camera(f, chaves)` de `lib/world.tsx`: o zoom interpola em escala logarítmica.
- **Nada de miniatura.** Personagem pequeno no meio de muito chão vazio parece slide. No plano mais aberto a figura ocupa uns 25 a 30% da altura; nos closes, 45 a 60%. Zoom mínimo de trabalho 1,25 (o 1,18 da base só no portal).
- **Close não corta personagem.** Se o close é no objeto (painel, QR, balões), enquadre de modo que o personagem fique inteiro, ou fora de vez. Meio corpo na borda é erro.
- **Zona do texto.** Nos closes, nenhum objeto do mundo entra na faixa de tela acima de y 450, onde ficam a etiqueta de era e a frase.
- **Não troque de lugar à toa.** Frase nova não exige cena nova: mude a ação ou o plano no mesmo lugar. Troca de lugar dentro da mesma era: `Deslize` (96 px + desfoque, ver `fx.tsx`). Entre eras: o `Portal`, uma vez por vídeo.
- **Variar o tamanho:** dois planos seguidos do mesmo tamanho ficam chapados.

## Vida no cenário

- Cada cena tem pelo menos **6 coisas se movendo devagar** além dos personagens: capim (`Capim`), pássaros cruzando (`Passaros`), fumaça (`Fumaca`), folhas do erval, nuvens, vaga-lumes, brasas, luzes da cidade ao longe no "hoje" (`LuzesLonge`), o anel da marca girando no fundo (`AnelFundo`), dados subindo, sensores pulsando. No Ponte, `Hills capim` e `Hills luzes` já colocam parte disso.
- O fundo nunca fica parado, mas nunca compete com o personagem: movimentos lentos (ciclos de 1,5 s ou mais), cores do lado escuro da paleta, opacidade baixa.
- **Personagem vivo parado:** as ações já somam uma respiração lenta (tronco, cabeça e braços, ciclos de 1,7 a 2,3 s, fase própria por personagem) e a **sombra de contato** sob os pés. Nunca desligue a sombra (`sombra={0}`) a não ser que o personagem esteja de fato no ar ou sobre outro objeto.

## Movimento

- Tudo com `easeInOut`, `easeOut` ou `settle`. Só máquinas (satélite, drone, dados) andam linear.
- Antecipação de 2 a 4 quadros antes de um gesto; `settle` nos pousos.
- Um detalhe secundário por cena: vaga-lumes, poeira de terra, brasas, dados subindo. Somem em até 1,5 s.
- Determinismo: tudo é função do quadro; variedade com `hash01`, nunca `Math.random()`.
- **Nada de tremor.** No celular, tremor parece erro de render, cansa o olho e piora a recompressão do Instagram (ruído que muda a cada quadro come o bitrate e vira borrão). Então:
  - `Grain` é fixo (a textura de papel não se mexe); `animated` só num momento de "filme antigo", curto;
  - `BoilDef` (traço vibrando) nunca na cena inteira: no máximo um elemento, por menos de 1 s, com `scale` 2 a 3, para lembrança ou sonho;
  - brilhos e cintilações lentos (ciclo de 20 quadros ou mais) e de pouca amplitude;
  - movimento de câmera sempre suave (`easeInOut`), nunca chacoalhado.
- O que dá vida sem tremer: personagens que respiram e andam, objetos que entram com `settle`, partículas lentas, um push-in de câmera.

## Texto

- **Ritmo assimétrico:** o texto entra firme em 18 quadros (mola, sobe 26 px e o desfoque some) e sai rápido em 9 quadros. Já está no `Label`.
- **No máximo dois níveis de texto por quadro** (etiqueta de era + frase). O rótulo do saber agora vive **no mundo** (`RotuloMundo`, ao lado do objeto e andando com a câmera), não como terceiro nível na tela.

- **Etiqueta de era**: `EraTag`, mono, maiúsculas, com traço no acento da era (`HÁ SÉCULOS`, `EM 1700`, `HOJE`).
- **Gancho**: `Label bar={URUCUM}`, até 5 palavras, uma pergunta, na tela até 0,5 s.
- **Frase**: `Label`, Outfit 700, minúsculas, 64 a 78 px, até 6 palavras, termina com ponto. A última palavra importante pode ir em luz (no "hoje").
- **Rótulo do saber**: `RotuloMundo` em palha (terra de dia), no mundo, ao lado do objeto (`EIXU · PLÊIADES`). Passe o `zoom` da câmera para o tamanho na tela ficar constante.
- Entrada com mola e giro leve; saída com colapso rápido, nunca um fade lento.
- No máximo 2 textos na tela ao mesmo tempo (mais o rótulo no mundo). Nunca hashtag, link, emoji ou travessão na tela.

## Efeitos (de outros projetos, ver `references/tecnicas.md` no repo)

- `Grain`: textura de papel/argila fixa sobre tudo (opacidade 0,06 a 0,08).
- `Vignette`: bordas escuras suaves.
- `BoilDef`: traço vibrando "desenhado à mão". Só um elemento, menos de 1 s (lembrança, sonho). Nunca a cena toda.
- `Portal`: o "o" do logo como íris entre eras. É a transição da marca; use uma vez por vídeo.
- `Particles`: `vagalume` e `brasa` no "antes", `dados` no "hoje".
- `GlowDef`: brilho só em elementos de luz.

## End card

- `EndCard`: wordmark creme sobre barro, entra da esquerda para a direita, com "ECOSSISTEMA DE INOVAÇÃO DAS MISSÕES". 1,3 a 1,6 s.
- O wordmark é um traçado vetorial do avatar do Instagram (`brand/`). Troque pelo vetor oficial quando a OCA enviar.

## Autoteste

Sem som, só o último quadro: alguém de fora entende que é a mesma pergunta em duas eras? Há um acento por era? Dá para tirar algo sem perder a mensagem? Então tire.
