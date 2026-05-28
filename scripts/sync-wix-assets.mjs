#!/usr/bin/env node
/**
 * Download key media from source-code-wix HTML into public/site-assets.
 * Usage: node scripts/sync-wix-assets.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIX_DIR = path.join(ROOT, 'source-code-wix');
const ASSETS = path.join(ROOT, 'public', 'site-assets');

const ASSET_MAP = [
  { file: 'logo.png', uri: 'a6d944_cb3a577e306f477d950688b6d94b60d7~mv2.png', w: 400, h: 170 },
  { file: 'hero-nhatrang.jpg', uri: 'a6d944_93726c78dcbc442b87fe455c878a4a5e~mv2.jpg', w: 1920, h: 1080 },
  { file: 'about-office.jpg', uri: 'a6d944_999ef32b8bd14ac28a50648a6c022622~mv2.jpg', w: 1920, h: 900 },
  { file: 'svc-consulting-1.jpg', uri: 'f6985b_0ef6350aab5641e1ae86daec2c5cbf1f~mv2.jpg', w: 800, h: 600 },
  { file: 'svc-consulting-2.jpg', uri: 'f6985b_11707ae0378e44e8b2fea737459dfaf2~mv2.jpg', w: 800, h: 600 },
  { file: 'svc-consulting-3.jpg', uri: 'f6985b_cc991a5577ce4743ba7c2575e6909925~mv2.jpg', w: 800, h: 600 },
  { file: 'team-huynh-thi-hang.png', uri: 'a6d944_5b7060c85c774a699f59ad2ceb870e1a~mv2.png', w: 400, h: 400 },
  { file: 'team-khanh-hiep.png', uri: 'a6d944_0a5c963a2d7e4e4fbd0221ab4e61a37c~mv2.png', w: 400, h: 400 },
  { file: 'team-thuy-nhi.png', uri: 'a6d944_838e50a7f6e74583961dd62ea6e5875b~mv2.png', w: 400, h: 400 },
  { file: 'team-thai-son.png', uri: 'a6d944_8a32cd3a796246ecaa18369617aae75f~mv2.png', w: 400, h: 400 },
  { file: 'team-hai-anh.png', uri: 'a6d944_6e87e865e89a433aa8fafcb258c4be63~mv2.png', w: 400, h: 400 },
  { file: 'team-kim-khanh.png', uri: 'a6d944_7222cf48aeae4001a66a4b83b8cfe393~mv2.png', w: 400, h: 400 },
];

const REFERER = 'https://5thepassionfruitde.wixstudio.com/kbizconsulting';

function wixUrl(uri, w, h) {
  return `https://static.wixstatic.com/media/${uri}/v1/fit/w_${w},h_${h},q_90,enc_auto/file.jpg`;
}

async function downloadOne({ file, uri, w, h }) {
  const url = wixUrl(uri, w, h);
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { Referer: REFERER, 'User-Agent': 'kbiz-site-clone/1.0' },
  });
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const fp = path.join(ASSETS, file);
  await fs.writeFile(fp, buf);
  return { file, bytes: buf.length, url };
}

async function main() {
  await fs.mkdir(ASSETS, { recursive: true });
  const results = [];
  for (const item of ASSET_MAP) {
    try {
      results.push(await downloadOne(item));
      console.log('OK', item.file);
    } catch (e) {
      console.warn('SKIP', item.file, e.message);
    }
  }
  await fs.writeFile(
    path.join(ROOT, 'data', 'wix-assets-manifest.json'),
    JSON.stringify({ downloadedAt: new Date().toISOString(), results }, null, 2),
  );
  console.log(`Done — ${results.length}/${ASSET_MAP.length} assets in public/site-assets/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
