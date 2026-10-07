export default function RewardDialog({ message, onContinue }) {
  return (
    <div className="reward-overlay">
      <div className="reward-dialog" role="dialog" aria-modal="true" aria-labelledby="reward-title">
        <button
          className="reward-card"
          type="button"
          autoFocus
          aria-label={`${message} You earned a rainbow coin. Tap to go to the next word.`}
          onClick={onContinue}
        >
          <span className="reward-sparkle reward-sparkle-one" aria-hidden="true">✦</span>
          <span className="reward-sparkle reward-sparkle-two" aria-hidden="true">✧</span>
          <span className="reward-cast" aria-hidden="true">
            <img className="reward-coin" src="/images/rainbow-coin.svg" alt="" width="84" height="84" />
          </span>
          <span className="reward-kicker">MAGIC REWARD</span>
          <span className="reward-title" id="reward-title">{message}</span>
          <span className="reward-coin-earned">You collected a rainbow coin!</span>
          <span className="reward-continue">Tap to play the next word <span aria-hidden="true">→</span></span>
        </button>
      </div>
    </div>
  );
}
