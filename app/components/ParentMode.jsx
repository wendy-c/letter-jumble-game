import { useState } from "react";
import { ageGroups, games, isGameAvailable, isGameForAge } from "../games-data";
import { isRightAnswer, makeGrownUpQuestion } from "../lib/grown-up-question";
import { useText } from "../i18n";
import GameFooter from "./GameFooter";

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
        {text.continue} <img className="inline-icon" src="/images/icons/menu-parent.svg" alt="" width="20" height="20" />
      </button>
    </form>
  );
}

// A switch with a title and a note, as used for every Parent mode setting.
function SettingSwitch({ checked, title, note, onToggle }) {
  return (
    <button className="spelling-guide-toggle parent-game-toggle" type="button" role="switch" aria-checked={checked} onClick={onToggle}>
      <span className="spelling-guide-toggle-copy">
        <span className="spelling-guide-toggle-title">{title}</span>
        <span className="spelling-guide-toggle-note">{note}</span>
      </span>
      <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
    </button>
  );
}

// A game's switch. The Letter Jumble games also have a spelling guide switch, under the game's.
function GameSwitch({ game, enabled, suitsAge, onToggle, spellingGuide, onToggleSpellingGuide }) {
  const text = useText();
  return (
    <li className={`parent-game${enabled ? "" : " parent-game-off"}`}>
      <SettingSwitch
        checked={enabled}
        title={game.name}
        note={<>
          {enabled ? text.on : text.off}
          {!suitsAge && text.forAges(game.ages.map((age) => text.ageGroup[age] ?? ageGroups.find((group) => group.id === age)?.label).join(", "))}
        </>}
        onToggle={onToggle}
      />
      {game.spellingGuide && (
        <span className="parent-game-guide">
          <SettingSwitch checked={spellingGuide} title={text.spellingGuide} note={text.spellingGuideNote} onToggle={onToggleSpellingGuide} />
        </span>
      )}
    </li>
  );
}

function ChildSettings({ player, onSetGameEnabled, onSetSpellingGuide }) {
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
              spellingGuide={Boolean(player.spellingGuide?.includes(game.id))}
              onToggleSpellingGuide={() => onSetSpellingGuide(player.name, game.id, !player.spellingGuide?.includes(game.id))}
            />
          );
        })}
      </ul>
    </section>
  );
}

// The parent mode page ("/parent"): a grown-up maths question, then each child's settings: which
// games they can play, and whether their Letter Jumble games show the spelling guide.
// Leaving the page locks it again; "Done" locks it and goes home (`onDone`).
export default function ParentMode({ players, breadcrumbs, onSetGameEnabled, onSetSpellingGuide, onDone }) {
  const text = useText();
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section className="game-wrap parent-page mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">{text.forGrownUps}</p>
        <h1 id="game-title">{text.parentMode}</h1>
      </div>

      <div className="parent-card">
        {!unlocked ? (
          <GrownUpCheck onPass={() => setUnlocked(true)} />
        ) : players.length === 0 ? (
          <p className="parent-intro">{text.noChildren}</p>
        ) : (
          <>
            <p className="parent-intro">{text.parentIntro}</p>
            <div className="parent-children">
              {players.map((player) => (
                <ChildSettings key={player.name} player={player} onSetGameEnabled={onSetGameEnabled} onSetSpellingGuide={onSetSpellingGuide} />
              ))}
            </div>
            <button className="action-button check-button parent-done" type="button" onClick={onDone}>
              {text.lockParentMode} <img className="inline-icon" src="/images/icons/menu-parent.svg" alt="" width="20" height="20" />
            </button>
          </>
        )}
      </div>

      <GameFooter>{text.forGrownUps}</GameFooter>
    </section>
  );
}
