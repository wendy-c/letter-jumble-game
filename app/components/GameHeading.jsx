function padNumber(number) {
  return String(number).padStart(2, "0");
}

export default function GameHeading({ isCvc, topic, round, rainbowCoins, wordMenuOpen, onBack, onOpenWordMenu }) {
  const total = topic.words.length;

  return (
    <div className="game-heading">
      <div>
        <button className="category-back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> {isCvc ? "All sounds" : "All games"}
        </button>
        <p className="eyebrow">TODAY’S MAGIC LESSON</p>
        <h1 id="game-title">{topic.name}</h1>
        <p className="heading-note">{isCvc ? "Look, listen, find the missing sound!" : "Look, think, cast the spell!"}</p>
      </div>
      <div className="progress-card" aria-label={`Word ${round + 1} of ${total}`}>
        <div className="progress-copy">
          <span>YOUR PROGRESS</span>
          <strong><span>{padNumber(round + 1)}</span> / {padNumber(total)}</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${((round + 1) / total) * 100}%` }} />
        </div>
      </div>
      <div className="heading-progress">
        <div className="rainbow-coin-tools">
          <div className="rainbow-coin-counter" aria-label={`${rainbowCoins} rainbow coins collected`}>
            <img className="rainbow-coin-icon coin-pop" key={rainbowCoins} src="/images/rainbow-coin.svg" alt="" width="32" height="32" />
            <span className="coin-count">{rainbowCoins}</span>
            <span className="coin-label">RAINBOW COINS</span>
          </div>
          <button
            className="hamburger-button"
            type="button"
            aria-label={`Browse ${topic.name} words`}
            aria-expanded={wordMenuOpen}
            aria-haspopup="dialog"
            onClick={onOpenWordMenu}
          >
            <span aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
