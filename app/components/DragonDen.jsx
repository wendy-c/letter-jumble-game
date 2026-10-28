import { useCallback, useEffect, useRef, useState } from "react";

import { sounds } from "../lib/sounds";
import DragonScene from "./DragonScene";
import GameFooter from "./GameFooter";
import RoadSign from "./RoadSign";

// Each tab is one of the dragon's rooms (see `rooms` in dragon-data). A place can have just some
// of them (`sections` in dragon-data): the park only has activities.
const allSections = [
  { kind: "treat", label: "Food", icon: "/images/icons/ui-treats.svg" },
  { kind: "groom", label: "Grooming", icon: "/images/game-asset/cvc/tub.svg" },
  { kind: "activity", label: "Activities", icon: "/images/game-asset/dragon/palette.svg" },
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
      <img className="dragon-action-icon" src={action.icon} alt="" width="40" height="40" />
      <span className="dragon-action-label">{action.label}</span>
      <span className="dragon-action-cost" aria-hidden="true">
        <img src="/images/rainbow-coin.svg" alt="" width="16" height="16" />
        {action.cost}
      </span>
    </button>
  );
}

// A dragon's den (Mochi's or Tofu's, from dragon-data), or the park where they play together:
// spend coins on food, grooming and activities, or tap a dragon for something free. A road sign
// in the corner of the room goes to Rainbow Village (`onGoToVillage`).
export default function DragonDen({ dragon, coins, onSpendCoins, breadcrumbs, onGoToVillage, titleAction = null }) {
  const { idleMessage, actions: dragonActions, petActions } = dragon;
  const sections = dragon.sections ? allSections.filter(({ kind }) => dragon.sections.includes(kind)) : allSections;
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
              {dragon.heading
                ? <>{dragon.heading[0]} <span>{dragon.heading[1]}</span></>
                : <>{dragon.name} the <span>{dragon.title.replace(`${dragon.name} the `, "")}</span></>}
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
              <RoadSign lines={["The Rainbow", "Village"]} />
            </button>
          </div>
          <p className="dragon-bubble" aria-live="polite">{message}</p>
        </div>

        <div className="dragon-panel">
          {sections.length > 1 && <div className="dragon-tabs" role="tablist" aria-label={`Things to do with ${dragon.name}`} onKeyDown={handleTabKeyDown}>
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
                <img className="dragon-tab-icon" src={icon} alt="" width="22" height="22" /> {label}
              </button>
            ))}
          </div>}

          <div
            className={`dragon-actions dragon-actions-${section}`}
            {...(sections.length > 1
              ? { role: "tabpanel", id: `dragon-section-${section}`, "aria-labelledby": `dragon-tab-${section}` }
              : { role: "group", "aria-label": `Things to do with ${dragon.name}` })}
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
