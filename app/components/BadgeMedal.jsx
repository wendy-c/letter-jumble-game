import LetterPattern from "./LetterPattern";

// A round medal on a ribbon showing the topic's picture. Unearned, it's a dashed placeholder.
export default function BadgeMedal({ topic, earned }) {
  if (!earned) {
    return (
      <span className="badge-medal badge-medal-locked" aria-hidden="true">
        <span className="badge-medal-face">?</span>
      </span>
    );
  }
  return (
    <span className={`badge-medal badge-${topic.color}`} aria-hidden="true">
      <span className="badge-ribbon badge-ribbon-left" />
      <span className="badge-ribbon badge-ribbon-right" />
      <span className="badge-medal-face">
        {topic.pattern ? <LetterPattern letters={topic.pattern} /> : <img src={topic.icon} alt="" width="44" height="44" />}
      </span>
      <span className="badge-shine">✦</span>
    </span>
  );
}
