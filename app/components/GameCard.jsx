import LetterPattern from "./LetterPattern";

// A game on the front page, made for children who can't read yet: a big picture, its name, and a
// small note for grown-ups. Tapping it opens the game.
export default function GameCard({ game, note, onSelect }) {
  const chinese = game.group === "chinese";

  return (
    <div className="game-card-wrap">
      <button className={`category-card category-${game.color} game-choice-card`} type="button" data-game-name={game.name} onClick={onSelect}>
        <span className="game-card-picture" aria-hidden="true">
          <img src={game.picture} alt="" width="120" height="120" />
          {game.pattern && <span className="game-card-chip"><LetterPattern letters={game.pattern} /></span>}
        </span>
        <span className="category-card-name" id={`game-name-${game.id}`} lang={chinese ? "zh-Hant-HK" : undefined}>{game.name}</span>
        <span className="game-card-note">{note}</span>
      </button>
    </div>
  );
}
