import { useEffect, useState } from "react";
import { maxNameLength } from "../lib/use-players";

export default function PlayerDialog({ players, currentName, onSelect, onCreate, onClose }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    const problem = onCreate(name);
    setError(problem ?? "");
  }

  return (
    <div className="player-overlay" onClick={onClose}>
      <div
        className="player-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="word-menu-close player-dialog-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">BEFORE WE START</p>
        <h2 id="player-dialog-title">Who’s playing?</h2>

        {players.length > 0 && (
          <ul className="player-list" aria-label="Players">
            {players.map((player) => (
              <li key={player.name}>
                <button
                  className={`player-option${player.name === currentName ? " player-option-current" : ""}`}
                  type="button"
                  aria-current={player.name === currentName ? "true" : undefined}
                  onClick={() => onSelect(player.name)}
                >
                  <span className="player-avatar" aria-hidden="true">{player.name.charAt(0).toLocaleUpperCase()}</span>
                  <span className="player-option-name">{player.name}</span>
                  <span className="player-option-coins">
                    <img src="/images/rainbow-coin.svg" alt="" width="18" height="18" />
                    {player.coins}
                    <span className="sr-only"> rainbow coins</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="player-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="new-player-name">{players.length > 0 ? "Or add a new player" : "What’s your name?"}</label>
          <div className="player-form-row">
            <input
              id="new-player-name"
              type="text"
              value={name}
              maxLength={maxNameLength}
              autoComplete="off"
              autoFocus={players.length === 0}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "new-player-error" : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
            />
            <button className="action-button check-button" type="submit">
              Let’s play! <span aria-hidden="true">✨</span>
            </button>
          </div>
          {error && <p className="player-form-error" id="new-player-error" role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
