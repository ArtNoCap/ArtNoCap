import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 520px at 78% 20%, rgba(99,102,241,0.38), transparent 60%), radial-gradient(820px 520px at 18% 88%, rgba(168,85,247,0.26), transparent 60%), linear-gradient(135deg, #020617, #0b1226 50%, #111827)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.0) 0%, rgba(2,6,23,0.25) 65%, rgba(2,6,23,0.65) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 70,
            left: 90,
            right: 90,
            display: "flex",
            gap: 22,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, #4f46e5, #4338ca)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div style={{ fontSize: 38, lineHeight: 1, color: "white", fontWeight: 800 }}>A</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "white", letterSpacing: -1 }}>
              ArtNoCap
            </div>
            <div style={{ fontSize: 26, color: "rgba(226,232,240,0.88)" }}>
              Community artwork requests
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 86,
            left: 90,
            right: 90,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, color: "white", letterSpacing: -0.6 }}>
            Post a design brief · Collect submissions · Vote on favorites
          </div>
          <div style={{ fontSize: 22, color: "rgba(203,213,225,0.9)" }}>
            No payments—just creative collaboration.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: -180,
            bottom: -200,
            width: 520,
            height: 520,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 30% 30%, rgba(129,140,248,0.5), rgba(79,70,229,0.0) 62%)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

