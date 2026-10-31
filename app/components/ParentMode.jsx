import { useId, useState } from "react";
import { ageGroups, defaultQuestionCount, games, isGameAvailable, isGameForAge, questionCountChoices } from "../games-data";
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

// One Parent mode setting: a title and a note, with an on/off switch named by the title.
// `children` sit under the note (a game's arrow for its more settings).
function SettingRow({ checked, title, note, onToggle, children = null }) {
  const titleId = useId();
  return (
    <div className="parent-mode-setting">
      <span className="parent-mode-copy">
        <span className="parent-mode-title" id={titleId}>{title}</span>
        <span className="parent-mode-note">{note}</span>
        {children}
      </span>
      <button className="parent-mode-switch" type="button" role="switch" aria-checked={checked} aria-labelledby={titleId} onClick={onToggle}>
        <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
      </button>
    </div>
  );
}

// How many questions a round deals: 5, 10, 15 or 20.
function QuestionCountChoice({ count, onChoose }) {
  const text = useText();
  const titleId = useId();
  return (
    <div className="parent-mode-setting parent-mode-setting-choices">
      <span className="parent-mode-copy">
        <span className="parent-mode-title" id={titleId}>{text.questionsPerRound}</span>
        <span className="parent-mode-note">{text.questionsPerRoundNote}</span>
      </span>
      <span className="parent-mode-choices" role="radiogroup" aria-labelledby={titleId}>
        {questionCountChoices.map((choice) => (
          <button key={choice} className="parent-mode-choice" type="button" role="radio" aria-checked={choice === count} onClick={() => onChoose(choice)}>
            {choice}
          </button>
        ))}
      </span>
    </div>
  );
}

// A game's switch. Games with more settings (the spelling guide, or how many questions a round
// has) show an arrow under "On" that opens them.
function GameSwitch({ game, enabled, suitsAge, onToggle, spellingGuide, onToggleSpellingGuide, questionCount, onSetQuestionCount }) {
  const text = useText();
  const optionsId = useId();
  const [open, setOpen] = useState(false);
  const hasOptions = Boolean(game.spellingGuide || game.questionCount);
  return (
    <li className={`parent-game${enabled ? "" : " parent-game-off"}`}>
      <SettingRow
        checked={enabled}
        title={game.name}
        note={<>
          {enabled ? text.on : text.off}
          {!suitsAge && text.forAges(game.ages.map((age) => text.ageGroup[age] ?? ageGroups.find((group) => group.id === age)?.label).join(", "))}
        </>}
        onToggle={onToggle}
      >
        {hasOptions && (
          <button
            className="parent-mode-expand"
            type="button"
            aria-expanded={open}
            aria-controls={optionsId}
            aria-label={text.moreSettings(game.name)}
            onClick={() => setOpen((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        )}
      </SettingRow>
      {hasOptions && (
        <div className="parent-game-options" id={optionsId} hidden={!open}>
          {game.spellingGuide && (
            <SettingRow checked={spellingGuide} title={text.spellingGuide} note={text.spellingGuideNote} onToggle={onToggleSpellingGuide} />
          )}
          {game.questionCount && <QuestionCountChoice count={questionCount} onChoose={onSetQuestionCount} />}
        </div>
      )}
    </li>
  );
}

function ChildSettings({ player, onSetGameEnabled, onSetSpellingGuide, onSetQuestionCount }) {
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
              questionCount={player.questionCounts?.[game.id] ?? defaultQuestionCount}
              onSetQuestionCount={(count) => onSetQuestionCount(player.name, game.id, count)}
            />
          );
        })}
      </ul>
    </section>
  );
}

// The parent mode page ("/parent"): a grown-up maths question, then each child's settings: which
// games they can play, whether their Letter Jumble games show the spelling guide, and how many
// questions a round of CVC Sounds, Digraphs or Blends has.
// Leaving the page locks it again; "Done" locks it and goes home (`onDone`).
export default function ParentMode({ players, breadcrumbs, onSetGameEnabled, onSetSpellingGuide, onSetQuestionCount, onDone }) {
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
                <ChildSettings key={player.name} player={player} onSetGameEnabled={onSetGameEnabled} onSetSpellingGuide={onSetSpellingGuide} onSetQuestionCount={onSetQuestionCount} />
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
