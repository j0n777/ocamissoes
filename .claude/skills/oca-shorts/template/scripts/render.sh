#!/usr/bin/env bash
# Renders a composition with Chrome headless shell (no GPU needed for SVG).
#   bash scripts/render.sh still <CompositionId> <frame> [out.png]
#   bash scripts/render.sh video <CompositionId> [out.mp4]
# Set REMOTION_BROWSER to override the browser binary.
set -euo pipefail
MODE="$1"; COMP="$2"
BROWSER="${REMOTION_BROWSER:-$(find /opt/pw-browsers -name chrome-headless-shell -type f 2>/dev/null | head -1)}"
ARGS=()
[ -n "$BROWSER" ] && ARGS+=(--browser-executable="$BROWSER")
mkdir -p out
if [ "$MODE" = still ]; then
  FRAME="$3"; OUT="${4:-out/${COMP}-f${FRAME}.png}"
  npx remotion still src/index.ts "$COMP" "$OUT" --frame="$FRAME" "${ARGS[@]}"
else
  OUT="${3:-out/${COMP}.mp4}"
  npx remotion render src/index.ts "$COMP" "$OUT" --codec=h264 --crf=18 "${ARGS[@]}"
fi
