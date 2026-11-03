import { tileName } from "./LetterBank";

// Magic E's word: the letters before the vowel, then the vowel's box, the consonant and the e's box,
// joined by an arch. Both boxes are one gap, filled by one pair ("a_e"): the vowel and the e.
function MagicEWord({ answer, round, blank, placed, tiles, checked, onSlotClick }) {
  const tileIndex = placed[0];
  const filled = tileIndex !== null && tileIndex !== undefined;
  const pair = filled ? tiles[tileIndex] : null;
  const isCorrect = checked && filled && pair === `${answer[blank]}_e`;
  const state = `${filled ? " slot-filled" : ""}${isCorrect ? " slot-correct" : ""}${checked && filled && !isCorrect ? " slot-wrong" : ""}`;
  const box = (letter, position) => (
    <button
      className={`letter-slot${state}`}
      type="button"
      key={`${round}-${position}`}
      aria-label={`Letter ${position + 1} of ${answer.length}${filled ? `, ${letter}` : ", empty"}`}
      onClick={() => onSlotClick(0)}
    >
      {filled ? letter : null}
    </button>
  );
  const given = (from, to) => answer.slice(from, to).split("").map((letter, offset) => (
    <span className="letter-given" key={`${round}-${from + offset}`} aria-label={`Letter ${from + offset + 1} of ${answer.length}, ${letter}`}>{letter}</span>
  ));
  return (
    <div className="letter-slots letter-slots-magic-e" aria-label="Your answer" style={{ "--word-letters": answer.length }}>
      <span className="letter-word">
        {given(0, blank)}
        <span className="magic-e-gap" aria-label={filled ? `Gap: ${tileName(pair)}` : "Gap: a vowel and a magic e"}>
          <svg className="magic-e-arch" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true"><path d="M6 18Q30-6 54 18" /></svg>
          {box(pair?.[0], blank)}
          {given(blank + 1, answer.length - 1)}
          {box("e", answer.length - 1)}
        </span>
      </span>
    </div>
  );
}

// The answer row. Each word's slots stay together on one line; positions not in `blanks`
// are given letters the learner doesn't fill in. A gap can hold `gapLength` letters (two for a
// digraph like "sh"), or for Magic E (`magicE`) a vowel and the e at the end. `guides` is null
// when the spelling guide is off.
export default function LetterSlots({ answer, round, blanks, gapLength = 1, magicE = false, placed, tiles, checked, guides, onSlotClick }) {
  if (magicE) return <MagicEWord answer={answer} round={round} blank={blanks[0]} placed={placed} tiles={tiles} checked={checked} onSlotClick={onSlotClick} />;
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
