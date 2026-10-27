import { useLanguage, useText } from "../i18n";
import { speakCantonese, speakWord } from "../lib/speech";
import Mascot from "./Mascot";

// The top of the front page: Mochi waves hello to the player by name, in a speech bubble. Tapping
// Mochi says it out loud (in Cantonese when the site is in Chinese), for children who can't read
// yet. Browsers only let a page speak after a tap, so it doesn't speak by itself.
export default function MochiGreeting({ playerName = null }) {
  const text = useText();
  const language = useLanguage();

  function sayHello() {
    const speak = language === "zh" ? speakCantonese : speakWord;
    speak(text.greetingSpoken(playerName), () => {});
  }

  return (
    <div className="mochi-greeting">
      <button className="mochi-greeting-mochi" type="button" aria-label={text.hearMochi} title={text.hearMochi} onClick={sayHello}>
        <Mascot mood="happy" />
        <span className="mochi-greeting-speaker" aria-hidden="true">🔊</span>
      </button>
      <div className="mochi-greeting-bubble">
        <h1 id="game-title">
          <span className="mochi-greeting-hi">{text.greetingHi(playerName)}</span>{" "}
          <span className="mochi-greeting-question">{text.greetingQuestion}</span>
        </h1>
      </div>
    </div>
  );
}
