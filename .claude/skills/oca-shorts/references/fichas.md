# Fichas: o caminho rápido (e seguro) para um vídeo

Para o formato Ponte, **não escreva código de cena**. Preencha uma ficha (`PonteSpec`) escolhendo uma cena do "antes" e uma do "hoje" nos menus abaixo. O template cuida de tempo, câmera, portal, trilha, sons, encontro e end card, e confere os textos: se uma regra for quebrada (palavras demais, travessão, "índio", sem fonte), o render para com a lista do que corrigir.

Só escreva uma cena à mão (como `PleiadesIA.tsx`) quando nenhuma combinação dos menus servir. Se a nova cena ficar boa, transforme-a em mais uma opção do menu (seção 5).

## 1. Passo a passo

1. Rode o motor de ideação (ideacao.md) e confira o saber no acervo.
2. Escolha `antes.cena` e `hoje.cena` nos menus (seções 2 e 3).
3. Crie `src/videos/<Id>.ts` copiando `ErvaRastreio.ts` e preencha.
4. Registre a ficha em `src/videos/index.ts` (`PONTES`).
5. Escreva a legenda em `src/videos/<Id>.legenda.txt` (legenda.md).
6. `npx tsc --noEmit`, depois stills de conferência:
   ```bash
   bash scripts/render.sh still <Id> 40      # antes
   bash scripts/render.sh still <Id> 282     # portal
   bash scripts/render.sh still <Id> 400     # hoje
   bash scripts/render.sh still <Id> 530     # encontro
   ```
7. `bash scripts/qa.sh <Id>`: render, master a -14 LUFS, checagens, legenda e folha de contato. Só entregue com **PASS** e depois de abrir `out/<Id>-contato.png`.

## 2. Menu "antes" (`antes.cena`)

| Cena | O que acontece (0 a 270) | Hora | Bom para | Rótulo sugerido |
|---|---|---|---|---|
| `ceu` | A Guardiã anda até a roça, olha e aponta as Plêiades (que brilham e se ligam), ajoelha e planta; brotos nascem | entardecer | calendário, previsão, dados do céu | `EIXU · PLÊIADES` |
| `lua` | Olha a Lua mudando de fase, depois colhe no erval | entardecer | ciclos, tempo certo, manejo | `FASES DA LUA` |
| `erval` | Anda até o erval, colhe folhas, carrega o cesto | dia | erva-mate, produto da região, cadeia produtiva | `KA'A · ERVA-MATE` |
| `prensa` | Puxa a alavanca da prensa três vezes, segura o livro impresso | entardecer | registrar e espalhar saber, publicar, comunicação | `PRENSA · 1700` |
| `fogueira` | Fala e gesticula para o povo sentado ao redor do fogo | noite | ensino, comunidade, saber passado de voz em voz | `DE VOZ EM VOZ` |

## 3. Menu "hoje" (`hoje.cena`)

| Cena | O que acontece (288 a 466) | Painel (`hoje.painel`) | Bom para |
|---|---|---|---|
| `satelite` | O Inovador digita no tablet; um satélite cruza e "pinga" a roça; raízes viram circuito; o painel escolhe a melhor barra | sim (ex.: `JANELA DE PLANTIO`) | agro de precisão, previsão, dados de satélite, IA |
| `sensor` | Um drone cruza; três sensores de solo acendem; o gráfico sobe; o celular avisa | não | IoT, monitoramento, alerta, irrigação |
| `rastreio` | O saco de erva tem etiqueta; o celular escaneia; o QR aparece; um pino cai no mapa | não | rastreabilidade, origem, marca regional, logística |
| `ia-texto` | Uma pergunta e a resposta da IA aparecem em balões; os dados sobem para a nuvem | não | IA generativa, escrita, tradução, atendimento, registro do saber |
| `rede` | A OCA moderna acende; uma rede de conexões se desenha entre pessoas e empresas | não | ecossistema, eventos, parcerias, a própria OCA |

Qualquer "antes" combina com qualquer "hoje". Combinações fortes: `ceu`+`satelite`, `lua`+`sensor`, `erval`+`rastreio`, `prensa`+`ia-texto`, `fogueira`+`rede`.

