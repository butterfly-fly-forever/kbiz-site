# K-Biz Site Clone

Node + Express + React (in-browser) clone of the K-Biz Consulting marketing site, with JSON-backed content and an admin CMS copied from the legacy KBiz project.

## Quick start

```bash
cd kbiz-site-clone
npm install
npm start
```

Open http://localhost:3000 — **public site serves Wix HTML snapshots** (`source-code-wix/`) for pixel-faithful UI (`SITE_MODE=wix`, default). Admin CMS: `/admin`. Legacy React clone: `/preview` or `SITE_MODE=react npm start`.

| URL | Page |
|-----|------|
| `/` | Home (Wix snapshot, interactive) |
| `/services` → `/kbizconsulting/services` | Services list |
| `/services/consulting-1` | Investment Consulting |
| `/services/consulting-2` | Start New Business |
| `/services/consulting-3` | Business Developing Services |
| `/contact` → `/kbizconsulting/contact` | Contact |
| `/project-case-studies` → `/kbizconsulting/...` | Projects |
| `/team-members-1` → `/kbizconsulting/...` | About / Team |

Inner pages use the `/kbizconsulting/...` path so Wix routing matches the export. Short URLs redirect automatically.

Sharp images: Wix `static.wixstatic.com` URLs for known assets are replaced with **`/kbiz-media/*`** from `kbiz-clone/images/` (run `npm run sync:kbiz-images` to mirror into `public/site-assets/` for React preview). Other paths without a snapshot are proxied from live Wix.

Set `WIX_INTERACTIVE=1` to keep Thunderbolt scripts on every page (home only is interactive by default).

Default admin credentials (override with env):

- User: `admin`
- Password: `kbiz2026`

## Crawl source site → JSON + assets

Populates `data/pages/*.json`, `data/posts.json`, `data/site.json`, `public/site-assets/`, and `crawl-screenshots/`:

```bash
npm run crawl
```

Expects **12 URLs** (8 static pages + 4 case-study posts). See `data/crawl-manifest.json`.

Sync images from Wix HTML snapshots in `source-code-wix/`:

```bash
npm run sync:wix
```

Optional env:

```bash
CRAWL_BASE_URL=https://5thepassionfruitde.wixstudio.com/kbizconsulting npm run crawl
```

## Visual comparison

With the server running:

```bash
npm run compare
# or: node scripts/compare-sites.mjs home
```

Compares local `/` to the live Wix site (should be very close in `SITE_MODE=wix`, default).

## Public routes (clean URLs)

| Path | Content |
|------|---------|
| `/` | `data/pages/home.json` |
| `/services` | `data/pages/services.json` |
| `/services/consulting-1` … `consulting-3` | Service detail pages |
| `/project-case-studies` | Listing (posts from API) |
| `/project-case-studies/:slug` | Case study from `data/posts.json` |
| `/insights/:slug` | Same post detail (alias) |
| `/team-members-1` | About us |
| `/contact` | Contact form → `POST /api/messages` |
| `/admin` | CMS |

## Admin

- **Posts** — case studies / articles; body in `data/posts.json` only (WYSIWYG `editor.jsx`)
- **Messages** — contact form submissions
- **Settings** — email, phone, address (footer + contact page)

Published posts show a **public URL** (`/project-case-studies/:slug`) in the admin list.

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/site` | — | `site.json` |
| `GET /api/pages/:id` | — | Page JSON |
| `GET /api/posts` | — | All posts |
| `GET /api/posts/slug/:slug` | — | Post by slug |
| `POST /api/messages` | — | Contact form |
| `POST /api/auth/login` | — | Admin token |
| `POST /api/posts` | Bearer | Upsert post |
| `PUT /api/settings` | Bearer | Settings |

## Content store abstraction (JSON → MongoDB)

`lib/content-store.js` defines:

- `JsonContentStore` — current file-based implementation
- `MongoContentStore` — same interface for MongoDB

Migrate when ready:

```bash
npm install mongodb
MONGODB_URI=mongodb://127.0.0.1:27017/kbiz npm run migrate:json-to-mongo
```

Wire `MongoContentStore` into `server.js` instead of `readJSON`/`writeJSON` to keep the same REST API for admin and public clients.

## Project layout

```
kbiz-site-clone/
├── server.js
├── index.html
├── data/
│   ├── site.json
│   ├── posts.json
│   ├── pages/*.json
│   └── crawl-manifest.json
├── public/site-assets/
├── assets/
│   ├── site.css
│   ├── site-components.jsx   # SectionRenderer
│   ├── site-pages.jsx
│   ├── app.jsx
│   ├── store.js
│   ├── admin.jsx
│   └── editor.jsx
├── scripts/
│   ├── crawl-site.mjs
│   ├── visual-diff.mjs
│   └── migrate-json-to-mongo.mjs
└── lib/content-store.js
```

## Naming convention

Repo file and folder names avoid the substring `wix`. Source URLs are stored only in `meta.sourceUrl` inside crawled JSON.
