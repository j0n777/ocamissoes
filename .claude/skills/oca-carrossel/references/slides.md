# Arquétipos de slide

Todos estão em `template/slides.html`. Copie uma `<section>`, troque o texto e mantenha os ids `s1..sN` em sequência.

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
| CTA | `s-cta` | wordmark grande, título, barra creme chanfrada com @ocamissoes e seta | Sempre o último |

## Criar um arquétipo novo

Fique no mesmo sistema:
- Um título `.big` (84 a 150 px), um `.sub` opcional (40 a 46 px), etiquetas mono (20 a 30 px), um acento.
- Visuais só com HTML/SVG: anéis, linhas, pontos, barras, grade, divisão de tela. Nunca imagem de banco ou de IA.
- Ideias que cabem:
  - **Mapa estilizado**: pontos das reduções ligados por linhas (só com coordenadas aproximadas e sem afirmar distâncias sem fonte);
  - **Céu**: as Plêiades em pontos creme sobre noite, ligadas por uma linha;
  - **Número + barra**: um dado de hoje com fonte, em barra luz;
  - **Pergunta**: só uma pergunta em tipo enorme, para engajar nos comentários.

## Fotos (quando a OCA enviar)

- Use só fotos de eventos ou pessoas da OCA, com autorização.
- Classe sugerida (acrescente ao CSS):
  `.photo { filter: sepia(.35) saturate(.8) contrast(1.05); }` e um gradiente terra por cima para o texto ler.
- Nunca fotos de povos indígenas sem autorização e contexto.
