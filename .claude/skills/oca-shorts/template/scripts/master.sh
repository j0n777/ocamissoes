#!/usr/bin/env bash
# Loudness master for Reels/Shorts: two-pass loudnorm to -14 LUFS, true peak
# -1.5 dBTP, video stream copied untouched.
#   bash scripts/master.sh out/<name>.mp4 [out/<name>-final.mp4]
set -euo pipefail
IN="$1"; OUT="${2:-${IN%.mp4}-final.mp4}"
TARGET="I=-14:TP=-1.5:LRA=11"
STATS=$(ffmpeg -hide_banner -nostats -i "$IN" -af "loudnorm=$TARGET:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -v error -y -i "$IN" -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -af "loudnorm=$TARGET:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  "$OUT"
echo "in: $(get input_i) LUFS, tp $(get input_tp) dBTP -> $OUT"
