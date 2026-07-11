#!/usr/bin/env node
/**
 * Captures admin screenshots and builds a client PDF guide.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/generate-client-guide.mjs
 */

import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SHOTS_DIR = path.join(ROOT, "docs", ".guide-screenshots");
const PDF_OUT = path.join(ROOT, "docs", "One-By-One-Ministries-Website-Content-Guide.pdf");

const BASE = process.env.SITE_URL ?? "https://www.onebyoneministries.org";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  process.exit(1);
}

const PAGES = [
  {
    id: "01-login",
    path: "/admin/login",
    title: "Step 1 — Sign in to the admin portal",
    caption:
      "Open the admin login page in your browser. Enter the email and password we sent you, then click Sign In to Admin.",
    auth: false,
  },
  {
    id: "02-dashboard",
    path: "/admin/dashboard",
    title: "Step 2 — Start on the Dashboard",
    caption:
      "After login you land here. Use the How to edit the website guide at the top. Each card shows what you can change and where it appears on the public site.",
    auth: true,
  },
  {
    id: "03-settings",
    path: "/admin/settings",
    title: "Site Settings — text, contact, and live preview",
    caption:
      "Edit the main title on the home page, mission statement, contact info, and social links on the left. The Live preview panel on the right shows what will appear on the public site. Click Save Changes at the top when you finish editing text.",
    auth: true,
  },
  {
    id: "04-settings-images",
    path: "/admin/settings",
    title: "Site Settings — banner images for each page",
    caption:
      "Scroll down to the banner images section. Click Choose file from computer to upload a header photo for each page. Each upload saves automatically and appears on the live site. Logos are fixed and cannot be changed here.",
    auth: true,
    scrollTo: "Page Hero Images",
  },
  {
    id: "05-posts",
    path: "/admin/posts",
    title: "Blog Posts — Stories page",
    caption:
      "Add or edit stories that appear on the Stories page. Use New Post, fill in title and content, set Published, then save.",
    auth: true,
  },
  {
    id: "06-projects",
    path: "/admin/projects",
    title: "Projects — ministry projects",
    caption:
      "Manage ministry projects shown on the Projects page. Click New Project or edit an existing one.",
    auth: true,
  },
  {
    id: "07-photos",
    path: "/admin/photos",
    title: "Photo Library — gallery",
    caption:
      "Upload photos for the public Photos page. Click Add Photo, upload an image, add alt text, and save.",
    auth: true,
  },
  {
    id: "08-videos",
    path: "/admin/videos",
    title: "Videos — YouTube links",
    caption:
      "Add YouTube videos shown on the Videos page. Click Add Video and paste the video link.",
    auth: true,
  },
  {
    id: "09-finance",
    path: "/admin/finance",
    title: "Finance Details — Donate page",
    caption:
      "Enter Venmo, Zelle, bank, check, and other giving details. These appear on the Donate page. Click Save Changes when done.",
    auth: true,
  },
];

async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(2500);
      return;
    } catch (err) {
      lastError = err;
      await page.waitForTimeout(2000 * (i + 1));
    }
  }
  throw lastError;
}

