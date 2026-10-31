# Biblioteca visual

Tudo o que a skill já sabe desenhar, pronto para usar e para mostrar à equipe. As folhas ficam em `biblioteca/` (imagens) e são composições do template (`src/scenes/Biblioteca.tsx`), então qualquer mudança nas libs aparece nelas: rode `bash scripts/biblioteca.sh` e copie `out/biblioteca/*.webp` para `biblioteca/`.

Antes de escrever uma cena, abra as folhas e escolha daqui. Se faltar algo, crie a peça na lib certa, acrescente na folha e re-renderize, para a biblioteca crescer junto com os vídeos.

| Folha | O que mostra |
|---|---|
| [BibPersonagens](../biblioteca/BibPersonagens.webp) | A Guardiã e o Inovador em **3 vistas** (`view="frente" \| "perfil" \| "costas"`) e o povo em tons de profundidade |
| [BibPoses](../biblioteca/BibPoses.webp) | 15 poses e objetos de mão: `STAND`, `LOOK_UP`, `KNEEL`, `SIT`, `CARRY`, `walk()`, `HOLD`, `WAVE`, e as de frente `FRENTE_UP`, `FRENTE_OPEN`, `FRENTE_HOLD`, `FRENTE_WAVE`; props `cesto`, `semente`, `cuia`, `livro`, `tablet`, `celular` |
| [BibAntes](../biblioteca/BibAntes.webp) | Cenário e objetos do "antes": `Oca`, `Ruina`, `Erval`, `Roca`, `Sprout`, `Fogueira`, `Prensa`, `Livro`, `Cuia`, `Rio`, `Canoa`, `Sol` |
| [BibHoje](../biblioteca/BibHoje.webp) | Kit do "hoje": `Satellite`, `Drone`, `Nuvem`, `Celular`, `HoloPanel`, `Antena`, `Notebook`, `PainelSolar`, `Sensor`, `CircuitRoots`, `DataMotes` |
| [BibCeus](../biblioteca/BibCeus.webp) | O mesmo lugar em `hora="dia" \| "entardecer" \| "noite"` nas duas eras (`Stage era hora`) |
| [BibAcoes](../biblioteca/BibAcoes.webp) | As ações de `lib/acoes.tsx` (todas menos `virar`), cada uma no meio do movimento (tabela em fichas.md) |
| [BibNatureza](../biblioteca/BibNatureza.webp) | `Nuvens` (dia e noite), `Chuva`, `Ema` (a ave da constelação de inverno), `QueroQuero` parado e voando |
| [BibComunidade](../biblioteca/BibComunidade.webp) | `OcaModerna` (a OCA de hoje), `Rede`, `ChatBalao` (pessoa e IA), `Lampada`, `Grafico`, `QRCode`, `MapPin`, `SacoErva`, `Trator`, `EstacaoClima` |
| [BibPlanos](../biblioteca/BibPlanos.webp) | A mesma cena nos 5 planos de `shot(tipo, ponto)`: `aberto`, `medio`, `close`, `detalhe`, `ceu`, mais o portal no meio |

## Vistas e poses

- `view="perfil"` é o padrão e usa `facing` (1 direita, -1 esquerda). Use para andar, trabalhar, apontar.
- `view="frente"` é para falar com o público, comemorar, acolher, mostrar algo no peito. Use as poses `FRENTE*`: nelas, `a` positivo sempre aponta para fora do corpo (as poses de perfil cruzariam os braços).
- `view="costas"` é para olhar o horizonte, o céu ou caminhar para longe (bom para a abertura e para o loop).
- Misture vistas para dar ritmo: perfil na ação, frente no encontro final, costas na contemplação.

## Planos (perspectivas)

- `shot("aberto", pé_do_sujeito)`: contexto, o lugar todo.
- `shot("medio", ...)`: corpo inteiro e gesto. O plano padrão.
- `shot("close", ...)`: tronco e cabeça, emoção, o momento da descoberta.
- `shot("detalhe", ponto)`: mãos, semente, tela; passe o ponto do objeto, ele fica no centro.
- `shot("ceu", ...)`: a câmera sobe para o céu acima do sujeito (estrelas, satélite).
- Combine com `pickShot` para cortes secos (1,2 a 2,7 s por plano, alternando aberto e fechado), ou interpole dois planos com `lerp` para um movimento contínuo e suave.

## Exemplos de combinação

- **Abertura contemplativa:** `costas` + `LOOK_UP` em `shot("aberto")`, `hora="noite"`, depois corte para `shot("ceu")`.
- **Descoberta:** `close` na Guardiã com `KNEEL` + `semente`, corte para `detalhe` nas mãos e no `Sprout` crescendo.
- **Hoje:** `medio` no Inovador com `HOLD` + `tablet`, corte para `detalhe` no `HoloPanel`, volta ao `aberto` com o `Satellite`.
- **Encontro:** os dois `view="frente"`, Guardiã `FRENTE_OPEN`, Inovador `FRENTE_HOLD`, em `medio`.
