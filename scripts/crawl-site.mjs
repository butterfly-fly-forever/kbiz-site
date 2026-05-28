#!/usr/bin/env node
/**
 * Crawl source site → data/pages/*.json, data/posts.json, site-assets, manifest, screenshots.
 * Usage: npm run crawl
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PAGES_DIR = path.join(DATA, 'pages');
const ASSETS = path.join(ROOT, 'public', 'site-assets');
const SHOTS = path.join(ROOT, 'crawl-screenshots');

const BASE = (process.env.CRAWL_BASE_URL || 'https://5thepassionfruitde.wixstudio.com/kbizconsulting').replace(/\/$/, '');

const EXPECTED = [
  { path: '/', pageId: 'home', kind: 'page' },
  { path: '/services', pageId: 'services', kind: 'page' },
  { path: '/services/consulting-1', pageId: 'services-consulting-1', kind: 'page' },
  { path: '/services/consulting-2', pageId: 'services-consulting-2', kind: 'page' },
  { path: '/services/consulting-3', pageId: 'services-consulting-3', kind: 'page' },
  { path: '/project-case-studies', pageId: 'project-case-studies', kind: 'page' },
  { path: '/project-case-studies/chiáhcikhasi', slug: 'chiahkhasi', kind: 'post' },
  { path: '/project-case-studies/dong-tam-market', slug: 'dong-tam-market', kind: 'post' },
  { path: '/project-case-studies/thinh-vuong-market', slug: 'thinh-vuong-market', kind: 'post' },
  { path: '/project-case-studies/thinh-vuong-2', slug: 'thinh-vuong-2', kind: 'post' },
  { path: '/team-members-1', pageId: 'team-members-1', kind: 'page' },
  { path: '/contact', pageId: 'contact', kind: 'page' },
];

const WIDTHS = [1440, 768, 375];

async function ensureDirs() {
  await fs.mkdir(PAGES_DIR, { recursive: true });
  await fs.mkdir(ASSETS, { recursive: true });
  await fs.mkdir(SHOTS, { recursive: true });
}

function absUrl(p) {
  if (p.startsWith('http')) return p;
  return BASE + (p.startsWith('/') ? p : '/' + p);
}

function hash(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

async function downloadAsset(url, suggestedName) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(url).pathname) || '.bin';
    const base = suggestedName || path.basename(new URL(url).pathname) || 'asset';
    const safe = base.replace(/[^\w.-]+/g, '_').slice(0, 80);
    const fname = safe.includes('.') ? safe : safe + ext;
    const fp = path.join(ASSETS, fname);
    await fs.writeFile(fp, buf);
    return { local: '/site-assets/' + fname, checksum: hash(buf), bytes: buf.length };
  } catch {
    return null;
  }
}

async function extractPage(page, url, pageId) {
  const data = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').trim();
    const h1 = document.querySelector('h1');
    const title = document.title;
    const imgs = [...document.querySelectorAll('img[src]')]
      .map((i) => i.src)
      .filter((s) => s && !s.startsWith('data:'));
    const paragraphs = [...document.querySelectorAll('p')]
      .map((p) => text(p))
      .filter((t) => t.length > 20)
      .slice(0, 12);
    return {
      title,
      heading: text(h1) || title.split('|')[0].trim(),
      imgs: [...new Set(imgs)].slice(0, 20),
      paragraphs,
    };
  });

  let heroImage = '/site-assets/Untitled-2.png';
  if (data.imgs[0]) {
    const dl = await downloadAsset(data.imgs[0], pageId + '-hero.jpg');
    if (dl) heroImage = dl.local;
  }

  const sections = [
    {
      type: 'hero',
      props: {
        image: heroImage,
        heading: data.heading.toUpperCase(),
        subheading: data.paragraphs[0] || '',
      },
    },
  ];

  if (data.paragraphs.length > 1) {
    sections.push({
      type: 'introCarousel',
      props: { slides: data.paragraphs.slice(1, 4) },
    });
  }

  if (pageId === 'services') {
    sections.push(
      {
        type: 'servicePills',
        props: {
          items: [
            { label: 'Investment Consulting', href: '/services/consulting-1' },
            { label: 'Start New Business', href: '/services/consulting-2' },
            { label: 'Business Developing Services', href: '/services/consulting-3' },
          ],
        },
      },
      {
        type: 'experienceQuote',
        props: { text: 'Over 19 years of consulting experience across Vietnam.' },
      },
      {
        type: 'missionVision',
        props: {
          mission: data.paragraphs[1] || 'Deliver practical consulting for sustainable growth.',
          vision: data.paragraphs[2] || 'Trusted partner for market operators and investors.',
        },
      },
      { type: 'ctaEstimate', props: { heading: 'Get an estimate', button: 'Contact' } }
    );
  }

  if (pageId === 'home') {
    sections.push({
      type: 'recentPosts',
      props: { heading: 'Latest projects', filter: { type: 'case-study', limit: 3 }, viewAllHref: '/project-case-studies' },
    });
  }

  if (pageId === 'project-case-studies') {
    sections.push({
      type: 'caseStudyGrid',
      props: { heading: 'Case studies', filter: { type: 'case-study', limit: 12 } },
    });
  }

  if (pageId === 'contact') {
    sections.push({ type: 'contactForm', props: {} });
  }

  if (pageId === 'team-members-1') {
    sections.push({
      type: 'richText',
      props: { html: '<p>' + (data.paragraphs.join('</p><p>') || '') + '</p>' },
    });
  }

  if (pageId?.startsWith('services-consulting')) {
    sections.push({
      type: 'richText',
      props: { html: '<p>' + data.paragraphs.slice(0, 3).join('</p><p>') + '</p>' },
    });
    sections.push({ type: 'ctaEstimate', props: { button: 'Contact' } });
  }

  return {
    id: pageId,
    path: url.replace(BASE, '') || '/',
    title: data.title,
    locale: 'en',
    sections,
    meta: { sourceUrl: url, crawledAt: new Date().toISOString() },
  };
}

async function extractPost(page, url, slug) {
  const data = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').trim();
    const h1 = document.querySelector('h1');
    const article = document.querySelector('article') || document.querySelector('main') || document.body;
    const imgs = [...document.querySelectorAll('img[src]')].map((i) => i.src).filter((s) => s && !s.startsWith('data:'));
    return {
      title: text(h1) || document.title,
      html: article?.innerHTML?.slice(0, 50000) || '',
      excerpt: text(document.querySelector('p')) || '',
      cover: imgs[0] || null,
    };
  });

  let cover = '/site-assets/case-' + slug + '.jpg';
  if (data.cover) {
    const dl = await downloadAsset(data.cover, 'case-' + slug + '.jpg');
    if (dl) cover = dl.local;
  }

  const sourcePath = url.replace(BASE, '');
  return {
    id: 'p_' + slug.replace(/-/g, '_'),
    slug,
    lang: 'en',
    status: 'published',
    type: 'case-study',
    title: data.title,
    excerpt: data.excerpt.slice(0, 280),
    cover,
    author: 'K-Biz',
    tags: ['Case study', 'Projects'],
    publishedAt: new Date().toISOString(),
    content: data.html ? '<div class="crawled-body">' + data.html + '</div>' : '<p>' + data.excerpt + '</p>',
    sourcePath,
    legacyHash: '/project-case-studies/' + slug,
  };
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const manifest = {
    urlCount: 12,
    pageCount: 8,
    postCount: 4,
    fetchedAt: new Date().toISOString(),
    base: BASE,
    pages: [],
    posts: [],
    assets: [],
  };

  const posts = [];

  for (const item of EXPECTED) {
    const url = absUrl(item.path);
    console.log('Crawl:', url);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForTimeout(4000);

      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: Math.round(w * 0.65) });
        await page.waitForTimeout(400);
        const shotId = (item.pageId || item.slug) + '-' + w;
        const shotPath = path.join(SHOTS, shotId + '.png');
        await page.screenshot({ path: shotPath, fullPage: true });
      }

      if (item.kind === 'post') {
        const post = await extractPost(page, url, item.slug);
        posts.push(post);
        manifest.posts.push({ slug: item.slug, sourcePath: item.path });
      } else {
        const doc = await extractPage(page, url, item.pageId);
        const fp = path.join(PAGES_DIR, item.pageId + '.json');
        await fs.writeFile(fp, JSON.stringify(doc, null, 2), 'utf8');
        manifest.pages.push({ id: item.pageId, path: item.path, sections: doc.sections.length });
      }
    } catch (e) {
      console.warn('Failed', url, e.message);
    } finally {
      await page.close();
    }
  }

  if (posts.length) {
    await fs.writeFile(path.join(DATA, 'posts.json'), JSON.stringify(posts, null, 2), 'utf8');
  }

  const site = {
    name: 'K-Biz Consulting',
    tagline: 'Innovative consulting for a smarter growth',
    logo: '/site-assets/logo.png',
    nav: [
      { label: 'Home', href: '/' },
      {
        label: 'Services',
        href: '/services',
        children: [
          { label: 'Investment Consulting', href: '/services/consulting-1' },
          { label: 'Start New Business', href: '/services/consulting-2' },
          { label: 'Business Developing Services', href: '/services/consulting-3' },
        ],
      },
      { label: 'Projects', href: '/project-case-studies' },
      { label: 'About us', href: '/team-members-1' },
      { label: 'Contact', href: '/contact' },
    ],
  };
  await fs.writeFile(path.join(DATA, 'site.json'), JSON.stringify(site, null, 2), 'utf8');

  manifest.urlCount = EXPECTED.length;
  manifest.pageCount = manifest.pages.length;
  manifest.postCount = posts.length;
  await fs.writeFile(path.join(DATA, 'crawl-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  await browser.close();

  if (manifest.pageCount < 8 || manifest.postCount < 4) {
    console.warn('Warning: expected 8 pages and 4 posts; got', manifest.pageCount, manifest.postCount);
    console.warn('Seed JSON in data/ is used as fallback until crawl succeeds.');
    process.exitCode = manifest.pageCount >= 6 ? 0 : 1;
  } else {
    console.log('Crawl complete:', manifest);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
