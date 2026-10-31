import BadgeMedal from "./BadgeMedal";
import Mascot from "./Mascot";

const englishCompletionText = {
  kicker: "TOPIC COMPLETE",
  title: "You did it!",
  tryTitle: "Good try!",
  score: "right",
  message: (topicName) => `You got every ${topicName} word right. Mochi is so proud of you!`,
  tryMessage: (topicName) => `Get every ${topicName} word right to earn its badge. Try again!`,
  practiseMessage: () => "Keep practising to get them all right!",
  button: "Back to all topics",
  tryAgain: "Try again",
  visitMochi: "Visit Mochi",
  badge: (topicName) => `New badge! ${topicName} is in your badge collection.`,
};

export const mathCompletionText = {
  ...englishCompletionText,
  kicker: "LEVEL COMPLETE",
  message: (topicName) => `You got every ${topicName} question right. Mochi is so proud of you!`,
  tryMessage: (topicName) => `Get every ${topicName} question right to earn its badge. Try again!`,
  button: "Back to all levels",
  nextLevel: (levelName) => `${levelName} is open now!`,
};

export const chineseCompletionText = {
  kicker: "全部完成",
  title: "你好叻呀！",
  tryTitle: "繼續加油！",
  score: "答對",
  message: (topicName) => `「${topicName}」全部答對，Mochi 好開心！`,
  tryMessage: (topicName) => `全部答對就可以得到「${topicName}」徽章，再試一次吧！`,
  practiseMessage: () => "多練習，下次全部答對！",
  button: "返回所有主題",
  tryAgain: "再試一次",
  visitMochi: "探望 Mochi",
  badge: (topicName) => `你得到「${topicName}」徽章！`,
};

// The end of a topic: how many answers were right (e.g. 8 / 10). Only a perfect score earns the
// topic's badge; `badge` is { name, image } when it just did, and `hasBadge` says it was earned before.
// Continuing goes back to the topic list. With full marks, `onVisitMochi` (when the player can
// visit her) adds a button to go and spend the coins on Mochi; otherwise `onTryAgain` adds a
// "Try again" button that plays the topic again from the start.
// `nextLevel` (Math and Logic) names the level that finishing this one has just opened.
export default function CompletionDialog({ topicName, count, correct = count, badge = null, hasBadge = false, text = englishCompletionText, onDone, onVisitMochi = null, onTryAgain = null, nextLevel = null }) {
  const perfect = correct === count;
  const tryAgain = !perfect && onTryAgain;
  return (
    <div className="reward-overlay">
      <div className="reward-dialog completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <div className="reward-card completion-card">
          <span className="reward-sparkle reward-sparkle-one" aria-hidden="true">✦</span>
          <span className="reward-sparkle reward-sparkle-two" aria-hidden="true">✧</span>
          <span className="completion-mascots" aria-hidden="true">
            <Mascot mood="idea" className="completion-mascot" />
          </span>
          <span className="reward-kicker">{text.kicker}</span>
          <h2 className="reward-title" id="completion-title">{perfect ? text.title : text.tryTitle}</h2>
          <p className={`completion-score${perfect ? " completion-score-perfect" : ""}`} aria-label={`${correct} / ${count} ${text.score}`}>
            <strong>{correct}</strong> / {count} <span>{text.score}</span>
          </p>
          <p className="reward-coin-earned completion-message">
            {perfect ? text.message(topicName) : hasBadge ? text.practiseMessage() : text.tryMessage(topicName)}
          </p>
          {nextLevel && <p className="completion-next-level">{text.nextLevel(nextLevel)}</p>}
          {badge && (
            <div className="completion-badge">
              <BadgeMedal image={badge.image} earned />
              <p>{text.badge(badge.name)}</p>
            </div>
          )}
          <div className="completion-actions">
            {tryAgain && (
              <button className="reward-continue completion-button" type="button" autoFocus onClick={onTryAgain}>
                <img src="/images/icons/ui-shuffle.svg" alt="" width="22" height="22" /> {text.tryAgain}
              </button>
            )}
            <button className={tryAgain ? "completion-button completion-secondary" : "reward-continue completion-button"} type="button" autoFocus={!tryAgain} onClick={onDone}>
              {text.button} <span aria-hidden="true">→</span>
            </button>
            {perfect && onVisitMochi && (
              <button className="completion-button completion-secondary" type="button" onClick={onVisitMochi}>
                <img src="/images/icons/dragon.svg" alt="" width="26" height="26" />
                {text.visitMochi}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
