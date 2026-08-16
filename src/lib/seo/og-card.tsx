import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { isUsableOgImage } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getCanonicalSiteUrl } from "@/lib/site-url";

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

const OG_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const MAX_HERO_BYTES = 8 * 1024 * 1024;

function isAllowedRemoteImage(url: URL) {
  const host = url.hostname;
  if (host.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/")) {
    return true;
  }
  try {
    return url.origin === getCanonicalSiteUrl();
  } catch {
    return false;
  }
}

async function fileToDataUri(pathFromPublic: string) {
  const filePath = join(process.cwd(), "public", pathFromPublic.replace(/^\//, ""));
  const buffer = await readFile(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function loadOgBackground(image?: string | null) {
  if (!isUsableOgImage(image) || !image) return null;

  try {
    if (image.startsWith("/")) {
      return await fileToDataUri(image);
    }

    const url = new URL(image);
    if (!isAllowedRemoteImage(url)) return null;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const mime = response.headers.get("content-type") ?? "";
    if (!mime.startsWith("image/") || mime.includes("svg")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_HERO_BYTES) return null;
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderOgCard({
  title,
  subtitle = siteConfig.tagline,
  imageUrl,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
}) {
  const [logoSrc, background] = await Promise.all([
    fileToDataUri(siteConfig.logo),
    loadOgBackground(imageUrl),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: background
            ? "#1a2620"
            : "linear-gradient(135deg, #1a2620 0%, #2a3a2e 55%, #474747 100%)",
          color: "#EDE7DA",
          fontFamily: "Georgia, serif",
          padding: 64,
        }}
      >
        {background ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: background
              ? "linear-gradient(180deg, rgba(17,26,21,0.28) 0%, rgba(17,26,21,0.82) 100%)"
              : "transparent",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={92} height={92} style={{ objectFit: "contain" }} />
        <div style={{ marginTop: 22, fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ marginTop: 16, fontSize: 26, color: "#EAC79A", maxWidth: 920 }}>
          {subtitle}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      headers: OG_CACHE_HEADERS,
    }
  );
}
