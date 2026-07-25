import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public", siteConfig.logo.replace(/^\//, ""))
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a2620 0%, #2a3a2e 55%, #474747 100%)",
          fontFamily: "Georgia, serif",
          color: "#EDE7DA",
          padding: 64,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={180} height={180} style={{ objectFit: "contain" }} />
        <div style={{ marginTop: 28, fontSize: 54, fontWeight: 700, textAlign: "center" }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#EAC79A", textAlign: "center", maxWidth: 900 }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
