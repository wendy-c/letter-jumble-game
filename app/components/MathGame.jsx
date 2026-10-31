import { useEffect, useState } from "react";
import { speakCantonese, speakWord, stopSpeaking } from "../lib/speech";

// What the question shows besides its picture: a number bond, a sum, a run of numbers or a
// pattern of pictures. The missing part shows "?" until it's answered, then the right answer.
function MathVisual({ visual, answer, solved }) {
  const fill = (value) => (value === null ? (solved ? answer : "?") : value);
  const missingClass = (value) => (value === null ? ` math-missing${solved ? " math-missing-filled" : ""}` : "");

  if (visual.type === "bond") {
    const [first, second] = visual.parts;
    return (
      <div className="math-bond" role="img" aria-label={`Number bond: ${visual.whole} is ${fill(first)} and ${fill(second)}`}>
        <svg className="math-bond-lines" viewBox="0 0 200 120" aria-hidden="true">
          <path d="M100 40 50 90M100 40l50 50" />
        </svg>
        <span className="math-bubble math-bond-whole">{visual.whole}</span>
        <span className={`math-bubble math-bond-left${missingClass(first)}`}>{fill(first)}</span>
        <span className={`math-bubble math-bond-right${missingClass(second)}`}>{fill(second)}</span>
      </div>
    );
  }
  if (visual.type === "equation") {
    const [question, rest] = visual.text.split("?");
    return (
      <p className="math-equation">
        {question.trim()}<span className={`math-box${missingClass(null)}`}>{fill(null)}</span>{rest.trim()}
      </p>
    );
  }
  if (visual.type === "sequence") {
    return (
      <ol className="math-sequence" aria-label={visual.items.map((item) => fill(item)).join(", ")}>
        {visual.items.map((item, index) => (
          <li key={index} className={`math-box${missingClass(item)}`}>{fill(item)}</li>
        ))}
      </ol>
    );
  }
  // A pattern of pictures; the gap shows the right picture once answered.
  return (
    <ol className="math-pattern" aria-label={visual.items.map((item) => item?.name ?? (solved ? answer : "?")).join(", ")}>
      {visual.items.map((item, index) => (
        <li key={index} className={`math-pattern-piece${item ? "" : missingClass(null)}`}>
          {item ? <img src={item.picture} alt="" width="48" height="48" />
            : solved ? <img src={visual.answerPicture} alt="" width="48" height="48" /> : "?"}
        </li>
      ))}
    </ol>
  );
}

// One Math and Logic question: its picture (or, without one, its sum or pattern drawn large), the
// question, and the choices. There's one try: the pick is reported with `onAnswer(correct)`, and
// the right answer fills the gap either way. Hearing the question read out is a hint.
// The parent remounts this (key) for every new question.
export default function MathGame({ topic, round, question, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState("");
  const solved = picked !== null;
  const chinese = question.lang !== "en";
  const visual = question.visual?.type === "pattern"
    ? { ...question.visual, answerPicture: question.options.find((option) => option.correct).picture }
    : question.visual;

  useEffect(() => () => stopSpeaking(), []);

  function pick(option) {
    if (solved) return;
    setPicked(option.label);
    onAnswer(option.correct);
  }

  function speak() {
    if (chinese) speakCantonese(question.prompt, setVoiceMessage);
    else speakWord(question.prompt, setVoiceMessage);
  }

  return (
    <div className="game-card math-card">
      <section className={`picture-panel picture-${topic.color} math-picture-panel`} aria-label="The question">
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <div className="math-stage">
          {question.picture
            ? <img className="math-picture" src={question.picture} alt="" width="512" height="320" />
            : <MathVisual visual={visual} answer={question.answer} solved={solved} />}
        </div>
      </section>

      <section className="answer-panel math-answer-panel" aria-label="Answer">
        <div className="answer-intro">
          <div>
            <h2 className="math-prompt" lang={question.lang}>{question.prompt}</h2>
          </div>
          <button
            className="voice-button"
            type="button"
            onClick={speak}
            aria-label={chinese ? "聽題目" : "Hear the question"}
            title={chinese ? "聽題目" : "Hear the question"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          </button>
        </div>
        <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>

        {question.picture && question.visual && <MathVisual visual={visual} answer={question.answer} solved={solved} />}

        <div className={`math-options${question.options.length === 3 ? " math-options-three" : ""}`} role="group" aria-label="Choices">
          {question.options.map((option) => {
            const wrong = picked === option.label && !option.correct;
            const right = solved && option.correct;
            return (
              <button
                className={`math-option${option.picture ? " math-option-picture" : ""}${wrong ? " chinese-option-wrong" : ""}${right ? " chinese-option-right" : ""}`}
                type="button"
                key={option.label}
                aria-label={option.label}
                disabled={solved}
                onClick={() => pick(option)}
              >
                {option.picture ? <img src={option.picture} alt="" width="56" height="56" /> : option.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
