#!/usr/bin/env node
/**
 * Verifies admin settings appear on the public site.
 * Usage: BASE=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/verify-settings-flow.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  process.exit(1);
}

const marker = `QA Settings Sync ${Date.now()}`;

async function getHeadlineInput(page) {
  const labeled = page.getByLabel("Hero Headline");
  if (await labeled.count()) return labeled.first();
  return page.locator("h3", { hasText: "Homepage Content" }).locator("xpath=ancestor::div[1]").locator("input").first();
}

async function gotoWithRetry(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(1500);
      return;
    } catch (err) {
      if (i === 2) throw err;
      await page.waitForTimeout(2000);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const publicContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const publicPage = await publicContext.newPage();

  console.log("Logging in...");
  await gotoWithRetry(adminPage, `${BASE}/admin/login`);
  await adminPage.fill('input[type="email"]', EMAIL);
  await adminPage.fill('input[type="password"]', PASSWORD);
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForFunction(() => !window.location.pathname.endsWith("/admin/login"), null, { timeout: 60_000 });
  await adminPage.waitForTimeout(2000);
  console.log("Admin URL after login:", adminPage.url());

  console.log("Opening Site Settings...");
  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);
  await adminPage.locator("h1", { hasText: "Site Settings" }).waitFor({ timeout: 30_000 });
  const headline = await getHeadlineInput(adminPage);
  const original = await headline.inputValue();

  await headline.fill(marker);
  await adminPage.locator('button:has-text("Save Changes")').click();
  await adminPage.waitForTimeout(5000);

  console.log("Checking public homepage...");
  await gotoWithRetry(publicPage, `${BASE}/`);
  const html = await publicPage.content();

  if (!html.includes(marker)) {
    console.error("FAIL: Public homepage does not include updated hero headline.");
    console.error("Marker:", marker);
    process.exitCode = 1;
  } else {
    console.log("PASS: Public homepage shows updated hero headline.");
  }

  console.log("Restoring original headline...");
  await gotoWithRetry(adminPage, `${BASE}/admin/settings`);
  await (await getHeadlineInput(adminPage)).fill(original);
  await adminPage.locator('button:has-text("Save Changes")').click();
  await adminPage.waitForTimeout(2000);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
