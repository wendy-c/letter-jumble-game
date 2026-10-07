export default function LetterBank({ label, round, tiles, placed, onTileClick }) {
  return (
    <div className="letter-bank" aria-label={label}>
      {tiles.map((letter, index) => {
        const isPlaced = placed.includes(index);
        return (
          <button
            className={`letter-tile${isPlaced ? " tile-used" : ""}`}
            type="button"
            key={`${round}-${index}`}
            data-letter={letter}
            aria-label={`Letter ${letter}${isPlaced ? ", placed" : ""}`}
            onClick={() => onTileClick(index)}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
