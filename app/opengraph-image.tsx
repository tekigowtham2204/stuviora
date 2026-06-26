import { ImageResponse } from "next/og";

// Default Open Graph image for the site (1200x630). Generated at the edge so
// social shares show a real branded preview instead of a missing image.
export const alt = "Stuviora: Hire students. Trust the platform.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#f8f2e3",
          color: "#473c33",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8fa85a",
          }}
        >
          Stuviora
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1.05,
            marginTop: 24,
          }}
        >
          Hire students. Trust the platform.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#6f6258",
            marginTop: 28,
          }}
        >
          AI-reviewed, pay-on-delivery student freelancing for India.
        </div>
      </div>
    ),
    { ...size }
  );
}