async function fetchLogoBase64() {
  const logoUrl = `${BASE}/assets/brand-transparent/5-web.png`;
  const res = await fetch(logoUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch logo from ${logoUrl}: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}

async function captureScreenshots() {
  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Login page (no credentials in screenshot)
  await gotoWithRetry(page, `${BASE}/admin/login`);
  await page.screenshot({ path: path.join(SHOTS_DIR, "01-login.png"), fullPage: false });

  // Authenticate
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.endsWith("/admin/login"), null, { timeout: 90_000 });

  if (page.url().includes("accept-invite")) {
    throw new Error("Account needs invite password setup. Complete that flow first.");
  }

  await page.waitForTimeout(3000);

  for (const item of PAGES.filter((p) => p.auth)) {
    await gotoWithRetry(page, `${BASE}${item.path}`);

    if (item.scrollTo) {
      const heading = page.locator("h3", { hasText: item.scrollTo });
      if (await heading.count()) {
        await heading.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
      }
    }

    await page.screenshot({
      path: path.join(SHOTS_DIR, `${item.id}.png`),
      fullPage: item.id === "04-settings-images",
    });
  }

  await browser.close();
  console.log("Screenshots saved to", SHOTS_DIR);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buildHtml(logoB64) {
  const sections = await Promise.all(
    PAGES.map(async (item) => {
      const file = path.join(SHOTS_DIR, `${item.id}.png`);
      const buf = await readFile(file);
      const b64 = buf.toString("base64");
      return `
        <section class="page">
          <h2>${escapeHtml(item.title)}</h2>
          <p class="caption">${escapeHtml(item.caption)}</p>
          <img src="data:image/png;base64,${b64}" alt="${escapeHtml(item.title)}" />
        </section>
      `;
    })
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>One By One Ministries — Website Content Guide</title>
  <style>
    @page { size: letter; margin: 0.65in; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Helvetica, Arial, sans-serif;
      color: #2d2d2d;
      margin: 0;
      line-height: 1.5;
    }
    .cover {
      min-height: 9.5in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.5in 0;
      page-break-after: always;
    }
    .cover-logo {
      width: 180px;
      height: auto;
      margin-bottom: 24px;
      display: block;
    }
    .cover h1 {
      font-size: 28px;
      color: #6E9277;
      margin: 0 0 12px;
    }
    .cover .subtitle {
      font-size: 16px;
      color: #555;
      margin-bottom: 28px;
    }
    .cover ul {
      font-size: 13px;
      color: #444;
      padding-left: 20px;
    }
    .cover li { margin-bottom: 8px; }
    .cover .url {
      margin-top: 32px;
      font-size: 14px;
      font-weight: 600;
      color: #6E9277;
    }
    .page {
      page-break-before: always;
      padding-top: 8px;
    }
    h2 {
      font-size: 18px;
      color: #6E9277;
      margin: 0 0 8px;
    }
    .caption {
      font-size: 12px;
      color: #555;
      margin: 0 0 14px;
      max-width: 7in;
    }
    img {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      display: block;
    }
    .footer-note {
      page-break-before: always;
      padding-top: 40px;
      font-size: 12px;
      color: #666;
    }
    .footer-note h2 { font-size: 16px; }
  </style>
</head>
<body>
  <div class="cover">
    <img class="cover-logo" src="data:image/png;base64,${logoB64}" alt="One By One Ministries logo" />
    <h1>One By One Ministries</h1>
    <p class="subtitle">Website Content Guide — how to update your site</p>
    <p style="font-size:13px;color:#444;max-width:6in;">
      This guide walks you through the admin dashboard step by step. You do not need technical skills.
      Open a section, make your changes, save, then check the live website. Changes appear on the public site right away.
    </p>
    <ul>
      <li><strong>Site Settings</strong> — home page text, contact info, social links, banner images for each page (with live preview)</li>
      <li><strong>Blog Posts</strong> — stories on the Stories page</li>
      <li><strong>Projects</strong> — ministry projects</li>
      <li><strong>Photo Library</strong> — gallery photos</li>
      <li><strong>Videos</strong> — YouTube videos</li>
      <li><strong>Finance Details</strong> — Venmo, Zelle, bank, check on the Donate page</li>
    </ul>
    <p class="url">Admin login: ${escapeHtml(BASE)}/admin/login</p>
    <p style="font-size:12px;color:#777;margin-top:8px;">Use the email and password provided to you separately.</p>
  </div>
  ${sections.join("\n")}
  <div class="footer-note">
    <h2>Quick tips</h2>
    <ul>
      <li>Always click <strong>Save Changes</strong> after editing text in Site Settings or Finance Details.</li>
      <li>Banner images in Site Settings save automatically when you upload a file.</li>
      <li>Use the <strong>Live preview</strong> panel on Site Settings to see what you are changing.</li>
      <li>Use <strong>View public website</strong> on the dashboard to confirm your changes on the live site.</li>
      <li>Need help? Contact your site administrator.</li>
    </ul>
  </div>
</body>
</html>`;
}

async function htmlToPdf(htmlPath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.pdf({
    path: PDF_OUT,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  });
  await browser.close();
}

async function main() {
  console.log("Capturing admin screenshots...");
  await captureScreenshots();

  console.log("Fetching logo...");
  const logoB64 = await fetchLogoBase64();

  console.log("Building PDF...");
  const html = await buildHtml(logoB64);
  const htmlPath = path.join(SHOTS_DIR, "guide.html");
  await writeFile(htmlPath, html);
  await htmlToPdf(htmlPath);

  console.log("Done:", PDF_OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
