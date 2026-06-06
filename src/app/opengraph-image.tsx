import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #EFE7DB 0%, #FFFFFF 48%, #EAC79A 100%)",
          color: "#5A4749",
          padding: 72
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#6E9277" }}>
          {siteConfig.shortName}
        </div>
        <div style={{ marginTop: 28, maxWidth: 880, fontSize: 78, fontWeight: 800, lineHeight: 1 }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 32, maxWidth: 860, fontSize: 32, lineHeight: 1.4, color: "#474747" }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    size
  );
}
