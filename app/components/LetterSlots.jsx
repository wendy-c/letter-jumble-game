// The answer row. Each word's slots stay together on one line; positions not in `blanks`
// are given letters the learner doesn't fill in. A gap can hold `gapLength` letters (two for a
// digraph like "sh"). `guides` is null when the spelling guide is off.
export default function LetterSlots({ answer, round, blanks, gapLength = 1, placed, tiles, checked, guides, onSlotClick }) {
  const answerLetterCount = answer.replaceAll(" ", "").length;
  const answerWords = answer.split(" ");

  return (
    <div
      className="letter-slots"
      aria-label="Your answer"
      style={{ "--word-letters": Math.max(...answerWords.map((word) => word.length)) }}
    >
      {answerWords.map((word, wordIndex) => {
        const wordStart = answerWords.slice(0, wordIndex).join("").length;
        return (
          <span className="letter-word" key={`${round}-word-${wordIndex}`}>
            {word.split("").map((letter, letterIndex) => {
              const index = wordStart + letterIndex;
              const slotIndex = blanks.indexOf(index);
              // The rest of a two-letter gap is part of the slot before it.
              if (blanks.some((blank) => index > blank && index < blank + gapLength)) return null;
              if (slotIndex === -1) {
                return (
                  <span
                    className="letter-given"
                    key={`${round}-${index}`}
                    aria-label={`Letter ${index + 1} of ${answerLetterCount}, ${letter}`}
                  >
                    {letter}
                  </span>
                );
              }
              const tileIndex = placed[slotIndex];
              const filled = tileIndex !== null && tileIndex !== undefined;
              const isCorrect = checked && filled && tiles[tileIndex] === answer.replaceAll(" ", "").slice(index, index + gapLength);
              const guide = guides ? guides[index] : null;
              const guideLabel = guide ? `, ${guide === "other" ? "single sound" : `${guide} team`}` : "";
              return (
                <button
                  className={`letter-slot${gapLength > 1 ? " letter-slot-wide" : ""}${guide ? ` letter-slot-guide-${guide}` : ""}${filled ? " slot-filled" : ""}${isCorrect ? " slot-correct" : ""}${checked && filled && !isCorrect ? " slot-wrong" : ""}`}
                  type="button"
                  key={`${round}-${index}`}
                  aria-label={`Letter ${index + 1} of ${answerLetterCount}${filled ? `, ${tiles[tileIndex]}` : ", empty"}${guideLabel}`}
                  onClick={() => onSlotClick(slotIndex)}
                >
                  {filled ? tiles[tileIndex] : null}
                </button>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
