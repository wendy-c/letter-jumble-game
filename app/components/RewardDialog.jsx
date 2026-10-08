const englishLabels = {
  kicker: "MAGIC REWARD",
  earned: "You collected a rainbow coin!",
  next: "Tap to play the next word",
  ariaLabel: (message) => `${message} You earned a rainbow coin. Tap to go to the next word.`,
};

export const chineseRewardLabels = {
  kicker: "魔法獎勵",
  earned: "你得到一個彩虹金幣！",
  next: "撳一下，玩下一個字",
  ariaLabel: (message) => `${message}你得到一個彩虹金幣。撳一下玩下一個字。`,
};

export default function RewardDialog({ message, onContinue, labels = englishLabels }) {
  return (
    <div className="reward-overlay">
      <div className="reward-dialog" role="dialog" aria-modal="true" aria-labelledby="reward-title">
        <button
          className="reward-card"
          type="button"
          autoFocus
          aria-label={labels.ariaLabel(message)}
          onClick={onContinue}
        >
          <span className="reward-sparkle reward-sparkle-one" aria-hidden="true">✦</span>
          <span className="reward-sparkle reward-sparkle-two" aria-hidden="true">✧</span>
          <span className="reward-cast" aria-hidden="true">
            <img className="reward-coin" src="/images/rainbow-coin.svg" alt="" width="84" height="84" />
          </span>
          <span className="reward-kicker">{labels.kicker}</span>
          <span className="reward-title" id="reward-title">{message}</span>
          <span className="reward-coin-earned">{labels.earned}</span>
          <span className="reward-continue">{labels.next} <span aria-hidden="true">→</span></span>
        </button>
      </div>
    </div>
  );
}
