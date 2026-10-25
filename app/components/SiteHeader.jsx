import { useText } from "../i18n";

// The top bar: the Rainbow Academy logo (which goes home and shows the welcome card) and the
// player's tools.
export default function SiteHeader({ onBrandClick, children }) {
  const text = useText();
  return (
    <header className="topbar mx-auto flex w-full max-w-6xl items-start justify-between">
      <a
        className="brand"
        href="/"
        aria-label={text.homeLink}
        onClick={(event) => {
          if (!onBrandClick) return;
          event.preventDefault();
          onBrandClick();
        }}
      >
        <img className="brand-logo" src="/images/logo.png" alt="" width="80" height="80" />
        <span className="brand-wave">The Rainbow Academy</span>
      </a>
      <div className="topbar-tools">
        {children}
      </div>
    </header>
  );
}
