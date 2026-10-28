import { badgeShelves } from "../badges";
import { useText } from "../i18n";
import BadgeMedal from "./BadgeMedal";
import GameFooter from "./GameFooter";

// The player's badge collection page ("/badges"): a shelf per game, with a badge for every topic
// they've finished and a placeholder for each one still to do.
export default function BadgeCollection({ player, breadcrumbs }) {
  const text = useText();
  const shelves = badgeShelves(player);
  const all = shelves.flatMap((shelf) => shelf.badges);
  const earnedCount = all.filter((badge) => badge.earned).length;

  return (
    <section className="game-wrap badge-page mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">RAINBOW ACADEMY</p>
        <h1 id="game-title">{text.badgesTitle(player.name)}</h1>
        <p className="badge-count">
          <img className="inline-icon" src="/images/icons/menu-badges.svg" alt="" width="22" height="22" /> {text.badgeCount(earnedCount, all.length)}
        </p>
        {earnedCount === 0 && <p className="heading-note">{text.noBadgesYet}</p>}
      </div>

      {shelves.map(({ game, badges }) => (
        <section className="badge-shelf" key={game.id} aria-labelledby={`badge-shelf-${game.id}`}>
          <h2 id={`badge-shelf-${game.id}`}>{game.name}</h2>
          <ul className="badge-grid">
            {badges.map(({ key, topic, image, earned }) => (
              <li
                className={`badge-item${earned ? " badge-item-earned" : ""}`}
                key={key}
                aria-label={earned ? text.badgeEarned(topic.name) : text.badgeNotYet(topic.name)}
              >
                <BadgeMedal image={image} earned={earned} />
                <span className="badge-name">{topic.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <GameFooter>{text.collectThemAll}</GameFooter>
    </section>
  );
}
