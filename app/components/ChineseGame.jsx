import { useEffect, useState } from "react";
import { speakCantonese, stopSpeaking } from "../lib/speech";
import Mascot from "./Mascot";

// Shows a phrase with the character being learned picked out, e.g. 餅乾 with 餅 highlighted.
function Phrase({ phrase, character }) {
  return [...phrase].map((part, index) => (
    part === character
      ? <mark className="chinese-phrase-highlight" key={index}>{part}</mark>
      : <span key={index}>{part}</span>
  ));
}

// One round of Chinese character recognition: read the character, hear it in Cantonese,
// and pick the matching picture. The parent remounts this (key) for every new word.
export default function ChineseGame({ topic, round, word, onCorrect }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  // Hearing the character is a hint, only on request. Stop any hint still being spoken
  // when moving on to another character.
  useEffect(() => () => stopSpeaking(), []);

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
          <p
            className={`chinese-character${word.character.length === 2 ? " chinese-character-pair" : ""}${word.character.length > 2 ? ` chinese-character-long chinese-character-${word.character.length}` : ""}`}
            lang="zh-Hant-HK"
          >
            {word.character}
          </p>
        </div>
        {word.phrases?.length > 0 && (
          <ul className="chinese-phrases" aria-label="常見詞語" lang="zh-Hant-HK">
            {word.phrases.map((phrase) => (
              <li key={phrase}>
                <button
                  className="chinese-phrase"
                  type="button"
                  aria-label={`聽「${phrase}」`}
                  onClick={() => speakCantonese(phrase, setVoiceMessage)}
                >
                  <Phrase phrase={phrase} character={word.character} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="answer-panel chinese-answer-panel" aria-label="揀圖畫">
        <div className="answer-intro">
          <span className="step-number">01</span>
          <div>
            <h2 lang="zh-Hant-HK">哪幅圖是正確的？</h2>
            <p lang="zh-Hant-HK">認生字，選圖畫</p>
          </div>
          <button
            className="voice-button"
            type="button"
            onClick={() => speakCantonese(word.character, setVoiceMessage)}
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
