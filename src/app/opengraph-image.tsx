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
  const [heroBuffer, logoBuffer] = await Promise.all([
    readFile(join(process.cwd(), "public", siteConfig.ogImage.replace(/^\//, ""))),
    readFile(join(process.cwd(), "public", siteConfig.logo.replace(/^\//, ""))),
  ]);

  const heroSrc = `data:image/jpeg;base64,${heroBuffer.toString("base64")}`;
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(26,42,31,0.55) 0%, rgba(26,42,31,0.82) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "48px 64px",
            textAlign: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={siteConfig.name}
            width={420}
            height={140}
            style={{
              objectFit: "contain",
              marginBottom: 28,
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
            }}
          />
          <div
            style={{
              maxWidth: 900,
              fontSize: 34,
              lineHeight: 1.35,
              color: "#EFE7DB",
              textShadow: "0 2px 12px rgba(0,0,0,0.45)",
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#EAC79A",
            }}
          >
            www.onebyoneministries.org
          </div>
        </div>
      </div>
    ),
    size
  );
}
