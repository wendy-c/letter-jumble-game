// A big tappable card used for both game choices and topic/mode choices. A `locked` card can't be
// tapped yet and shows a padlock; `tag` (e.g. "★ Full score") sits top right.
export default function ChoiceCard({ className = "", color, icon, tag = null, name, note, onClick, locked = false }) {
  return (
    <button className={`category-card${className ? ` ${className}` : ""} category-${color}${locked ? " category-card-locked" : ""}`} type="button" onClick={onClick} disabled={locked}>
      <span className="category-card-top">
        <span className="category-card-icon" aria-hidden="true">{icon}</span>
        {tag && <span className="category-card-tag">{tag}</span>}
      </span>
      <span className="category-card-name">{name}</span>
      <span className="category-card-bottom">
        <span>{note}</span>
        {locked
          ? <img className="category-card-lock" src="/images/icons/menu-parent.svg" alt="" width="22" height="22" />
          : <span className="category-card-arrow" aria-hidden="true">→</span>}
      </span>
    </button>
  );
}
