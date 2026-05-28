#!/usr/bin/env node
/**
 * Import data/*.json into MongoDB.
 * Requires: MONGODB_URI=mongodb://localhost:27017/kbiz
 * Usage: node scripts/migrate-json-to-mongo.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const PAGES = path.join(DATA, 'pages');

async function readJson(fp) {
  return JSON.parse(await fs.readFile(fp, 'utf8'));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI (e.g. mongodb://127.0.0.1:27017/kbiz)');
    process.exit(1);
  }
  let MongoClient;
  try {
    ({ MongoClient } = await import('mongodb'));
  } catch {
    console.error('Install mongodb: npm install mongodb');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const site = await readJson(path.join(DATA, 'site.json'));
  await db.collection('site').replaceOne({ _id: 'main' }, { _id: 'main', ...site }, { upsert: true });

  const settings = await readJson(path.join(DATA, 'settings.json'));
  await db.collection('settings').replaceOne({ _id: 'main' }, { _id: 'main', ...settings }, { upsert: true });

  const posts = await readJson(path.join(DATA, 'posts.json'));
  await db.collection('posts').deleteMany({});
  if (posts.length) await db.collection('posts').insertMany(posts);

  const messages = await readJson(path.join(DATA, 'messages.json'));
  await db.collection('messages').deleteMany({});
  if (messages.length) await db.collection('messages').insertMany(messages);

  const files = await fs.readdir(PAGES);
  await db.collection('pages').deleteMany({});
  for (const f of files.filter((x) => x.endsWith('.json'))) {
    const page = await readJson(path.join(PAGES, f));
    await db.collection('pages').insertOne(page);
  }

  console.log('Migrated site, settings,', posts.length, 'posts,', files.length, 'pages');
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
