// One Daily Challenge level's ten questions (or a sample of a Rainbow Speed Quest topic's, given
// as `topic`), exactly as a child sees them (the game's question card), two to a row for looking
// over and annotating. Each card is drawn at its full width and
// scaled down to fit, so it keeps the game's desktop layout. Used by the stories next to it: one
// folder per level, in English and in Chinese.
import { fn } from "storybook/test";
import MathGame from "../../app/components/MathGame";
import { mathLevels } from "../../app/math-data/math-data";

const cardWidth = 1100;
const scale = 0.5;

// Cards two to a row, each with a line above it saying what it is (`label`).
export function QuestionGrid({ items }) {
  return (
    <ol style={{ display: "grid", gridTemplateColumns: `repeat(2, ${cardWidth * scale}px)`, gap: "28px 24px", margin: 0, padding: 0, listStyle: "none" }}>
      {items.map(({ key, label, level, round, question, language }) => (
        <li key={key}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#8a80a6" }}>{label}</p>
          <div style={{ width: cardWidth, zoom: scale }}>
            <MathGame topic={level} round={round} question={question} onAnswer={fn()} language={language} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function LevelQuestions({ level: id, topic = null, limit = 10, language = "en" }) {
  const level = topic ?? mathLevels.find((item) => item.id === id);
  const name = level.names?.[language] ?? level.name;
  return (
    <section style={{ fontFamily: "Fredoka, sans-serif", color: "#3d2b63" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 30 }}>{name}</h1>
      <p style={{ margin: "0 0 20px", color: "#8a80a6" }}>
        {level.ages && `${level.ages.map((age) => age.toUpperCase()).join(", ")} · `}{level.focus?.[language] ?? level.english} · {Math.min(limit, level.words.length)} questions
      </p>
      <QuestionGrid
        items={level.words.slice(0, limit).map((question, index) => ({
          key: index,
          label: `Question ${index + 1} · ${question.answers[0]} · Answer: ${question.answer}`,
          level: { ...level, name },
          round: index,
          question,
          language,
        }))}
      />
    </section>
  );
}
