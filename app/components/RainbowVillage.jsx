import GameFooter from "./GameFooter";

// The places in the village picture: `left` and `bottom` (in percent, so the picture scales on
// phones) put each one on its clearing at the end of a path. While a place is still to unlock its
// card and padlock sit under it, so it stands a little lower (`unlockBottom`) to fit on the map.
const places = [
  { id: "mochi", label: "Mochi’s House", image: "/images/village/mochi-house.svg", left: 23, bottom: 21 },
  { id: "park", label: "The Park", image: "/images/village/park.svg", left: 50, bottom: 53, unlockBottom: 34 },
  { id: "tofu", label: "Tofu’s House", image: "/images/village/tofu-house.svg", left: 77, bottom: 21 },
];

// Under a place until it's unlocked: its name, how many coins it takes and how close we are, then
// a round padlock button that unlocks it once there are enough coins.
function UnlockCard({ name, unlockName, coins, cost, onUnlock }) {
  const affordable = coins >= cost;
  return (
    <>
      <span className="village-place-label tofu-unlock-card">
        <span>{name}</span>
        <span className="village-place-note">unlock with {cost} coins</span>
        <span className="tofu-unlock-status" aria-hidden="true">
          <img src="/images/rainbow-coin.svg" alt="" width="18" height="18" />
          <span>{affordable ? cost : `${coins}/${cost}`}</span>
        </span>
        <span className="unlock-progress" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (coins / cost) * 100)}%` }} />
        </span>
      </span>
      <button
        className="tofu-unlock-button"
        type="button"
        disabled={!affordable}
        aria-label={affordable ? `Unlock ${unlockName} for ${cost} rainbow coins` : `Unlock ${unlockName}: ${coins} of ${cost} rainbow coins`}
        onClick={onUnlock}
      >
        <span aria-hidden="true">🔓</span>
      </button>
    </>
  );
}

// Rainbow Village: each house opens that dragon's den. Until Tofu moves in, her house has an
// unlock card and there's no park yet; after, the park appears with its own unlock card, and once
// that's unlocked too it opens the park, where Mochi and Tofu play together.
export default function RainbowVillage({
  breadcrumbs, onVisit, tofuUnlocked, coins, unlockCost, onUnlockTofu,
  parkUnlocked = false, parkUnlockCost = 100, onUnlockPark = () => {}, titleAction = null,
}) {
  // What each place still to unlock needs: Tofu's house first, then the park.
  const toUnlock = {
    tofu: !tofuUnlocked && { unlockName: "Tofu", cost: unlockCost, onUnlock: onUnlockTofu },
    park: tofuUnlocked && !parkUnlocked && { unlockName: "the park", cost: parkUnlockCost, onUnlock: onUnlockPark },
  };
  const note = !tofuUnlocked
    ? `Save up ${unlockCost} rainbow coins to meet Mochi’s best friend, Tofu.`
    : !parkUnlocked
      ? `Save up ${parkUnlockCost} rainbow coins to open the park, where Mochi and Tofu play together.`
      : "Who shall we visit today?";

  return (
    <section className="game-wrap village-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">WELCOME TO</p>
        <div className="title-row">
          <h1 id="game-title">Rainbow <span>Village</span></h1>
          {titleAction}
        </div>
        <p className="heading-note">{note}</p>
      </div>

      <div className="village-map">
        <img className="village-scene" src={tofuUnlocked ? "/images/village/village.svg" : "/images/village/village-start.svg"} alt="" />
        {places.filter(({ id }) => tofuUnlocked || id !== "park").map(({ id, label, image, left, bottom, unlockBottom = bottom }) => (
          toUnlock[id] ? (
            <div className="village-place village-place-unlock" key={id} style={{ left: `${left}%`, bottom: `${unlockBottom}%` }}>
              <img src={image} alt="" />
              <UnlockCard name={label} coins={coins} {...toUnlock[id]} />
            </div>
          ) : (
            <button
              className="village-place"
              type="button"
              key={id}
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
              aria-label={`Visit ${label}`}
              onClick={() => onVisit(id)}
            >
              <img src={image} alt="" />
              <span className="village-place-label">{label}</span>
            </button>
          )
        ))}
      </div>

      <GameFooter>PICK A PLACE TO VISIT</GameFooter>
    </section>
  );
}
