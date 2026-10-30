# Imagens de referência

Imagem dá prova e dá vontade de parar no slide. Todo carrossel da OCA tem **pelo menos 1 e no máximo 3 slides com imagem**, e cada imagem tem origem e licença registradas.

## 1. De onde vem a imagem (nesta ordem)

| Prioridade | Fonte | Quando usar | Como |
|---|---|---|---|
| 1 | **Documento ou foto real com licença livre** | Quando a imagem é a prova do que o slide diz (a folha de rosto de 1724, as ruínas de São Miguel) | Wikimedia Commons (`scripts/commons.mjs`), Internet Archive (obras antigas em domínio público), acervos que permitem reuso |
| 2 | **Fotos da própria OCA** | Eventos, pessoas e lugares do ecossistema | A equipe envia; use só com autorização de quem aparece |
| 3 | **Ilustração gerada por IA** | Para criar clima ou mostrar um conceito que não tem foto (a mesma pergunta em duas eras, uma cuia ao lado de um celular, um erval com sensores) | A ferramenta de imagem do próprio agente, ou `scripts/gerar-imagem.mjs`, sempre com o estilo da seção 3 |

Nunca use imagem de banco pago sem licença, print de outro perfil, ou imagem "achada no Google" sem licença clara.

## 2. Pesquisar (fontes reais)

```bash
node scripts/commons.mjs "ruínas São Miguel das Missões" 6
```

- Salva em `assets/ref/` a imagem e um `.json` com título, autor, licença, página e a linha de crédito pronta.
- Só passam licenças livres: domínio público, CC0, CC BY, CC BY-SA.
- Busque em português, espanhol e inglês (as Missões são também argentinas e paraguaias: "ruinas jesuíticas", "reducciones", "Jesuit missions").
- O Commons limita IPs compartilhados (erro 429): o script espera e tenta de novo; se insistir, rode mais tarde.
- **Internet Archive** (obras antigas): a página digitalizada sai pela URL IIIF
  `https://iiif.archive.org/iiif/<identificador>%24<página>/full/1400,/0/default.jpg` (página começa em 0).
  Exemplo: a folha de rosto de 1724 é `explicaciondeelc00yapu%245`. Obra antiga é domínio público; credite quem digitalizou.

## 3. Gerar com IA

Se o agente que roda a skill tem uma ferramenta de imagem própria (por exemplo, um modelo da OpenAI com geração de imagem), use-a direto com o prompt abaixo. Senão:

```bash
OPENAI_API_KEY=... node scripts/gerar-imagem.mjs cuia-e-celular retrato "uma cuia de chimarrão ao lado de um celular com um gráfico de safra, sobre uma mesa de madeira"
```

- Modelo: `OPENAI_IMAGE_MODEL`, padrão `gpt-image-2.5-flare` (guia de imagem da OpenAI, conferido em 2026-10-30). Qualidade: `OPENAI_IMAGE_QUALITY`, padrão `medium`.
- Formatos: `retrato` 1024x1536 (slide inteiro ou meia página), `paisagem` 1536x1024 (faixa de cima), `quadrado` 1024x1024.
- Salva `assets/ia/<nome>.webp` e um `.json` com modelo, prompt e data.

**Estilo da casa** (o script já acrescenta; use igual em outra ferramenta):

> Editorial flat illustration with a subtle printed-paper grain. Earthy palette only: terracotta #915729, cream #f8f4e1, dark brown #4a2a12, warm clay #b9773f, straw #d9b98a, muted green #6f8a3c. At most one small accent: urucum red #c8462c for the past, or teal light #3fd6c6 for technology. Simple bold shapes, soft shadows, calm composition with empty space at the bottom third for a headline. No text, no letters, no numbers, no logos, no watermarks, no frames. Respectful: no feathered headdresses, no face paint, no stereotypes; prefer hands, objects, landscapes and architecture to faces.

Escreva o assunto em uma frase concreta: objeto + lugar + luz. Bons assuntos: mãos plantando sementes sob as Plêiades; a fachada de pedra das ruínas ao entardecer com um drone ao longe; um erval com um sensor de solo; uma prensa de madeira ao lado de um notebook.

**Proibido gerar:**
- rostos ou corpos de pessoas Guarani ou de qualquer povo indígena (risco de estereótipo; use mãos, objetos, paisagem);
- "fotos históricas" ou documentos falsos (uma página antiga inventada, um retrato de época): o que é histórico vem de fonte real;
- pessoas reais identificáveis, marcas, logos e texto dentro da imagem (o texto é sempre do slide);
- qualquer coisa que pareça registro de um fato que não aconteceu.

## 4. No slide

- Tratamentos (classes em `slides.html`):
  - `.doc`: foto ou documento real, cor verdadeira levemente aquecida. Use quando a imagem é a prova.
  - `.duo`: duotone da marca (cinza multiplicado sobre barro). Use como fundo ou para unificar fotos de origens diferentes.
  - `.ia`: ilustração de IA já no estilo; sem filtro.
- Layouts: `s-imagem` (imagem em cima, título embaixo) e `.bg-img` (fundo duotone atrás do texto, como na capa do modelo).
- **Crédito sempre visível** no slide da imagem, em `.src`: `Imagem: <autor>, <licença>, via <fonte>` ou `Ilustração gerada com IA`. Imagem usada só como fundo pode ter o crédito na legenda.
- Imagem de IA nunca aparece num slide de fato histórico sem o aviso "Ilustração gerada com IA".

## 5. Registro

- Cada imagem de terceiros publicada ganha uma linha em `conteudo/creditos.md` (arquivo, origem, licença, crédito, onde foi usada).
- CC BY-SA: além do crédito, cite a licença (ex.: "CC BY-SA 4.0").
- Guarde o `.json` junto da imagem no projeto do carrossel até a publicação.
