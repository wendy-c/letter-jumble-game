// Shown in Mochi's den until Tofu moves in: save up rainbow coins to unlock Tofu's house.
export default function TofuUnlock({ coins, cost, onUnlock }) {
  const affordable = coins >= cost;
  return (
    <div className="tofu-unlock">
      <img className="tofu-unlock-house" src="/images/village/tofu-house.svg" alt="" width="72" height="72" />
      <div className="tofu-unlock-copy">
        <strong>Tofu’s House</strong>
        <span>
          {affordable
            ? "Mochi’s best friend Tofu can move in next door!"
            : `Save up ${cost} rainbow coins to meet Mochi’s best friend, Tofu.`}
        </span>
        <span className="tofu-unlock-progress" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (coins / cost) * 100)}%` }} />
        </span>
      </div>
      <button
        className="tofu-unlock-button"
        type="button"
        disabled={!affordable}
        aria-label={affordable ? `Unlock Tofu for ${cost} rainbow coins` : `Unlock Tofu: ${coins} of ${cost} rainbow coins`}
        onClick={onUnlock}
      >
        <span aria-hidden="true">{affordable ? "Unlock" : "🔒"}</span>
        <img src="/images/rainbow-coin.svg" alt="" width="18" height="18" />
        <span aria-hidden="true">{affordable ? cost : `${coins}/${cost}`}</span>
      </button>
    </div>
  );
}
