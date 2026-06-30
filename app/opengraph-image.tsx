import { ImageResponse } from "next/og";

// Default Open Graph image (1200x630). Generated at the edge so social shares
// show a branded preview: the Gate Seal + the Fraunces wordmark + the promise.
export const alt = "Stuviora: Hire students. Trust the platform.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Resolve the Fraunces display font for satori. Fetches the Google Fonts
 * static file at request time; returns null on any failure so the card
 * degrades to a serif fallback instead of 500-ing.
 */
async function loadFraunces(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fraunces = await loadFraunces();
  const display = fraunces ? "Fraunces" : "Georgia";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 80px",
          background: "#f8f2e3",
          color: "#473c33",
        }}
      >
        {/* Lockup: seal + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <path
              d="M28 13 V19 A9 9 0 0 1 19 28 H13 A9 9 0 0 1 4 19 V13 A9 9 0 0 1 13 4 H18"
              stroke="#abc270"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.4 16.8 L15 20.4 L25 8"
              stroke="#473c33"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 3.4 C26 5.6 26.4 6 28.6 6 C26.4 6 26 6.4 26 8.6 C26 6.4 25.6 6 23.4 6 C25.6 6 26 5.6 26 3.4 Z"
              fill="#fda769"
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontFamily: display,
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Stuviora
          </div>
        </div>

        {/* The promise */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: display,
              fontSize: 86,
              fontWeight: 600,
              lineHeight: 1.03,
              letterSpacing: "-0.02em",
            }}
          >
            Hire students. Trust the platform.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#6f6258",
              marginTop: 26,
            }}
          >
            Every deliverable passes an AI quality check before it reaches you.
          </div>
        </div>

        {/* Footer trust strip */}
        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 22,
            color: "#8fa85a",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span>AI-reviewed</span>
          <span style={{ color: "#b6a692" }}>/</span>
          <span>Escrow-protected</span>
          <span style={{ color: "#b6a692" }}>/</span>
          <span>College-verified</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fraunces
        ? [{ name: "Fraunces", data: fraunces, weight: 600, style: "normal" }]
        : [],
    },
  );
}
