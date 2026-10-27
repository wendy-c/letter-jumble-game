import { gameGroups } from "../games-data";
import { useText } from "../i18n";
import GameCard from "./GameCard";
import GameFooter from "./GameFooter";
import MochiGreeting from "./MochiGreeting";

// The front page: Mochi says hello, then the player's games under headings (Phonics, Cambridge YLE
// training, 中文 and Visit Mochi). A heading with none of their games isn't shown.
export default function GamePicker({ games, playerName = null, onSelectGame, emptyMessage }) {
  const text = useText();
  const shelves = gameGroups
    .map((group) => ({ group, games: games.filter((game) => game.group === group.id) }))
    .filter((shelf) => shelf.games.length > 0);

  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <MochiGreeting playerName={playerName} />
      {games.length === 0 && emptyMessage && <p className="game-picker-empty">{emptyMessage}</p>}
      {shelves.map(({ group, games: shelfGames }) => (
        <section className="game-group" key={group.id} aria-labelledby={`game-group-${group.id}`}>
          <h2 className="game-group-title" id={`game-group-${group.id}`} lang={group.lang}>
            <span className="game-group-icon" aria-hidden="true"><img src={group.icon} alt="" width="28" height="28" /></span>
            {text.groups[group.id] ?? group.name}
          </h2>
          <div className="category-grid game-choice-grid">
            {shelfGames.map((game) => (
              <GameCard key={game.id} game={game} note={text.gameNotes[game.id] ?? game.note} onSelect={() => onSelectGame(game)} />
            ))}
          </div>
        </section>
      ))}
      <GameFooter>{text.pickAGame}</GameFooter>
    </section>
  );
}
