# OCA Missões: guia do projeto

Repositório de conteúdo do @ocamissoes ("O Ecossistema de Inovação das Missões/RS!"). Aqui não há site nem app: só skills, marca, referências e exemplos.

## Skills

- `oca-shorts`: vídeos curtos 2D. Leia `.claude/skills/oca-shorts/SKILL.md`.
- `oca-carrossel`: carrosséis. Leia `.claude/skills/oca-carrossel/SKILL.md`.
- Trabalhe sempre numa cópia do `template/` fora do repo (scratchpad). Só volte ao repo com mudanças nas libs, nos templates, nas referências ou com um exemplo aprovado.

## Regras

- **Fatos:** só o que está em `references/acervo.md` das skills, com atribuição. Um fato novo entra no acervo com fonte, data e confiança antes de ir para o ar. O acervo existe igual nas duas skills: editou um, copie para o outro.
- **Respeito:** Guarani ou Mbyá-Guarani conforme a fonte, nunca "índios" no nosso texto. Nada de estereótipo visual ou sonoro. Saber ancestral como especialidade; o "hoje" continua o "antes", não o supera.
- **Marca:** paleta e fontes em `brand/README.md`. Urucum só no "antes", luz só no "hoje".
- **Áudio:** só o que `scripts/audio.mjs` gera, ou arquivos com licença clara anotados em `conteudo/creditos.md`. Nunca música comercial.
- **Texto:** português do Brasil, sem travessões.
- **Registro:** cada vídeo ou carrossel publicado ganha uma linha em `conteudo/videos.md` ou `conteudo/carrosseis.md`.

## Fluxo de trabalho

- Edite pelo GitHub (branch + PR). Não faça merge sem pedido explícito.
- Antes de commitar mudança em lib do vídeo: `npx tsc --noEmit` e um still do `FigureSheet` e da cena alterada.
