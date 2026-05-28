/* Section-driven page renderer — maps section.type → React component */

const { useState, useEffect, useMemo } = React;

function usePublishedPosts(filter) {
  const key = JSON.stringify(filter);
  const [posts, setPosts] = useState(() => Store.getPublishedPosts(filter));
  useEffect(() => {
    const refresh = () => setPosts(Store.getPublishedPosts(filter));
    const offPosts = Store.on('posts', refresh);
    const offBoot = Store.on('boot', refresh);
    refresh();
    return () => { offPosts(); offBoot(); };
  }, [key]);
  return posts;
}

const SectionHeroHome = ({ props: p = {} }) => {
  const { nav } = useRoute();
  const to = normalizeHashPath(p.ctaHref || 'project-case-studies');
  return (
    <section className="kb-hero-home" style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}>
      <div className="kb-hero-home__overlay" />
      <div className="kb-container kb-hero-home__inner">
        <h1 className="kb-hero-home__title">{p.heading}</h1>
        {p.subheading ? <p className="kb-hero-home__sub">{p.subheading}</p> : null}
        <a href={hashHref(to)} className="kb-hero-home__cta" onClick={(e) => { e.preventDefault(); nav(to); }}>
          <span className="kb-hero-home__cta-icon"><Icon name="arrowRight" size={20} stroke={2.5} /></span>
          <span className="kb-hero-home__cta-label">{p.ctaLabel || 'VIEW PROJECTS'}</span>
        </a>
      </div>
    </section>
  );
};

