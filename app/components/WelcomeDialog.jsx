import { useEffect } from "react";
import { useText } from "../i18n";
import { NewPlayerForm } from "./PlayerDialog";

const text = {
  en: {
    title: "Welcome to Rainbow Academy!",
    paragraphs: [
      "This app was created by a software engineer and a mother of two, with one simple goal: to build learning experiences that children genuinely enjoy.",
      "The games are designed around the learning objectives and topics commonly found in Hong Kong’s kindergarten curriculum. Through fun and engaging activities, children can build phonics skills, prepare for Cambridge English exams, strengthen Chinese character recognition, and explore many other areas of learning.",
      "We hope every child can learn through play, discover new knowledge with confidence, and develop a lifelong love of learning.",
    ],
    motto: "Learn, Play, Shine!",
    button: "Let’s Start",
  },
  zh: {
    title: "歡迎來到 Rainbow Academy！",
    paragraphs: [
      "這個APP由一位兩名孩子的港媽兼軟件工程師親手打造，初心很簡單：創造孩子真正喜愛，並能從中學習的遊戲體驗。",
      "遊戲內容以香港幼稚園課程為基礎，結合孩子的實際學習需要而設計，涵蓋自然拼讀（Phonics）、劍橋英語考試預備、中文識字及更多學習主題。",
      "希望每位孩子都能透過遊戲快樂學習、主動探索，並在成長路上建立自信與成就感。",
    ],
    motto: "學中玩，玩中學，閃耀每一天！",
    button: "一起玩吧！",
  },
};

// The En / 繁 switch for the site's language.
export function LanguageSwitch({ language, onChange }) {
  const text = useText();
  return (
    <button
      className="language-switch"
      type="button"
      role="switch"
      aria-checked={language === "zh"}
      aria-label={text.languageSwitch}
      onClick={() => onChange(language === "zh" ? "en" : "zh")}
    >
      <span className={language === "en" ? "language-on" : ""}>En</span>
      <span className={language === "zh" ? "language-on" : ""} lang="zh-Hant-HK">繁</span>
    </button>
  );
}

// What Rainbow Academy is, in English or Chinese. A new family (no players yet) sees it on
// arriving, with a form to create their first player: "Let's Play" creates them. Opened from the
// logo when there are players already, the button just closes it.
export default function WelcomeDialog({ language, onLanguage, onCreate = null, onClose }) {
  const copy = text[language];
  const siteText = useText();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="player-dialog welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <button className="word-menu-close player-dialog-close" type="button" aria-label={siteText.close} onClick={onClose}>
          ×
        </button>
        <div className="welcome-top">
          <img className="welcome-logo" src="/images/logo.png" alt="" width="84" height="84" />
          <LanguageSwitch language={language} onChange={onLanguage} />
        </div>
        <div lang={language === "zh" ? "zh-Hant-HK" : "en"}>
          <h2 id="welcome-title">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => <p className="welcome-text" key={paragraph}>{paragraph}</p>)}
          <p className="welcome-motto"><span aria-hidden="true">🌈 </span>{copy.motto}</p>
          {onCreate ? (
            <div className="welcome-form">
              <NewPlayerForm
                label={siteText.yourName}
                onCreate={onCreate}
                submitLabel={<>{copy.button} <span aria-hidden="true">→</span></>}
                submitClassName="reward-continue completion-button welcome-button"
              />
            </div>
          ) : (
            <button className="reward-continue completion-button welcome-button" type="button" autoFocus onClick={onClose}>
              {copy.button} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
