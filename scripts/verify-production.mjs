#!/usr/bin/env node
/**
 * Post-deploy production smoke tests (login, settings text sync, homepage banner image).
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/verify-production.mjs
 */

import { firefox } from "playwright";

const BASE = process.env.SITE_URL ?? process.env.BASE ?? "https://www.onebyoneministries.org";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  process.exit(1);
}

const marker = `QA Prod Verify ${Date.now()}`;

function stripQuery(url) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0];
  }
}

async function getHeadlineInput(page) {
  const labeled = page.getByLabel("Hero Headline");
  if (await labeled.count()) return labeled.first();
  return page
    .locator("h3", { hasText: "Homepage Content" })
    .locator("xpath=ancestor::div[1]")
    .locator("input")
    .first();
}

async function gotoWithRetry(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
      await page.waitForTimeout(1500);
      return;
    } catch (err) {
      if (i === 2) throw err;
      await page.waitForTimeout(2000);
    }
  }
}

async function verifyLogin(adminPage) {
  console.log("\n[1/3] Admin login");
  await gotoWithRetry(adminPage, `${BASE}/admin/login`);
  await adminPage.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 30_000 });
  await adminPage.fill('input[type="email"]', EMAIL);
  await adminPage.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    adminPage.waitForURL(/\/admin\/(dashboard|accept-invite)/, { timeout: 45_000 }),
    adminPage.click('button[type="submit"]'),
  ]);

  const url = adminPage.url();
  if (url.includes("/admin/login")) {
    throw new Error(`Login failed (url: ${url})`);
  }
  console.log("PASS: Logged in, landed at", url);
}

async function verifySettingsTextSync(adminPage, publicPage) {
  console.log("\n[2/3] Settings text sync");
  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);
  await adminPage.locator("h1", { hasText: "Site Settings" }).waitFor({ timeout: 30_000 });

  const headline = await getHeadlineInput(adminPage);
  const original = await headline.inputValue();
  await headline.fill(marker);
  await adminPage.locator('button:has-text("Save Changes")').click({ force: true });
  await adminPage.waitForTimeout(4000);

  const savedInAdmin = await (await getHeadlineInput(adminPage)).inputValue();
  if (!savedInAdmin.includes(marker)) {
    throw new Error("Admin settings did not persist headline after save");
  }

  await gotoWithRetry(publicPage, `${BASE}/?v=${Date.now()}`);
  await publicPage.waitForTimeout(5000);
  const bodyText = await publicPage.locator("body").innerText();
  if (!bodyText.includes(marker)) {
    throw new Error("Public homepage does not show saved headline");
  }
  console.log("PASS: Saved headline appears on public homepage");

  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);
  await (await getHeadlineInput(adminPage)).fill(original);
  await adminPage.locator('button:has-text("Save Changes")').click({ force: true });
  await adminPage.waitForTimeout(3000);
  console.log("Restored original headline");
}

async function verifyHomepageBannerImage(adminPage, publicPage) {
  console.log("\n[3/3] Homepage banner image sync");
  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);

  const heroSlot = adminPage.locator("p", { hasText: "Homepage hero" }).locator("xpath=ancestor::div[1]");
  const adminImg = heroSlot.locator("img").first();
  const adminCount = await adminImg.count();
  if (adminCount === 0) {
    console.log("SKIP: No homepage banner image uploaded in admin yet");
    return;
  }

  const adminSrc = await adminImg.getAttribute("src");
  if (!adminSrc) {
    throw new Error("Admin homepage banner preview has no src");
  }

  await gotoWithRetry(publicPage, `${BASE}/?v=${Date.now()}`);
  await publicPage.waitForTimeout(4000);

  const publicImg = publicPage.locator('img[alt="One By One Ministries community"]').first();
  await publicImg.waitFor({ timeout: 15_000 });
  const publicSrc = await publicImg.getAttribute("src");
  if (!publicSrc) {
    throw new Error("Public homepage banner image has no src");
  }

  const adminBase = stripQuery(adminSrc);
  const publicBase = stripQuery(publicSrc);
  if (adminBase !== publicBase) {
    throw new Error(`Image mismatch.\n  Admin: ${adminSrc}\n  Public: ${publicSrc}`);
  }

  if (!publicSrc.includes("v=")) {
    console.log("WARN: Public image URL has no cache-bust query param (may still be correct)");
  } else {
    console.log("PASS: Public image uses cache-bust param");
  }
  console.log("PASS: Homepage banner image matches admin after refresh");
}

async function main() {
  const browser = await firefox.launch({ headless: true });
  const failures = [];

  const adminPage = await browser.newPage();
  try {
    await verifyLogin(adminPage);
  } catch (err) {
    failures.push(`Login: ${err instanceof Error ? err.message : err}`);
  }

  if (failures.length === 0) {
    const publicPage = await browser.newPage();
    try {
      await verifySettingsTextSync(adminPage, publicPage);
    } catch (err) {
      failures.push(`Settings sync: ${err instanceof Error ? err.message : err}`);
    }

    if (failures.length === 0) {
      try {
        await verifyHomepageBannerImage(adminPage, publicPage);
      } catch (err) {
        failures.push(`Banner image: ${err instanceof Error ? err.message : err}`);
      }
    }
    await publicPage.close();
  }

  await adminPage.close();
  await browser.close();

  if (failures.length) {
    console.error("\nFAILED:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }

  console.log("\nAll production checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
