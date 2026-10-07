import ChoiceCard from "./ChoiceCard";
import GameFooter from "./GameFooter";
import LetterPattern from "./LetterPattern";

export default function TopicMenu({ isCvc, topics, progressFor = () => 0, onBack, onSelectTopic }) {
  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        <button className="category-back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Choose a game
        </button>
        <p className="eyebrow">WELCOME TO SPELLING SCHOOL</p>
        {isCvc ? (
          <>
            <h1 id="game-title">CVC <span>Sounds</span></h1>
            <p className="heading-note">Listen for the missing sound and pick the right letter.</p>
          </>
        ) : (
          <>
            <h1 id="game-title">Letter <span>Jumble</span></h1>
            <p className="heading-note">Pick a spell book and start today’s magic lesson.</p>
          </>
        )}
      </div>
      <div className={`category-grid${isCvc ? " mode-grid" : ""}`}>
        {topics.map((topic, index) => (
          <ChoiceCard
            key={topic.id}
            color={topic.color}
            icon={topic.pattern
              ? <LetterPattern letters={topic.pattern} />
              : <img src={topic.icon} alt="" width="40" height="40" />}
            number={index + 1}
            name={topic.name}
            note={progressFor(topic) > 0
              ? `${progressFor(topic)} of ${topic.words.length} spells learned`
              : `${topic.words.length} spells to learn`}
            onClick={() => onSelectTopic(topic)}
          />
        ))}
      </div>
      <GameFooter>{isCvc ? "PICK A SOUND" : "PICK A SPELL BOOK"}</GameFooter>
    </section>
  );
}
