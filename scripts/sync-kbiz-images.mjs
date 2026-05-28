#!/usr/bin/env node
/** Copy kbiz-clone/images → public/site-assets for React/preview mode. */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'kbiz-clone', 'images');
const DEST = path.join(ROOT, 'public', 'site-assets');

const ALIASES = {
  'svc-consulting-1.jpg': 'service-investment.jpg',
  'svc-consulting-2.jpg': 'service-newbiz.jpg',
  'svc-consulting-3.jpg': 'service-bizdev.jpg',
};

async function main() {
  await fs.mkdir(DEST, { recursive: true });
  const files = await fs.readdir(SRC);
  let n = 0;
  for (const f of files) {
    if (!/\.(jpe?g|png|webp|gif)$/i.test(f)) continue;
    await fs.copyFile(path.join(SRC, f), path.join(DEST, f));
    n++;
    const alias = Object.entries(ALIASES).find(([, v]) => v === f)?.[0];
    if (alias) await fs.copyFile(path.join(SRC, f), path.join(DEST, alias));
  }
  console.log(`Copied ${n} images from kbiz-clone/images to public/site-assets/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
