# Formatos

Cinco jeitos de contar uma pergunta que atravessa o tempo, com os mesmos personagens, cenário e som. Escolha pelo que a ideia pede, não pelo último usado. Quadros a 30 fps.

---

## 1. Ponte (antes → hoje)

O formato principal e o da cena modelo `PleiadesIA`.

- **Para:** um saber ancestral e a ferramenta de hoje que responde à mesma pergunta.
- **Anatomia:**
  - 0 a 20: etiqueta `HÁ SÉCULOS` e o gancho (a pergunta) em barra urucum.
  - 20 a 260: a Guardiã resolve com o saber (olha o céu, planta, colhe). O objeto-ponte aparece e brilha. Uma etiqueta pequena pode nomear o saber (`EIXU · PLÊIADES`).
  - 270 a 306: **Portal**. A tela fecha no "o" do logo em cima do objeto-ponte e abre no "hoje". A virada cai no quadro 288 (`TRAVESSIA_TURN`) se a trilha for `travessia`.
  - 300 a 460: o Inovador com a ferramenta de hoje. O objeto-ponte continua no mesmo lugar.
  - 470 a 560: a Guardiã entra, os dois juntos sob o mesmo céu. Frase-ponte.
  - 560 a 600: end card.
- **Câmera:** contínua, um push-in leve em cada era. O portal é o único "corte".
- **Som:** `travessia` (vira sozinha no 288), ambiência por era, `portal` começando 36 quadros antes da virada.

## 2. Duelo de eras

As duas eras lado a lado, ao mesmo tempo, fazendo a mesma tarefa.

- **Para:** comparar ritmo, alcance ou escala sem dizer que um é "melhor". Os dois chegam; o de hoje chega mais longe ou mais rápido, o de antes deixou a base.
- **Anatomia:** tela dividida na vertical (esquerda "antes" com céu quente; direita "hoje" com céu noite). Etiquetas `ANTES` e `HOJE` no alto. N batidas da mesma ação. No fim, a linha divisória some e os dois cenários se fundem.
- **Câmera:** travada, push-in nos últimos 90 quadros.
- **Som:** `semente`; um SFX por batida de cada lado (`bambu`/`madeira` à esquerda, `click`/`dados` à direita).

## 3. Linha do tempo

Uma caminhada da Guardiã até o Inovador, passando por marcos.

- **Para:** mostrar a evolução de uma mesma solução em 3 a 5 marcos (ex.: folha de erva → erval → carreta → caminhão → rastreio por dados).
- **Anatomia:** uma trilha horizontal com marcos (texto curto em mono sobre cada um). A câmera acompanha da esquerda para a direita; a paleta vai do quente ao noite. Cada marco tem um objeto que se transforma no seguinte. No último marco o Inovador recebe o objeto.
- **Câmera:** pan contínuo com parallax das coxilhas (`Hills parallax={cam.x}`).
- **Som:** `travessia` ou `semente`; `whoosh-short` a cada marco, `success` no último.

## 4. Herança

Começa no hoje e revela a raiz.

- **Para:** "isso que você usa hoje tem origem aqui". Ótimo para a imprensa de 1700 (publicar com IA hoje) e para a OCA como casa (oca → Tava → OCA).
- **Anatomia:** abre no "hoje" com a ferramenta funcionando. A câmera recua; o portal se abre ao contrário (do "hoje" para o "antes") e mostra a origem. Fecha voltando ao "hoje" com o objeto-ponte agora com a marca do "antes" (o urucum aparece num detalhe).
- **Som:** `ceu` ou `colheita`; `whoosh-reverse` antes da revelação, `boom` suave no meio.

## 5. Mutirão

Muitos juntos fazem o que um sozinho não faz.

- **Para:** a missão da própria OCA: conectar pessoas, empresas e instituições. Eventos, captação, ecossistema.
- **Anatomia:** uma figura tenta mover algo grande sozinha. Outras chegam (`look="povo"`, tons por profundidade), e o objeto se move; no "hoje", as conexões entre as pessoas aparecem como linhas de luz (rede). Etiqueta final: `ninguém inova sozinho.`
- **Câmera:** travada e larga; os que chegam entram pela borda.
- **Som:** `mutirao`; `passo-terra` a cada chegada, `success` quando o objeto se move.

---

## Séries

- **"Do céu ao satélite"**: Ponte, mensal, um saber astronômico por episódio.
- **"A casa da inovação"**: Herança, sobre a OCA, a oca e a Tava.
- **"Mutirão"**: Mutirão, para divulgar eventos e conexões do ecossistema.
