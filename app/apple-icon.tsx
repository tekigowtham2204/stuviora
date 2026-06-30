import { ImageResponse } from "next/og";

// iOS home-screen icon. Cream field with a generous maskable safe area so
// the mark never clips when iOS rounds + masks it. Literal hexes: this is a
// standalone image and cannot read CSS tokens. The Aurora is drawn as inline
// SVG (satori-native) rather than an embedded data-URI image, which resvg
// cannot rasterize during prerender.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f2e3",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <path
            d="M4 22 A12 12 0 0 1 28 22"
            stroke="#abc270"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M8 22 A8 8 0 0 1 24 22"
            stroke="#fec868"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M12 22 A4 4 0 0 1 20 22"
            stroke="#fda769"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M4 22 H28"
            stroke="#473c33"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
