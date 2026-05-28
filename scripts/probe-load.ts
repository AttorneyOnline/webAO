#!/usr/bin/env bun
/**
 * Headless-Chrome probe to diagnose why a page's `window.load` event
 * isn't firing (tab spinner-forever, no favicon rendered, etc.).
 *
 * Usage:
 *   bun scripts/probe-load.ts <url>
 *
 * Example:
 *   bun scripts/probe-load.ts "http://localhost:8080/client.html?mode=replay"
 *
 * Reports:
 *   - Whether DOMContentLoaded and `load` fired (and when).
 *   - Browser console errors / page errors that surfaced.
 *   - If load did NOT fire after the timeout, dumps document state:
 *     pending images (with sample URLs), unloaded stylesheet links,
 *     and any in-flight network requests at the moment of timeout.
 *
 * The most common culprits in practice are:
 *   - `<img src="">` placeholders (Chrome may keep them as "pending"
 *     and they block the load event)
 *   - Many lazy-loaded `<img>` tags (3000+ char icons) -- their
 *     `.complete` stays false even with `loading="lazy"`
 *   - `<link rel="stylesheet" href="">` placeholders -- empty href
 *     resolves to the document URL and never settles cleanly
 *   - An error-event handler that re-fires its own error (loop)
 */
import puppeteer from "puppeteer";

const url = process.argv[2];
if (!url) {
  console.error("usage: bun scripts/probe-load.ts <url>");
  process.exit(2);
}

const TIMEOUT_MS = 15_000;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const navStart = Date.now();

page.on("dialog", (d) => void d.dismiss());
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.log(`[${msg.type()}] ${msg.text()}`);
  }
});

const ongoing = new Map<string, { url: string; type: string; started: number }>();
page.on("request", (req) => {
  ongoing.set(req.url(), { url: req.url(), type: req.resourceType(), started: Date.now() });
});
page.on("requestfinished", (req) => ongoing.delete(req.url()));
page.on("requestfailed", (req) => ongoing.delete(req.url()));

let loadFiredAt: number | null = null;
page.once("load", () => { loadFiredAt = Date.now() - navStart; });

try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
  console.log(`[DOMContentLoaded] +${Date.now() - navStart}ms`);
} catch (e) {
  console.log(`[navigation failed] ${(e as Error).message}`);
  await browser.close();
  process.exit(1);
}

await new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS));

if (loadFiredAt !== null) {
  console.log(`\n✓ window.load fired at +${loadFiredAt}ms`);
  await browser.close();
  process.exit(0);
}

console.log(`\n✗ window.load did NOT fire within ${TIMEOUT_MS}ms`);

const state = await page.evaluate(() => {
  const incompleteImages = Array.from(document.images).filter((i) => !i.complete);
  const unloadedLinks = Array.from(
    document.querySelectorAll("link[rel=stylesheet]"),
  ).filter((l: any) => !l.sheet);
  return {
    readyState: document.readyState,
    totalImages: document.images.length,
    incompleteImages: incompleteImages.length,
    sampleIncompleteImages: incompleteImages.slice(0, 5).map((i) => i.src || "[empty src]"),
    totalLinks: document.querySelectorAll("link[rel=stylesheet]").length,
    unloadedLinks: unloadedLinks.map((l: any) => `id=${l.id || "?"} href=${l.href || "[empty]"}`),
  };
});

console.log(`  document.readyState = ${state.readyState}`);
console.log(`  images: ${state.incompleteImages}/${state.totalImages} incomplete`);
if (state.sampleIncompleteImages.length) {
  for (const src of state.sampleIncompleteImages) console.log(`    - ${src}`);
}
console.log(`  stylesheets: ${state.unloadedLinks.length}/${state.totalLinks} unloaded`);
for (const l of state.unloadedLinks) console.log(`    - ${l}`);

if (ongoing.size > 0) {
  console.log(`  in-flight requests: ${ongoing.size}`);
  for (const r of ongoing.values()) {
    console.log(`    - ${r.type.padEnd(12)} ${Date.now() - r.started}ms  ${r.url}`);
  }
} else {
  console.log("  in-flight requests: 0  (load is blocked by something non-network)");
}

await browser.close();
process.exit(1);
