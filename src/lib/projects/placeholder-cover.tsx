import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 750;

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #312e81 0%, #6d28d9 45%, #be185d 100%)",
  "linear-gradient(135deg, #0f766e 0%, #1d4ed8 50%, #6d28d9 100%)",
  "linear-gradient(135deg, #9d174d 0%, #7c2d12 50%, #ca8a04 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #0e7490 50%, #047857 100%)",
  "linear-gradient(135deg, #4c1d95 0%, #831843 55%, #b45309 100%)",
  "linear-gradient(135deg, #134e4a 0%, #3730a3 50%, #6b21a8 100%)",
] as const;

function seedToIndex(seed: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/**
 * Renders a 16:10 PNG used as the project card image when no mood board is uploaded.
 */
export async function generateProjectPlaceholderCoverPng(params: {
  title: string;
  categories: string[];
}): Promise<ArrayBuffer> {
  const title = truncate(params.title.trim(), 100);
  const categoryLine = truncate(
    params.categories.filter(Boolean).join(" · "),
    90,
  );
  const background =
    GRADIENT_PRESETS[seedToIndex(`${title}|${categoryLine}`, GRADIENT_PRESETS.length)];

  const titleFontSize = title.length > 56 ? 42 : title.length > 36 ? 48 : 54;

  const res = new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 72,
          paddingRight: 72,
          background,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1056,
          }}
        >
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          {categoryLine ? (
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.35,
              }}
            >
              {categoryLine}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );

  return res.arrayBuffer();
}
