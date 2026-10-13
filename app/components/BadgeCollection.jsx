import { useEffect } from "react";
import { badgeShelves } from "../badges";
import BadgeMedal from "./BadgeMedal";

// The player's badge collection: a shelf per game, with a badge for every topic they've finished
// and a placeholder for each one still to do.
export default function BadgeCollection({ player, onClose }) {
  const shelves = badgeShelves(player);
  const all = shelves.flatMap((shelf) => shelf.badges);
  const earnedCount = all.filter((badge) => badge.earned).length;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="player-overlay" onClick={onClose}>
      <div
        className="player-dialog badge-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="word-menu-close player-dialog-close" type="button" aria-label="Close badges" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">MAGIC ACADEMY</p>
        <h2 id="badge-title">{player.name}’s badges</h2>
        <p className="badge-count">
          <span aria-hidden="true">🏅</span> {earnedCount} of {all.length} badges
        </p>
        {earnedCount === 0 && <p className="parent-intro">Finish every word in a topic to earn its badge!</p>}

        {shelves.map(({ game, badges }) => (
          <section className="badge-shelf" key={game.id} aria-labelledby={`badge-shelf-${game.id}`}>
            <h3 id={`badge-shelf-${game.id}`}>{game.name}</h3>
            <ul className="badge-grid">
              {badges.map(({ key, topic, earned }) => (
                <li
                  className={`badge-item${earned ? " badge-item-earned" : ""}`}
                  key={key}
                  aria-label={`${topic.name}: ${earned ? "earned" : "not earned yet"}`}
                >
                  <BadgeMedal topic={topic} earned={earned} />
                  <span className="badge-name">{topic.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
