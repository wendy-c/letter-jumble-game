import { useCallback, useEffect, useRef, useState } from "react";
import { dragonActions, dragonName, petAction } from "../dragon-data";
import { sounds } from "../lib/sounds";
import DragonScene from "./DragonScene";
import GameFooter from "./GameFooter";

const sections = [
  { kind: "treat", label: "Treats", icon: "🍎" },
  { kind: "groom", label: "Grooming", icon: "🛁" },
  { kind: "activity", label: "Activities", icon: "🎨" },
];

const idleMessage = `Tap ${dragonName} for a snuggle, or treat her with your rainbow coins!`;

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

export default function DragonDen({ coins, onSpendCoins, breadcrumbs }) {
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
  }, [onSpendCoins]);

  const pet = useCallback(() => play(petAction), [play]);
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
          <p className="eyebrow">MEET YOUR MAGIC PET</p>
          <h1 id="game-title" className="game-title">
            {dragonName} the <span>Rainbow Dragon</span>
          </h1>
          <p className="heading-note">Spend rainbow coins on yummy treats and pampering.</p>
        </div>
      </div>

      <div className="game-card dragon-card">
        <div className="dragon-stage-wrap">
          <DragonScene command={command} onPet={pet} />
          <p className="dragon-bubble" aria-live="polite">{message}</p>
        </div>

        <div className="dragon-panel">
          <div className="dragon-tabs" role="tablist" aria-label={`Things to do with ${dragonName}`} onKeyDown={handleTabKeyDown}>
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
            className="dragon-actions"
            role="tabpanel"
            id={`dragon-section-${section}`}
            aria-labelledby={`dragon-tab-${section}`}
          >
            {dragonActions.filter((action) => action.kind === section).map((action) => (
              <ActionButton key={action.id} action={action} coins={coins} busy={busy} onUse={play} />
            ))}
          </div>

          {coins < cheapest && (
            <p className="dragon-hint">You’re out of rainbow coins! Spell some words to earn more for {dragonName}.</p>
          )}
        </div>
      </div>

      <GameFooter>DRAG TO TURN · TAP TO SNUGGLE</GameFooter>
    </section>
  );
}
