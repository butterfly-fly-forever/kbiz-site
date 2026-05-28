/**
 * Serve Wix HTML snapshots with URL rewrite for local hosting (pixel-faithful mode).
 */

const fsp = require('fs/promises');
const path = require('path');
const { applyKbizMedia, sharpifyWixImages } = require('./kbiz-media');

const WIX_LIVE_ORIGIN = 'https://5thepassionfruitde.wixstudio.com/kbizconsulting';

/** slug path (no leading slash) → file name in source-code-wix/ */
const LOCAL_SNAPSHOT = {
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
  'about-us': 'about-us',
  about: 'about-us',
};

const PREFIX_SNAPSHOT = [
  { prefix: 'project-case-studies', file: 'projects' },
  { prefix: 'team-members', file: 'about-us' },
];

const fileCache = new Map();
const rewrittenCache = new Map();

function normalizePathname(pathname) {
  const p = (pathname || '/').split('?')[0].replace(/\/+/g, '/');
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p || '/';
}

const KBIZ_PATH_PREFIX = '/kbizconsulting';

function stripKbizPrefix(pathname) {
  const p = normalizePathname(pathname);
  if (p === KBIZ_PATH_PREFIX || p.startsWith(KBIZ_PATH_PREFIX + '/')) {
    const rest = p.slice(KBIZ_PATH_PREFIX.length) || '/';
    return rest === '/' ? '/' : rest;
  }
  return p;
}

