import Mascot from "./Mascot";

export const englishCompletionText = {
  kicker: "TOPIC COMPLETE",
  title: "You did it!",
  message: (topicName, count) => `You finished all ${count} ${topicName} words. Ada and Elly are so proud of you!`,
  button: "Back to all topics",
};

export const chineseCompletionText = {
  kicker: "全部完成",
  title: "你好叻呀！",
  message: (topicName, count) => `你學完「${topicName}」全部 ${count} 個字，Ada 同 Elly 好開心！`,
  button: "返回所有主題",
};

// Praise for finishing every word in a topic; continuing goes back to the topic list.
export default function CompletionDialog({ topicName, count, text = englishCompletionText, onDone }) {
  return (
    <div className="reward-overlay">
      <div className="reward-dialog completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <div className="reward-card completion-card">
          <span className="reward-sparkle reward-sparkle-one" aria-hidden="true">✦</span>
          <span className="reward-sparkle reward-sparkle-two" aria-hidden="true">✧</span>
          <span className="completion-confetti" aria-hidden="true">🎉</span>
          <span className="completion-mascots" aria-hidden="true">
            <Mascot name="ada" className="completion-mascot" />
            <Mascot name="elly" className="completion-mascot" />
          </span>
          <span className="reward-kicker">{text.kicker}</span>
          <h2 className="reward-title" id="completion-title">{text.title}</h2>
          <p className="reward-coin-earned completion-message">{text.message(topicName, count)}</p>
          <button className="reward-continue completion-button" type="button" autoFocus onClick={onDone}>
            {text.button} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
