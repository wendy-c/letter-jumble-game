import { useText } from "../i18n";
import Mascot from "./Mascot";

// The top of the front page: Mochi, arms open and smiling, says hello to the player by name in a
// speech bubble.
export default function MochiGreeting({ playerName = null }) {
  const text = useText();

  return (
    <div className="mochi-greeting">
      <Mascot mood="welcome" className="mochi-greeting-mochi" />
      <div className="mochi-greeting-bubble">
        <h1 id="game-title">
          <span className="mochi-greeting-hi">{text.greetingHi(playerName)}</span>{" "}
          <span className="mochi-greeting-question">{text.greetingQuestion}</span>
        </h1>
      </div>
    </div>
  );
}
