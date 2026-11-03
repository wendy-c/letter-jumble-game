// A Magic E pair ("a_e"): the vowel and the e, with an arch from one to the other.
export function MagicEPair({ pair }) {
  const [vowel, e] = pair.split("_");
  return (
    <span className="magic-e-pair">
      <svg className="magic-e-arch" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true"><path d="M6 18Q30-6 54 18" /></svg>
      <span>{vowel}</span><span>{e}</span>
    </span>
  );
}

const isPair = (tile) => /^[a-z]_e$/.test(tile);
// How a tile is read out: "a_e" as "a, magic e".
export const tileName = (tile) => (isPair(tile) ? `${tile[0]}, magic e` : tile);

export default function LetterBank({ label, round, tiles, placed, onTileClick }) {
  return (
    <div className="letter-bank" aria-label={label}>
      {tiles.map((letter, index) => {
        const isPlaced = placed.includes(index);
        return (
          <button
            className={`letter-tile${isPair(letter) ? " letter-tile-pair" : ""}${isPlaced ? " tile-used" : ""}`}
            type="button"
            key={`${round}-${index}`}
            data-letter={letter}
            aria-label={`Letter ${tileName(letter)}${isPlaced ? ", placed" : ""}`}
            onClick={() => onTileClick(index)}
          >
            {isPair(letter) ? <MagicEPair pair={letter} /> : letter}
          </button>
        );
      })}
    </div>
  );
}
