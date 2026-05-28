#!/usr/bin/env node
/**
 * Pre-manual-test checks: data, assets, API, routes, hash URLs, key UI signals.
 * Usage: npm run preflight
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PAGES_DIR = path.join(DATA, 'pages');
const ASSETS = path.join(ROOT, 'public', 'site-assets');
const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  { path: '/', name: 'Home', expect: ['INNOVATIVE', 'CONSULTING'] },
  { path: '/services', name: 'Services', expect: ['OUR SERVICES', 'Services'] },
  { path: '/services/consulting-1', name: 'Service 1', expect: [] },
  { path: '/services/consulting-2', name: 'Service 2', expect: [] },
  { path: '/services/consulting-3', name: 'Service 3', expect: [] },
  { path: '/project-case-studies', name: 'Projects', expect: ['OUR PROJECTS', 'Case studies'] },
  { path: '/project-case-studies/chiahkhasi', name: 'Case study detail', expect: ['Chia Hkhasi'] },
  { path: '/team-members-1', name: 'About', expect: [] },
  { path: '/contact', name: 'Contact', expect: ['Contact'] },
];

const results = { pass: [], fail: [], warn: [] };

function ok(msg) { results.pass.push(msg); }
function fail(msg) { results.fail.push(msg); }
function warn(msg) { results.warn.push(msg); }

async function fileExists(fp) {
  try { await fs.access(fp); return true; } catch { return false; }
}

async function checkData() {
  const posts = JSON.parse(await fs.readFile(path.join(DATA, 'posts.json'), 'utf8'));
  const site = JSON.parse(await fs.readFile(path.join(DATA, 'site.json'), 'utf8'));
  const pageFiles = (await fs.readdir(PAGES_DIR)).filter((f) => f.endsWith('.json'));

  if (pageFiles.length < 8) fail(`Pages: expected 8 JSON files, got ${pageFiles.length}`);
  else ok(`Pages: ${pageFiles.length} files in data/pages/`);

  const published = posts.filter((p) => p.status === 'published' && p.type === 'case-study');
  if (published.length < 4) fail(`Posts: expected 4 published case studies, got ${published.length}`);
  else ok(`Posts: ${published.length} published case studies`);

  const bad404 = posts.filter((p) => p.title === '404' || (p.excerpt || '').includes('page you\'re looking for'));
  if (bad404.length) fail(`Posts: ${bad404.length} still have crawl 404 content`);
  else ok('Posts: no 404 crawl artifacts in titles/excerpts');

  for (const p of published) {
    if (!p.slug) fail(`Post ${p.id}: missing slug`);
    if (p.cover) {
      const local = p.cover.startsWith('/') ? path.join(ROOT, 'public', p.cover.replace(/^\//, '')) : null;
      if (local && !(await fileExists(local))) warn(`Post ${p.slug}: cover missing ${p.cover}`);
    }
  }

  for (const id of ['home', 'services', 'project-case-studies', 'contact']) {
    const page = JSON.parse(await fs.readFile(path.join(PAGES_DIR, `${id}.json`), 'utf8'));
    if (!page.sections?.length) fail(`Page ${id}: no sections`);
    else ok(`Page ${id}: ${page.sections.length} section(s)`);
    for (const sec of page.sections || []) {
      const img = sec.props?.image;
      if (img?.startsWith('/site-assets')) {
        const fp = path.join(ROOT, 'public', img.replace(/^\//, ''));
        if (!(await fileExists(fp))) warn(`Page ${id}: missing asset ${img}`);
      }
    }
  }

  if (!site.logo) warn('site.json: no logo path');
  else ok(`site.json: logo ${site.logo}`);
}

async function checkApi() {
  const endpoints = [
    '/api/health',
    '/api/site',
    '/api/settings',
    '/api/posts',
    '/api/pages/home',
    '/api/pages/services',
    '/api/pages/project-case-studies',
    '/api/posts/slug/chiahkhasi',
  ];
  for (const ep of endpoints) {
    try {
      const r = await fetch(BASE + ep);
      if (!r.ok) fail(`API ${ep}: HTTP ${r.status}`);
      else ok(`API ${ep}: ${r.status}`);
    } catch (e) {
      fail(`API ${ep}: ${e.message}`);
    }
  }
}

async function checkRoutes(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const url = BASE + route.path;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const { pathname, hash, href } = await page.evaluate(() => ({
      pathname: location.pathname,
      hash: location.hash,
      href: location.href,
    }));
    if (hash && hash.startsWith('#/')) {
      fail(`${route.name}: legacy hash URL ${href}`);
    }

    const body = await page.evaluate(() => document.body.innerText);
    if (/Page not found|Run .*npm run crawl/i.test(body)) {
      fail(`${route.name}: shows page-not-found or crawl hint`);
    }
    if (/Loading…/.test(body) && body.trim().length < 50) {
      warn(`${route.name}: still showing Loading…`);
    }

    for (const needle of route.expect) {
      if (needle && !body.includes(needle)) {
        warn(`${route.name}: expected text "${needle}" not found`);
      }
    }

    const hasNav = await page.locator('.kb-nav').count();
    if (!hasNav) fail(`${route.name}: missing .kb-nav`);
    else ok(`${route.name}: renders (${pathname})`);
  }

  await page.goto(BASE + '/project-case-studies', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const cards = await page.locator('.kb-post-card').count();
  if (cards < 4) fail(`Projects grid: expected 4 cards, got ${cards}`);
  else ok(`Projects grid: ${cards} case study cards`);

  await context.close();
}

async function main() {
  console.log('K-Biz clone — preflight checks\n');

  try {
    const h = await fetch(BASE + '/api/health');
    if (!h.ok) throw new Error('health not ok');
    ok(`Server reachable at ${BASE}`);
  } catch {
    fail(`Server not running — run: npm start (port ${PORT})`);
    console.log('\n--- Data checks (offline) ---');
    await checkData();
    printReport();
    process.exit(1);
  }

  await checkData();
  console.log('\n--- API ---');
  await checkApi();
  console.log('\n--- Browser routes ---');
  const browser = await chromium.launch({ headless: true });
  await checkRoutes(browser);
  await browser.close();

  printReport();
  process.exit(results.fail.length ? 1 : 0);
}

function printReport() {
  console.log('\n========== PREFLIGHT REPORT ==========');
  if (results.pass.length) {
    console.log(`\nPASS (${results.pass.length}):`);
    results.pass.forEach((m) => console.log('  ✓', m));
  }
  if (results.warn.length) {
    console.log(`\nWARN (${results.warn.length}):`);
    results.warn.forEach((m) => console.log('  !', m));
  }
  if (results.fail.length) {
    console.log(`\nFAIL (${results.fail.length}):`);
    results.fail.forEach((m) => console.log('  ✗', m));
  }
  console.log('\n=====================================');
  if (!results.fail.length) {
    console.log('Ready for manual testing.');
    console.log(`Open: ${BASE}/`);
  } else {
    console.log('Fix FAIL items before manual QA.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
