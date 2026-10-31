# Arquétipos de slide

Os estilos ficam em `template/assets/oca.css`, compartilhado por todos os carrosséis. Os exemplos de cada tipo estão em `template/slides.html` e `template/exemplo-suarez.html`. Copie uma `<section>`, troque o texto e mantenha os ids `s1..sN` em sequência.

Base:
- `.slide` tem 1080x1350, padding de 80 px e é uma coluna: `margin-top: auto` empurra o título para o terço de baixo.
- Fundo por classe: `.g-barro`, `.g-creme`, `.g-noite`. Alterne ao longo do carrossel.
- Wordmark: `assets/oca-wordmark-creme.svg` em fundo escuro ou barro, `assets/oca-wordmark-terra.svg` no creme.
- Textura de papel automática em todo slide (`.slide::after`).
- Acentos: `.u` (urucum) e `.l` (luz). Fonte: `.src`. Etiqueta: `.tag` com `<i>` colorido.

| Arquétipo | Classe | Visual | Use para |
|---|---|---|---|
| Capa | `s-capa` | anel do "o" grande saindo pelo canto, etiqueta, título de 148 px, "Arraste" | Sempre o slide 1 |
| Fato | `s-fato` | número ou ano gigante em urucum (330 px), título, apoio e fonte | Um dado histórico com data |
| Linha do tempo | `s-linha` | pontos numa linha; o primeiro urucum, o último luz com brilho | Antes → hoje em 3 a 5 marcos |
| Destaque | `s-destaque` | aspas grandes em urucum, título, apoio, fonte | O detalhe mais surpreendente |
| Ponte | `s-ponte` | metade de cima barro ("Antes"), metade de baixo noite ("Hoje"), o "o" do logo na emenda | O coração: mesma necessidade, duas eras |
| Reflexão | `s-reflexao` | fundo noite, anel em luz bem sutil, título grande e apoio | A ideia que fica |
| Lista | `s-lista` | título no alto e até 3 cartões numerados em mono | Algo útil: passos, ferramentas, perguntas |
| Imagem | `s-imagem` | imagem chanfrada saindo pela direita (720 px de altura), título, apoio e crédito | A prova: documento, lugar, objeto. Ver imagens.md |
| Fundo com imagem | `.bg-img` dentro de qualquer slide | imagem em duotone atrás do texto, com degradê barro | Capa ou reflexão com clima (crédito na legenda) |
| Número | `s-numero` | número de hoje gigante em luz, barra medidora (`<i style="width: 33.9%">`), título de leitura, apoio com a pesquisa e `.src` | O "hoje" com dado real (pilar Missões em dados). Exemplo em exemplo-suarez.html |
| Pergunta | `s-pergunta` | uma pergunta enorme e o ícone de comentário com um pedido curto | Penúltimo slide, para abrir os comentários. Exemplo em exemplo-suarez.html |
| CTA | `s-cta` | wordmark grande, título, barra creme chanfrada com @ocamissoes e seta | Sempre o último |

## Criar um arquétipo novo

Fique no mesmo sistema:
- Um título `.big` (84 a 150 px), um `.sub` opcional (40 a 46 px), etiquetas mono (20 a 30 px), um acento.
- Visuais desenhados em HTML/SVG (anéis, linhas, pontos, barras, grade, divisão de tela) e imagens só pelas regras de imagens.md. Nunca banco de imagens sem licença.
- Ideias que cabem:
  - **Mapa estilizado**: pontos das reduções ligados por linhas (só com coordenadas aproximadas e sem afirmar distâncias sem fonte);
  - **Céu**: as Plêiades em pontos creme sobre noite, ligadas por uma linha;
  - **Número + barra**: um dado de hoje com fonte, em barra luz;
  - **Pergunta**: só uma pergunta em tipo enorme, para engajar nos comentários.

## Imagens

- Envolva a imagem num `<div class="img doc|duo|ia">` (ou `img duo bg-img` para fundo). Regras completas em imagens.md.
- `object-position` decide o recorte: para página de livro, mostre o topo (`50% 10%`).
- Fotos da OCA (eventos): use `.doc`; com pessoas, só com autorização.
- Nunca fotos de povos indígenas sem autorização e contexto.
