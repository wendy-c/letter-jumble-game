import { useEffect, useState } from "react";
import { speakCantonese, stopSpeaking } from "../lib/speech";
import Mascot from "./Mascot";

// One round of Chinese character recognition: read the character, hear it in Cantonese,
// and pick the matching picture. The parent remounts this (key) for every new word.
export default function ChineseGame({ topic, round, word, onCorrect }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  // Say the character as soon as it appears.
  useEffect(() => {
    speakCantonese(word.character, setVoiceMessage);
    return () => stopSpeaking();
  }, [word.character]);

  function pick(option) {
    if (solved) return;
    if (option.character === word.character) {
      setSolved(true);
      onCorrect();
    } else if (!wrongPicks.includes(option.character)) {
      setWrongPicks((current) => [...current, option.character]);
    }
  }

  return (
    <div className="game-card chinese-card">
      <section className={`picture-panel picture-${topic.color} chinese-character-panel`} aria-label="今次嘅字">
        <div className="picture-topline">
          <span className="category-label"><span className="category-dot" />{topic.name}</span>
          <span className="picture-count">
            {String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span>
          </span>
        </div>
        <div className="chinese-character-stage">
          <span className="art-sparkle sparkle-one" aria-hidden="true">✦</span>
          <span className="art-sparkle sparkle-three" aria-hidden="true">✧</span>
          <p className={`chinese-character${word.character.length > 1 ? " chinese-character-pair" : ""}`} lang="zh-Hant-HK">
            {word.character}
          </p>
        </div>
        <button
          className="chinese-listen"
          type="button"
          onClick={() => speakCantonese(word.character, setVoiceMessage)}
          aria-label="再聽一次"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
          再聽一次
        </button>
        <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>
      </section>

      <section className="answer-panel chinese-answer-panel" aria-label="揀圖畫">
        <div className="answer-intro">
          <span className="step-number">01</span>
          <div>
            <h2 lang="zh-Hant-HK">邊幅圖啱呢個字？</h2>
            <p lang="zh-Hant-HK">睇吓個字，揀啱嘅圖畫</p>
          </div>
        </div>

        <div className="chinese-options" role="group" aria-label="圖畫選擇">
          {word.options.map((option) => {
            const wrong = wrongPicks.includes(option.character);
            const right = solved && option.character === word.character;
            return (
              <button
                className={`chinese-option${wrong ? " chinese-option-wrong" : ""}${right ? " chinese-option-right" : ""}`}
                type="button"
                key={option.character}
                data-character={option.character}
                aria-label={option.english}
                disabled={wrong}
                onClick={() => pick(option)}
              >
                <img src={option.picture} alt="" width="128" height="128" />
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
