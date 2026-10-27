import { useEffect, useState } from "react";
import { speakWord } from "../lib/speech";

const oneTry = {
  en: ["🌈", "Each question has one try. A right answer earns a rainbow coin, and getting a whole topic right earns its badge!"],
  zh: ["🌈", "每題只有一次機會。答對可得到彩虹金幣，全部答對更可得到徽章！"],
};

const spelling = (en, zh) => ({
  en: [["🖼️", "Look at the picture."], ["🔊", "Tap the speaker to hear the word."], ...en, ["🪄", "Tap “Check word” when you’re done."], oneTry.en],
  zh: [["🖼️", "看看圖畫。"], ["🔊", "按喇叭，聽聽這個英文字。"], ...zh, ["🪄", "完成後按「Check word」。"], oneTry.zh],
});

const pictureGame = (en, zh) => ({
  en: [...en, oneTry.en],
  zh: [...zh, oneTry.zh],
});

// 中文認字 (both 入門篇 and 進階篇): three plain numbered steps, no icons.
const chineseCharacters = {
  numbered: true,
  en: [
    "Read it, and tap the speaker for a hint.",
    "Tap the right picture.",
    "A right answer earns a rainbow coin, and getting them all right earns a badge!",
  ],
  zh: [
    "讀一讀，按喇叭聽聽提示。",
    "按一按正確的圖畫。",
    "答對可得到彩虹金幣，全部答對更可得到徽章！",
  ],
};

// How to play each game: a few steps, each with an icon, in English and Chinese (or, with
// `numbered`, plain numbered steps).
const howTo = {
  digraphs: spelling(
    [["🔤", "Tap the two letters (like sh) that fill the gap."]],
    [["🔤", "按兩個字母（例如 sh）填入空格。"]],
  ),
  starters: spelling(
    [["🔤", "Tap the letters in spelling order to fill the boxes. Tap a box to take its letter back out."]],
    [["🔤", "按次序按字母，把格子填滿。按格子可以拿走字母。"]],
  ),
  "letter-jumble": spelling(
    [["🔤", "Tap the letters in spelling order to fill the boxes. Tap a box to take its letter back out."]],
    [["🔤", "按次序按字母，把格子填滿。按格子可以拿走字母。"]],
  ),
  chinese: chineseCharacters,
  "chinese-advanced": chineseCharacters,
  "measure-words": pictureGame(
    [["👀", "Read the measure word, like 一個 or 一枝."], ["👆", "Tap the thing that goes with it."], ["🔊", "Tap the speaker to hear it in Cantonese."]],
    [["👀", "讀一讀量詞，例如「一個」、「一枝」。"], ["👆", "按一按配合這個量詞的名詞。"], ["🔊", "按喇叭聽聽廣東話讀音。"]],
  ),
  idioms: pictureGame(
    [["🖼️", "Look at the picture and read what the idiom means."], ["❓", "One character of the idiom is missing."], ["👆", "Tap the character that fills the gap."]],
    [["🖼️", "看看圖畫，讀讀成語的意思。"], ["❓", "成語缺少了一個字。"], ["👆", "按一按正確的字，把成語填上。"]],
  ),
  dragon: {
    en: [
      ["🌈", "Spend rainbow coins on treats, grooming and activities."],
      ["👆", "Tap the dragon for free cuddles and tricks."],
      ["🔄", "Drag sideways to turn her around."],
      ["🏡", "Switch tabs to walk to another room."],
      ["💛", "Save up 100 coins to meet Mochi’s best friend, Tofu!"],
    ],
    zh: [
      ["🌈", "用彩虹金幣買小食、梳洗和玩遊戲。"],
      ["👆", "按一按Mochi，她會跟你玩，不用金幣。"],
      ["🔄", "左右拖動可以讓Mochi轉身。"],
      ["🏡", "換分頁，Mochi會走到另一個房間。"],
      ["💛", "儲夠 100 個金幣，就可以認識 Mochi 的好朋友 Tofu！"],
    ],
  },
};

export const hasHowToPlay = (gameId) => gameId === "cvc" || Boolean(howTo[gameId]);

// CVC Sounds has its own simpler card: three numbered steps, then letter tiles that say their
// sound, for a quick revision.
const cvcSteps = [
  "Look at the picture and tap the speaker icon for a hint.",
  "Tap the letter that fills the gap.",
  "Tap “Check word” when you’re done.",
];
const consonants = "bcdfghjklmnprstvwxyz".split("");
const vowels = "aeiou".split("");

// How each letter sounds, spelled so the browser's voice says the sound rather than the letter's
// name (b says "buh", not "bee").
const letterSounds = {
  a: "ah", e: "eh", i: "ih", o: "awe", u: "uh",
  b: "buh", c: "kuh", d: "duh", f: "fuh", g: "guh", h: "huh", j: "juh", k: "kuh", l: "luh", m: "muh",
  n: "nuh", p: "puh", r: "ruh", s: "suh", t: "tuh", v: "vuh", w: "wuh", x: "ks", y: "yuh", z: "zuh",
};

// The middle sound's revision is the vowels; every other CVC mode revises the consonants.
const revisionLetters = (topicId) => (topicId === "middle-sound" ? vowels : consonants);

function CvcHowTo({ topicId, onClose }) {
  const [voiceMessage, setVoiceMessage] = useState("");
  return (
    <div lang="en">
      <h2 id="how-to-title">How to play</h2>
      <ol className="how-to-numbered">
        {cvcSteps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <h3 className="how-to-revision-title">Need a revision?</h3>
      <p className="heading-note how-to-revision-note">Tap the letters to hear the letter sound.</p>
      <div className="how-to-letters" role="group" aria-label="Letter sounds">
        {revisionLetters(topicId).map((letter) => (
          <button
            className="letter-tile how-to-letter"
            type="button"
            key={letter}
            aria-label={`Hear the ${letter} sound`}
            onClick={() => speakWord(letterSounds[letter], setVoiceMessage)}
          >
            {letter}
          </button>
        ))}
      </div>
      <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">{voiceMessage}</p>
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
// tapped. `language` is howToLanguage's choice for the game; `topicId` is the topic being played.
export default function HowToPlayDialog({ game, topicId = null, language, onClose }) {
  const steps = howTo[game.id]?.[language] ?? [];
  const numbered = Boolean(howTo[game.id]?.numbered);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay">
      <div className="player-dialog how-to-dialog" role="dialog" aria-modal="true" aria-labelledby="how-to-title">
        {game.id === "cvc" ? <CvcHowTo topicId={topicId} onClose={onClose} /> : (
        <div lang={language === "zh" ? "zh-Hant-HK" : "en"}>
          {!numbered && <p className="eyebrow">{language === "zh" ? "遊戲玩法" : "HOW TO PLAY"}</p>}
          <h2 id="how-to-title">{titles[language](game.name)}</h2>
          {numbered ? (
            <ol className="how-to-numbered">
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          ) : (
            <ol className="how-to-steps">
              {steps.map(([icon, step]) => (
                <li key={step}>
                  <span className="how-to-icon" aria-hidden="true">{icon}</span>
                  <span>{step}</span>
                </li>
              ))}
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
export function HowToPlayButton({ language, onClick }) {
  return (
    <button className="how-to-open" type="button" aria-label={language === "zh" ? "玩法" : "How to play"} title={language === "zh" ? "玩法" : "How to play"} onClick={onClick}>
      <span aria-hidden="true">?</span>
    </button>
  );
}
