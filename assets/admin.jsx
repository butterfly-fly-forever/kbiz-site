/* admin.jsx — admin login + dashboard + post editor + messages */
const { useState: _uSa, useEffect: _uEa, useMemo: _uMa, useRef: _uRa } = React;

// ---- Login -----------------------------------------------------------
const AdminLogin = ({ onSignedIn }) => {
  const { t } = useLang();
  const { nav } = useRoute();
  const [user, setUser] = _uSa('admin');
  const [pass, setPass] = _uSa('');
  const [err, setErr] = _uSa('');
  const [busy, setBusy] = _uSa(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const ok = await Store.signIn(user, pass);
    setBusy(false);
    if (ok) onSignedIn(); else setErr(t('admin.badCreds'));
  };
  return (
    <div className="kb-login">
      <div className="kb-login__card">
        <div style={{ marginBottom: 24 }}><Logo /></div>
        <h2 style={{ fontFamily: 'var(--kb-display)', fontSize: 32, color: 'var(--kb-navy)', margin: '0 0 8px' }}>{t('admin.loginTitle')}</h2>
        <p style={{ color: 'var(--kb-ink-soft)', margin: '0 0 24px' }}>{t('admin.loginLead')}</p>
        <form onSubmit={submit} className="kb-form">
          <div className="kb-field">
            <label>{t('admin.user')}</label>
            <input className="kb-input" value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
          </div>
          <div className="kb-field">
            <label>{t('admin.pass')}</label>
            <input type="password" className="kb-input" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          {err ? <div style={{ color: 'var(--kb-blue)', color: '#c9372c', fontSize: 13 }}>{err}</div> : null}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <small style={{ color: 'var(--kb-ink-muted)' }}>{t('admin.hint')}</small>
            <button className="kb-btn kb-btn--primary" type="submit" disabled={busy}>{busy ? '…' : t('admin.signIn')} <Icon name="arrowRight" size={14} /></button>
          </div>
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <a href="/" onClick={(e) => { e.preventDefault(); nav(''); }} style={{ fontSize: 13, color: 'var(--kb-ink-muted)' }}>← {t('admin.backToSite')}</a>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Top bar ---------------------------------------------------------
const AdminBar = ({ tab, setTab, onSignOut }) => {
  const { t } = useLang();
  const { nav } = useRoute();
  const tabs = [
    { id: 'dashboard', l: t('admin.dashboard'), icon: 'home' },
    { id: 'posts',     l: t('admin.posts'),     icon: 'file' },
    { id: 'messages',  l: t('admin.messages'),  icon: 'inbox' },
    { id: 'settings',  l: t('admin.settings'),  icon: 'settings' },
  ];
  const msgs = Store.getMessages().filter(m => !m.read).length;
  return (
    <div className="kb-admin__bar">
      <div className="kb-admin__brand">
        <Logo />
        <span style={{ color: 'var(--kb-ink-muted)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: '1px solid var(--kb-line-2)', paddingLeft: 12 }}>Admin</span>
      </div>
      <div className="kb-admin__tabs">
        {tabs.map(tb => (
          <button key={tb.id} className={'kb-admin__tab' + (tab === tb.id ? ' is-on' : '')} onClick={() => setTab(tb.id)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name={tb.icon} size={14} /> {tb.l}
              {tb.id === 'messages' && msgs > 0 ? <span style={{ background: '#c9372c', color: '#fff', borderRadius: 999, padding: '0 6px', fontSize: 10 }}>{msgs}</span> : null}
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <LangSwitch />
        <a className="kb-btn kb-btn--ghost kb-btn--sm" href="/" onClick={(e) => { e.preventDefault(); nav(''); }}>← {t('admin.backToSite')}</a>
        <button className="kb-btn kb-btn--primary kb-btn--sm" onClick={onSignOut}>{t('admin.signOut')}</button>
      </div>
    </div>
  );
};

// ---- Dashboard -------------------------------------------------------
const AdminDashboard = ({ setTab }) => {
  const { t } = useLang();
  const posts = Store.getPosts();
  const msgs = Store.getMessages();
  const stat = [
    { lbl: t('admin.posts'),    val: posts.length, sub: posts.filter(p => p.status === 'published').length + ' ' + t('admin.statusPublished').toLowerCase() },
    { lbl: t('admin.messages'), val: msgs.length, sub: msgs.filter(m => !m.read).length + ' unread' },
    { lbl: 'Drafts',            val: posts.filter(p => p.status === 'draft').length, sub: '' },
  ];
  return (
    <div className="kb-admin__main">
      <h1 style={{ fontFamily: 'var(--kb-display)', fontSize: 40, color: 'var(--kb-navy)', margin: '0 0 24px' }}>{t('admin.dashboard')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {stat.map((s, i) => (
          <div key={i} className="kb-card">
            <div style={{ fontSize: 12, color: 'var(--kb-ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{s.lbl}</div>
            <div style={{ fontFamily: 'var(--kb-display)', fontSize: 56, color: 'var(--kb-navy)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 13, color: 'var(--kb-ink-soft)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="kb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Recent posts</h3>
          <button className="kb-btn kb-btn--ghost kb-btn--sm" onClick={() => setTab('posts')}>View all</button>
        </div>
        <table className="kb-table">
          <tbody>
            {posts.slice(0, 5).map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.title}</td>
                <td>{p.lang.toUpperCase()}</td>
                <td>
                  <span className="kb-tag" style={{ background: p.status === 'published' ? '#dcfff1' : '#fff7d6', color: p.status === 'published' ? '#1f845a' : '#8b6914' }}>
                    {p.status === 'published' ? t('admin.statusPublished') : t('admin.statusDraft')}
                  </span>
                </td>
                <td style={{ color: 'var(--kb-ink-muted)' }}>{fmtDate(p.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Posts list ------------------------------------------------------
const AdminPostList = ({ onOpen, onNew }) => {
  const { t } = useLang();
  const [, rev] = _uSa({});
  _uEa(() => Store.on('posts', () => rev({})), []);
  const posts = Store.getPosts();
  const [confirm, setConfirm] = _uSa(null);
  return (
    <div className="kb-admin__main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--kb-display)', fontSize: 40, color: 'var(--kb-navy)', margin: 0 }}>{t('admin.posts')}</h1>
        <button className="kb-btn kb-btn--primary" onClick={onNew}>
          <Icon name="plus" size={16} /> {t('admin.newPost')}
        </button>
      </div>
      <div className="kb-card" style={{ padding: 0 }}>
        {posts.length === 0 ? (
          <div className="kb-empty" style={{ margin: 24 }}>{t('admin.noPosts')}</div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Public URL</th>
                <th>Lang</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(p.id)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--kb-navy)' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--kb-ink-muted)' }}>{p.excerpt}</div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {(p.legacyHash || (p.slug ? '/project-case-studies/' + p.slug : '')) ? (
                      <a href={p.legacyHash || '/project-case-studies/' + p.slug} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--kb-blue)' }}>
                        {p.legacyHash || '/project-case-studies/' + p.slug}
                      </a>
                    ) : '—'}
                  </td>
                  <td><span className="kb-tag kb-tag--blue">{p.lang.toUpperCase()}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.tags || []).slice(0, 2).map(tg => <span key={tg} className="kb-tag">{tg}</span>)}
                    </div>
                  </td>
                  <td>
                    <span className="kb-tag" style={{ background: p.status === 'published' ? '#dcfff1' : '#fff7d6', color: p.status === 'published' ? '#1f845a' : '#8b6914' }}>
                      {p.status === 'published' ? t('admin.statusPublished') : t('admin.statusDraft')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--kb-ink-muted)', fontSize: 12 }}>{fmtDate(p.publishedAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="kb-icon-btn" onClick={() => onOpen(p.id)} title="Edit"><Icon name="edit" size={16} /></button>
                      <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => setConfirm(p.id)} title="Delete"><Icon name="trash" size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {confirm ? (
        <div className="kb-modal" onClick={() => setConfirm(null)}>
          <div className="kb-modal__card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{t('admin.confirmDelete')}</h3>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <button className="kb-btn kb-btn--ghost" onClick={() => setConfirm(null)}>{t('admin.cancel')}</button>
              <button className="kb-btn kb-btn--primary" style={{ background: '#c9372c' }} onClick={() => { Store.deletePost(confirm); setConfirm(null); }}>{t('admin.ok')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ---- Post editor -----------------------------------------------------
const slugify = (s) => (s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim().replace(/\s+/g, '-').slice(0, 80);

const AdminPostEditor = ({ id, onBack }) => {
  const { t } = useLang();
  const toast = useToast();
  const isNew = !id;
  const initial = !isNew ? Store.getPost(id) : null;
  const blank = {
    id: Store.uid(),
    slug: '',
    lang: 'en',
    status: 'draft',
    title: '',
    excerpt: '',
    cover: '',
    author: 'K-Biz editorial',
    tags: [],
    publishedAt: new Date().toISOString(),
    content: '<p>Start writing your article…</p>',
  };
  const [post, setPost] = _uSa(initial || blank);
  const [dirty, setDirty] = _uSa(false);

  // Auto-slug when title changes (only if user hasn't touched slug or it's new)
  _uEa(() => {
    if (isNew && !post.slug) {
      setPost(p => ({ ...p, slug: slugify(p.title) }));
    }
    // eslint-disable-next-line
  }, [post.title]);

  const update = (k, v) => { setPost({ ...post, [k]: v }); setDirty(true); };

  const handleContentChange = (html) => { setPost(p => ({ ...p, content: html })); };

  const saveDraft = async () => {
    const p = { ...post, status: 'draft' };
    const saved = await Store.upsertPost(p);
    setPost(saved);
    setDirty(false);
    toast.show(t('admin.saved') + ' (' + t('admin.statusDraft') + ')');
  };
  const publish = async () => {
    if (!post.title.trim()) { toast.show('Title required', 'error'); return; }
    const slug = post.slug || slugify(post.title);
    const legacyHash = post.legacyHash || '/project-case-studies/' + slug;
    const p = { ...post, slug, legacyHash, type: post.type || 'case-study', status: 'published', publishedAt: post.publishedAt || new Date().toISOString() };
    const saved = await Store.upsertPost(p);
    setPost(saved);
    setDirty(false);
    toast.show(t('admin.saved') + ' · ' + t('admin.statusPublished'));
  };

  const onCoverFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const r = await Store.uploadFile(file);
      update('cover', r.url);
      toast.show('Uploaded.');
    } catch (err) {
      toast.show('Upload failed: ' + (err.message || err), 'error');
    }
  };

  // Cmd+S to save
  _uEa(() => {
    const on = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDraft();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 0, alignItems: 'start' }}>
      <div style={{ padding: '24px 24px 24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button className="kb-btn kb-btn--ghost kb-btn--sm" onClick={onBack}>{t('admin.back')}</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: dirty ? '#b38600' : 'var(--kb-ink-muted)' }}>{dirty ? '● ' + t('admin.unsaved') : '✓ ' + t('admin.saved')}</span>
            <button className="kb-btn kb-btn--ghost kb-btn--sm" onClick={saveDraft}>
              <Icon name="save" size={14} /> {t('admin.saveDraft')}
            </button>
            <button className="kb-btn kb-btn--primary kb-btn--sm" onClick={publish}>
              {t('admin.publish')} <Icon name="check" size={14} />
            </button>
          </div>
        </div>
        <input
          className="kb-input"
          value={post.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder={t('admin.title')}
          style={{
            fontFamily: 'var(--kb-display)', fontSize: 40, padding: '14px 16px',
            border: '1px solid transparent', background: 'transparent', color: 'var(--kb-navy)',
            marginBottom: 8,
          }}
        />
        <RichEditor value={post.content} onChange={handleContentChange} onDirtyChange={() => setDirty(true)} />
      </div>
      {/* Sidebar */}
      <aside style={{ padding: '24px 32px 24px 0', position: 'sticky', top: 64, alignSelf: 'start' }}>
        <div className="kb-card" style={{ display: 'grid', gap: 14 }}>
          <div className="kb-field">
            <label>{t('admin.slug')}</label>
            <input className="kb-input" value={post.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
          </div>
          <div className="kb-field">
            <label>{t('admin.lang')}</label>
            <select className="kb-select" value={post.lang} onChange={(e) => update('lang', e.target.value)}>
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
          <div className="kb-field">
            <label>{t('admin.author')}</label>
            <input className="kb-input" value={post.author} onChange={(e) => update('author', e.target.value)} />
          </div>
          <div className="kb-field">
            <label>{t('admin.cover')}</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="kb-input" value={post.cover || ''} onChange={(e) => update('cover', e.target.value)} placeholder="/uploads/… or full URL" style={{ flex: 1 }} />
              <label className="kb-btn kb-btn--ghost kb-btn--sm" style={{ cursor: 'pointer', flex: '0 0 auto' }}>
                <Icon name="upload" size={14} /> Upload
                <input type="file" accept="image/*" onChange={onCoverFile} style={{ display: 'none' }} />
              </label>
            </div>
            {post.cover ? <div style={{ aspectRatio: '16/9', borderRadius: 6, overflow: 'hidden', marginTop: 8, background: '#f1f2f4' }}><img src={post.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : null}
          </div>
          <div className="kb-field">
            <label>{t('admin.excerpt')}</label>
            <textarea className="kb-textarea" style={{ minHeight: 80 }} value={post.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
          </div>
          <div className="kb-field">
            <label>{t('admin.tags')}</label>
            <input
              className="kb-input"
              value={(post.tags || []).join(', ')}
              onChange={(e) => update('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {(post.tags || []).map(tg => <span key={tg} className="kb-tag kb-tag--blue">{tg}</span>)}
            </div>
          </div>
          <div className="kb-field">
            <label>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={'kb-btn kb-btn--sm ' + (post.status === 'draft' ? 'kb-btn--primary' : 'kb-btn--ghost')} onClick={() => update('status', 'draft')}>{t('admin.statusDraft')}</button>
              <button className={'kb-btn kb-btn--sm ' + (post.status === 'published' ? 'kb-btn--primary' : 'kb-btn--ghost')} onClick={() => update('status', 'published')}>{t('admin.statusPublished')}</button>
            </div>
          </div>
        </div>
      </aside>
      {toast.node}
    </div>
  );
};

// ---- Messages --------------------------------------------------------
const AdminMessages = () => {
  const { t, lang } = useLang();
  const [, rev] = _uSa({});
  _uEa(() => Store.on('messages', () => rev({})), []);
  _uEa(() => { Store.refreshMessages && Store.refreshMessages(); }, []);
  const msgs = Store.getMessages();
  const [open, setOpen] = _uSa(null);
  const settings = Store.getSettings();
  return (
    <div className="kb-admin__main">
      <h1 style={{ fontFamily: 'var(--kb-display)', fontSize: 40, color: 'var(--kb-navy)', margin: '0 0 24px' }}>{t('admin.messages')}</h1>
      <div className="kb-card" style={{ padding: 0 }}>
        {msgs.length === 0 ? (
          <div className="kb-empty" style={{ margin: 24 }}>{t('admin.noMessages')}</div>
        ) : (
          <table className="kb-table">
            <thead><tr><th>From</th><th>Service</th><th>Message</th><th>Received</th><th></th></tr></thead>
            <tbody>
              {msgs.map(m => (
                <tr key={m.id} style={{ cursor: 'pointer', background: m.read ? undefined : '#fafdff' }} onClick={() => { setOpen(m); Store.markRead(m.id); }}>
                  <td>
                    <div style={{ fontWeight: m.read ? 500 : 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--kb-ink-muted)' }}>{m.email}</div>
                  </td>
                  <td>{m.service || '—'}</td>
                  <td style={{ color: 'var(--kb-ink-soft)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                  <td style={{ fontSize: 12, color: 'var(--kb-ink-muted)' }}>{fmtDate(m.receivedAt, lang)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => Store.deleteMessage(m.id)} title="Delete"><Icon name="trash" size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {open ? (
        <div className="kb-modal" onClick={() => setOpen(null)}>
          <div className="kb-modal__card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--kb-ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('admin.from')}</div>
                <h3 style={{ fontFamily: 'var(--kb-display)', fontSize: 28, color: 'var(--kb-navy)', margin: '4px 0 0' }}>{open.name}</h3>
                <div style={{ color: 'var(--kb-ink-soft)' }}>{open.company}</div>
              </div>
              <button className="kb-icon-btn" onClick={() => setOpen(null)}><Icon name="close" size={18} /></button>
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <div><strong>Email:</strong> <a href={`mailto:${open.email}`}>{open.email}</a></div>
              <div><strong>Phone:</strong> {open.phone || '—'}</div>
              <div><strong>Service:</strong> {open.service || '—'}</div>
              <div><strong>{t('admin.receivedAt')}:</strong> {fmtDate(open.receivedAt, lang)}</div>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid var(--kb-line-2)', margin: '20px 0' }} />
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--kb-ink)' }}>{open.message}</div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <a className="kb-btn kb-btn--ghost" href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your message to K-Biz')}`}>
                <Icon name="mail" size={14} /> Reply
              </a>
              <button className="kb-btn kb-btn--primary" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ---- Settings --------------------------------------------------------
const AdminSettings = () => {
  const { t } = useLang();
  const toast = useToast();
  const [s, setS] = _uSa(Store.getSettings());
  const save = () => { Store.setSettings(s); toast.show(t('admin.saved')); };

  const doExport = async () => {
    const data = await Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kbiz-data-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };
  const doImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const obj = JSON.parse(reader.result);
        await Store.importAll(obj);
        toast.show('Imported.');
        setS(Store.getSettings());
      } catch (err) {
        toast.show('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="kb-admin__main">
      <h1 style={{ fontFamily: 'var(--kb-display)', fontSize: 40, color: 'var(--kb-navy)', margin: '0 0 24px' }}>{t('admin.settings')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="kb-card">
          <h3 style={{ margin: '0 0 16px' }}>Contact details</h3>
          <div className="kb-form">
            <div className="kb-field">
              <label>Email</label>
              <input className="kb-input" value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} />
            </div>
            <div className="kb-field">
              <label>Phone</label>
              <input className="kb-input" value={s.contactPhone} onChange={(e) => setS({ ...s, contactPhone: e.target.value })} />
            </div>
            <button className="kb-btn kb-btn--primary" onClick={save}>{t('admin.saved').replace('Đã ', 'Lưu ')}</button>
          </div>
        </div>
        <div className="kb-card">
          <h3 style={{ margin: '0 0 16px' }}>Sao lưu dữ liệu</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="kb-btn kb-btn--ghost" onClick={doExport}><Icon name="download" size={14} /> {t('admin.exportJson')}</button>
            <label className="kb-btn kb-btn--ghost" style={{ cursor: 'pointer' }}>
              <Icon name="upload" size={14} /> {t('admin.importJson')}
              <input type="file" accept="application/json" onChange={doImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
      {toast.node}
    </div>
  );
};

// ---- Shell -----------------------------------------------------------
const AdminApp = ({ route, nav }) => {
  const [authed, setAuthed] = _uSa(Store.isAuthed());
  const [tab, setTab] = _uSa('dashboard');
  const [editingId, setEditingId] = _uSa(null); // null = list, 'new' = new, '<id>' = edit
  if (!authed) return <AdminLogin onSignedIn={() => setAuthed(true)} />;

  return (
    <div className="kb-admin">
      <AdminBar tab={tab} setTab={(t) => { setTab(t); setEditingId(null); }} onSignOut={() => { Store.signOut(); setAuthed(false); nav(''); }} />
      {tab === 'dashboard' && <AdminDashboard setTab={setTab} />}
      {tab === 'posts' && (editingId === null
        ? <AdminPostList onOpen={(id) => setEditingId(id)} onNew={() => setEditingId('new')} />
        : <AdminPostEditor id={editingId === 'new' ? null : editingId} onBack={() => setEditingId(null)} />
      )}
      {tab === 'messages' && <AdminMessages />}
      {tab === 'settings' && <AdminSettings />}
    </div>
  );
};

Object.assign(window, { AdminApp });
