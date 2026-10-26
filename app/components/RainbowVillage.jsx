import GameFooter from "./GameFooter";

// The places in the village picture: `left` and `bottom` (in percent, so the picture scales on
// phones) put each one on its clearing at the end of a path.
const places = [
  { id: "mochi", label: "Mochi’s House", image: "/images/village/mochi-house.svg", left: 23, bottom: 21 },
  { id: "park", label: "Park", image: "/images/village/park.svg", left: 50, bottom: 53, locked: true },
  { id: "tofu", label: "Tofu’s House", image: "/images/village/tofu-house.svg", left: 77, bottom: 21 },
];

// Under Tofu's house until she moves in: unlocks it once there are enough rainbow coins.
function TofuUnlockButton({ coins, cost, onUnlock }) {
  const affordable = coins >= cost;
  return (
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
  );
}

// Rainbow Village: each house opens that dragon's den. Until Tofu moves in, her house has an
// unlock button and there's no park yet; after, the park appears, locked for now.
export default function RainbowVillage({ breadcrumbs, onVisit, tofuUnlocked, coins, unlockCost, onUnlockTofu, titleAction = null }) {
  return (
    <section className="game-wrap village-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">WELCOME TO</p>
        <div className="title-row">
          <h1 id="game-title">Rainbow <span>Village</span></h1>
          {titleAction}
        </div>
        <p className="heading-note">
          {tofuUnlocked ? "Who shall we visit today?" : `Save up ${unlockCost} rainbow coins to meet Mochi’s best friend, Tofu.`}
        </p>
      </div>

      <div className="village-map">
        <img className="village-scene" src={tofuUnlocked ? "/images/village/village.svg" : "/images/village/village-start.svg"} alt="" />
        {places.filter(({ id }) => tofuUnlocked || id !== "park").map(({ id, label, image, left, bottom, locked }) => (
          id === "tofu" && !tofuUnlocked ? (
            <div className="village-place village-place-unlock" key={id} style={{ left: `${left}%`, bottom: `${bottom}%` }}>
              <img src={image} alt="" />
              <TofuUnlockButton coins={coins} cost={unlockCost} onUnlock={onUnlockTofu} />
            </div>
          ) : (
            <button
              className={`village-place${locked ? " village-place-locked" : ""}`}
              type="button"
              key={id}
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
              disabled={locked}
              aria-label={locked ? `${label}, coming soon` : `Visit ${label}`}
              onClick={() => onVisit(id)}
            >
              <img src={image} alt="" />
              <span className="village-place-label">
                {locked && <span aria-hidden="true">🔒 </span>}
                {label}
                {locked && <span className="village-place-soon">Coming soon</span>}
              </span>
            </button>
          )
        ))}
      </div>

      <GameFooter>PICK A PLACE TO VISIT</GameFooter>
    </section>
  );
}
