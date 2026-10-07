// A big tappable card used for both game choices and topic/mode choices.
export default function ChoiceCard({ className = "", color, icon, number, name, note, onClick }) {
  return (
    <button className={`category-card${className ? ` ${className}` : ""} category-${color}`} type="button" onClick={onClick}>
      <span className="category-card-top">
        <span className="category-card-icon" aria-hidden="true">{icon}</span>
        <span className="category-card-number">{String(number).padStart(2, "0")}</span>
      </span>
      <span className="category-card-name">{name}</span>
      <span className="category-card-bottom">
        <span>{note}</span>
        <span className="category-card-arrow" aria-hidden="true">→</span>
      </span>
    </button>
  );
}
