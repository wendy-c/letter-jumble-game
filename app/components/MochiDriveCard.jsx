import { useEffect, useRef, useState } from "react";
import { sounds } from "../lib/sounds";
import { mochiDriveTime } from "../lib/timing";
import RoadSign from "./RoadSign";

// The front page's way to the dragon game: Mochi in sunglasses driving her cloud mobile (drawn by
// scripts/make-mochi.py), next to a road sign for the Rainbow Village. Tapping anywhere on the
// card, she toots her horn and floats off down the road (for mochiDriveTime), then the game opens.
// (The car and the sign are its buttons, for keyboards and screen readers; their clicks reach the
// card.)
export default function MochiDriveCard({ game, note, onSelect }) {
  const [driving, setDriving] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function drive() {
    if (driving) return;
    const stayStill = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (stayStill || mochiDriveTime <= 0) {
      onSelect();
      return;
    }
    setDriving(true);
    sounds.honk?.();
    timer.current = setTimeout(onSelect, mochiDriveTime);
  }

  return (
    <div className={`mochi-drive category-${game.color}${driving ? " mochi-drive-going" : ""}`} onClick={drive}>
      <div className="mochi-drive-road" aria-hidden="true" />
      <span className="mochi-drive-flowers" aria-hidden="true" />
      <p className="mochi-drive-note">{note}</p>
      <button
        className="mochi-drive-car"
        type="button"
        data-game-name={game.name}
        aria-label={game.name}
        disabled={driving}
      >
        <span className="mochi-car-bob">
          <img className="mochi-drive-mochi" src="/images/mochi/cloudmobile.svg" alt="" width="370" height="340" />
        </span>
        <span className="mochi-drive-puff mochi-drive-puff-one" aria-hidden="true" />
        <span className="mochi-drive-puff mochi-drive-puff-two" aria-hidden="true" />
      </button>
      <button className="mochi-drive-sign" type="button" aria-label="Go to Rainbow Village" disabled={driving}>
        <RoadSign lines={["Rainbow", "Village"]} direction="right" />
      </button>
    </div>
  );
}
