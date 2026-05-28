#!/usr/bin/env node
/**
 * Compare live page screenshots to crawl reference (pixel diff summary).
 * Usage: node scripts/visual-diff.mjs [pageId]
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'crawl-screenshots');
const PORT = process.env.PORT || 3000;
const LOCAL = `http://localhost:${PORT}`;
const pageId = process.argv[2] || 'services';
const WIDTHS = [1440, 768, 375];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  for (const w of WIDTHS) {
    const page = await context.newPage();
    await page.setViewportSize({ width: w, height: Math.round(w * 0.65) });
    const pathSeg = pageId === 'home' ? '' : pageId;
    const url = pathSeg ? `${LOCAL}/${pathSeg}` : LOCAL + '/';
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    const livePath = path.join(SHOTS, `live-${pageId}-${w}.png`);
    await page.screenshot({ path: livePath, fullPage: true });
    const refPath = path.join(SHOTS, `${pageId}-${w}.png`);
    let hasRef = false;
    try {
      await fs.access(refPath);
      hasRef = true;
    } catch {}
    results.push({ width: w, live: livePath, reference: hasRef ? refPath : null });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify({ pageId, results }, null, 2));
  console.log('Open crawl-screenshots/ to compare live-* vs reference shots.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
