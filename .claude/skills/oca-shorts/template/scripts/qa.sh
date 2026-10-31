#!/usr/bin/env bash
# Final gate before delivery. Renders the composition, masters the loudness,
# checks the file and the caption, and builds a contact sheet to look at.
#   bash scripts/qa.sh <CompositionId>
#   MAX_S=60 bash scripts/qa.sh <Id>      # narrated explainer (default 15 to 25.5 s)
# Output: out/<Id>-final.mp4, out/<Id>-contato.png and a PASS/FAIL report.
# The caption is read from src/videos/<Id>.legenda.txt (or out/<Id>.legenda.txt).
set -uo pipefail
ID="$1"
mkdir -p out
fail=0
ok() { echo "  OK    $1"; }
ko() { echo "  FALHA $1"; fail=1; }

echo "1. tipos"
if npx tsc --noEmit >/dev/null 2>&1; then ok "tsc"; else ko "tsc (rode npx tsc --noEmit)"; fi

echo "2. render"
if bash scripts/render.sh video "$ID" "out/$ID.mp4" >"out/$ID.render.log" 2>&1; then ok "render"; else ko "render (veja out/$ID.render.log)"; echo; tail -20 "out/$ID.render.log"; exit 1; fi
bash scripts/master.sh "out/$ID.mp4" "out/$ID-final.mp4" >/dev/null 2>&1 || ko "master"
F="out/$ID-final.mp4"

echo "3. arquivo"
IFS=, read -r W H FPS <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$F")"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
AUD=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$F" | head -1)
[ "$W" = 1080 ] && [ "$H" = 1920 ] && ok "1080x1920" || ko "tamanho ${W}x${H}"
[ "$FPS" = "30/1" ] && ok "30 fps" || ko "fps $FPS"
MIN_S="${MIN_S:-15}"; MAX_S="${MAX_S:-25.5}"
awk -v d="$DUR" -v a="$MIN_S" -v b="$MAX_S" 'BEGIN{exit !(d>=a && d<=b)}' && ok "duração ${DUR}s" || ko "duração ${DUR}s (${MIN_S} a ${MAX_S} s)"
[ "$AUD" = audio ] && ok "tem áudio" || ko "sem áudio"
LOUD=$(ffmpeg -hide_banner -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1)
I=$(echo "$LOUD" | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
TP=$(echo "$LOUD" | grep -E "^\s+Peak:" | tail -1 | awk '{print $2}')
awk -v i="$I" 'BEGIN{exit !(i>=-15 && i<=-13)}' && ok "loudness ${I} LUFS" || ko "loudness ${I} LUFS (alvo -14)"
awk -v p="$TP" 'BEGIN{exit !(p<=-1.0)}' && ok "pico ${TP} dBTP" || ko "pico ${TP} dBTP (máx -1)"

echo "4. legenda"
CAP="src/videos/$ID.legenda.txt"; [ -f "$CAP" ] || CAP="out/$ID.legenda.txt"
if [ -f "$CAP" ]; then node scripts/checa-legenda.mjs "$CAP" || fail=1; else ko "legenda não encontrada ($CAP)"; fi

echo "5. folha de contato"
ffmpeg -v error -y -i "$F" -vf "select='not(mod(n\,75))',scale=270:-1,tile=4x2" -frames:v 1 -vsync 0 "out/$ID-contato.png" && ok "out/$ID-contato.png (um quadro a cada 2,5 s): abra e confira"

echo
if [ $fail = 0 ]; then echo "PASS: $F pronto para entrega."; else echo "FAIL: corrija os itens acima antes de entregar."; fi
exit $fail
