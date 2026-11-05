import LetterPattern from "./LetterPattern";

// A game on the front page, made for children who can't read yet: a big picture, its name, and a
// small note for grown-ups. Tapping it opens the game. A `recent` card is the front page's "Keep
// playing" one: the same game's card is in its own group too, so this one has its own name id and
// isn't counted among the games.
export default function GameCard({ game, note, onSelect, recent = false }) {
  const chinese = game.group === "chinese";

  return (
    <div className="game-card-wrap">
      <button className={`category-card category-${game.color} game-choice-card`} type="button" data-game-name={recent ? undefined : game.name} onClick={onSelect}>
        <span className="game-card-picture" aria-hidden="true">
          <img src={game.picture} alt="" width="120" height="120" />
          {game.pattern && <span className="game-card-chip"><LetterPattern letters={game.pattern} /></span>}
        </span>
        <span className="category-card-name" id={`game-name-${recent ? "recent-" : ""}${game.id}`} lang={chinese ? "zh-Hant-HK" : undefined}>{game.name}</span>
        <span className="game-card-note">{note}</span>
      </button>
    </div>
  );
}
