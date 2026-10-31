import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, easeOut, progress, settle } from "./anim";

// OCA Missões identity for video. The palette comes from the logo (barro,
// creme, terra); two accents tell the eras apart: URUCUM belongs to the
// ancestral side ("antes"), LUZ to the new side ("hoje"). Never mix both
// accents in one shot except in the final frame, where the eras meet.

export const W = 1080;
export const H = 1920;

export const BARRO = "#915729"; // logo background, the brand colour
export const CREME = "#f8f4e1"; // logo letters, figures, text
export const TERRA = "#4a2a12"; // logo shadow, outlines, dark ground
export const NOITE = "#24140a"; // deepest background (night, "hoje")
export const ARGILA = "#b9773f"; // light clay, mid-tones, far hills
export const PALHA = "#d9b98a"; // straw, secondary text on dark
export const MATE = "#6f8a3c"; // erva-mate green, plants only
export const URUCUM = "#c8462c"; // ancestral accent
export const LUZ = "#3fd6c6"; // tech accent: screens, AI, circuits

export const FONT = '"Outfit", sans-serif';
export const MONO = '"JetBrains Mono", monospace';

export const Fonts = () => (
  <style>{`
    @font-face { font-family: "Outfit"; src: url(${staticFile("fonts/outfit-latin-wght-normal.woff2")}) format("woff2"); font-weight: 100 900; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212; }
    @font-face { font-family: "Outfit"; src: url(${staticFile("fonts/outfit-latin-ext-wght-normal.woff2")}) format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF; }
    @font-face { font-family: "JetBrains Mono"; src: url(${staticFile("fonts/jetbrains-mono-latin-wght-normal.woff2")}) format("woff2"); font-weight: 100 800; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: "JetBrains Mono"; src: url(${staticFile("fonts/jetbrains-mono-latin-ext-wght-normal.woff2")}) format("woff2"); font-weight: 100 800; unicode-range: U+0100-024F, U+1E00-1EFF; }
  `}</style>
);

const MARGIN = 64;

// A line of on-screen text, centred on `y`, clamped to the 64 px side margins.
// It pops in at `at` (spring scale with a settling tilt) and, if `out` is set,
// collapses at `out` (cubic, never a slow fade). `bar` puts it on a filled
// chamfered bar, the hook style.
export const Label = ({
  children,
  frame,
  at = 0,
  out,
  y,
  size = 64,
  color = CREME,
  bar,
  weight = 700,
  mono = false,
  style,
}: {
  children: ReactNode;
  frame: number;
  at?: number;
  out?: number;
  y: number;
  size?: number;
  color?: string;
  bar?: string;
  weight?: number;
  mono?: boolean;
  style?: CSSProperties;
}) => {
  // Plain strings: "\n" breaks the line and the size shrinks so the longest
  // line fits between the margins (estimated from the character count).
  let content = children;
  let fs = size;
  if (typeof children === "string") {
    const lines = children.split("\n");
    const longest = Math.max(...lines.map((l) => l.length));
    const em = mono ? 0.78 : 0.53;
    fs = Math.min(size, Math.floor((W - 2 * MARGIN - (bar ? 68 : 0)) / (longest * em)));
    content = lines.map((l, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {l}
      </span>
    ));
  }
  const tin = progress(frame, at, 14);
  if (tin <= 0) return null;
  const tout = out === undefined ? 0 : progress(frame, out, 8);
  if (tout >= 1) return null;
  const s = settle(tin) * (1 - tout * tout * tout);
  const rot = (1 - easeOut(tin)) * -4;
  return (
    <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: y, transform: "translateY(-50%)", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: mono ? MONO : FONT,
          fontWeight: weight,
          fontSize: fs,
          lineHeight: 1.05,
          letterSpacing: mono ? "0.16em" : "-0.02em",
          textTransform: mono ? "uppercase" : "none",
          color,
          textAlign: "center",
          maxWidth: W - 2 * MARGIN,
          transform: `scale(${s}) rotate(${rot}deg)`,
          padding: bar ? "18px 34px 22px" : 0,
          background: bar,
          clipPath: bar ? "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)" : undefined,
          ...style,
        }}
      >
        {content}
      </div>
    </div>
  );
};

// Era tag ("HÁ SÉCULOS", "HOJE"): small mono text with a short accent line.
export const EraTag = ({ frame, at = 0, out, text, accent, y = 250, color = CREME }: { frame: number; at?: number; out?: number; text: string; accent: string; y?: number; color?: string }) => {
  const t = easeOut(progress(frame, at, 12));
  if (t <= 0 || (out !== undefined && frame >= out)) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: t }}>
      <i style={{ display: "block", width: 70 * t, height: 4, background: accent }} />
      <span style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.3em", color, fontWeight: 600 }}>{text}</span>
      <i style={{ display: "block", width: 70 * t, height: 4, background: accent }} />
    </div>
  );
};

// Faint handle in the lower third (inside the safe area, above the caption).
export const Watermark = ({ y = 1560, color = CREME }: { y?: number; color?: string }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: "0.25em", color, opacity: 0.35 }}>@OCAMISSOES</div>
);

// OCA end card: the wordmark wipes in left to right on barro, then the line
// from the bio. About 1.6 s; keep it short so the loop restarts quickly.
export const EndCard = ({ frame, start }: { frame: number; start: number }) => {
  const t = frame - start;
  if (t < 0) return null;
  const fade = clamp01(t / 6);
  const wipe = easeOut(clamp01((t - 4) / 16));
  return (
    <AbsoluteFill style={{ background: BARRO, opacity: fade, alignItems: "center", justifyContent: "center" }}>
      <Fonts />
      <Img src={staticFile("brand/oca-wordmark-creme.svg")} style={{ width: 560, clipPath: `inset(0% ${(1 - wipe) * 100}% 0% 0%)` }} />
      <div style={{ marginTop: 56, fontFamily: MONO, fontSize: 26, letterSpacing: "0.22em", color: CREME, opacity: clamp01((t - 18) / 8) * 0.85, textAlign: "center", lineHeight: 1.6 }}>
        ECOSSISTEMA DE INOVAÇÃO
        <br />
        DAS MISSÕES
      </div>
    </AbsoluteFill>
  );
};
