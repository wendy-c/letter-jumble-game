import { useEffect } from "react";

function SpellingGuideToggle({ checked, onToggle }) {
  return (
    <div className="word-menu-settings">
      <button
        className="spelling-guide-toggle"
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
      >
        <span className="spelling-guide-toggle-copy">
          <span className="spelling-guide-toggle-title">Spelling guide</span>
          <span className="spelling-guide-toggle-note">Show vowel and consonant teams</span>
        </span>
        <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
      </button>
    </div>
  );
}

export default function WordMenu({ topic, round, showGuideToggle, showSpellingGuide, onToggleSpellingGuide, onSelectWord, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="word-menu-overlay" onClick={onClose}>
      <aside
        className="word-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-menu-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="word-menu-header">
          <div>
            <p className="eyebrow">CHOOSE A SPELL TO PRACTISE</p>
            <h2 id="word-menu-title">{topic.name}</h2>
            <p className="word-menu-count">{topic.words.length} words in this game</p>
          </div>
          <button
            className="word-menu-close"
            type="button"
            aria-label="Close word menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {showGuideToggle && <SpellingGuideToggle checked={showSpellingGuide} onToggle={onToggleSpellingGuide} />}
        <nav className="word-menu-list" aria-label={`${topic.name} words`}>
          {topic.words.map((word, index) => {
            const displayWord = word.answers[index % word.answers.length];
            const title = displayWord.charAt(0).toLocaleUpperCase() + displayWord.slice(1);
            const isCurrent = index === round;

            return (
              <button
                className={`word-menu-item${isCurrent ? " word-menu-item-current" : ""}`}
                type="button"
                key={`${topic.id}-${index}`}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => onSelectWord(index)}
              >
                <span className="word-menu-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="word-menu-name">{title}</span>
                {isCurrent && <span className="word-menu-playing">PLAYING</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
