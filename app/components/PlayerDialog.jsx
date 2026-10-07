import { useEffect, useState } from "react";
import { ageGroups } from "../games-data";
import { maxNameLength } from "../lib/use-players";

function AgeChoice({ value, onChange, labelledBy }) {
  return (
    <div className="age-choice" role="radiogroup" aria-labelledby={labelledBy}>
      {ageGroups.map((group) => (
        <button
          className={`age-option${value === group.id ? " age-option-selected" : ""}`}
          type="button"
          role="radio"
          aria-checked={value === group.id}
          key={group.id}
          onClick={() => onChange(group.id)}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}

// Picks who's playing. New players give a name and an age; players saved before ages
// existed (or `askAgeFor`) are asked their age before they continue.
export default function PlayerDialog({ players, currentName, askAgeFor = null, onSelect, onCreate, onSetAge, onClose }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(null);
  const [error, setError] = useState("");
  const [ageFor, setAgeFor] = useState(askAgeFor);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    const problem = onCreate(name, age);
    setError(problem ?? "");
  }

  function choose(player) {
    if (player.age) {
      onSelect(player.name, player.age);
    } else {
      setAgeFor(player.name);
    }
  }

  function chooseAge(chosenAge) {
    onSetAge(ageFor, chosenAge);
    onSelect(ageFor, chosenAge);
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

        {ageFor ? (
          <>
            <p className="eyebrow">ONE QUICK QUESTION</p>
            <h2 id="player-dialog-title">How old is {ageFor}?</h2>
            <AgeChoice value={null} onChange={chooseAge} labelledBy="player-dialog-title" />
          </>
        ) : (
          <>
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
                      onClick={() => choose(player)}
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
              <input
                id="new-player-name"
                type="text"
                value={name}
                maxLength={maxNameLength}
                autoComplete="off"
                autoFocus={players.length === 0}
                aria-invalid={error && !error.includes("old") ? "true" : undefined}
                aria-describedby={error ? "new-player-error" : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
              />
              <p className="player-form-label" id="new-player-age">How old are you?</p>
              <AgeChoice
                value={age}
                labelledBy="new-player-age"
                onChange={(chosenAge) => {
                  setAge(chosenAge);
                  setError("");
                }}
              />
              {error && <p className="player-form-error" id="new-player-error" role="alert">{error}</p>}
              <button className="action-button check-button player-form-submit" type="submit">
                Let’s play! <span aria-hidden="true">✨</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
