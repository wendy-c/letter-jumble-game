// Every Math question, one after another, exactly as a child sees it: the game's question card
// with its picture, question and choices, grouped by level (or topic), in English or Chinese. The
// choices can be tapped to try them.
import { fn } from "storybook/test";
import MathGame from "../app/components/MathGame";
import { mathLevels } from "../app/math-data";
import { speedTopics } from "../app/speed-quest-data";

function LevelQuestions({ level, language, limit }) {
  const name = level.names?.[language] ?? level.name;
  return (
    <section style={{ marginBottom: 48 }} aria-labelledby={`${level.id}-title`}>
      <h1 id={`${level.id}-title`} style={{ margin: "0 0 4px", fontFamily: "Fredoka, sans-serif", color: "#3d2b63", fontSize: 30 }}>
        {name}
      </h1>
      <p style={{ margin: "0 0 20px", fontFamily: "Fredoka, sans-serif", color: "#8a80a6" }}>
        {level.focus?.[language] ?? level.english} · {Math.min(limit ?? Infinity, level.words.length)} questions
      </p>
      {level.words.slice(0, limit).map((question, index) => (
        <div key={index} style={{ maxWidth: 1152, margin: "0 auto 28px" }}>
          <p style={{ margin: "0 0 8px", fontFamily: "Fredoka, sans-serif", fontSize: 13, fontWeight: 700, color: "#8a80a6" }}>
            {name} · Question {index + 1} · {question.answers[0]} · Answer: {question.answer}
          </p>
          <MathGame topic={{ ...level, name }} round={index} question={question} onAnswer={fn()} language={language} />
        </div>
      ))}
    </section>
  );
}

// `levels` are level ids, or "speed-quest" for a sample of each Rainbow Speed Quest topic.
function ChallengeQuestions({ levels, language = "en" }) {
  if (levels === "speed-quest") return speedTopics.map((topic) => <LevelQuestions key={topic.id} level={topic} language={language} limit={10} />);
  return levels.map((id) => <LevelQuestions key={id} level={mathLevels.find((level) => level.id === id)} language={language} />);
}

const idsFor = (age) => mathLevels.filter((level) => level.ages.includes(age)).map((level) => level.id);

export default {
  title: "Challenge/Daily Challenge",
  component: ChallengeQuestions,
  argTypes: { language: { control: "inline-radio", options: ["en", "zh"] } },
};

export const Ages3To4 = { name: "Ages 3-4 (Levels 1-20)", args: { levels: idsFor("3-4") } };
export const Ages5To6 = { name: "Ages 5-6 (Levels 1-20)", args: { levels: idsFor("5-6") } };
export const Ages3To4InChinese = { name: "Ages 3-4 in Chinese", args: { levels: idsFor("3-4"), language: "zh" } };
export const Ages5To6InChinese = { name: "Ages 5-6 in Chinese", args: { levels: idsFor("5-6"), language: "zh" } };
export const SpeedQuest = { name: "Rainbow Speed Quest (10 of each)", args: { levels: "speed-quest" } };
