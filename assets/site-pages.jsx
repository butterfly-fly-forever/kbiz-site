/* Route-specific pages: post detail, insights alias */

const { useState, useEffect } = React;

const PostDetailPage = ({ slug }) => {
  const { lang, t } = useLang();
  const { nav } = useRoute();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let on = true;
    setPost(null);
    setMissing(false);
    const found = Store.getPostBySlug(slug);
    if (found && found.status === 'published') {
      setPost(found);
      return;
    }
    if (Store.Api.available) {
      fetch('/api/posts/slug/' + encodeURIComponent(slug))
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(p => { if (on) setPost(p); })
        .catch(() => { if (on) setMissing(true); });
    } else {
      setMissing(true);
    }
    return () => { on = false; };
  }, [slug]);

  useEffect(() => {
    if (post?.title) document.title = post.title + ' | K-Biz Consulting';
  }, [post]);

  useEffect(() => Store.on('posts', () => {
    const p = Store.getPostBySlug(slug);
    if (p && p.status === 'published') setPost(p);
  }), [slug]);

  if (missing) return (
    <div className="kb-container kb-page-error">
      <h1>Article not found</h1>
      <a href={hashHref('project-case-studies')} onClick={(e) => { e.preventDefault(); nav('project-case-studies'); }}>Back to projects</a>
    </div>
  );
  if (!post) return <div className="kb-loading">Loading…</div>;

  return (
    <article className="kb-post-detail">
      {post.cover ? (
        <div className="kb-post-detail__hero" style={{ backgroundImage: `url(${post.cover})` }}>
          <div className="kb-post-detail__hero-overlay" />
        </div>
      ) : null}
      <div className="kb-container kb-post-detail__body">
        <a href={hashHref('project-case-studies')} className="kb-back" onClick={(e) => { e.preventDefault(); nav('project-case-studies'); }}>
          <Icon name="arrowLeft" size={16} /> Projects
        </a>
        <header className="kb-post-detail__header">
          <div className="kb-post-detail__meta">
            <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt, lang)}</time>
            <span>{readMinutes(post.content)} {t('common.minRead')}</span>
            {post.author ? <span>{post.author}</span> : null}
          </div>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="kb-post-detail__excerpt">{post.excerpt}</p> : null}
        </header>
        <div className="kb-prose" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
      </div>
    </article>
  );
};

Object.assign(window, { PostDetailPage });