function slugFromPathname(pathname) {
  const p = stripKbizPrefix(pathname);
  return p === '/' ? '' : p.replace(/^\//, '');
}

function isHomePath(pathname) {
  const p = stripKbizPrefix(pathname);
  return p === '/';
}

function resolveLocalSnapshot(slug) {
  if (Object.prototype.hasOwnProperty.call(LOCAL_SNAPSHOT, slug)) {
    return LOCAL_SNAPSHOT[slug];
  }
  for (const { prefix, file } of PREFIX_SNAPSHOT) {
    if (slug === prefix || slug.startsWith(prefix + '/')) return file;
  }
  return null;
}

/** Remove Wix Thunderbolt runtime so SSR markup stays visible (pixel-faithful static mode). */
function stripWixRuntimeScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function stabilizeWixHtml(html) {
  return html
    .replace(/thunderbolt-renderer-gradual/g, 'wix-thunderbolt')
    .replace(/"isTBRollout":true/g, '"isTBRollout":false');
}

/** Remove "Built on WIX STUDIO" freemium banner (#WIX_ADS) and its reserved layout gap. */
function stripWixBranding(html) {
  let out = html
    .replace(/<!--\$-->\s*<div id="WIX_ADS"[\s\S]*?<\/div>\s*<!--\/\$-->/gi, '')
    .replace(/<div id="WIX_ADS"[\s\S]*?<\/div>/gi, '')
    .replace(/--wix-ads-height:\s*[^;]+;/gi, '--wix-ads-height: 0px !important;')
    .replace(/--sticky-offset:\s*30px\s*;/gi, '--sticky-offset: 0px !important;');
  const hideCss = `<style id="kbiz-hide-wix-ads">
:root{--wix-ads-height:0px!important;--sticky-offset:0px!important}
#WIX_ADS,.WIX_ADS,.ub230c{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;position:absolute!important;pointer-events:none!important}
#site-root,#SITE_CONTAINER #site-root{top:0!important;margin-top:0!important}
#masterPage.mesh-layout #SITE_HEADER_WRAPPER,#masterPage.mesh-layout #SITE_HEADER-placeholder{margin-top:0!important}
[id^="comp-kbgakxea"],.comp-kbgakxea-container,[class*="wixui-header"]{top:0!important}
.mesh-layout #site-root,.mesh-layout main,.mesh-layout footer{width:100%!important;max-width:100%!important}
.mesh-layout .max-width-container{max-width:min(100%,var(--site-width,980px))!important;margin-left:auto!important;margin-right:auto!important}
#SITE_CONTAINER,#main_MF{overflow-x:clip!important}
.Qh0lWW[data-animate-blur] img,[data-animate-blur] img{filter:none!important;opacity:1!important}
header .wixui-horizontal-menu .OD_PyT,header .wixui-horizontal-menu nav,header .StylableHorizontalMenu3372578893__root{display:flex!important;flex-direction:row!important;align-items:center!important;height:auto!important;max-height:39px!important}
header .wixui-horizontal-menu .OD_PyT,header .wixui-horizontal-menu nav,header .StylableHorizontalMenu3372578893__menu{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;align-self:center!important;gap:0 24px!important;height:39px!important;max-height:39px!important;margin-top:0!important;margin-bottom:0!important;flex:0 0 auto!important}
header .ScrollControls2015960785__root,header .ScrollButton2305195801__root{display:none!important}
header .StylableHorizontalMenu3372578893__menuItem{padding-top:0!important;padding-bottom:0!important;margin-top:0!important;margin-bottom:0!important}
header .itemDepth02233374943__itemWrapper,header .itemShared2352141355__rootContainer{display:inline-flex!important;flex-direction:row!important;align-items:center!important;align-self:center!important;position:relative!important;margin-top:0!important;margin-bottom:0!important;height:39px!important}
header #SITE_HEADER,header #SITE_HEADER_WRAPPER,header .wixui-header,header .StylableHorizontalMenu3372578893__root,header .itemDepth02233374943__itemWrapper{overflow:visible!important}
header .StylableHorizontalMenu3372578893__columnsLayout,header .itemDepth02233374943__positionBox,header .itemDepth02233374943__animationBox,header .submenu815198092__pageWrapper,header .submenu815198092__root{position:absolute!important;top:100%!important;left:0!important;min-width:260px!important;display:block!important;height:auto!important;max-height:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;overflow:visible!important;z-index:10050!important;background:#dbf9eb!important;box-shadow:0 8px 24px rgba(0,0,0,.12)!important;padding:8px 0!important;margin:0!important}
header .itemDepth02233374943__itemWrapper:hover .StylableHorizontalMenu3372578893__columnsLayout,header .itemDepth02233374943__itemWrapper:hover .itemDepth02233374943__positionBox,header .itemDepth02233374943__itemWrapper:hover .itemDepth02233374943__animationBox,header .itemDepth02233374943__itemWrapper:hover .submenu815198092__pageWrapper,header .itemDepth02233374943__itemWrapper:focus-within .StylableHorizontalMenu3372578893__columnsLayout,header .itemDepth02233374943__itemWrapper:focus-within .itemDepth02233374943__positionBox,header .itemDepth02233374943__itemWrapper:focus-within .itemDepth02233374943__animationBox,header .itemDepth02233374943__itemWrapper:focus-within .submenu815198092__pageWrapper,header .itemDepth02233374943__itemWrapper.kbiz-submenu-open .StylableHorizontalMenu3372578893__columnsLayout,header .itemDepth02233374943__itemWrapper.kbiz-submenu-open .itemDepth02233374943__positionBox,header .itemDepth02233374943__itemWrapper.kbiz-submenu-open .itemDepth02233374943__animationBox,header .itemDepth02233374943__itemWrapper.kbiz-submenu-open .submenu815198092__pageWrapper{opacity:1!important;visibility:visible!important;pointer-events:auto!important}
header .submenu815198092__menuItem,header .itemDepth12472627565__itemWrapper{display:block!important}
header .submenu815198092__listWrapper,header .submenu815198092__pageStretchWrapper{background:#dbf9eb!important}
header .submenu815198092__menuItem,header .submenu815198092__menuItem.itemDepth12472627565--isCurrentPage,header .submenu815198092__menuItem.itemDepth12472627565--isHovered{background:transparent!important}
header .submenu815198092__menuItem a,header .itemDepth12472627565__root{display:block!important;padding:10px 16px!important;white-space:nowrap!important;text-decoration:none!important;color:#005e2c!important}
header .itemDepth12472627565__label,header .submenu815198092__menuItem .itemDepth12472627565__label,header .submenu815198092__menuItem.itemDepth12472627565--isCurrentPage .itemDepth12472627565__label,header .submenu815198092__menuItem.itemDepth12472627565--isHovered .itemDepth12472627565__label{color:#005e2c!important;-webkit-text-fill-color:#005e2c!important;text-shadow:none!important}
header .submenu815198092__menuItem a:hover,header .submenu815198092__menuItem.itemDepth12472627565--isHovered{background:rgba(0,94,44,.08)!important}
header [id*="comp-md17tq0e"]{display:none!important}
</style>`;
  if (!out.includes('kbiz-hide-wix-ads')) {
    out = out.includes('</head>') ? out.replace('</head>', hideCss + '</head>') : hideCss + out;
  }
  return injectHeaderMenuScript(out);
}

/** Wix menu flyouts need JS when Thunderbolt is stripped; CSS :hover alone is unreliable. */
function injectHeaderMenuScript(html) {
  if (html.includes('kbiz-header-menu')) return html;
  const script = `<script id="kbiz-header-menu">(function(){function bind(){var h=document.querySelector("header");if(!h||h.dataset.kbizMenuBound)return;h.dataset.kbizMenuBound="1";h.querySelectorAll(".itemDepth02233374943__itemWrapper").forEach(function(li){var box=li.querySelector(".itemDepth02233374943__positionBox");if(!box)return;li.addEventListener("mouseenter",function(){li.classList.add("kbiz-submenu-open")});li.addEventListener("mouseleave",function(){li.classList.remove("kbiz-submenu-open")});var btn=li.querySelector(".itemShared2352141355__accessibilityIcon");if(btn)btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();li.classList.toggle("kbiz-submenu-open")})})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind()})();</script>`;
  if (html.includes('</body>')) return html.replace('</body>', script + '</body>');
  return html + script;
}

/** Home snapshot hydrates correctly; other pages need static SSR after URL rewrite. */
const INTERACTIVE_SNAPSHOTS = new Set(['source-code']);

function rewriteWixHtml(html, publicOrigin, pathname, fileName) {
  let out = stabilizeWixHtml(html);
  const pub = (publicOrigin || '').replace(/\/$/, '');
  const localBase = isHomePath(pathname) ? pub : pub + KBIZ_PATH_PREFIX;
  const pairs = [
    ['https://5thepassionfruitde.wixstudio.com/kbizconsulting/', localBase + '/'],
    ['https://5thepassionfruitde.wixstudio.com/kbizconsulting', localBase],
    ['https:\\/\\/5thepassionfruitde.wixstudio.com\\/kbizconsulting\\/', localBase.replace(/\//g, '\\/') + '\\/'],
    ['https:\\/\\/5thepassionfruitde.wixstudio.com\\/kbizconsulting', localBase.replace(/\//g, '\\/')],
  ];
  for (const [from, to] of pairs) out = out.split(from).join(to);
  const keepScripts =
    process.env.WIX_INTERACTIVE === '1' ||
    (fileName && INTERACTIVE_SNAPSHOTS.has(fileName));
  if (!keepScripts) out = stripWixRuntimeScripts(out);
  out = stripWixBranding(out);
  out = sharpifyWixImages(out);
  out = applyKbizMedia(out, fileName);
  return out;
}

function clearHtmlCaches() {
  fileCache.clear();
  rewrittenCache.clear();
}

async function readSnapshotFile(wixDir, fileName) {
  const key = fileName;
  if (!fileCache.has(key)) {
    const fp = path.join(wixDir, fileName);
    fileCache.set(key, await fsp.readFile(fp, 'utf8'));
  }
  return fileCache.get(key);
}

async function loadLocalHtml(wixDir, fileName, publicOrigin, pathname) {
  const cacheKey = fileName + '|' + publicOrigin + '|' + (pathname || '/');
  if (rewrittenCache.has(cacheKey)) return rewrittenCache.get(cacheKey);
  const raw = await readSnapshotFile(wixDir, fileName);
  const html = rewriteWixHtml(raw, publicOrigin, pathname || '/', fileName);
  rewrittenCache.set(cacheKey, html);
  return html;
}

async function fetchLiveHtml(pathname, search) {
  const p = normalizePathname(pathname);
  const url = WIX_LIVE_ORIGIN + (p === '/' ? '' : p) + (search || '');
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'kbiz-site-clone/1.0',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    const err = new Error('wix-fetch-' + res.status);
    err.status = res.status;
    throw err;
  }
  return res.text();
}

function publicOriginFromRequest(req) {
  if (process.env.KBIZ_PUBLIC_URL) return process.env.KBIZ_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${process.env.PORT || 3000}`;
  return `${proto}://${host}`.replace(/\/$/, '');
}

/**
 * @returns {{ mode: 'local'|'proxy', file?: string }}
 */
function resolveRoute(pathname) {
  const slug = slugFromPathname(pathname);
  const file = resolveLocalSnapshot(slug);
  if (file) return { mode: 'local', file };
  return { mode: 'proxy' };
}

/** Short paths → Wix router base (required for client hydration on inner pages). */
const CANONICAL_REDIRECTS = {
  '/services': KBIZ_PATH_PREFIX + '/services',
  '/contact': KBIZ_PATH_PREFIX + '/contact',
  '/project-case-studies': KBIZ_PATH_PREFIX + '/project-case-studies',
  '/team-members-1': KBIZ_PATH_PREFIX + '/team-members-1',
  '/about-us': KBIZ_PATH_PREFIX + '/about-us',
  '/about': KBIZ_PATH_PREFIX + '/team-members-1',
  '/projects': KBIZ_PATH_PREFIX + '/project-case-studies',
};

function canonicalRedirectTarget(pathname) {
  const p = normalizePathname(pathname);
  if (CANONICAL_REDIRECTS[p]) return CANONICAL_REDIRECTS[p];
  if (p.startsWith('/services/') && !p.startsWith(KBIZ_PATH_PREFIX)) {
    return KBIZ_PATH_PREFIX + p;
  }
  if (p.startsWith('/project-case-studies/') && !p.startsWith(KBIZ_PATH_PREFIX)) {
    return KBIZ_PATH_PREFIX + p;
  }
  if (p.startsWith('/team-members') && !p.startsWith(KBIZ_PATH_PREFIX)) {
    return KBIZ_PATH_PREFIX + p;
  }
  return null;
}

async function serveWixPage(req, res, wixDir, next) {
  try {
    const redirectTo = canonicalRedirectTarget(req.path);
    if (redirectTo) {
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      return res.redirect(301, redirectTo + qs);
    }

    const origin = publicOriginFromRequest(req);
    const route = resolveRoute(req.path);

    if (route.mode === 'local') {
      const html = await loadLocalHtml(wixDir, route.file, origin, req.path);
      res.setHeader('Cache-Control', 'no-cache');
      res.type('html').send(html);
      return;
    }

    const proxyPath = stripKbizPrefix(req.path);
    const raw = await fetchLiveHtml(
      proxyPath,
      req.url.includes('?') ? '?' + req.url.split('?')[1] : '',
    );
    const html = rewriteWixHtml(raw, origin, req.path, null);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  } catch (e) {
    if (e.status === 404) return res.status(404).send('Page not found on Wix.');
    if (e.code === 'ENOENT') return res.status(404).send('Missing Wix snapshot.');
    next(e);
  }
}

module.exports = {
  LOCAL_SNAPSHOT,
  WIX_LIVE_ORIGIN,
  KBIZ_PATH_PREFIX,
  normalizePathname,
  stripKbizPrefix,
  slugFromPathname,
  isHomePath,
  resolveLocalSnapshot,
  resolveRoute,
  rewriteWixHtml,
  loadLocalHtml,
  fetchLiveHtml,
  publicOriginFromRequest,
  canonicalRedirectTarget,
  serveWixPage,
  clearHtmlCaches,
};
