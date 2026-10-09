import { useEffect, useState } from "react";
import { speakCantonese, stopSpeaking } from "../lib/speech";
import Mascot from "./Mascot";

function NounIcon({ icon }) {
  if (icon?.startsWith("/")) return <img className="measure-icon-image" src={icon} alt="" width="40" height="40" />;
  return <span className="measure-icon" aria-hidden="true">{icon}</span>;
}

// One measure-word question: "一個 ＿＿" — pick the noun that goes with the measure word.
// Hearing it in Cantonese is a hint, only when the learner taps the speaker.
// The parent remounts this (key) for every new question.
export default function MeasureWordGame({ topic, round, question, onCorrect }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const measure = question.character;

  useEffect(() => () => stopSpeaking(), []);

  function pick(option) {
    if (solved) return;
    if (option.correct) {
      setSolved(true);
      onCorrect();
    } else if (!wrongPicks.includes(option.noun)) {
      setWrongPicks((current) => [...current, option.noun]);
    }
  }

  return (
    <div className="game-card chinese-card measure-card">
      <section className={`picture-panel picture-${topic.color} chinese-character-panel`} aria-label="今次嘅量詞">
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <div className="chinese-character-stage">
          <span className="art-sparkle sparkle-one" aria-hidden="true">✦</span>
          <span className="art-sparkle sparkle-three" aria-hidden="true">✧</span>
          <p className="measure-phrase" lang="zh-Hant-HK" aria-label={solved ? `一${measure}${question.noun}` : `一${measure}，空格`}>
            <span className="measure-one">一</span>
            <span className="chinese-character measure-word">{measure}</span>
            <span className={`measure-blank${solved ? " measure-blank-filled" : ""}`}>
              {solved ? <><NounIcon icon={question.icon} /> {question.noun}</> : "？"}
            </span>
          </p>
        </div>
      </section>

      <section className="answer-panel chinese-answer-panel" aria-label="揀名詞">
        <div className="answer-intro">
          <span className="step-number">01</span>
          <div>
            <h2 lang="zh-Hant-HK">邊樣嘢可以用「{measure}」？</h2>
            <p lang="zh-Hant-HK">揀啱嘅名詞，填入空格</p>
          </div>
          <button
            className="voice-button"
            type="button"
            onClick={() => speakCantonese(`一${measure}`, setVoiceMessage)}
            aria-label="聽提示"
            title="唔識讀？聽吓提示"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          </button>
        </div>
        <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>

        <div className="measure-options" role="group" aria-label="名詞選擇">
          {question.options.map((option) => {
            const wrong = wrongPicks.includes(option.noun);
            const right = solved && option.correct;
            return (
              <button
                className={`measure-option${wrong ? " chinese-option-wrong" : ""}${right ? " chinese-option-right" : ""}`}
                type="button"
                key={option.noun}
                data-noun={option.noun}
                disabled={wrong}
                lang="zh-Hant-HK"
                onClick={() => pick(option)}
              >
                <NounIcon icon={option.icon} />
                <span className="measure-noun">{option.noun}</span>
              </button>
            );
          })}
        </div>

        <div className="answer-footer chinese-feedback">
          {wrongPicks.length > 0 && !solved && <Mascot name="elly" className="mascot-feedback" />}
          <p className={`feedback${wrongPicks.length > 0 && !solved ? " feedback-try" : ""}`} aria-live="polite" lang="zh-Hant-HK">
            {wrongPicks.length > 0 && !solved ? "唔係呢個，再試吓！" : " "}
          </p>
        </div>
      </section>
    </div>
  );
}
