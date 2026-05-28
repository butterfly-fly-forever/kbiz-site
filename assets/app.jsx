/* App shell — History API router (clean URLs, no #) */

const { useMemo } = React;

function resolvePageId(route) {
  const parts = route.parts;
  if (parts.length === 0) return 'home';
  if (parts[0] === 'admin') return null;
  if (parts[0] === 'services' && parts.length === 1) return 'services';
  if (parts[0] === 'services' && parts[1]) return 'services-' + parts[1];
  if (parts[0] === 'project-case-studies' && parts.length === 1) return 'project-case-studies';
  if (parts[0] === 'insights' && parts[1]) return null;
  if (parts[0] === 'team-members-1') return 'team-members-1';
  if (parts[0] === 'contact') return 'contact';
  return parts.join('-') || 'home';
}

function App() {
  const { route, nav } = useRoute();

  const view = useMemo(() => {
    if (route.parts[0] === 'admin') {
      return <AdminApp route={route} nav={nav} />;
    }
    if (route.parts[0] === 'project-case-studies' && route.parts[1]) {
      return <PostDetailPage slug={route.parts[1]} />;
    }
    if (route.parts[0] === 'insights' && route.parts[1]) {
      return <PostDetailPage slug={route.parts[1]} />;
    }
    const pageId = resolvePageId(route);
    if (pageId === 'home') {
      return <Home />;
    }
    if (!pageId) return <div className="kb-container"><h1>Not found</h1></div>;
    return <PageFromJson pageId={pageId} />;
  }, [route.path]);

  if (route.parts[0] === 'admin') return view;

  return (
    <div className="kb-app">
      <Nav />
      <main>{view}</main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
