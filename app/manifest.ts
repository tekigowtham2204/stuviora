import type { MetadataRoute } from "next";

/** Installable-PWA manifest (audit #58). A service worker is deferred;
 *  install + theme behaviour works from the manifest alone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stuviora",
    short_name: "Stuviora",
    description:
      "India's student freelancing platform. AI-checked quality, escrow-protected pay.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F2E3",
    theme_color: "#473C33",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}
