import { gameGroups } from "../games-data";
import ChoiceCard from "./ChoiceCard";
import GameFooter from "./GameFooter";
import LetterPattern from "./LetterPattern";

// The front page: the player's games under headings (Phonics, Cambridge YLE training, 中文 and
// Visit Mochi). A heading with none of their games isn't shown.
export default function GamePicker({ games, onSelectGame, emptyMessage }) {
  const shelves = gameGroups
    .map((group) => ({ group, games: games.filter((game) => game.group === group.id) }))
    .filter((shelf) => shelf.games.length > 0);

  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        <p className="eyebrow">WELCOME TO THE RAINBOW ACADEMY</p>
        <h1 id="game-title">Learn, Play, Shine!</h1>
        <p className="heading-note">Which magic lesson shall we play today?</p>
      </div>
      {games.length === 0 && emptyMessage && <p className="game-picker-empty">{emptyMessage}</p>}
      {shelves.map(({ group, games: shelfGames }) => (
        <section className="game-group" key={group.id} aria-labelledby={`game-group-${group.id}`}>
          <h2 className="game-group-title" id={`game-group-${group.id}`} lang={group.lang}>
            <span className="game-group-icon" aria-hidden="true">{group.icon}</span>
            {group.name}
          </h2>
          <div className="category-grid game-choice-grid">
            {shelfGames.map((game, index) => (
              <ChoiceCard
                className="game-choice-card"
                key={game.id}
                color={game.color}
                icon={game.icon
                  ? <img src={game.icon} alt="" width="40" height="40" />
                  : <LetterPattern letters={game.pattern} />}
                number={index + 1}
                name={game.name}
                note={game.note}
                onClick={() => onSelectGame(game)}
              />
            ))}
          </div>
        </section>
      ))}
      <GameFooter>PICK A GAME</GameFooter>
    </section>
  );
}
