#!/usr/bin/env node
/**
 * Extract section HTML + computed styles from source site (Playwright).
 * Use output to align clone CSS/sections — Wix raw HTML is not drop-in ready.
 *
 * Usage:
 *   node scripts/extract-design.mjs [home|services|project-case-studies|url]
 *   node scripts/extract-design.mjs https://5thepassionfruitde.wixstudio.com/kbizconsulting
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'design-extracts');
const BASE = (process.env.CRAWL_BASE_URL || 'https://5thepassionfruitde.wixstudio.com/kbizconsulting').replace(/\/$/, '');

const PATHS = {
  home: '/',
  services: '/services',
  'project-case-studies': '/project-case-studies',
  contact: '/contact',
};

const STYLE_KEYS = [
  'display', 'position', 'width', 'height', 'maxWidth',
  'color', 'backgroundColor', 'backgroundImage',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform',
  'padding', 'paddingTop', 'paddingBottom', 'margin', 'marginTop', 'marginBottom',
  'gap', 'gridTemplateColumns', 'flexDirection', 'alignItems', 'justifyContent',
  'borderRadius', 'boxShadow', 'opacity',
];

function pickStyles(computed) {
  const o = {};
  for (const k of STYLE_KEYS) {
    const v = computed[k];
    if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') o[k] = v;
  }
  return o;
}

async function extract(page) {
  return page.evaluate((keys) => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const styleKeys = keys;

    const pick = (computed) => {
      const o = {};
      for (const k of styleKeys) {
        const v = computed[k];
        if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') o[k] = v;
      }
      return o;
    };

    const sections = [];
    const roots = document.querySelectorAll('main section, main [data-testid], #SITE_CONTAINER section, #SITE_CONTAINER > div > section');
    const nodes = roots.length ? roots : [...document.querySelectorAll('section')].slice(0, 12);

    nodes.forEach((sec, i) => {
      if (!sec || sec.offsetHeight < 40) return;
      const h = sec.querySelector('h1,h2,h3');
      const imgs = [...sec.querySelectorAll('img[src]')]
        .map((img) => img.src)
        .filter((s) => s && !s.startsWith('data:'))
        .slice(0, 6);
      const buttons = [...sec.querySelectorAll('a,button')]
        .filter((b) => text(b).length < 80)
        .slice(0, 8)
        .map((b) => ({
          tag: b.tagName.toLowerCase(),
          text: text(b),
          href: b.getAttribute('href'),
          styles: pick(getComputedStyle(b)),
        }));

      sections.push({
        index: i,
        tag: sec.tagName.toLowerCase(),
        id: sec.id || null,
        className: (sec.className || '').toString().slice(0, 200),
        heading: h ? text(h) : null,
        textPreview: text(sec).slice(0, 400),
        imageUrls: imgs,
        buttons,
        sectionStyles: pick(getComputedStyle(sec)),
        htmlSnippet: sec.outerHTML.slice(0, 12000),
      });
    });

    const nav = document.querySelector('header');
    const hero = document.querySelector('h1')?.closest('section') || document.querySelector('h1')?.parentElement;

    return {
      title: document.title,
      url: location.href,
      fonts: [...document.fonts].map((f) => f.family).filter(Boolean).slice(0, 20),
      cssVars: [...document.styleSheets].length,
      nav: nav ? {
        htmlSnippet: nav.outerHTML.slice(0, 8000),
        styles: pick(getComputedStyle(nav)),
      } : null,
      hero: hero ? {
        htmlSnippet: hero.outerHTML.slice(0, 12000),
        styles: pick(getComputedStyle(hero)),
        h1Styles: pick(getComputedStyle(document.querySelector('h1'))),
      } : null,
      sections,
    };
  }, STYLE_KEYS);
}

async function main() {
  const arg = process.argv[2] || 'home';
  const url = arg.startsWith('http') ? arg : absUrl(PATHS[arg] || '/');
  const slug = arg.startsWith('http') ? 'custom' : arg.replace(/\//g, '-');

  await fs.mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(5000);
  try {
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  } catch {}

  const data = await extract(page);
  data.extractedAt = new Date().toISOString();
  data.sourceUrl = url;

  const jsonPath = path.join(OUT, `${slug}.json`);
  const shotPath = path.join(OUT, `${slug}-1440.png`);
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  await page.screenshot({ path: shotPath, fullPage: true });

  await browser.close();

  console.log('Saved:', jsonPath);
  console.log('Screenshot:', shotPath);
  console.log('Sections:', data.sections.length);
  console.log('\nTip: map sections → data/pages/*.json + assets/site.css (do not paste raw Wix HTML into React).');
}

function absUrl(p) {
  return BASE + (p.startsWith('/') ? p : '/' + p);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
