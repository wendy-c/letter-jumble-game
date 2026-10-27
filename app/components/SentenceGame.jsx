import { useEffect, useState } from "react";
import { speakCantonese, stopSpeaking } from "../lib/speech";

// One fill-in-the-blank question (感受): a sentence with a feeling word missing, and four feelings
// to choose from, each with Mochi or Tofu showing it above the word. There's one try: the pick is
// reported with `onAnswer(correct)`, and the right word fills the gap either way. The speaker reads
// the sentence (with a pause for the gap) as a hint. The parent remounts this (key) for every new
// question.
export default function SentenceGame({ topic, round, question, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const solved = Boolean(picked);
  const [voiceMessage, setVoiceMessage] = useState("");

  useEffect(() => () => stopSpeaking(), []);

  const at = question.sentence.indexOf(question.character);
  const before = question.sentence.slice(0, at);
  const after = question.sentence.slice(at + question.character.length);

  function pick(option) {
    if (picked) return;
    setPicked(option.character);
    onAnswer(option.character === question.character);
  }

  return (
    <div className="game-card chinese-card sentence-card">
      <section className={`picture-panel picture-${topic.color} sentence-panel`} aria-label="句子">
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <p className="sentence-text" lang="zh-Hant-HK" aria-label={solved ? question.sentence : `${before}空格${after}`}>
          {before}
          <span className={`sentence-blank${solved ? " sentence-blank-filled" : ""}`}>{solved ? question.character : "？"}</span>
          {after}
        </p>
      </section>

      <section className="answer-panel chinese-answer-panel" aria-label="揀感受">
        <div className="answer-intro">
          <span className="step-number">01</span>
          <div>
            <h2 lang="zh-Hant-HK">哪個感受可以填入空格？</h2>
            <p lang="zh-Hant-HK">讀一讀句子，選擇正確的感受</p>
          </div>
          <button
            className="voice-button"
            type="button"
            onClick={() => speakCantonese(`${before}，${after}`, setVoiceMessage)}
            aria-label="聽提示"
            title="聽吓個句子"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          </button>
        </div>
        <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>

        <div className="feeling-options" role="group" aria-label="感受的選擇">
          {question.options.map((option) => {
            const wrong = picked === option.character && option.character !== question.character;
            const right = solved && option.character === question.character;
            return (
              <button
                className={`feeling-option${wrong ? " chinese-option-wrong" : ""}${right ? " chinese-option-right" : ""}`}
                type="button"
                key={option.character}
                data-character={option.character}
                disabled={solved}
                lang="zh-Hant-HK"
                onClick={() => pick(option)}
              >
                <img src={option.picture} alt="" width="236" height="246" />
                <span>{option.character}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