const SectionAboutMarquee = ({ props: p = {} }) => {
  const lines = p.lines?.length ? p.lines : [
    { eyebrow: 'WORK WITH PASSION', heading: 'ABOUT K-BIZ CONSULTING' },
  ];
  const track = [...lines, ...lines, ...lines];
  return (
    <section className="kb-about-marquee" aria-hidden="true">
      <div className="kb-about-marquee__track">
        {track.map((line, i) => (
          <div key={i} className="kb-about-marquee__item">
            {line.eyebrow ? <span className="kb-about-marquee__eyebrow">{line.eyebrow}</span> : null}
            <span className="kb-about-marquee__heading">{line.heading}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const SectionHero = ({ props: p = {} }) => {
  const { nav } = useRoute();
  const btnTo = p.buttonHref || 'contact';
  const isPage = p.variant === 'page';
  const cls = 'kb-hero' + (isPage ? ' kb-hero--page' : '');
  return (
    <section className={cls} style={!isPage && p.image ? { backgroundImage: `url(${p.image})` } : undefined}>
      {!isPage ? <div className="kb-hero__overlay" /> : null}
      {isPage && p.image ? (
        <div className="kb-hero--page__media" style={{ backgroundImage: `url(${p.image})` }} aria-hidden="true" />
      ) : null}
      <div className="kb-container kb-hero__inner">
        {p.eyebrow ? <p className="kb-hero__eyebrow">{p.eyebrow}</p> : null}
        <h1 className="kb-hero__title">{p.heading || p.title}</h1>
        {p.subheading ? <p className="kb-hero__sub">{p.subheading}</p> : null}
        {p.button ? (
          <a href={hashHref(btnTo)} className="kb-btn kb-btn--primary"
            onClick={(e) => { e.preventDefault(); nav(btnTo); }}>{p.button}</a>
        ) : null}
      </div>
    </section>
  );
};

const SectionServicesIntro = ({ props: p = {} }) => (
  <section className="kb-svc-intro">
    <div className="kb-container">
      {p.eyebrow ? <p className="kb-svc-intro__eyebrow">{p.eyebrow}</p> : null}
      <h2 className="kb-svc-intro__title">{p.heading}</h2>
    </div>
  </section>
);

const SectionAboutCarousel = ({ props: p = {} }) => {
  const slide = (p.slides || [])[0] || {};
  const { nav } = useRoute();
  return (
    <section className="kb-about-band">
      <div className="kb-container">
        {slide.eyebrow ? <p className="kb-about-band__eyebrow">{slide.eyebrow}</p> : null}
        <h2 className="kb-about-band__title">{slide.heading}</h2>
        {slide.text ? <p className="kb-about-band__text">{slide.text}</p> : null}
        {slide.cta ? (
          <a href={hashHref(slide.ctaHref || 'team-members-1')} className="kb-about-band__link"
            onClick={(e) => { e.preventDefault(); nav(slide.ctaHref || 'team-members-1'); }}>
            {slide.cta}
          </a>
        ) : null}
      </div>
    </section>
  );
};

const SectionServiceCards = ({ props: p = {} }) => {
  const { nav } = useRoute();
  return (
    <section className="kb-svc-cards">
      <div className="kb-container">
        <div className="kb-svc-cards__grid">
          {(p.items || []).map((item, i) => (
            <article key={i} className="kb-svc-card">
              {item.image ? (
                <a href={hashHref(item.href || '')} className="kb-svc-card__media" onClick={(e) => { e.preventDefault(); nav(item.href || ''); }}>
                  <img src={item.image} alt="" loading="lazy" />
                </a>
              ) : null}
              <div className="kb-svc-card__body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href={hashHref(item.href || '')} onClick={(e) => { e.preventDefault(); nav(item.href || ''); }}>
                  {item.linkLabel || 'Read More'}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const SectionTeamTeaser = ({ props: p = {} }) => {
  const { nav } = useRoute();
  return (
    <section className="kb-team-teaser">
      <div className="kb-container">
        {p.eyebrow ? <p className="kb-team-teaser__eyebrow">{p.eyebrow}</p> : null}
        <h2 className="kb-team-teaser__title">{p.heading}</h2>
        {p.text ? <p className="kb-team-teaser__text">{p.text}</p> : null}
        {p.cta ? (
          <a href={hashHref(p.ctaHref || 'project-case-studies')} className="kb-btn kb-btn--primary"
            onClick={(e) => { e.preventDefault(); nav(p.ctaHref || 'project-case-studies'); }}>
            {p.cta}
          </a>
        ) : null}
      </div>
    </section>
  );
};

const SectionTestimonials = ({ props: p = {} }) => {
  const items = p.items || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);
  const active = items[idx] || items[0];
  return (
    <section className="kb-testimonials">
      <div className="kb-container">
        {p.heading ? <h2 className="kb-testimonials__title">{p.heading}</h2> : null}
        {active ? (
          <figure className="kb-testimonial kb-testimonial--featured">
            <blockquote>&ldquo;{active.quote}&rdquo;</blockquote>
            <figcaption>
              <cite>{active.name}</cite>
              {active.role ? <span>{active.role}</span> : null}
            </figcaption>
          </figure>
        ) : null}
        {items.length > 1 ? (
          <div className="kb-testimonials__dots" role="tablist" aria-label="Testimonials">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={i === idx ? 'is-on' : ''}
                onClick={() => setIdx(i)}
                aria-label={'Testimonial ' + (i + 1)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const SectionIntroCarousel = ({ props: p = {} }) => {
  const slides = p.slides || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <section className="kb-intro-carousel">
      <div className="kb-container">
        {p.heading ? <h2 className="kb-section-title">{p.heading}</h2> : null}
        <div className="kb-carousel">
          {slides.map((s, i) => (
            <div key={i} className={'kb-carousel__slide' + (i === idx ? ' is-active' : '')}>
              {typeof s === 'string' ? <p>{s}</p> : (
                <>
                  {s.title ? <h3>{s.title}</h3> : null}
                  {s.text ? <p>{s.text}</p> : null}
                </>
              )}
            </div>
          ))}
        </div>
        {slides.length > 1 ? (
          <div className="kb-carousel__dots">
            {slides.map((_, i) => (
              <button key={i} type="button" className={i === idx ? 'is-on' : ''} onClick={() => setIdx(i)} aria-label={'Slide ' + (i + 1)} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const SectionServicePills = ({ props: p = {} }) => {
  const { nav } = useRoute();
  return (
    <section className="kb-pills">
      <div className="kb-container">
        <div className="kb-pills__row">
          {(p.items || []).map((item, i) => (
            <a key={i} href={hashHref(item.href || '')} className="kb-pill"
              onClick={(e) => { if (item.href) { e.preventDefault(); nav(item.href); } }}>
              {item.label || item.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const SectionFeatureTriplet = ({ props: p = {} }) => (
  <section className="kb-triplet">
    <div className="kb-container">
      <div className="kb-triplet__grid">
        {(p.items || []).map((item, i) => (
          <article key={i} className="kb-triplet__card">
            {item.icon ? <div className="kb-triplet__icon">{item.icon}</div> : null}
            <h3>{item.title}</h3>
            <p>{item.text || item.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const SectionServiceBlocks = ({ props: p = {} }) => (
  <section className="kb-service-blocks">
    <div className="kb-container">
      {(p.items || []).map((item, i) => (
        <div key={i} className={'kb-service-block' + (i % 2 ? ' kb-service-block--reverse' : '')}>
          {item.image ? <div className="kb-service-block__media"><img src={item.image} alt="" loading="lazy" /></div> : null}
          <div className="kb-service-block__body">
            <h3>{item.title}</h3>
            <p>{item.text || item.description}</p>
            {item.href ? <a href={item.href} className="kb-link-arrow">Learn more <Icon name="arrowRight" size={14} /></a> : null}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SectionExperienceQuote = ({ props: p = {} }) => (
  <section className="kb-quote-band">
    <div className="kb-container">
      <blockquote className="kb-quote-band__text">{p.text}</blockquote>
    </div>
  </section>
);

const SectionMissionVision = ({ props: p = {} }) => (
  <section className="kb-mv">
    <div className="kb-container kb-mv__grid">
      <div className="kb-mv__card">
        <h3>Mission</h3>
        <p>{p.mission}</p>
      </div>
      <div className="kb-mv__card">
        <h3>Vision</h3>
        <p>{p.vision}</p>
      </div>
    </div>
  </section>
);

const SectionCtaEstimate = ({ props: p = {} }) => {
  const { nav } = useRoute();
  return (
    <section className="kb-cta-band">
      <div className="kb-container kb-cta-band__inner">
        <h2>{p.heading || 'Get an estimate'}</h2>
        {p.subheading ? <p>{p.subheading}</p> : null}
        <a href={hashHref('contact')} onClick={(e) => { e.preventDefault(); nav('contact'); }}
          className="kb-btn kb-btn--primary kb-btn--lg">
          {p.button || 'Contact'}
        </a>
      </div>
    </section>
  );
};

const PostCard = ({ post, nav, variant = 'default' }) => {
  const { lang, t } = useLang();
  const to = 'project-case-studies/' + post.slug;
  const href = hashHref(to);
  const onNav = (e) => { e.preventDefault(); nav(to); };
  if (variant === 'overlay') {
    return (
      <article className="kb-post-card kb-post-card--overlay">
        <a href={href} className="kb-post-card__cover" onClick={onNav}>
          <img src={post.cover || '/site-assets/hero-nhatrang.jpg'} alt={post.title} loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = '/site-assets/hero-nhatrang.jpg'; }} />
          <div className="kb-post-card__overlay">
            <h3>{post.title}</h3>
            <span className="kb-post-card__read">{t('common.readMore')}</span>
          </div>
        </a>
      </article>
    );
  }
  return (
    <article className="kb-post-card">
      {post.cover ? (
        <a href={href} className="kb-post-card__cover" onClick={onNav}>
          <img src={post.cover} alt={post.title} loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = '/site-assets/hero-nhatrang.jpg'; }} />
        </a>
      ) : null}
      <div className="kb-post-card__body">
        <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt, lang)}</time>
        <h3><a href={href} onClick={onNav}>{post.title}</a></h3>
        <p>{post.excerpt}</p>
        <a href={href} onClick={onNav} className="kb-link-arrow">
          {t('common.readMore')} <Icon name="arrowRight" size={14} />
        </a>
      </div>
    </article>
  );
};

const SectionDifferentiators = ({ props: p = {} }) => (
  <section className="kb-diff">
    <div className="kb-container">
      {p.heading ? <h2 className="kb-diff__title">{p.heading}</h2> : null}
      <div className="kb-diff__grid">
        {(p.items || []).map((item, i) => (
          <article key={i} className="kb-diff__card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const SectionRecentPosts = ({ props: p = {} }) => {
  const { nav } = useRoute();
  const filter = { type: p.filter?.type || 'case-study', limit: p.filter?.limit || p.limit || 3 };
  const posts = usePublishedPosts(filter);
  const cardVariant = p.cardVariant || 'default';
  return (
    <section className="kb-posts-grid-section">
      <div className="kb-container">
        {p.eyebrow ? <p className="kb-section-eyebrow">{p.eyebrow}</p> : null}
        {p.heading ? <h2 className="kb-section-title">{p.heading}</h2> : null}
        <div className={'kb-posts-grid' + (cardVariant === 'overlay' ? ' kb-posts-grid--overlay' : '')}>
          {posts.length ? posts.map(post => <PostCard key={post.id} post={post} nav={nav} variant={cardVariant} />) : (
            <p className="kb-posts-empty">Case studies are loading. Refresh the page or run <code>npm run crawl</code>.</p>
          )}
        </div>
        {p.viewAllHref ? (
          <p className="kb-section-cta">
            <a href={hashHref(p.viewAllHref)} onClick={(e) => { e.preventDefault(); nav(p.viewAllHref); }} className="kb-btn kb-btn--primary">
              {p.viewAllLabel || 'MORE PROJECTS'}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
};

const SectionCaseStudyGrid = SectionRecentPosts;

const SectionRichText = ({ props: p = {} }) => (
  <section className="kb-rich">
    <div className="kb-container kb-rich__inner">
      {p.heading ? <h2 className="kb-section-title">{p.heading}</h2> : null}
      <div className="kb-prose" dangerouslySetInnerHTML={{ __html: p.html || p.content || '' }} />
    </div>
  </section>
);

const SectionTeamGrid = ({ props: p = {} }) => (
  <section className="kb-team">
    <div className="kb-container">
      {p.heading ? <h2 className="kb-section-title">{p.heading}</h2> : null}
      <div className="kb-team__grid">
        {(p.members || p.items || []).map((m, i) => (
          <article key={i} className="kb-team__card">
            {m.photo ? <img src={m.photo} alt={m.name} className="kb-team__photo" loading="lazy" /> : <div className="kb-team__photo kb-team__photo--placeholder" />}
            <h3>{m.name}</h3>
            <p className="kb-team__role">{m.role || m.title}</p>
            {m.bio ? <p>{m.bio}</p> : null}
          </article>
        ))}
      </div>
    </div>
  </section>
);

const SectionContactForm = ({ props: p = {} }) => {
  const { t } = useLang();
  const toast = useToast();
  const site = Store.getSite();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const settings = Store.getSettings();
  const secondaryEmail = p.secondaryEmail || site?.secondaryEmail || 'info@kbiz.com.vn';

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { toast.show('Name and email required', 'error'); return; }
    setBusy(true);
    try {
      await Store.addMessage(form);
      setDone(true);
      toast.show(t('contact.thanks'));
      setForm({ name: '', email: '', phone: '', company: '', service: '', message: '' });
    } catch {
      toast.show('Could not send message', 'error');
    } finally { setBusy(false); }
  };

  return (
    <section className="kb-contact-form-section">
      <div className="kb-container">
        <div className="kb-contact-grid">
          <div>
            <h2>{p.heading || t('contact.title')}</h2>
            <p>{p.lead || t('contact.lead')}</p>
            <ul className="kb-contact-info">
              <li><Icon name="pin" size={18} /> {settings.contactAddress}</li>
              <li><Icon name="phone" size={18} /> {settings.contactPhone}</li>
              <li><Icon name="mail" size={18} /> <a href={'mailto:' + settings.contactEmail}>{settings.contactEmail}</a></li>
              {secondaryEmail ? (
                <li><Icon name="mail" size={18} /> <a href={'mailto:' + secondaryEmail}>{secondaryEmail}</a></li>
              ) : null}
            </ul>
          </div>
          {done ? (
            <div className="kb-contact-thanks"><Icon name="check" size={32} /><p>{t('contact.thanks')}</p></div>
          ) : (
            <form className="kb-form" onSubmit={submit}>
              <label>{t('contact.name')}<input required value={form.name} onChange={set('name')} /></label>
              <label>{t('contact.email')}<input type="email" required value={form.email} onChange={set('email')} /></label>
              <label>{t('contact.phone')}<input value={form.phone} onChange={set('phone')} /></label>
              <label>{t('contact.company')}<input value={form.company} onChange={set('company')} /></label>
              <label>{t('contact.service')}<input value={form.service} onChange={set('service')} /></label>
              <label>{t('contact.message')}<textarea rows={5} value={form.message} onChange={set('message')} /></label>
              <button type="submit" className="kb-btn kb-btn--primary" disabled={busy}>{busy ? '…' : t('contact.send')}</button>
            </form>
          )}
        </div>
      </div>
      {toast.node}
    </section>
  );
};

const SECTION_MAP = {
  heroHome: SectionHeroHome,
  hero: SectionHero,
  servicesIntro: SectionServicesIntro,
  aboutMarquee: SectionAboutMarquee,
  aboutCarousel: SectionAboutCarousel,
  serviceCards: SectionServiceCards,
  teamTeaser: SectionTeamTeaser,
  testimonials: SectionTestimonials,
  introCarousel: SectionIntroCarousel,
  servicePills: SectionServicePills,
  featureTriplet: SectionFeatureTriplet,
  serviceBlocks: SectionServiceBlocks,
  experienceQuote: SectionExperienceQuote,
  missionVision: SectionMissionVision,
  differentiators: SectionDifferentiators,
  ctaEstimate: SectionCtaEstimate,
  recentPosts: SectionRecentPosts,
  caseStudyGrid: SectionCaseStudyGrid,
  richText: SectionRichText,
  teamGrid: SectionTeamGrid,
  contactForm: SectionContactForm,
};

const SectionRenderer = ({ sections = [] }) => (
  <>
    {sections.map((sec, i) => {
      const Comp = SECTION_MAP[sec.type];
      if (!Comp) {
        console.warn('Unknown section type:', sec.type);
        return null;
      }
      return <Comp key={sec.id || i} props={sec.props || {}} />;
    })}
  </>
);

const PageFromJson = ({ pageId }) => {
  const [page, setPage] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let on = true;
    setPage(null);
    setErr(false);
    Store.getPage(pageId).then(p => { if (on) { if (p) setPage(p); else setErr(true); } });
    return () => { on = false; };
  }, [pageId]);
  useEffect(() => {
    if (page?.title) document.title = page.title;
  }, [page]);
  if (err) return <div className="kb-container kb-page-error"><h1>Page not found</h1><p>Run <code>npm run crawl</code> to generate content.</p></div>;
  if (!page) return <div className="kb-loading">Loading…</div>;
  return (
    <div className={'kb-page kb-page--' + pageId}>
      <SectionRenderer sections={page.sections || []} />
    </div>
  );
};

Object.assign(window, {
  SectionRenderer, PageFromJson, PostCard, usePublishedPosts, SECTION_MAP,
});
