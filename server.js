/**
 * K-Biz Consulting — Node server
 * JSON files in /data, pages in /data/pages, uploads in /public/uploads
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fsp = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PAGES_DIR = path.join(DATA_DIR, 'pages');
const UPLOAD_DIR = path.join(ROOT, 'public', 'uploads');
const SITE_ASSETS = path.join(ROOT, 'public', 'site-assets');
const KBIZ_MEDIA_DIR = path.join(ROOT, 'kbiz-clone', 'images');

const ADMIN_USER = process.env.KBIZ_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.KBIZ_ADMIN_PASS || 'kbiz2026';
const AUTH_TOKEN_SECRET = process.env.KBIZ_TOKEN_SECRET || 'change-me-in-production';

/** wix = serve source-code-wix HTML (pixel-faithful); react = legacy JSON/React SPA at /preview */
const SITE_MODE = (process.env.SITE_MODE || 'wix').toLowerCase();
const { serveWixPage, loadLocalHtml } = require('./lib/wix-html');

async function ensureDir(p) { await fsp.mkdir(p, { recursive: true }); }

async function readJSON(name, fallback) {
  const fp = path.join(DATA_DIR, name + '.json');
  try {
    const raw = await fsp.readFile(fp, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await writeJSON(name, fallback);
      return fallback;
    }
    throw e;
  }
}

async function writeJSON(name, value) {
  await ensureDir(DATA_DIR);
  const fp = path.join(DATA_DIR, name + '.json');
  const tmp = fp + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await fsp.rename(tmp, fp);
  return value;
}

async function readPage(id) {
  const fp = path.join(PAGES_DIR, id + '.json');
  const raw = await fsp.readFile(fp, 'utf8');
  return JSON.parse(raw);
}

function uid() { return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function token(user) {
  return Buffer.from(user + '|' + Date.now() + '|' + AUTH_TOKEN_SECRET).toString('base64');
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const t = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  try {
    const raw = Buffer.from(t || '', 'base64').toString('utf8');
    const [user, ts, secret] = raw.split('|');
    if (secret !== AUTH_TOKEN_SECRET || user !== ADMIN_USER) throw 0;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

const SEED_POSTS = [];
const SEED_MESSAGES = [];
const SEED_SETTINGS = {
  contactEmail: 'kbizconsulting16@gmail.com',
  contactPhone: '(0258) 3516 343',
  contactAddress: '16A Le Quy Don St, Nha Trang Ward, Khanh Hoa Province',
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/site-assets', express.static(SITE_ASSETS));
app.use('/kbiz-media', express.static(KBIZ_MEDIA_DIR, { maxAge: '7d' }));
app.use(express.static(ROOT, { extensions: ['html'], fallthrough: true, index: false }));

/** Wix HTML snapshots in source-code-wix/ for pixel reference */
const WIX_REF_DIR = path.join(ROOT, 'source-code-wix');
const WIX_REF_PAGES = {
  '': 'source-code',
  home: 'source-code',
  services: 'services',
  'services/consulting-1': 'service/consulting-1',
  'services/consulting-2': 'service/consulting-2',
  'services/consulting-3': 'service/consulting-3',
  contact: 'contact',
  projects: 'projects',
  'project-case-studies': 'projects',
  'team-members-1': 'about-us',
  about: 'about-us',
  'about-us': 'about-us',
};

async function sendWixReference(pageKey, req, res, next) {
  const file = WIX_REF_PAGES[pageKey];
  if (!file) {
    return res.status(404).send('Unknown reference page. Try /reference, /reference/services, /reference/contact, /reference/projects, /reference/about-us');
  }
  try {
    const origin = require('./lib/wix-html').publicOriginFromRequest(req);
    const refPath = pageKey ? `${require('./lib/wix-html').KBIZ_PATH_PREFIX}/${pageKey}` : '/';
    const html = await loadLocalHtml(WIX_REF_DIR, file, origin, refPath || '/');
    res.type('html').send(html);
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).send(`Missing source-code-wix/${file}`);
    next(e);
  }
}

app.get(['/reference', '/reference/'], (req, res, next) => sendWixReference('', req, res, next));
app.get('/reference/:page', (req, res, next) => sendWixReference(req.params.page, req, res, next));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now(), siteMode: SITE_MODE, persistence: 'json-files' }));

app.post('/api/auth/login', (req, res) => {
  const { user, pass } = req.body || {};
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return res.json({ user, token: token(user) });
  }
  res.status(401).json({ error: 'bad-credentials' });
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }));

app.get('/api/site', async (req, res) => {
  try {
    const site = await readJSON('site', null);
    if (!site) return res.status(404).json({ error: 'not-found' });
    res.json(site);
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: 'not-found' });
    throw e;
  }
});

app.get('/api/pages', async (req, res) => {
  try {
    const files = await fsp.readdir(PAGES_DIR);
    const ids = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
    res.json({ pages: ids });
  } catch (e) {
    if (e.code === 'ENOENT') return res.json({ pages: [] });
    throw e;
  }
});

app.get('/api/pages/:id', async (req, res) => {
  try {
    const page = await readPage(req.params.id);
    res.json(page);
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: 'not-found' });
    throw e;
  }
});

