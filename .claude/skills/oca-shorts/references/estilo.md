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

- **Etiqueta de era**: `EraTag`, mono, maiúsculas, com traço no acento da era (`HÁ SÉCULOS`, `EM 1700`, `HOJE`).
- **Gancho**: `Label bar={URUCUM}`, até 5 palavras, uma pergunta, na tela até 0,5 s.
- **Frase**: `Label`, Outfit 700, minúsculas, 64 a 78 px, até 6 palavras, termina com ponto. A última palavra importante pode ir em luz (no "hoje").
- **Etiqueta pequena**: `Label mono size 26` em palha, para nomear o saber (`EIXU · PLÊIADES`).
- Entrada com mola e giro leve; saída com colapso rápido, nunca um fade lento.
- No máximo 3 textos ao mesmo tempo. Nunca hashtag, link, emoji ou travessão na tela.

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
