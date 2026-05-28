/* Shared UI: Nav, Footer, hooks — routes match source site slugs */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function useLang() {
  const [lang, setLangState] = useState(Store.getLang());
  useEffect(() => Store.on('lang', () => setLangState(Store.getLang())), []);
  const setLang = useCallback((l) => Store.setLang(l), []);
  const t = useCallback((path, fallback) => {
    const dict = window.I18N[lang] || window.I18N.en;
    const v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), dict);
    if (v === undefined && lang !== 'en') {
      const en = path.split('.').reduce((o, k) => (o ? o[k] : undefined), window.I18N.en);
      return en !== undefined ? en : (fallback ?? path);
    }
    return v !== undefined ? v : (fallback ?? path);
  }, [lang]);
  return { lang, setLang, t };
}

function normalizePath(to) {
  if (to == null || to === '') return '';
  return String(to).replace(/^#+/, '').replace(/^\/+/, '');
}

function pathHref(to) {
  const p = normalizePath(to);
  return p ? '/' + p : '/';
}

/** @deprecated use pathHref */
const hashHref = pathHref;
/** @deprecated use normalizePath */
const normalizeHashPath = normalizePath;

function migrateHashUrl() {
  const h = window.location.hash;
  if (!h || h === '#') return;
  const path = h.replace(/^#\/?/, '');
  window.history.replaceState(null, '', (path ? '/' + path : '/') + window.location.search);
}

function useRoute() {
  const parse = () => {
    const pathOnly = window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || '';
    const parts = pathOnly.split('/').filter(Boolean);
    return { path: pathOnly, parts, query: window.location.search.replace(/^\?/, '') || '' };
  };
  const [route, setRoute] = useState(() => {
    migrateHashUrl();
    return parse();
  });
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  const nav = useCallback((to) => {
    const url = pathHref(to);
    window.history.pushState(null, '', url);
    setRoute(parse());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return { route, nav, pathHref, hashHref, normalizePath, normalizeHashPath };
}

const Icon = ({ name, size = 18, stroke = 1.8, ...rest }) => {
  const paths = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
    check: <path d="M5 13l4 4L19 7" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    pin: <><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></>,
    chevron: <path d="M6 9l6 6 6-6" />,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    linkedin: <><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M9 9h4v2a4 4 0 0 1 7 3v7h-4v-6a2 2 0 0 0-4 0v6H9z" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {paths[name] || null}
    </svg>
  );
};

const Logo = ({ light = false, src }) => {
  const site = Store.getSite();
  const logoSrc = src || site?.logo || '/site-assets/logo.svg';
  return (
    <div className="kb-logo" aria-label="K-Biz Consulting">
      {logoSrc ? (
        <img src={logoSrc} alt="K-Biz Consulting" className="kb-logo__img" onError={(e) => { e.target.style.display = 'none'; }} />
      ) : null}
      <span className="kb-logo__text" style={light ? { color: '#fff' } : undefined}>
        <span className="kb-logo__name">K-Biz Consulting</span>
      </span>
    </div>
  );
};

const LangSwitch = () => {
  const { lang, setLang } = useLang();
  return (
    <div className="kb-lang" role="group" aria-label="Language">
      <button className={lang === 'en' ? 'is-on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
      <button className={lang === 'vi' ? 'is-on' : ''} onClick={() => setLang('vi')} aria-pressed={lang === 'vi'}>VI</button>
    </div>
  );
};

const Nav = () => {
  const { t } = useLang();
  const { route, nav } = useRoute();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMobileOpen(false); setSvcOpen(false); }, [route.path]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const go = (to) => (e) => { e.preventDefault(); nav(to); };

  return (
    <header className={'w-full bg-[#DBFDEB] sticky top-0 z-[100] transition-all duration-200 border-b border-gray-200/50' + (scrolled ? ' shadow-sm' : '')}>
      <div className="w-full px-[40px] h-[120px] flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" onClick={go('')} className="flex-shrink-0 flex items-center">
          <img src="/site-assets/logo.png" alt="K-Biz Logo" className="h-[96px] w-auto object-contain" />
        </a>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-[40px] ml-auto mr-[40px] h-full" aria-label="Primary">
          <div className="relative group flex items-center h-full">
            <a href="/services" onClick={go('services')} className="text-[#005E2C] hover:text-[#B800FF] font-bold text-[14px] tracking-wide transition-colors duration-200 flex items-center h-full">
              Services
            </a>
            {/* Dropdown Menu */}
            <div className="absolute top-[120px] left-1/2 -translate-x-1/2 min-w-[280px] bg-[#E7AAFF] flex flex-col p-8 gap-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-lg z-[200] rounded-none">
              <a href="/services/consulting-1" onClick={go('services/consulting-1')} className="text-[#005E2C] hover:underline font-bold text-[14px] transition-all">
                Investment Consulting
              </a>
              <a href="/services/consulting-2" onClick={go('services/consulting-2')} className="text-white hover:text-[#005E2C] hover:underline font-bold text-[14px] transition-all">
                Start New Business
              </a>
              <a href="/services/consulting-3" onClick={go('services/consulting-3')} className="text-white hover:text-[#005E2C] hover:underline font-bold text-[14px] transition-all">
                Business Developing Services
              </a>
            </div>
          </div>
          <a href="/project-case-studies" onClick={go('project-case-studies')} className="text-[#005E2C] hover:text-[#B800FF] font-bold text-[14px] tracking-wide transition-colors duration-200">
            Projects
          </a>
          <a href="/team-members-1" onClick={go('team-members-1')} className="text-[#005E2C] hover:text-[#B800FF] font-bold text-[14px] tracking-wide transition-colors duration-200">
            About us
          </a>
        </nav>

        {/* Right Cta */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <a href="/contact" onClick={go('contact')} className="hidden md:inline-block bg-[#3D0055] text-white px-[36px] py-[12px] text-[14px] font-bold tracking-widest uppercase hover:bg-[#5C2D82] transition-colors duration-200 rounded-none">
            Contact
          </a>
          <button type="button" className="md:hidden p-2 text-[#005E2C]" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen} onClick={() => setMobileOpen(o => !o)}>
            <Icon name={mobileOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={'kb-drawer' + (mobileOpen ? ' is-on' : '')} aria-hidden={!mobileOpen}>
        <nav className="kb-drawer__inner" aria-label="Mobile">
          <a href="/" onClick={go('')} className="kb-drawer__link">{t('nav.home')}</a>
          <button className={'kb-drawer__link kb-drawer__group' + (svcOpen ? ' is-open' : '')}
            onClick={() => setSvcOpen(o => !o)} aria-expanded={svcOpen}>
            <span>{t('nav.services')}</span><Icon name="chevron" size={16} />
          </button>
          {svcOpen ? (
            <div className="kb-drawer__sub">
              <a href="/services" onClick={go('services')}>{t('nav.services')}</a>
              <a href="/services/consulting-1" onClick={go('services/consulting-1')}>{t('nav.svc1')}</a>
              <a href="/services/consulting-2" onClick={go('services/consulting-2')}>{t('nav.svc2')}</a>
              <a href="/services/consulting-3" onClick={go('services/consulting-3')}>{t('nav.svc3')}</a>
            </div>
          ) : null}
          <a href="/project-case-studies" onClick={go('project-case-studies')} className="kb-drawer__link">{t('nav.projects')}</a>
          <a href="/team-members-1" onClick={go('team-members-1')} className="kb-drawer__link">{t('nav.about')}</a>
          <a href="/contact" onClick={go('contact')} className="kb-drawer__link">{t('nav.contact')}</a>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => {
  const { t } = useLang();
  const { nav, hashHref } = useRoute();
  const s = Store.getSettings();
  const go = (to) => (e) => { e.preventDefault(); nav(to); };
  return (
    <footer className="w-full bg-gradient-to-b from-[#F7F8F7] to-[#EDEDED] py-[60px] border-t border-gray-200">
      <div className="w-full px-[40px] grid grid-cols-2 gap-12 text-[#0C0C0C]">
        {/* Logo & Contact Info */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <img src="/site-assets/logo.png" alt="K-Biz Logo" className="h-[52px]" />
          </div>
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">CONTACT</p>
          <p className="text-[14px] text-gray-600 leading-[22px] w-[360px] max-w-full mb-4">
            {s.contactAddress}
          </p>
          <div className="text-[13px] text-gray-500 flex flex-col gap-1">
            <span>Email: <a href={'mailto:' + s.contactEmail} className="text-[#005E2C] hover:underline">{s.contactEmail}</a></span>
            <span>Phone: {s.contactPhone}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-end gap-24 text-[14px] text-gray-700">
          <div>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4">NAVIGATION</p>
            <ul className="flex flex-col gap-2.5">
              <li><a href="/" onClick={go('')} className="hover:text-[#B800FF] transition-colors">{t('nav.home')}</a></li>
              <li><a href="/services" onClick={go('services')} className="hover:text-[#B800FF] transition-colors">{t('nav.services')}</a></li>
              <li><a href="/project-case-studies" onClick={go('project-case-studies')} className="hover:text-[#B800FF] transition-colors">{t('nav.projects')}</a></li>
              <li><a href="/team-members-1" onClick={go('team-members-1')} className="hover:text-[#B800FF] transition-colors">{t('nav.about')}</a></li>
              <li><a href="/contact" onClick={go('contact')} className="hover:text-[#B800FF] transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full px-[40px] mt-12 pt-6 border-t border-gray-200 text-center text-[12px] text-gray-400">
        <span>© {new Date().getFullYear()} K-Biz Consulting. All rights reserved.</span>
      </div>
    </footer>
  );
};

function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  const show = (msg, kind = 'success') => setToast({ msg, kind });
  const node = toast ? (
    <div className={'kb-toast kb-toast--' + toast.kind}>
      <Icon name={toast.kind === 'error' ? 'close' : 'check'} size={16} />
      {toast.msg}
    </div>
  ) : null;
  return { show, node };
}

const fmtDate = (iso, lang) => {
  try {
    return new Date(iso).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
};

const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
};

const readMinutes = (html) => Math.max(1, Math.round(stripHtml(html).trim().split(/\s+/).filter(Boolean).length / 200));

Object.assign(window, {
  useLang, useRoute, useToast,
  Icon, Logo, LangSwitch, Nav, Footer,
  fmtDate, stripHtml, readMinutes,
  normalizePath, normalizeHashPath, pathHref, hashHref,
});
