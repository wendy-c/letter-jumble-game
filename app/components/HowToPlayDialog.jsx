import { useEffect } from "react";
import { LanguageSwitch } from "./WelcomeDialog";

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

// How to play each game: a few steps, each with an icon, in English and Chinese.
const howTo = {
  cvc: spelling(
    [["🔤", "Tap the letter that fills the gap. Tap another letter to swap it."]],
    [["🔤", "按一個字母填入空格。想換字母，再按另一個便可以。"]],
  ),
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
  chinese: pictureGame(
    [["👀", "Read the Chinese character."], ["🔊", "Need help? Tap the speaker to hear it in Cantonese."], ["👆", "Tap the picture that matches."]],
    [["👀", "讀一讀這個中文字。"], ["🔊", "不會讀？按喇叭聽聽廣東話讀音。"], ["👆", "按一按正確的圖畫。"]],
  ),
  "chinese-advanced": pictureGame(
    [["👀", "Read the Chinese word."], ["🔊", "Need help? Tap the speaker to hear it in Cantonese."], ["👆", "Tap the picture that matches."]],
    [["👀", "讀一讀這個詞語。"], ["🔊", "不會讀？按喇叭聽聽廣東話讀音。"], ["👆", "按一按正確的圖畫。"]],
  ),
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
      ["👆", "按一按小龍，她會跟你玩，不用金幣。"],
      ["🔄", "左右拖動可以讓小龍轉身。"],
      ["🏡", "換分頁，小龍會走到另一個房間。"],
      ["💛", "儲夠 100 個金幣，就可以認識 Mochi 的好朋友 Tofu！"],
    ],
  },
};

export const hasHowToPlay = (gameId) => Boolean(howTo[gameId]);

const titles = { en: (name) => `How to play ${name}`, zh: (name) => `${name}：玩法` };
const buttons = { en: "Got it, let’s go!", zh: "明白了，開始吧！" };

// Explains a game's controls before the first time it's played (and whenever "How to play" is
// tapped), in the language chosen on the welcome card.
export default function HowToPlayDialog({ game, language, onLanguage, onClose }) {
  const steps = howTo[game.id][language];

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
        <div className="how-to-top">
          <p className="eyebrow">{language === "zh" ? "遊戲玩法" : "HOW TO PLAY"}</p>
          <LanguageSwitch language={language} onChange={onLanguage} />
        </div>
        <div lang={language === "zh" ? "zh-Hant-HK" : "en"}>
          <h2 id="how-to-title">{titles[language](game.name)}</h2>
          <ol className="how-to-steps">
            {steps.map(([icon, step]) => (
              <li key={step}>
                <span className="how-to-icon" aria-hidden="true">{icon}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <button className="reward-continue completion-button how-to-button" type="button" autoFocus onClick={onClose}>
            {buttons[language]} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// A small "How to play" button for the top of a game.
export function HowToPlayButton({ language, onClick }) {
  return (
    <button className="how-to-open" type="button" onClick={onClick}>
      <span aria-hidden="true">❓</span> {language === "zh" ? "玩法" : "How to play"}
    </button>
  );
}
