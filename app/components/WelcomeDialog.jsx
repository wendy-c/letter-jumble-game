import { useEffect } from "react";

const text = {
  en: {
    title: "Welcome to Rainbow Academy!",
    paragraphs: [
      "This app was created by a software engineer and a mother of two, with one simple goal: to build learning experiences that children genuinely enjoy.",
      "The games are designed around the learning objectives and topics commonly found in Hong Kong’s kindergarten curriculum. Through fun and engaging activities, children can build phonics skills, prepare for Cambridge English exams, strengthen Chinese character recognition, and explore many other areas of learning.",
      "We hope every child can learn through play, discover new knowledge with confidence, and develop a lifelong love of learning.",
    ],
    motto: "Learn through play, discover with confidence.",
    button: "Let’s Play",
  },
  zh: {
    title: "歡迎來到 Rainbow Academy！",
    paragraphs: [
      "本應用程式由一位軟體工程師兼兩名孩子的母親親手打造，初心很簡單：創造孩子真正喜愛，並能從中學習的遊戲體驗。",
      "遊戲內容以香港幼稚園課程為基礎，結合孩子的實際學習需要而設計，涵蓋自然拼讀（Phonics）、劍橋英語考試預備、中文識字及更多學習主題。",
      "希望每位孩子都能透過遊戲快樂學習、主動探索，並在成長路上建立自信與成就感。",
    ],
    motto: "寓學習於遊戲，讓孩子自信探索世界。",
    button: "一起玩吧！",
  },
};

// The En / 繁 switch, used on the welcome and how-to-play cards.
export function LanguageSwitch({ language, onChange }) {
  return (
    <button
      className="language-switch"
      type="button"
      role="switch"
      aria-checked={language === "zh"}
      aria-label="Language: English or 繁體中文"
      onClick={() => onChange(language === "zh" ? "en" : "zh")}
    >
      <span className={language === "en" ? "language-on" : ""}>En</span>
      <span className={language === "zh" ? "language-on" : ""} lang="zh-Hant-HK">繁</span>
    </button>
  );
}

// The first thing a visitor sees: what Rainbow Academy is, in English or Chinese.
export default function WelcomeDialog({ language, onLanguage, onClose }) {
  const copy = text[language];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay">
      <div className="player-dialog welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <div className="welcome-top">
          <img className="welcome-logo" src="/images/logo.png" alt="" width="84" height="84" />
          <LanguageSwitch language={language} onChange={onLanguage} />
        </div>
        <div lang={language === "zh" ? "zh-Hant-HK" : "en"}>
          <h2 id="welcome-title">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => <p className="welcome-text" key={paragraph}>{paragraph}</p>)}
          <p className="welcome-motto"><span aria-hidden="true">🌈 </span>{copy.motto}</p>
          <button className="reward-continue completion-button welcome-button" type="button" autoFocus onClick={onClose}>
            {copy.button} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
