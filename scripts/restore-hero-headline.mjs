#!/usr/bin/env node
/**
 * Ensures production hero headline is correct (removes leftover QA test text).
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/restore-hero-headline.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.SITE_URL ?? "https://www.onebyoneministries.org";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const CORRECT_HEADLINE = "Bringing Hope, Education, and the Love of Christ One By One";

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  process.exit(1);
}

async function getHeadlineInput(page) {
  const labeled = page.getByLabel("Hero Headline");
  if (await labeled.count()) return labeled.first();
  return page.locator("h3", { hasText: "Homepage Content" }).locator("xpath=ancestor::div[1]").locator("input").first();
}

async function gotoWithRetry(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(1500);
      return;
    } catch {
      await page.waitForTimeout(2000);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const adminPage = await browser.newPage();
  const publicPage = await browser.newPage();

  await gotoWithRetry(publicPage, `${BASE}/`);
  await publicPage.waitForTimeout(4000);
  const before = await publicPage.locator("body").innerText();
  const hadQa = before.includes("QA Settings Sync");
  console.log("Live site has QA text before fix:", hadQa);

  await gotoWithRetry(adminPage, `${BASE}/admin/login`);
  await adminPage.fill('input[type="email"]', EMAIL);
  await adminPage.fill('input[type="password"]', PASSWORD);
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForFunction(() => !window.location.pathname.endsWith("/admin/login"), null, { timeout: 90_000 });

  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);
  const headline = await getHeadlineInput(adminPage);
  const current = await headline.inputValue();
  console.log("Admin headline before:", current.slice(0, 80));

  if (current === CORRECT_HEADLINE && !hadQa) {
    console.log("Already correct. Nothing to do.");
    await browser.close();
    return;
  }

  await headline.fill(CORRECT_HEADLINE);
  await adminPage.locator('button:has-text("Save Changes")').click();
  await adminPage.waitForTimeout(5000);

  await gotoWithRetry(publicPage, `${BASE}/?v=${Date.now()}`);
  await publicPage.waitForTimeout(4000);
  const after = await publicPage.locator("body").innerText();
  const stillQa = after.includes("QA Settings Sync");
  const hasCorrect = after.includes("Bringing Hope") || after.includes("BringingHope");

  if (stillQa) {
    console.error("FAIL: QA text still on homepage");
    process.exitCode = 1;
  } else if (hasCorrect) {
    console.log("PASS: Homepage shows correct headline.");
  } else {
    console.log("Saved headline; verify manually:", after.slice(0, 120));
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
