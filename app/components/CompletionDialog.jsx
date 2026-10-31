import BadgeMedal from "./BadgeMedal";
import Mascot from "./Mascot";
import { formatTime } from "./MathGame";

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

// The Daily Challenge's texts, in English and Chinese (it follows the site's language).
export const mathCompletionText = {
  en: {
    ...englishCompletionText,
    kicker: "LEVEL COMPLETE",
    message: (topicName) => `You got every ${topicName} question right. Mochi is so proud of you!`,
    tryMessage: (topicName) => `Get every ${topicName} question right to earn its badge. Try again!`,
    button: "Back to all levels",
    nextLevel: (levelName) => `${levelName} opens tomorrow!`,
  },
  zh: {
    ...chineseCompletionText,
    kicker: "完成關卡",
    button: "返回所有關卡",
    nextLevel: (levelName) => `明天就可以玩${levelName}！`,
  },
};

// Rainbow Speed Quest's: the round's time, and its record.
export const speedCompletionText = {
  en: {
    ...englishCompletionText,
    kicker: "ROUND COMPLETE",
    message: (topicName) => `You got every ${topicName} sum right. Mochi is so proud of you!`,
    tryMessage: (topicName) => `Get every ${topicName} sum right to earn its badge and set a record. Try again!`,
    yourTime: (time) => `Your time: ${time}`,
    bestTime: (time) => `Your record: ${time}`,
    firstRecord: "That’s your first record! Can you beat it next time?",
    newRecord: "New record!",
    recordBonus: (coins) => `+${coins} rainbow coins for beating your record!`,
  },
  zh: {
    ...chineseCompletionText,
    kicker: "完成一輪",
    yourTime: (time) => `你的時間：${time}`,
    bestTime: (time) => `你的紀錄：${time}`,
    firstRecord: "這是你的第一個紀錄！下次可以打破它嗎？",
    newRecord: "打破紀錄！",
    recordBonus: (coins) => `打破紀錄，獎勵 ${coins} 個彩虹金幣！`,
  },
};

// The end of a topic: how many answers were right (e.g. 8 / 10). Only a perfect score earns the
// topic's badge; `badge` is { name, image } when it just did, and `hasBadge` says it was earned before.
// Continuing goes back to the topic list. With full marks, `onVisitMochi` (when the player can
// visit her) adds a button to go and spend the coins on Mochi; otherwise `onTryAgain` adds a
// "Try again" button that plays the topic again from the start.
// `nextLevel` (Daily Challenge) names the level that finishing this one opens, from tomorrow.
// `speed` (Rainbow Speed Quest) is { time, best, newRecord, bonus }: the round's time in
// milliseconds (null when it wasn't timed from the start), the record before it, and whether it set
// a new one (earning `bonus` coins when it beat an earlier record).
export default function CompletionDialog({ topicName, count, correct = count, badge = null, hasBadge = false, text = englishCompletionText, onDone, onVisitMochi = null, onTryAgain = null, nextLevel = null, speed = null }) {
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
          {speed && speed.time !== null && (
            <div className="completion-speed">
              <p className="completion-time">{text.yourTime(formatTime(speed.time))}</p>
              {speed.newRecord
                ? <p className="completion-record">{speed.best === null ? text.firstRecord : text.newRecord}</p>
                : speed.best !== null && <p>{text.bestTime(formatTime(speed.best))}</p>}
              {speed.bonus > 0 && <p className="completion-record">{text.recordBonus(speed.bonus)}</p>}
            </div>
          )}
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
