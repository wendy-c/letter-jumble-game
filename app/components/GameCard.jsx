import { speakCantonese, speakWord } from "../lib/speech";
import { useText } from "../i18n";
import LetterPattern from "./LetterPattern";

// A game on the front page, made for children who can't read yet: a big picture, its name, and a
// small note for grown-ups. The speaker button in the corner says what the game is (in Cantonese
// for the Chinese games); the rest of the card opens it.
export default function GameCard({ game, note, onSelect }) {
  const text = useText();
  const chinese = game.group === "chinese";

  return (
    <div className="game-card-wrap">
      <button className={`category-card category-${game.color} game-choice-card`} type="button" onClick={onSelect}>
        <span className="game-card-picture" aria-hidden="true">
          <img src={game.picture} alt="" width="120" height="120" />
          {game.pattern && <span className="game-card-chip"><LetterPattern letters={game.pattern} /></span>}
        </span>
        <span className="category-card-name" id={`game-name-${game.id}`} lang={chinese ? "zh-Hant-HK" : undefined}>{game.name}</span>
        <span className="game-card-note">{note}</span>
      </button>
      <button
        className="game-card-speaker"
        type="button"
        aria-label={text.hearGame}
        aria-describedby={`game-name-${game.id}`}
        title={text.hearGame}
        onClick={() => (chinese ? speakCantonese : speakWord)(game.say ?? game.name, () => {})}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      </button>
    </div>
  );
}