app.get('/api/posts', async (req, res) => {
  res.json(await readJSON('posts', SEED_POSTS));
});
app.get('/api/posts/slug/:slug', async (req, res) => {
  const all = await readJSON('posts', SEED_POSTS);
  const p = all.find(x => x.slug === req.params.slug);
  if (!p) return res.status(404).json({ error: 'not-found' });
  res.json(p);
});
app.get('/api/posts/:id', async (req, res) => {
  const all = await readJSON('posts', SEED_POSTS);
  const p = all.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'not-found' });
  res.json(p);
});
app.post('/api/posts', requireAuth, async (req, res) => {
  const all = await readJSON('posts', SEED_POSTS);
  const body = req.body || {};
  const id = body.id || uid();
  const i = all.findIndex(x => x.id === id);
  const next = { ...body, id, updatedAt: new Date().toISOString() };
  if (!next.legacyHash && next.slug) {
    next.legacyHash = '/project-case-studies/' + next.slug;
  }
  if (i >= 0) all[i] = next; else all.unshift(next);
  await writeJSON('posts', all);
  res.json(next);
});
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  const all = await readJSON('posts', SEED_POSTS);
  await writeJSON('posts', all.filter(x => x.id !== req.params.id));
  res.json({ ok: true });
});
app.put('/api/posts', requireAuth, async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'expected-array' });
  await writeJSON('posts', req.body);
  res.json({ ok: true, count: req.body.length });
});

app.get('/api/messages', requireAuth, async (req, res) => {
  res.json(await readJSON('messages', SEED_MESSAGES));
});
app.post('/api/messages', async (req, res) => {
  const all = await readJSON('messages', SEED_MESSAGES);
  const m = { ...req.body, id: 'm_' + uid(), receivedAt: new Date().toISOString(), read: false };
  all.unshift(m);
  await writeJSON('messages', all);
  res.status(201).json(m);
});
app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  const all = await readJSON('messages', SEED_MESSAGES);
  await writeJSON('messages', all.filter(x => x.id !== req.params.id));
  res.json({ ok: true });
});
app.patch('/api/messages/:id', requireAuth, async (req, res) => {
  const all = await readJSON('messages', SEED_MESSAGES);
  const i = all.findIndex(x => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'not-found' });
  all[i] = { ...all[i], ...req.body };
  await writeJSON('messages', all);
  res.json(all[i]);
});

app.get('/api/settings', async (req, res) => {
  res.json(await readJSON('settings', SEED_SETTINGS));
});
app.put('/api/settings', requireAuth, async (req, res) => {
  const next = { ...SEED_SETTINGS, ...await readJSON('settings', SEED_SETTINGS), ...(req.body || {}) };
  await writeJSON('settings', next);
  res.json(next);
});

const storage = multer.diskStorage({
  destination: async (req, file, cb) => { await ensureDir(UPLOAD_DIR); cb(null, UPLOAD_DIR); },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.-]+/g, '_').slice(-60);
    cb(null, Date.now().toString(36) + '-' + safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('image-only'), ok);
  },
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no-file' });
  res.status(201).json({ url: '/uploads/' + req.file.filename, filename: req.file.filename, size: req.file.size });
});

app.get('/api/export', requireAuth, async (req, res) => {
  let pageIds = [];
  try {
    const files = await fsp.readdir(PAGES_DIR);
    pageIds = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
  } catch {}
  res.json({
    site: await readJSON('site', null).catch(() => null),
    pageIds,
    posts: await readJSON('posts', SEED_POSTS),
    messages: await readJSON('messages', SEED_MESSAGES),
    settings: await readJSON('settings', SEED_SETTINGS),
    exportedAt: new Date().toISOString(),
  });
});

app.post('/api/import', requireAuth, async (req, res) => {
  const b = req.body || {};
  if (Array.isArray(b.posts)) await writeJSON('posts', b.posts);
  if (Array.isArray(b.messages)) await writeJSON('messages', b.messages);
  if (b.settings && typeof b.settings === 'object') await writeJSON('settings', b.settings);
  res.json({ ok: true });
});

(async () => {
  await ensureDir(DATA_DIR);
  await ensureDir(PAGES_DIR);
  await ensureDir(UPLOAD_DIR);
  await ensureDir(SITE_ASSETS);
  await readJSON('posts', SEED_POSTS);
  await readJSON('messages', SEED_MESSAGES);
  await readJSON('settings', SEED_SETTINGS);

  const INDEX_HTML = path.join(ROOT, 'index.html');
  const REACT_SHELL = /^\/(admin(\/.*)?|preview(\/.*)?)$/;

  app.get(REACT_SHELL, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(INDEX_HTML, (err) => (err ? next(err) : undefined));
  });

  app.get(/^\/(?!api|reference|uploads|site-assets|assets|node_modules).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (SITE_MODE === 'react') {
      return res.sendFile(INDEX_HTML, (err) => (err ? next(err) : undefined));
    }
    return serveWixPage(req, res, WIX_REF_DIR, next);
  });

  app.listen(PORT, () => {
    console.log('K-Biz site at http://localhost:' + PORT);
    console.log('  Site mode: ' + SITE_MODE + (SITE_MODE === 'wix' ? ' (Wix HTML snapshots)' : ' (React SPA)'));
    console.log('  Admin: http://localhost:' + PORT + '/admin — ' + ADMIN_USER + ' / ' + ADMIN_PASS);
    if (SITE_MODE === 'wix') console.log('  React preview: http://localhost:' + PORT + '/preview');
  });
})();
