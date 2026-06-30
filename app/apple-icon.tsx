import { ImageResponse } from "next/og";

// iOS home-screen icon. Cream field with a generous maskable safe area so
// the seal never clips when iOS rounds + masks it. Literal hexes: this is a
// standalone image and cannot read CSS tokens. The seal is drawn as inline
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
            d="M28 13 V19 A9 9 0 0 1 19 28 H13 A9 9 0 0 1 4 19 V13 A9 9 0 0 1 13 4 H18"
            stroke="#abc270"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9 C12 6 6 6 6 11 C6 15 12 15 12 19 C12 23 6 23 6 21"
            stroke="#473c33"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 9 L20.5 23 L26 7"
            stroke="#473c33"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26 3.4 C26 5.6 26.4 6 28.6 6 C26.4 6 26 6.4 26 8.6 C26 6.4 25.6 6 23.4 6 C25.6 6 26 5.6 26 3.4 Z"
            fill="#fda769"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
