import { useEffect, useState } from "react";
import { ageGroups, games, isGameAvailable, isGameForAge } from "../games-data";
import { isRightAnswer, makeGrownUpQuestion } from "../lib/grown-up-question";
import { useText } from "../i18n";

function GrownUpCheck({ onPass }) {
  const text = useText();
  const [question, setQuestion] = useState(() => makeGrownUpQuestion());
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (isRightAnswer(question, typed)) {
      onPass();
      return;
    }
    // A new question each time, so it can't be guessed by trying every number.
    setQuestion(makeGrownUpQuestion());
    setTyped("");
    setError(text.notRight);
  }

  return (
    <form className="parent-form" onSubmit={handleSubmit} noValidate>
      <p className="parent-intro">{text.grownUpsOnly}</p>
      <label htmlFor="grown-up-answer" className="grown-up-question">
        {text.whatIs} <strong>{question.text}</strong>?
      </label>
      <input
        id="grown-up-answer"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={typed}
        autoFocus
        aria-invalid={error ? "true" : undefined}
        onChange={(event) => {
          setTyped(event.target.value);
          setError("");
        }}
      />
      {error && <p className="player-form-error" role="alert">{error}</p>}
      <button className="action-button check-button" type="submit">
        {text.continue} <span aria-hidden="true">🔓</span>
      </button>
    </form>
  );
}

function GameSwitch({ game, enabled, suitsAge, onToggle }) {
  const text = useText();
  return (
    <li className={`parent-game${enabled ? "" : " parent-game-off"}`}>
      <button
        className="spelling-guide-toggle parent-game-toggle"
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
      >
        <span className="spelling-guide-toggle-copy">
          <span className="spelling-guide-toggle-title">{game.name}</span>
          <span className="spelling-guide-toggle-note">
            {enabled ? text.on : text.off}
            {!suitsAge && text.forAges(game.ages.map((age) => text.ageGroup[age] ?? ageGroups.find((group) => group.id === age)?.label).join(", "))}
          </span>
        </span>
        <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
      </button>
    </li>
  );
}

function ChildSettings({ player, onSetGameEnabled }) {
  const text = useText();
  const ageLabel = player.age && (text.ageGroup[player.age] ?? ageGroups.find((group) => group.id === player.age)?.label);
  const onCount = games.filter((game) => isGameAvailable(game, player)).length;

  return (
    <section className="parent-child" aria-labelledby={`parent-child-${player.name}`}>
      <h3 id={`parent-child-${player.name}`}>
        <span className="player-avatar" aria-hidden="true">{player.name.charAt(0).toLocaleUpperCase()}</span>
        {player.name}
        {ageLabel && <span className="parent-child-age">{ageLabel}</span>}
      </h3>
      {onCount === 0 && <p className="parent-warning">{text.allGamesOff(player.name)}</p>}
      <ul className="parent-games">
        {games.map((game) => {
          const enabled = isGameAvailable(game, player);
          const suitsAge = isGameForAge(game, player.age);
          return (
            <GameSwitch
              key={game.id}
              game={game}
              enabled={enabled}
              suitsAge={suitsAge}
              onToggle={() => onSetGameEnabled(player.name, game.id, !enabled, suitsAge)}
            />
          );
        })}
      </ul>
    </section>
  );
}

// Parent mode: a grown-up maths question, then each child's game settings. Closing it locks it.
export default function ParentMode({ players, onSetGameEnabled, onClose }) {
  const text = useText();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay" onClick={onClose}>
      <div
        className="player-dialog parent-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="word-menu-close player-dialog-close" type="button" aria-label={text.closeParentMode} onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">{text.forGrownUps}</p>
        <h2 id="parent-title">{text.parentMode}</h2>

        {!unlocked ? (
          <GrownUpCheck onPass={() => setUnlocked(true)} />
        ) : players.length === 0 ? (
          <p className="parent-intro">{text.noChildren}</p>
        ) : (
          <>
            <p className="parent-intro">{text.parentIntro}</p>
            {players.map((player) => (
              <ChildSettings key={player.name} player={player} onSetGameEnabled={onSetGameEnabled} />
            ))}
            <button className="action-button check-button parent-done" type="button" onClick={onClose}>
              {text.lockParentMode} <span aria-hidden="true">🔒</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
