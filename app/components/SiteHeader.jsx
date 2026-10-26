import { useText } from "../i18n";

// The top bar: the Rainbow Academy logo with its name and a "beta" badge (which goes home and
// shows the welcome card), and the player's tools.
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
        <img className="brand-logo" src="/images/logo-name-beta.png" alt="" width="270" height="96" />
      </a>
      <div className="topbar-tools">
        {children}
      </div>
    </header>
  );
}
