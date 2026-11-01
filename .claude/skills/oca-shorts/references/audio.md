# Som

Todos os arquivos são sintetizados por `template/scripts/audio.mjs` (`npm run audio`): osciladores, ruído, filtros e um reverb pequeno. Não há samples, áudio de IA nem gravações de terceiros, então o som é da OCA e pode ser publicado em qualquer plataforma, em qualquer duração.

Os timbres ancestrais (taquara batida, chocalho de sementes, flauta soprada, tambor) são **inspirados** em instrumentos como o *takuapu* e o *mbaraka*, nunca gravações nem reproduções de cantos Guarani. Muitos desses instrumentos são objetos rituais: não use o nome deles como efeito sonoro na legenda e não imite cantos sagrados. Se a OCA quiser música Guarani de verdade, o caminho é parceria com um coral ou artista Mbyá, com consentimento, pagamento e crédito.

## Licenças

Não existe duração que torne uma música com direitos "liberada": trechos de 10, 30 ou 60 segundos são detectados e crédito não substitui licença. Então:
1. **Padrão:** as trilhas abaixo, embutidas no MP4.
2. **Áudio em alta:** exporte uma versão sem `<Music>` (só SFX) e escolha o som no app do Instagram na hora de postar.
3. **Nunca** coloque música comercial no arquivo.
4. Bancos externos só com licença clara por arquivo: Mixkit (licença própria, uso comercial), Pixabay (Content License), Freesound **CC0** (CC-BY exige crédito na legenda). Anote a origem em `conteudo/creditos.md`.

## Trilhas

`<Music name="..." volume={0.28..0.38} />`. `beatFrames(nome)` dá quadros por batida a 30 fps; ponha ações repetidas nessa grade.

| Nome | BPM | Quadros/batida | Duração | Clima | Use para |
|---|---|---|---|---|---|
| `raiz` | 84 | 21,4 | 23 s, loop | taquara, chocalho, flauta, drone grave | o "antes" puro, origem, terra |
| `ceu` | 60 | 30 | 32 s, loop | noite, grilos, flauta lenta, sinos | astronomia, contemplação, reflexão |
| `travessia` | 100 | 18 | 28 s, toca uma vez | 4 compassos ancestrais; no **quadro 288** entra arpejo, bumbo e baixo | o formato Ponte: ponha a virada de era no 288 (`TRAVESSIA_TURN`) |
| `semente` | 96 | 18,75 | 20 s, loop | taquara e chocalho sob arpejo quente | o padrão: raiz + futuro, otimista |
| `circuito` | 112 | 16,1 | 26 s, loop | eletrônico limpo com chocalho no lugar do chimbal | IA, dados, sistemas, o "hoje" puro |
| `colheita` | 90 | 20 | 21 s, loop | maior, sinos, flauta, tambor suave | resultado, conclusão, o "depois" |
| `mutirao` | 104 | 17,3 | 18,5 s, loop | percussão coletiva: tambores, taquaras, palmas | comunidade, eventos, ecossistema |

## Efeitos

`<Sfx name="..." at={quadro} volume={0.4..0.8} />`, sempre no quadro exato do contato.

| Grupo | Nomes |
|---|---|
| Ambiência (loop) | `mata` (pássaros, insetos, vento), `noite` (grilos, sapos), `rio`, `fogueira`, `chuva`, `vento`, `tech-hum` (zumbido de equipamento, para o "hoje") |
| Ancestral | `bambu` (taquara no chão), `chocalho`, `tambor`, `flauta` (3 notas), `pau-de-chuva`, `madeira`, `pedra`, `palha`, `semente` (sementes caindo), `brasa`, `passo-terra` |
| Tecnologia | `scan`, `holo` (painel surge), `dados`, `ia` (sistema "pensando"), `drone`, `satelite` (ping), `power-up`, `click`, `tick`, `notify`, `success`, `glitch`, `typing` |
| Transição e acento | `portal` (sucção + brilho + impacto em 1,2 s), `whoosh`, `whoosh-short`, `whoosh-reverse`, `riser`, `boom`, `impact-soft`, `tape-stop`, `sparkle`, `pop`, `ding`, `page` |

## Mixagem que funciona no celular

- Trilha 0,28 a 0,38, sempre abaixo dos SFX. Ambiência 0,1 a 0,25 o vídeo todo.
- Contatos 0,4 a 0,8; o momento mais importante pode ir a 1.
- **Portal:** o impacto do `portal` está em 1,2 s (36 quadros). Comece-o 36 quadros antes da virada.
- Whoosh começa 1 a 2 quadros antes da mudança visual; riser termina no quadro do impacto.
- No máximo 3 sons começando no mesmo quadro. Picos somam: cada arquivo sai a -1 dB.
- Pausa antes da virada: `<Music stopAt>` + `tape-stop` 8 quadros antes, 0,2 a 0,4 s de quase silêncio, e a virada como som mais forte.
- Celular corta abaixo de ~150 Hz: junte `boom` com algo agudo (`ding`, `sparkle`).

## Narração gravada

- `<Locucao name="arquivo.wav" at={0} />` toca `public/audio/vo/arquivo.wav` (voz de uma pessoa, gravada; nunca voz gerada).
- `node scripts/pausas-vo.mjs public/audio/vo/arquivo.wav` lista cada frase (início e fim em segundos e em quadros) e marca as pausas de 0,7 s ou mais como fim de parágrafo; grava `arquivo.pausas.json`. Ajuste o limiar (`-35` dB) se a gravação tiver ruído.
- Com voz, a trilha cai para cerca de 0,12 e os SFX ficam entre 0,3 e 0,5.

## Loudness

- Depois do render, rode `bash scripts/master.sh out/<nome>.mp4`: loudnorm em dois passos para **-14 LUFS** e true peak -1,5 dBTP (padrão de Reels, Shorts e TikTok), vídeo copiado sem recompressão.
- Confira: `ffmpeg -i out/<nome>-final.mp4 -af ebur128 -f null -` mostra I perto de -14 LUFS.
- A cena modelo saiu do render a -16 LUFS e foi a -14,0 LUFS com pico de -1,4 dB.

## Criar um som novo

1. Acrescente um gerador em `MUSIC` ou `SFX` em `scripts/audio.mjs`, só com os blocos que já existem (`osc`, `noise`, `filter`, `shape`, `bell`, `flute`, `rattle`, `bamboo`, `drum`, `wood`, `crickets`...).
2. Acrescente o nome em `MUSIC_BPM` ou `SfxName` em `src/lib/sound.tsx`.
3. `node scripts/audio.mjs public/audio <nome>` e confira o nível com `ffmpeg -i arquivo -af volumedetect -f null -`.
4. Acrescente uma linha nesta tabela.
