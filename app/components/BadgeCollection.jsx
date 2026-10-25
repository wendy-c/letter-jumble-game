import { badgeShelves } from "../badges";
import BadgeMedal from "./BadgeMedal";
import GameFooter from "./GameFooter";

// The player's badge collection page ("/badges"): a shelf per game, with a badge for every topic
// they've finished and a placeholder for each one still to do.
export default function BadgeCollection({ player, breadcrumbs }) {
  const shelves = badgeShelves(player);
  const all = shelves.flatMap((shelf) => shelf.badges);
  const earnedCount = all.filter((badge) => badge.earned).length;

  return (
    <section className="game-wrap badge-page mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">RAINBOW ACADEMY</p>
        <h1 id="game-title">{player.name}’s <span>badges</span></h1>
        <p className="badge-count">
          <span aria-hidden="true">🏅</span> {earnedCount} of {all.length} badges
        </p>
        {earnedCount === 0 && <p className="heading-note">Get every answer in a topic right to earn its badge!</p>}
      </div>

      {shelves.map(({ game, badges }) => (
        <section className="badge-shelf" key={game.id} aria-labelledby={`badge-shelf-${game.id}`}>
          <h2 id={`badge-shelf-${game.id}`}>{game.name}</h2>
          <ul className="badge-grid">
            {badges.map(({ key, topic, image, earned }) => (
              <li
                className={`badge-item${earned ? " badge-item-earned" : ""}`}
                key={key}
                aria-label={`${topic.name}: ${earned ? "earned" : "not earned yet"}`}
              >
                <BadgeMedal image={image} earned={earned} />
                <span className="badge-name">{topic.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <GameFooter>COLLECT THEM ALL</GameFooter>
    </section>
  );
}