## 4. Campos e limites (checados no render)

| Campo | Regra |
|---|---|
| `id` | PascalCase, sem espaço (vira o nome da composição) |
| `pergunta` | até 5 palavras, termina com `?` (gancho em barra urucum) |
| `antes.tag` | opcional; padrão `HÁ SÉCULOS`. Use `EM 1700`, `NAS MISSÕES` quando a fonte der a época |
| `antes.rotulo` | opcional; até 3 palavras, nomeia o saber |
| `antes.frase` | até 6 palavras, termina com ponto |
| `hoje.frase` | até 6 palavras, termina com ponto |
| `hoje.painel` | opcional; até 3 palavras (só `satelite`) |
| `ponte` | duas linhas de até 4 palavras; a segunda aparece em luz |
| `referencia` | obrigatório: a fonte do saber, igual ao acervo |

Em todos os textos: sem travessão, sem "índio". Textos longos encolhem sozinhos para caber na margem, mas encolher demais é sinal de texto longo: corte palavras.

## 5. Ações (`lib/acoes.tsx`), para cenas novas

Personagem = posição + lista de batidas. O sistema calcula a pose em cada quadro e já coloca os sons (passos, sementes, cliques). Folha visual: `biblioteca/BibAcoes.webp`.

```tsx
const g = ator({ x: 240, y: GROUND }, [
  { de: 20, ate: 60, faz: "andar", x: 420 },
  { de: 60, ate: 150, faz: "olhar-ceu" },
  { de: 152, ate: 260, faz: "plantar" },
]);
<AtorFig a={g} f={f} look="raiz" size={340} prop="semente" />   // no mundo
<Sons a={g} />                                                    // junto dos sons
```

| `faz` | O que é | Som automático |
|---|---|---|
| `parado` | em pé, respirando | |
| `andar` (`x`) | anda até `x` e vira para lá | passos a cada 10 quadros |
| `olhar-ceu` | olha para cima apontando | |
| `apontar` | braço reto para a frente (alavanca, mostrar) | |
| `ajoelhar` | ajoelha | palha |
| `plantar` | ajoelhado, enterra sementes a cada 24 quadros | palha + semente |
| `colher` | estica o braço para a árvore a cada 30 quadros | palha |
| `segurar` | segura no peito e olha (tablet, livro, celular) | |
| `digitar` | segura o tablet e toca | cliques baixos |
| `acenar` | acena | |
| `carregar` | carrega com os dois braços | |
| `sentar` | senta no chão | impacto suave |
| `beber-mate` | sentado, leva a cuia à boca de vez em quando | |
| `entregar` | estende o braço para entregar algo | whoosh curto |
| `virar` (`facing`) | vira de lado na hora | |
| `comemorar` | de frente, braços para cima, pulinhos | pop |
| `acolher` | de frente, braços abertos | |
| `mostrar` | de frente, objeto no peito | |
| `acenar-frente` | de frente, acena | |

Regras:
- As de frente (`comemorar`, `acolher`, `mostrar`, `acenar-frente`) trocam a vista na hora: ponha um corte de câmera no mesmo quadro.
- Entre batidas o personagem fica na última pose; cada batida entra suave em até 12 quadros.
- O objeto de mão (`prop`) é do desenho, não da ação: troque o `prop` no quadro em que a ação muda (ex.: `prop={f < 150 ? "cesto" : "semente"}`).

## 6. Criar uma opção nova no menu

1. Acrescente o nome em `CenaAntes` ou `CenaHoje` em `src/formatos/Ponte.tsx`.
2. Escreva a função no registro `ANTES` ou `HOJE`, retornando `mundo`, `atores`, `sons`, `foco` (onde o portal fecha, em coordenadas de tela) e, se precisar, `hora` e `defs`.
3. No "hoje", o Inovador termina em pé em x 400 até o quadro 466 (o encontro depende disso).
4. Faça uma ficha de teste, rode `qa.sh`, e acrescente a linha na tabela deste arquivo.
