/**
 * Content store abstraction — swap JSON files for MongoDB without changing API routes.
 *
 * JsonContentStore: current default (server.js readJSON/writeJSON)
 * MongoContentStore: implement same interface, then wire in server bootstrap
 */

const path = require('path');
const fsp = require('fs/promises');

class JsonContentStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.pagesDir = path.join(dataDir, 'pages');
  }

  async read(name, fallback) {
    const fp = path.join(this.dataDir, name + '.json');
    try {
      return JSON.parse(await fsp.readFile(fp, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT' && fallback !== undefined) return fallback;
      throw e;
    }
  }

  async write(name, value) {
    const fp = path.join(this.dataDir, name + '.json');
    const tmp = fp + '.tmp';
    await fsp.mkdir(this.dataDir, { recursive: true });
    await fsp.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await fsp.rename(tmp, fp);
    return value;
  }

  async getSite() {
    return this.read('site', null);
  }

  async listPageIds() {
    try {
      const files = await fsp.readdir(this.pagesDir);
      return files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
    } catch {
      return [];
    }
  }

  async getPage(id) {
    const fp = path.join(this.pagesDir, id + '.json');
    return JSON.parse(await fsp.readFile(fp, 'utf8'));
  }

  async getPosts() {
    return this.read('posts', []);
  }

  async savePosts(posts) {
    return this.write('posts', posts);
  }

  async getMessages() {
    return this.read('messages', []);
  }

  async saveMessages(messages) {
    return this.write('messages', messages);
  }

  async getSettings() {
    return this.read('settings', {});
  }

  async saveSettings(settings) {
    return this.write('settings', settings);
  }
}

/**
 * MongoContentStore skeleton — connect with MONGODB_URI, map collections:
 *   site (single doc), pages, posts, messages, settings
 */
class MongoContentStore {
  constructor(client, dbName = 'kbiz') {
    this.client = client;
    this.dbName = dbName;
  }

  db() {
    return this.client.db(this.dbName);
  }

  async getSite() {
    return this.db().collection('site').findOne({ _id: 'main' });
  }

  async getPage(id) {
    return this.db().collection('pages').findOne({ id });
  }

  async listPageIds() {
    const docs = await this.db().collection('pages').find({}, { projection: { id: 1 } }).toArray();
    return docs.map((d) => d.id);
  }

  async getPosts() {
    return this.db().collection('posts').find({}).sort({ publishedAt: -1 }).toArray();
  }

  async savePosts(posts) {
    const col = this.db().collection('posts');
    await col.deleteMany({});
    if (posts.length) await col.insertMany(posts);
    return posts;
  }

  async getMessages() {
    return this.db().collection('messages').find({}).sort({ receivedAt: -1 }).toArray();
  }

  async saveMessages(messages) {
    const col = this.db().collection('messages');
    await col.deleteMany({});
    if (messages.length) await col.insertMany(messages);
    return messages;
  }

  async getSettings() {
    return this.db().collection('settings').findOne({ _id: 'main' });
  }

  async saveSettings(settings) {
    await this.db().collection('settings').replaceOne({ _id: 'main' }, { _id: 'main', ...settings }, { upsert: true });
    return settings;
  }
}

module.exports = { JsonContentStore, MongoContentStore };
