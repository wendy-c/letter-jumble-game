import LetterBank from "./LetterBank";
import LetterSlots from "./LetterSlots";
import Mascot from "./Mascot";

function SpellingGuideLegend() {
  return (
    <div className="spelling-guide" aria-label="Spelling guide">
      <span className="spelling-guide-title">Spelling guide</span>
      <span className="spelling-guide-item"><i className="guide-mark guide-mark-vowel" aria-hidden="true" /> Vowel team</span>
      <span className="spelling-guide-item"><i className="guide-mark guide-mark-consonant" aria-hidden="true" /> Consonant team</span>
      <span className="spelling-guide-item"><i className="guide-mark guide-mark-other" aria-hidden="true" /> Other</span>
    </div>
  );
}

function feedbackMessage({ checked, complete, allPlaced }) {
  if (!checked || complete) return " ";
  return allPlaced ? "Not quite!" : "Fill every box before you check.";
}

export default function AnswerPanel({
  isCvc,
  isDigraph = false,
  isBlend = false,
  answer,
  round,
  blanks,
  gapLength = 1,
  placed,
  tiles,
  checked,
  complete,
  allPlaced,
  guides,
  voiceMessage,
  onSpeak,
  onSlotClick,
  onTileClick,
  onCheck,
}) {
  return (
    <section className="answer-panel" aria-label="Spell the word">
      <div className="answer-intro">
        <div>
          <h2>{isCvc ? "Click to play the sound" : "Spell it out"}</h2>
          <p>{isBlend ? "Which blend fills the gap?" : isDigraph ? "Which two letters fill the gap?" : isCvc ? "Which letter fills the gap?" : "Tap letters to fill the boxes"}</p>
        </div>
        <button className="voice-button" type="button" onClick={onSpeak} aria-label="Hear the word" title="Hear the word">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        </button>
      </div>
      <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">
        {voiceMessage}
      </p>

      <LetterSlots
        answer={answer}
        round={round}
        blanks={blanks}
        gapLength={gapLength}
        placed={placed}
        tiles={tiles}
        checked={checked}
        guides={guides}
        onSlotClick={onSlotClick}
      />

      {guides && <SpellingGuideLegend />}

      <div className="tile-instructions">
        <span>{isBlend ? "Tap the missing blend" : isDigraph ? "Tap the missing letters" : isCvc ? "Tap the missing letter" : "Tap letters in spelling order"}</span>
        <span className="instruction-line" />
      </div>

      <LetterBank
        label={isBlend ? "Blend choices" : isDigraph ? "Digraph choices" : isCvc ? "Letter choices" : "Scrambled letters"}
        round={round}
        tiles={tiles}
        placed={placed}
        onTileClick={onTileClick}
      />

      <div className="answer-footer">
        {checked && !complete && <Mascot mood="confused" className="mascot-feedback" />}
        <p className={`feedback${checked ? (complete ? " feedback-success" : " feedback-try") : ""}`} aria-live="polite">
          {feedbackMessage({ checked, complete, allPlaced })}
        </p>
        <button className="action-button check-button" type="button" onClick={onCheck}>
          Check it<span aria-hidden="true"></span>
        </button>
      </div>
    </section>
  );
}
