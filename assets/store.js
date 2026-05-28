(function () {
  const NS = 'kbiz.v1.';
  const KEYS = {
    posts: NS + 'posts',
    messages: NS + 'messages',
    settings: NS + 'settings',
    site: NS + 'site',
    pages: NS + 'pages',
    auth: NS + 'auth',
    token: NS + 'token',
    lang: NS + 'lang',
  };

  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw); }
    catch { return fallback; }
  }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function uid() { return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  const Api = {
    base: '/api',
    available: false,
    get token() { return read(KEYS.token, null); },
    set token(v) { v ? write(KEYS.token, v) : localStorage.removeItem(KEYS.token); },
    headers(extra = {}) {
      const h = { 'content-type': 'application/json', ...extra };
      if (this.token) h.authorization = 'Bearer ' + this.token;
      return h;
    },
    async _req(method, path, body, opts = {}) {
      const init = { method, headers: opts.upload ? (this.token ? { authorization: 'Bearer ' + this.token } : {}) : this.headers() };
      if (body !== undefined) init.body = opts.upload ? body : JSON.stringify(body);
      const r = await fetch(this.base + path, init);
      if (!r.ok) throw Object.assign(new Error('api-' + r.status), { status: r.status });
      const ct = r.headers.get('content-type') || '';
      return ct.includes('application/json') ? r.json() : r.text();
    },
    get(p) { return this._req('GET', p); },
    post(p, b) { return this._req('POST', p, b); },
    put(p, b) { return this._req('PUT', p, b); },
    patch(p, b) { return this._req('PATCH', p, b); },
    del(p) { return this._req('DELETE', p); },
    upload(file) {
      const fd = new FormData();
      fd.append('file', file);
      return this._req('POST', '/upload', fd, { upload: true });
    },
    async ping() {
      try { const r = await fetch(this.base + '/health'); this.available = r.ok; }
      catch { this.available = false; }
      return this.available;
    },
  };

  const SEED_POSTS = [];
  const SEED_MESSAGES = [];
  const SEED_SETTINGS = {
    contactEmail: 'kbizconsulting16@gmail.com',
    contactPhone: '(0258) 3516 343',
    contactAddress: '16A Le Quy Don St, Nha Trang Ward, Khanh Hoa Province',
  };

  async function pull(name, lsKey, fallback) {
    if (!Api.available) return;
    try {
      const data = await Api.get('/' + name);
      write(lsKey, data);
      Store._emit(name);
    } catch {}
  }

  function pushPosts(arr) { if (Api.available && Api.token) Api.put('/posts', arr).catch(() => {}); }
  function pushSettings(obj) { if (Api.available && Api.token) Api.put('/settings', obj).catch(() => {}); }

  const Store = {
    Api,
    keys: KEYS,
    uid,
    mode: 'local',

    async boot() {
      const ok = await Api.ping();
      this.mode = ok ? 'server' : 'local';
      if (!ok) return false;
      await Promise.all([
        pull('posts', KEYS.posts, SEED_POSTS),
        pull('settings', KEYS.settings, SEED_SETTINGS),
        this._hydrateSite(),
        this.isAuthed() ? pull('messages', KEYS.messages, SEED_MESSAGES) : Promise.resolve(),
      ]);
      return true;
    },

    async _hydrateSite() {
      if (!Api.available) return;
      try {
        const site = await Api.get('/site');
        write(KEYS.site, site);
        this._emit('site');
      } catch {}
    },

    getSite() { return read(KEYS.site, null); },

    async getPage(id) {
      const cache = read(KEYS.pages, {}) || {};
      if (cache[id]) return cache[id];
      if (Api.available) {
        try {
          const page = await Api.get('/pages/' + id);
          cache[id] = page;
          write(KEYS.pages, cache);
          return page;
        } catch {}
      }
      return null;
    },

    getPosts() { return read(KEYS.posts, null) || SEED_POSTS.slice(); },
    setPosts(arr) { write(KEYS.posts, arr); this._emit('posts'); pushPosts(arr); },
    async upsertPost(post) {
      const withHash = {
        ...post,
        legacyHash: post.legacyHash || (post.slug ? '/project-case-studies/' + post.slug : ''),
        type: post.type || 'case-study',
      };
      if (Api.available && Api.token) {
        try {
          const saved = await Api.post('/posts', withHash);
          const all = this.getPosts();
          const i = all.findIndex(p => p.id === saved.id);
          if (i >= 0) all[i] = saved; else all.unshift(saved);
          write(KEYS.posts, all);
          this._emit('posts');
          return saved;
        } catch {}
      }
      const all = this.getPosts();
      const i = all.findIndex(p => p.id === withHash.id);
      if (i >= 0) all[i] = withHash; else all.unshift(withHash);
      this.setPosts(all);
      return withHash;
    },
    async deletePost(id) {
      if (Api.available && Api.token) { try { await Api.del('/posts/' + id); } catch {} }
      this.setPosts(this.getPosts().filter(p => p.id !== id));
    },
    getPost(id) { return this.getPosts().find(p => p.id === id); },
    getPostBySlug(slug) { return this.getPosts().find(p => p.slug === slug); },
    getPublishedPosts(filter = {}) {
      let list = this.getPosts().filter(p => p.status === 'published');
      if (filter.type) list = list.filter(p => p.type === filter.type);
      if (filter.lang) list = list.filter(p => p.lang === filter.lang);
      list.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
      if (filter.limit) list = list.slice(0, filter.limit);
      return list;
    },

    getMessages() { return read(KEYS.messages, null) || SEED_MESSAGES.slice(); },
    setMessages(arr) { write(KEYS.messages, arr); this._emit('messages'); },
    async addMessage(m) {
      if (Api.available) {
        try {
          const saved = await Api.post('/messages', m);
          const all = this.getMessages();
          all.unshift(saved);
          this.setMessages(all);
          return saved;
        } catch {}
      }
      const all = this.getMessages();
      const local = { ...m, id: 'm_' + uid(), receivedAt: new Date().toISOString(), read: false };
      all.unshift(local);
      this.setMessages(all);
      return local;
    },
    async deleteMessage(id) {
      if (Api.available && Api.token) { try { await Api.del('/messages/' + id); } catch {} }
      this.setMessages(this.getMessages().filter(m => m.id !== id));
    },
    async markRead(id) {
      if (Api.available && Api.token) { try { await Api.patch('/messages/' + id, { read: true }); } catch {} }
      this.setMessages(this.getMessages().map(m => m.id === id ? { ...m, read: true } : m));
    },
    async refreshMessages() {
      if (Api.available && Api.token) {
        try { const all = await Api.get('/messages'); write(KEYS.messages, all); this._emit('messages'); } catch {}
      }
    },

    getSettings() { return Object.assign({}, SEED_SETTINGS, read(KEYS.settings, {}) || {}); },
    setSettings(obj) { write(KEYS.settings, obj); this._emit('settings'); pushSettings(obj); },

    isAuthed() { return !!read(KEYS.auth, null) && !!Api.token; },
    async signIn(user, pass) {
      if (Api.available) {
        try {
          const r = await Api.post('/auth/login', { user, pass });
          Api.token = r.token;
          write(KEYS.auth, { user: r.user, at: new Date().toISOString(), mode: 'server' });
          await pull('messages', KEYS.messages, SEED_MESSAGES);
          return true;
        } catch { return false; }
      }
      if (user === 'admin' && pass === 'kbiz2026') {
        Api.token = 'local-' + Date.now();
        write(KEYS.auth, { user, at: new Date().toISOString(), mode: 'local' });
        return true;
      }
      return false;
    },
    signOut() { Api.token = null; localStorage.removeItem(KEYS.auth); },

    getLang() {
      const stored = read(KEYS.lang, null);
      if (stored === 'en' || stored === 'vi') return stored;
      return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
    },
    setLang(l) { write(KEYS.lang, l); document.documentElement.lang = l; this._emit('lang'); },

    async exportAll() {
      if (Api.available && Api.token) { try { return await Api.get('/export'); } catch {} }
      return { posts: this.getPosts(), messages: this.getMessages(), settings: this.getSettings(), exportedAt: new Date().toISOString() };
    },
    async importAll(obj) {
      if (Api.available && Api.token) { try { await Api.post('/import', obj); } catch {} }
      if (obj.posts) this.setPosts(obj.posts);
      if (obj.messages) this.setMessages(obj.messages);
      if (obj.settings) this.setSettings(obj.settings);
    },

    async uploadFile(file) {
      if (Api.available && Api.token) return await Api.upload(file);
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve({ url: r.result, filename: file.name, size: file.size, local: true });
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    },

    _listeners: {},
    on(evt, fn) {
      (this._listeners[evt] = this._listeners[evt] || []).push(fn);
      return () => { this._listeners[evt] = (this._listeners[evt] || []).filter(f => f !== fn); };
    },
    _emit(evt) {
      (this._listeners[evt] || []).forEach(fn => { try { fn(); } catch {} });
      (this._listeners['*'] || []).forEach(fn => { try { fn(evt); } catch {} });
    },
  };

  document.documentElement.lang = Store.getLang();
  Store.boot().then((ok) => {
    console.info(ok ? 'K-Biz: server API connected' : 'K-Biz: localStorage mode');
    Store._emit('boot');
  });

  window.Store = Store;
})();
