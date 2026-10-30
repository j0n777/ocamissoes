#!/usr/bin/env bash
# Renders the visual library sheets (src/scenes/Biblioteca.tsx) to out/biblioteca/*.webp.
#   bash scripts/biblioteca.sh
set -euo pipefail
mkdir -p out/biblioteca
for c in BibPersonagens BibPoses BibAntes BibHoje BibCeus BibPlanos; do
  bash scripts/render.sh still "$c" 40 "out/biblioteca/$c.png" >/dev/null
  ffmpeg -v error -y -i "out/biblioteca/$c.png" -quality 85 "out/biblioteca/$c.webp" && rm "out/biblioteca/$c.png"
  echo "out/biblioteca/$c.webp"
done
