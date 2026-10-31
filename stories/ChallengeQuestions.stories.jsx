// Every Math and Logic question, one after another, exactly as a child sees it: the game's
// question card with its picture, question and choices, grouped by level. The choices can be
// tapped to try them.
import { fn } from "storybook/test";
import MathGame from "../app/components/MathGame";
import { mathLevels } from "../app/math-data";

function LevelQuestions({ level }) {
  return (
    <section style={{ marginBottom: 48 }} aria-labelledby={`${level.id}-title`}>
      <h1 id={`${level.id}-title`} style={{ margin: "0 0 4px", fontFamily: "Fredoka, sans-serif", color: "#3d2b63", fontSize: 30 }}>
        {level.name}
      </h1>
      <p style={{ margin: "0 0 20px", fontFamily: "Fredoka, sans-serif", color: "#8a80a6" }}>
        {level.english} · {level.words.length} questions
      </p>
      {level.words.map((question, index) => (
        <div key={index} style={{ maxWidth: 1152, margin: "0 auto 28px" }}>
          <p style={{ margin: "0 0 8px", fontFamily: "Fredoka, sans-serif", fontSize: 13, fontWeight: 700, color: "#8a80a6" }}>
            {level.name} · Question {index + 1} · {question.answers[0]} · Answer: {question.answer}
          </p>
          <MathGame topic={level} round={index} question={question} onAnswer={fn()} />
        </div>
      ))}
    </section>
  );
}

function ChallengeQuestions({ levels }) {
  return levels.map((id) => <LevelQuestions key={id} level={mathLevels.find((level) => level.id === id)} />);
}

export default {
  title: "Challenge/Math and Logic",
  component: ChallengeQuestions,
};

export const AllLevels = { args: { levels: mathLevels.map((level) => level.id) } };
export const Level1 = { name: "Level 1", args: { levels: ["level-1"] } };
export const Level2 = { name: "Level 2", args: { levels: ["level-2"] } };
export const Level3 = { name: "Level 3", args: { levels: ["level-3"] } };
export const Level4 = { name: "Level 4", args: { levels: ["level-4"] } };
export const Level5 = { name: "Level 5", args: { levels: ["level-5"] } };
export const Level6 = { name: "Level 6", args: { levels: ["level-6"] } };
