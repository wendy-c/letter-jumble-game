import ChoiceCard from "./ChoiceCard";
import GameFooter from "./GameFooter";
import LetterPattern from "./LetterPattern";

export default function GamePicker({ games, onSelectGame }) {
  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        <p className="eyebrow">WELCOME TO SPELLING SCHOOL</p>
        <h1 id="game-title">Choose an adventure!</h1>
        <p className="heading-note">Which magic lesson shall we play today?</p>
      </div>
      <div className="category-grid game-choice-grid">
        {games.map((game, index) => (
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
      <GameFooter>PICK A GAME</GameFooter>
    </section>
  );
}
