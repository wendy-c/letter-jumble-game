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
    <ol className="math-pattern" aria-label={visual.items.map((item) => (item ? visual.nameOf(item) : solved ? visual.answerName : "?")).join(", ")}>
      {visual.items.map((item, index) => (
        <li key={index} className={`math-pattern-piece${item ? "" : missingClass(null)}`}>
          {item ? <img src={item.picture} alt="" width="48" height="48" />
            : solved ? <img src={visual.answerPicture} alt="" width="48" height="48" /> : "?"}
        </li>
      ))}
    </ol>
  );
}

// A generated question's picture, made from small pictures of things: groups to add or take away
// (taken-away ones are crossed out), a mix to count, a ten frame (or two) to fill, or a row of swaps.
function MathScene({ scene }) {
  const things = (picture, count, gone = 0) => Array.from({ length: count }, (_, index) => (
    <span key={index} className={`math-thing${index >= count - gone ? " math-thing-gone" : ""}`}>
      <img src={picture} alt="" width="40" height="40" />
    </span>
  ));
  if (scene.type === "groups") {
    const total = scene.groups.reduce((sum, group) => sum + group.count, 0);
    return (
      <div className={`math-scene math-groups${total > 12 ? " math-scene-many" : ""}`} aria-hidden="true">
        {scene.groups.map((group, index) => <div className="math-group" key={index}>{things(group.picture, group.count, group.crossed)}</div>)}
      </div>
    );
  }
  if (scene.type === "count") {
    return (
      <div className={`math-scene math-count${scene.items.length > 12 ? " math-scene-many" : ""}`} aria-hidden="true">
        {scene.items.map((picture, index) => <span key={index} className="math-thing"><img src={picture} alt="" width="40" height="40" /></span>)}
      </div>
    );
  }
  if (scene.type === "frame") {
    const frames = Array.from({ length: Math.ceil(scene.size / 10) }, (_, index) => index);
    return (
      <div className="math-scene math-frames" aria-hidden="true">
        {frames.map((frame) => (
          <div key={frame} className={`math-frame${scene.size === 5 ? " math-frame-five" : ""}`}>
            {Array.from({ length: Math.min(10, scene.size - frame * 10) }, (_, index) => {
              const filled = frame * 10 + index < scene.filled;
              return <span key={index} className="math-frame-cell">{filled && <img src={scene.picture} alt="" width="32" height="32" />}</span>;
            })}
          </div>
        ))}
      </div>
    );
  }
  // Swaps: "1 [this] = 2 [that]", with the last row's count to find.
  return (
    <div className="math-scene math-swaps" aria-hidden="true">
      {scene.rows.map((row, index) => (
        <div key={index} className="math-swap-row">
          <img src={row.from} alt="" width="40" height="40" />
          <span className="math-swap-equals">=</span>
          {row.count === null
            ? <><span className="math-box math-missing">?</span><img src={row.to} alt="" width="40" height="40" /></>
            : Array.from({ length: row.count }, (_, item) => <img key={item} src={row.to} alt="" width="40" height="40" />)}
        </div>
      ))}
    </div>
  );
}

// "1:05": minutes and seconds.
export function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// A clock counting up from `startedAt`, for timed rounds.
function Timer({ startedAt, language }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="math-timer" role="timer" aria-label={language === "zh" ? "時間" : "Time"}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M10 2h4" /></svg>
      {formatTime(Math.max(0, now - startedAt))}
    </span>
  );
}

// One Daily Challenge or Rainbow Speed Quest question, in `language` ("en" or "zh"): its picture (a
// drawing, or one made from small pictures; without either, its sum or pattern drawn large), the
// question, and the choices. There's one try: the pick is reported with `onAnswer(correct)`, and
// the right answer fills the gap either way. Hearing the question read out is a hint. Timed rounds
// pass `startedAt` to show a clock. The parent remounts this (key) for every new question.
export default function MathGame({ topic, round, question, onAnswer, language = "en", startedAt = null }) {
  const [picked, setPicked] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState("");
  const solved = picked !== null;
  const chinese = language === "zh";
  const lang = chinese ? "zh-Hant-HK" : "en";
  const prompt = typeof question.prompt === "string" ? question.prompt : question.prompt[language] ?? question.prompt.en;
  const picture = typeof question.picture === "string" || !question.picture ? question.picture : question.picture[language];
  const nameOf = (item) => item.name?.[language] ?? item.name?.en ?? item.label;
  const right = question.options.find((option) => option.correct);
  const visual = question.visual?.type === "pattern"
    ? { ...question.visual, answerPicture: right.picture, answerName: nameOf(right), nameOf }
    : question.visual;
  const hasPicture = Boolean(picture || question.scene);

  useEffect(() => () => stopSpeaking(), []);

  function pick(option) {
    if (solved) return;
    setPicked(option.label);
    onAnswer(option.correct);
  }

  function speak() {
    if (chinese) speakCantonese(prompt, setVoiceMessage);
    else speakWord(prompt, setVoiceMessage);
  }

  return (
    <div className="game-card math-card">
      <section className={`picture-panel picture-${topic.color} math-picture-panel`} aria-label={chinese ? "題目" : "The question"}>
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          {startedAt !== null && <Timer startedAt={startedAt} language={language} />}
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <div className="math-stage">
          {picture ? <img className="math-picture" src={picture} alt="" width="512" height="320" />
            : question.scene ? <MathScene scene={question.scene} />
              : <MathVisual visual={visual} answer={question.answer} solved={solved} />}
        </div>
      </section>

      <section className="answer-panel math-answer-panel" aria-label={chinese ? "答案" : "Answer"}>
        <div className="answer-intro">
          <div>
            <h2 className="math-prompt" lang={lang}>{prompt}</h2>
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

        {hasPicture && question.visual && <MathVisual visual={visual} answer={question.answer} solved={solved} />}

        <div className={`math-options${question.options.length === 3 ? " math-options-three" : ""}`} role="group" aria-label={chinese ? "選擇" : "Choices"}>
          {question.options.map((option) => {
            const wrong = picked === option.label && !option.correct;
            const isRight = solved && option.correct;
            return (
              <button
                className={`math-option${option.picture ? " math-option-picture" : ""}${wrong ? " chinese-option-wrong" : ""}${isRight ? " chinese-option-right" : ""}`}
                type="button"
                key={option.label}
                aria-label={nameOf(option)}
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
