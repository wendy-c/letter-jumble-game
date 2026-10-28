import { useEffect, useState } from "react";
import { ageGroups } from "../games-data";
import { translatePlayerError, useLanguage, useText } from "../i18n";
import { maxNameLength } from "../lib/use-players";

function AgeChoice({ value, onChange, labelledBy }) {
  const text = useText();
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
          {text.ageGroup[group.id] ?? group.label}
        </button>
      ))}
    </div>
  );
}

// A new player's name and age. `onCreate(name, age)` returns an error message, or null once the
// player is made. Also used on the welcome card for a family's first player.
export function NewPlayerForm({ label, onCreate, autoFocus = false, submitLabel, submitClassName = "action-button check-button player-form-submit" }) {
  const text = useText();
  const language = useLanguage();
  const [name, setName] = useState("");
  const [age, setAge] = useState(null);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const problem = onCreate(name, age);
    setError(problem ?? "");
  }

  return (
    <form className="player-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-player-name">{label}</label>
      <input
        id="new-player-name"
        type="text"
        value={name}
        maxLength={maxNameLength}
        autoComplete="off"
        autoFocus={autoFocus}
        aria-invalid={error && !error.includes("old") ? "true" : undefined}
        aria-describedby={error ? "new-player-error" : undefined}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
      />
      <p className="player-form-label" id="new-player-age">{text.howOld}</p>
      <AgeChoice
        value={age}
        labelledBy="new-player-age"
        onChange={(chosenAge) => {
          setAge(chosenAge);
          setError("");
        }}
      />
      {error && <p className="player-form-error" id="new-player-error" role="alert">{translatePlayerError(language, error)}</p>}
      <button className={submitClassName} type="submit">
        {submitLabel ?? <>{text.letsPlay} <img className="inline-icon" src="/images/icons/ui-sparkle.svg" alt="" width="20" height="20" /></>}
      </button>
    </form>
  );
}

// Picks who's playing. New players give a name and an age; players saved before ages
// existed (or `askAgeFor`) are asked their age before they continue.
export default function PlayerDialog({ players, currentName, askAgeFor = null, onSelect, onCreate, onSetAge, onClose }) {
  const text = useText();
  const [ageFor, setAgeFor] = useState(askAgeFor);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        <button className="word-menu-close player-dialog-close" type="button" aria-label={text.close} onClick={onClose}>
          ×
        </button>

        {ageFor ? (
          <>
            <p className="eyebrow">{text.oneQuickQuestion}</p>
            <h2 id="player-dialog-title">{text.howOldIs(ageFor)}</h2>
            <AgeChoice value={null} onChange={chooseAge} labelledBy="player-dialog-title" />
          </>
        ) : (
          <>
            <p className="eyebrow">{text.beforeWeStart}</p>
            <h2 id="player-dialog-title">{text.whosPlaying}</h2>

            {players.length > 0 && (
              <ul className="player-list" aria-label={text.players}>
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
                        <span className="sr-only">{text.rainbowCoinsHidden}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <NewPlayerForm label={players.length > 0 ? text.addPlayer : text.yourName} onCreate={onCreate} autoFocus={players.length === 0} />
          </>
        )}
      </div>
    </div>
  );
}
