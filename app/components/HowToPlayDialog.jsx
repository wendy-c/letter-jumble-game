import { useEffect } from "react";

const reward = {
  en: "A right answer earns a rainbow coin, and getting a whole topic right earns its badge!",
  zh: "答對可得到彩虹金幣，全部答對更可得到徽章！",
};

// The phonics games that fill a gap in a word (Consonant Digraphs, R & L Blends).
const fillTheGap = (en, zh) => ({
  en: ["Look at the picture, tap the speaker if you need a hint.", en, "Tap “Check it”.", reward.en],
  zh: ["看看圖畫，需要提示就按喇叭。", zh, "按「Check it」。", reward.zh],
});

// How to play each game, as plain numbered steps in English and Chinese. (CVC Sounds has its own
// card, CvcHowTo.)
const howTo = {
  digraphs: fillTheGap("Tap the two letters (like sh) that fill the gap.", "按兩個字母（例如 sh）填入空格。"),
  blends: fillTheGap("Tap the blend (like br or str) that fills the gap.", "按一按正確的混合音（例如 br 或 str），填入空格。"),
  starters: {
    en: ["Look at the picture, tap the speaker if you need a hint.", "Tap the letters in spelling order to fill the boxes.", "Tap “Check it”.", reward.en],
    zh: ["看看圖畫，需要提示就按喇叭。", "按次序按字母，把格子填滿。", "按「Check it」。", reward.zh],
  },
  chinese: {
    en: ["Read it, and tap the speaker for a hint.", "Tap the right picture.", "A right answer earns a rainbow coin, and getting them all right earns a badge!"],
    zh: ["讀一讀，按喇叭聽聽提示。", "按一按正確的圖畫。", reward.zh],
  },
  "measure-words": {
    en: ["Read the measure word, like 一個 or 一枝, and tap the speaker for a hint.", "Tap the thing that goes with it.", reward.en],
    zh: ["讀一讀量詞，例如「一個」、「一枝」，按喇叭聽聽提示。", "按一按配合這個量詞的名詞。", reward.zh],
  },
  idioms: {
    en: ["Look at the picture and read what the idiom means.", "Tap the character that fills the gap.", reward.en],
    zh: ["看看圖畫，讀讀成語的意思。", "按一按正確的字，把成語填上。", reward.zh],
  },
};
howTo["letter-jumble"] = howTo.starters;

// Mochi's game is shown with pictures: annotated screenshots of her house and of Rainbow Village.
const pictureSteps = {
  dragon: [
    {
      picture: "/images/how-to/mochi-den.jpg",
      en: "Interact with Mochi by collecting rainbow coins. Click on the road sign to visit the Rainbow Village.",
      zh: "收集彩虹金幣，就可以跟 Mochi 玩。按一按路牌，就可以去彩虹村。",
    },
    {
      picture: "/images/how-to/rainbow-village.jpg",
      en: "Collect 100 coins to unlock Tofu!",
      zh: "儲夠 100 個金幣，就可以解鎖 Tofu！",
    },
  ],
};
howTo["chinese-advanced"] = howTo.chinese;

export const hasHowToPlay = (gameId) => gameId === "cvc" || Boolean(howTo[gameId] || pictureSteps[gameId]);

// CVC Sounds has its own simpler card: three numbered steps.
const cvcSteps = [
  "Look at the picture and tap the speaker icon for a hint.",
  "Tap the letter that fills the gap.",
  "Tap “Check it” when you’re done.",
];

function CvcHowTo({ onClose }) {
  return (
    <div lang="en">
      <h2 id="how-to-title">How to play</h2>
      <ol className="how-to-numbered">
        {cvcSteps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <button className="reward-continue completion-button how-to-button" type="button" autoFocus onClick={onClose}>
        {buttons.en} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

// "About this game": what a game is for, opened from the info button beside its title.
const about = {
  cvc: {
    title: "About CVC Sounds",
    text: "The CVC (Consonant-Vowel-Consonant) games are designed to help children develop phonics skills by identifying individual sounds within simple words. Through separate activities focusing on beginning sounds, middle vowel sounds, and ending sounds, learners build a stronger understanding of how letters and sounds work together to form words.",
  },
};

export const hasAbout = (gameId) => Boolean(about[gameId]);

export function AboutDialog({ game, onClose }) {
  const { title, text } = about[game.id];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay" onClick={onClose}>
      <div className="player-dialog how-to-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="about-title">{title}</h2>
        <p className="welcome-text">{text}</p>
        <button className="reward-continue completion-button how-to-button" type="button" autoFocus onClick={onClose}>
          Got it <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

// A round info button (a circled "i") beside a game's title, for "About this game".
export function AboutButton({ onClick }) {
  return (
    <button className="how-to-open" type="button" aria-label="About this game" title="About this game" onClick={onClick}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <circle cx="12" cy="7" r="1.6" fill="#fff" />
        <path d="M10 10.5h2.6v6.5H14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// Instructions come in the game's own language: Chinese for the Chinese games, English for the
// English ones. Mochi's den isn't a language game, so it follows the site's language.
const chineseGames = ["chinese", "chinese-advanced", "measure-words", "idioms"];
export function howToLanguage(gameId, siteLanguage) {
  if (chineseGames.includes(gameId)) return "zh";
  if (gameId === "dragon") return siteLanguage;
  return "en";
}

const titles = { en: (name) => `How to play ${name}`, zh: (name) => `${name}：玩法` };
const buttons = { en: "Got it, let’s go!", zh: "明白了，開始吧！" };

// Explains a game's controls before the first time it's played, and whenever its "?" button is
// tapped. `language` is howToLanguage's choice for the game.
export default function HowToPlayDialog({ game, language, onClose }) {
  const steps = howTo[game.id]?.[language] ?? [];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay">
      <div className={`player-dialog how-to-dialog${pictureSteps[game.id] ? " how-to-dialog-pictures" : ""}`} role="dialog" aria-modal="true" aria-labelledby="how-to-title">
        {game.id === "cvc" ? <CvcHowTo onClose={onClose} /> : (
        <div lang={language === "zh" ? "zh-Hant-HK" : "en"}>
          <h2 id="how-to-title">{titles[language](game.name)}</h2>
          {pictureSteps[game.id] ? (
            <ol className="how-to-pictures">
              {pictureSteps[game.id].map((step) => (
                <li key={step.picture}>
                  <img src={step.picture} alt="" width="640" height={step.picture.includes("village") ? 543 : 433} />
                  <p>{step[language]}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ol className="how-to-numbered">
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          )}
          <button className="reward-continue completion-button how-to-button" type="button" autoFocus onClick={onClose}>
            {buttons[language]} <span aria-hidden="true">→</span>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

// A round "?" button beside a module's title (and the dragons' homes) that shows how to play.
// `className` adds to its own (Mochi's is hidden on very narrow screens).
export function HowToPlayButton({ language, onClick, className = "" }) {
  return (
    <button className={`how-to-open${className ? ` ${className}` : ""}`} type="button" aria-label={language === "zh" ? "玩法" : "How to play"} title={language === "zh" ? "玩法" : "How to play"} onClick={onClick}>
      <span aria-hidden="true">?</span>
    </button>
  );
}
