import { useCallback, useEffect, useRef, useState } from "react";

import { sounds } from "../lib/sounds";
import DragonScene from "./DragonScene";
import GameFooter from "./GameFooter";

// Each tab is one of the dragon's rooms (see `rooms` in dragon-data).
const sections = [
  { kind: "treat", label: "Treats", icon: "🍎" },
  { kind: "groom", label: "Grooming", icon: "🛁" },
  { kind: "activity", label: "Activities", icon: "🎨" },
];

function ActionButton({ action, coins, busy, onUse }) {
  const affordable = coins >= action.cost;
  return (
    <button
      className="dragon-action"
      type="button"
      disabled={busy || !affordable}
      aria-label={`${action.label}, ${action.cost} rainbow ${action.cost === 1 ? "coin" : "coins"}`}
      onClick={() => onUse(action)}
    >
      <span className="dragon-action-icon" aria-hidden="true">{action.icon}</span>
      <span className="dragon-action-label">{action.label}</span>
      <span className="dragon-action-cost" aria-hidden="true">
        <img src="/images/rainbow-coin.svg" alt="" width="16" height="16" />
        {action.cost}
      </span>
    </button>
  );
}

// A wooden road sign on a post, its plank an arrow pointing out of the room.
function VillageSign() {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <g stroke="#4b2e22" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M100 50v56" strokeWidth="14" />
        <path d="M100 50v56" stroke="#b9794a" strokeWidth="7" />
        <path d="M86 106h28" strokeWidth="5" />
        <path d="M30 14h118a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H30L6 42Z" fill="#e0a56a" />
        <path d="M34 26h108M34 58h108" stroke="#c98a55" strokeWidth="2.5" />
        <circle cx="140" cy="20" r="2.5" fill="#4b2e22" stroke="none" />
        <circle cx="140" cy="64" r="2.5" fill="#4b2e22" stroke="none" />
      </g>
      <text x="86" y="38" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4b2e22">The Rainbow</text>
      <text x="86" y="55" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4b2e22">Village</text>
    </svg>
  );
}

// A dragon's den (Mochi's or Tofu's, from dragon-data): spend coins on treats, grooming and
// activities, or tap her for something free. A road sign in the corner of the room goes to
// Rainbow Village (`onGoToVillage`).
export default function DragonDen({ dragon, coins, onSpendCoins, breadcrumbs, onGoToVillage, titleAction = null }) {
  const { idleMessage, actions: dragonActions, petActions } = dragon;
  const [command, setCommand] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(idleMessage);
  const [section, setSection] = useState(sections[0].kind);
  const tabRefs = useRef({});
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const play = useCallback((action) => {
    if (busyRef.current) return;
    if (action.cost > 0) {
      if (!onSpendCoins(action.cost)) return;
      sounds.coin();
    }

    busyRef.current = true;
    setBusy(true);
    setMessage(action.reaction);
    setCommand({ id: action.id, nonce: Date.now() });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      busyRef.current = false;
      setBusy(false);
      setMessage(idleMessage);
    }, action.duration * 1000);
  }, [onSpendCoins, idleMessage]);

  // Each tap does the next free thing in turn (for Mochi: a snuggle, a twirl, then a wave).
  const petTurnRef = useRef(0);
  const pet = useCallback(() => {
    if (busyRef.current) return;
    const action = petActions[petTurnRef.current % petActions.length];
    petTurnRef.current += 1;
    play(action);
  }, [play, petActions]);
  const cheapest = Math.min(...dragonActions.map((action) => action.cost));

  // Left/right arrow keys move between the tabs, as screen reader users expect.
  function handleTabKeyDown(event) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = sections.findIndex((candidate) => candidate.kind === section);
    const next = sections[(index + step + sections.length) % sections.length].kind;
    setSection(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="game-wrap dragon-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="game-heading">
        <div>
          {breadcrumbs}
          <p className="eyebrow">{dragon.eyebrow}</p>
          <div className="title-row">
            <h1 id="game-title" className="game-title">
              {dragon.name} the <span>{dragon.title.replace(`${dragon.name} the `, "")}</span>
            </h1>
            {titleAction}
          </div>
          <p className="heading-note">{dragon.note}</p>
        </div>
      </div>

      <div className="game-card dragon-card">
        <div className="dragon-stage-wrap">
          <div className="dragon-room">
            <DragonScene
              dragon={dragon.id}
              name={dragon.name}
              rooms={sections.map(({ kind }) => dragon.rooms[kind])}
              room={dragon.rooms[section]}
              command={command}
              onPet={pet}
            />
            <button className="village-sign" type="button" aria-label="Go to Rainbow Village" onClick={onGoToVillage}>
              <VillageSign />
            </button>
          </div>
          <p className="dragon-bubble" aria-live="polite">{message}</p>
        </div>

        <div className="dragon-panel">
          <div className="dragon-tabs" role="tablist" aria-label={`Things to do with ${dragon.name}`} onKeyDown={handleTabKeyDown}>
            {sections.map(({ kind, label, icon }) => (
              <button
                className="dragon-tab"
                type="button"
                role="tab"
                key={kind}
                id={`dragon-tab-${kind}`}
                ref={(element) => {
                  tabRefs.current[kind] = element;
                }}
                aria-selected={section === kind}
                aria-controls={`dragon-section-${kind}`}
                tabIndex={section === kind ? 0 : -1}
                onClick={() => setSection(kind)}
              >
                <span aria-hidden="true">{icon}</span> {label}
              </button>
            ))}
          </div>

          <div
            className={`dragon-actions dragon-actions-${section}`}
            role="tabpanel"
            id={`dragon-section-${section}`}
            aria-labelledby={`dragon-tab-${section}`}
          >
            {dragonActions.filter((action) => action.kind === section).map((action) => (
              <ActionButton key={action.id} action={action} coins={coins} busy={busy} onUse={play} />
            ))}
          </div>

          {coins < cheapest && (
            <p className="dragon-hint">You’re out of rainbow coins! Spell some words to earn more for {dragon.name}.</p>
          )}
        </div>
      </div>

      <GameFooter>{dragon.footer}</GameFooter>
    </section>
  );
}
