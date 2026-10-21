import { useEffect, useState } from "react";
import { speakCantonese, stopSpeaking } from "../lib/speech";

// One 成語 question: a picture or short comic, the idiom with one character missing, and its
// meaning; pick the character that fills the gap. There's one try: the pick is reported with
// `onAnswer(correct)`, and the right character fills the gap either way.
// Hearing the idiom and its meaning in Cantonese is a hint, only when the learner taps the speaker.
// The parent remounts this (key) for every new question.
export default function IdiomGame({ topic, round, question, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const solved = Boolean(picked);
  const [voiceMessage, setVoiceMessage] = useState("");

  useEffect(() => () => stopSpeaking(), []);

  const characters = [...question.idiom];
  const blankLabel = characters.map((character, index) => (index === question.blank ? "空格" : character)).join("");

  function pick(option) {
    if (picked) return;
    setPicked(option.character);
    onAnswer(option.correct);
  }

  return (
    <div className="game-card chinese-card idiom-card">
      <section className={`picture-panel picture-${topic.color} idiom-picture-panel`} aria-label="成語圖畫">
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <img className="idiom-picture" key={question.picture} src={question.picture} alt="" width="256" height="160" />
        <p className="idiom-phrase" lang="zh-Hant-HK" aria-label={solved ? question.idiom : blankLabel}>
          {characters.map((character, index) => (
            index === question.blank ? (
              <span className={`idiom-tile idiom-blank${solved ? " idiom-blank-filled" : ""}`} key={index}>
                {solved ? character : "？"}
              </span>
            ) : (
              <span className="idiom-tile" key={index}>{character}</span>
            )
          ))}
        </p>
        <p className="idiom-meaning" lang="zh-Hant-HK">{question.meaning}</p>
      </section>

      <section className="answer-panel chinese-answer-panel" aria-label="揀字">
        <div className="answer-intro">
          <span className="step-number">01</span>
          <div>
            <h2 lang="zh-Hant-HK">哪個字可以填入空格？</h2>
            <p lang="zh-Hant-HK">看圖畫和解釋，選擇正確的字</p>
          </div>
          <button
            className="voice-button"
            type="button"
            onClick={() => speakCantonese(`${question.idiom}，${question.meaning}`, setVoiceMessage)}
            aria-label="聽提示"
            title="聽吓成語同解釋"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          </button>
        </div>
        <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>

        <div className="idiom-options" role="group" aria-label="字的選擇">
          {question.options.map((option) => {
            const wrong = picked === option.character && !option.correct;
            const right = solved && option.correct;
            return (
              <button
                className={`idiom-option${wrong ? " chinese-option-wrong" : ""}${right ? " chinese-option-right" : ""}`}
                type="button"
                key={option.character}
                data-character={option.character}
                disabled={solved}
                lang="zh-Hant-HK"
                onClick={() => pick(option)}
              >
                {option.character}
              </button>
            );
          })}
        </div>

      </section>
    </div>
  );
}
