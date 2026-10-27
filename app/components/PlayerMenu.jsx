import { useEffect, useRef, useState } from "react";
import { useLanguage, useText } from "../i18n";

// The player chip, with their rainbow coins, and its menu: switch player, badges, Parent mode, the
// site's language, log out.
export default function PlayerMenu({ player, coins = player.coins ?? 0, onSwitch, onBadges, onParentMode, onLanguage, onLogOut }) {
  const text = useText();
  const language = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="player-menu" ref={menuRef}>
      <button
        className="player-chip"
        type="button"
        aria-label={text.playerOptions(player.name, coins)}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="player-avatar" aria-hidden="true">{player.name.charAt(0).toLocaleUpperCase()}</span>
        <span className="player-chip-name">{player.name}</span>
        <span className="player-chip-coins" aria-hidden="true">
          <img src="/images/rainbow-coin.svg" alt="" width="20" height="20" />
          {coins}
        </span>
        <span className="player-chip-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="player-menu-list" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSwitch();
            }}
          >
            {text.switchPlayer}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onBadges();
            }}
          >
            <span aria-hidden="true">🏅</span> {text.myBadges}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onParentMode();
            }}
          >
            <span aria-hidden="true">🔒</span> {text.parentMode}
          </button>
          {/* Switches the site's language; the menu stays open to show the change. */}
          <button
            className="player-menu-language"
            type="button"
            role="menuitemcheckbox"
            aria-checked={language === "zh"}
            aria-label={text.languageSwitch}
            onClick={() => onLanguage(language === "zh" ? "en" : "zh")}
          >
            <span><span aria-hidden="true">🌐</span> {text.language}</span>
            <span className="language-switch language-switch-small" aria-hidden="true">
              <span className={language === "en" ? "language-on" : ""}>En</span>
              <span className={language === "zh" ? "language-on" : ""}>繁</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogOut();
            }}
          >
            {text.logOut}
          </button>
        </div>
      )}
    </div>
  );
}
