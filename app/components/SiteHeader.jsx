export default function SiteHeader({ badge, children }) {
  return (
    <header className="topbar mx-auto flex w-full max-w-6xl items-center justify-between">
      <a className="brand" href="/" aria-label="Word Wave home">
        <img className="brand-logo" src="/images/logo.png" alt="" width="80" height="80" />
        <span className="brand-wave">The Magic Academy</span>
      </a>
      <div className="topbar-tools">
        <div className="exam-badge">
          <span className="badge-sparkle" aria-hidden="true">✦</span>
          {badge}
        </div>
        {children}
      </div>
    </header>
  );
}
