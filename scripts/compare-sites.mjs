#!/usr/bin/env node
/**
 * Self-test: snapshot source site vs local clone and report pixel similarity.
 * Usage: node scripts/compare-sites.mjs [home|services|all]
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'crawl-screenshots', 'compare');
const SOURCE_BASE = 'https://5thepassionfruitde.wixstudio.com/kbizconsulting';
const LOCAL_BASE = `http://localhost:${process.env.PORT || 3000}`;
const WIDTHS = [1440, 768, 375];

const KBIZ = '/kbizconsulting';
const PAGES = {
  home: { source: SOURCE_BASE, local: LOCAL_BASE + '/' },
  services: { source: SOURCE_BASE + '/services', local: LOCAL_BASE + KBIZ + '/services' },
  contact: { source: SOURCE_BASE + '/contact', local: LOCAL_BASE + KBIZ + '/contact' },
  projects: { source: SOURCE_BASE + '/project-case-studies', local: LOCAL_BASE + KBIZ + '/project-case-studies' },
  about: { source: SOURCE_BASE + '/team-members-1', local: LOCAL_BASE + KBIZ + '/team-members-1' },
  'consulting-1': {
    source: SOURCE_BASE + '/services/consulting-1',
    local: LOCAL_BASE + KBIZ + '/services/consulting-1',
  },
  'consulting-2': {
    source: SOURCE_BASE + '/services/consulting-2',
    local: LOCAL_BASE + KBIZ + '/services/consulting-2',
  },
  'consulting-3': {
    source: SOURCE_BASE + '/services/consulting-3',
    local: LOCAL_BASE + KBIZ + '/services/consulting-3',
  },
};

async function readPng(fp) {
  const buf = await fs.readFile(fp);
  return PNG.sync.read(buf);
}

function cropToSize(img, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((y * img.width + x) << 2);
      const di = ((y * w + x) << 2);
      out.data[di] = img.data[si];
      out.data[di + 1] = img.data[si + 1];
      out.data[di + 2] = img.data[si + 2];
      out.data[di + 3] = img.data[si + 3];
    }
  }
  return out;
}

async function diffImages(aPath, bPath, diffPath) {
  const raw1 = await readPng(aPath);
  const raw2 = await readPng(bPath);
  const w = Math.min(raw1.width, raw2.width);
  const h = Math.min(raw1.height, raw2.height);
  const img1 = cropToSize(raw1, w, h);
  const img2 = cropToSize(raw2, w, h);
  const out = new PNG({ width: w, height: h });
  const mismatched = pixelmatch(
    img1.data, img2.data, out.data, w, h,
    { threshold: 0.15, includeAA: true }
  );
  const total = w * h;
  const matchPct = ((total - mismatched) / total) * 100;
  await fs.writeFile(diffPath, PNG.sync.write(out));
  return { mismatched, total, matchPct, width: w, height: h };
}

async function shot(page, url, fp) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3500);
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch {}
  await page.screenshot({ path: fp, fullPage: false });
}

async function main() {
  const which = process.argv[2] || 'all';
  const pages = which === 'all' ? Object.keys(PAGES) : [which];
  await fs.mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const report = { testedAt: new Date().toISOString(), pages: [], pass1to1: false };

  for (const pageId of pages) {
    const cfg = PAGES[pageId];
    if (!cfg) continue;
    const pageReport = { pageId, viewports: [], minMatchPct: 100 };

    for (const w of WIDTHS) {
      const vh = w >= 768 ? 900 : w >= 375 ? 812 : 667;
      const ctx = await browser.newContext({ viewport: { width: w, height: vh } });
      const page = await ctx.newPage();
      const srcPath = path.join(OUT, `${pageId}-source-${w}.png`);
      const locPath = path.join(OUT, `${pageId}-local-${w}.png`);
      const diffPath = path.join(OUT, `${pageId}-diff-${w}.png`);

      console.log(`Capture ${pageId} @ ${w}px — source…`);
      await shot(page, cfg.source, srcPath);
      console.log(`Capture ${pageId} @ ${w}px — local…`);
      await shot(page, cfg.local, locPath);
      await ctx.close();

      const diff = await diffImages(srcPath, locPath, diffPath);
      const pass = diff.matchPct >= 92;
      pageReport.viewports.push({
        width: w,
        source: srcPath,
        local: locPath,
        diff: diffPath,
        matchPct: Math.round(diff.matchPct * 10) / 10,
        pass,
        note: pass ? 'close' : 'NOT 1:1',
      });
      pageReport.minMatchPct = Math.min(pageReport.minMatchPct, diff.matchPct);
      console.log(`  ${w}px: ${diff.matchPct.toFixed(1)}% match ${pass ? '✓' : '✗'}`);
    }
    pageReport.pass1to1 = pageReport.minMatchPct >= 92;
    report.pages.push(pageReport);
  }

  await browser.close();
  report.pass1to1 = report.pages.every((p) => p.pass1to1);
  const outJson = path.join(OUT, 'report.json');
  await fs.writeFile(outJson, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n--- SUMMARY ---');
  for (const p of report.pages) {
    console.log(`${p.pageId}: min match ${p.minMatchPct.toFixed(1)}% — ${p.pass1to1 ? 'PASS (≥92%)' : 'FAIL — not 1:1'}`);
  }
  console.log(`Overall: ${report.pass1to1 ? 'PASS' : 'FAIL — visual gaps remain'}`);
  console.log(`Artifacts: ${OUT}`);
  process.exit(report.pass1to1 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
