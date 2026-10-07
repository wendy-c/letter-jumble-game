import { useCallback, useEffect, useRef, useState } from "react";
import { dragonActions, dragonName, petAction } from "../dragon-data";
import DragonScene from "./DragonScene";
import GameFooter from "./GameFooter";

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

export default function DragonDen({ coins, onSpendCoins, onBack }) {
  const [command, setCommand] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(idleMessage);
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const play = useCallback((action) => {
    if (busyRef.current) return;
    if (action.cost > 0 && !onSpendCoins(action.cost)) return;

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
  const treats = dragonActions.filter((action) => action.kind === "treat");
  const grooming = dragonActions.filter((action) => action.kind === "groom");
  const cheapest = Math.min(...dragonActions.map((action) => action.cost));

  return (
    <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="game-heading">
        <div>
          <button className="category-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Choose a game
          </button>
          <p className="eyebrow">MEET YOUR MAGIC PET</p>
          <h1 id="game-title">{dragonName} the <span>Rainbow Dragon</span></h1>
          <p className="heading-note">Spend rainbow coins on yummy treats and pampering.</p>
        </div>
        <div className="heading-progress">
          <div className="rainbow-coin-counter" aria-label={`${coins} rainbow coins collected`}>
            <img className="rainbow-coin-icon coin-pop" key={coins} src="/images/rainbow-coin.svg" alt="" width="32" height="32" />
            <span className="coin-count">{coins}</span>
            <span className="coin-label">RAINBOW COINS</span>
          </div>
        </div>
      </div>

      <div className="game-card dragon-card">
        <div className="dragon-stage-wrap">
          <DragonScene command={command} onPet={pet} />
          <p className="dragon-bubble" aria-live="polite">{message}</p>
        </div>

        <div className="dragon-panel">
          <h2 className="dragon-panel-title">Treats</h2>
          <div className="dragon-actions">
            {treats.map((action) => (
              <ActionButton key={action.id} action={action} coins={coins} busy={busy} onUse={play} />
            ))}
          </div>

          <h2 className="dragon-panel-title">Grooming</h2>
          <div className="dragon-actions">
            {grooming.map((action) => (
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
