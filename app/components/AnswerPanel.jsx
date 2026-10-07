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
  return allPlaced ? "Not quite — give it another try!" : "Fill every box before you check.";
}

export default function AnswerPanel({
  isCvc,
  answer,
  round,
  blanks,
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
        <span className="step-number">01</span>
        <div>
          <h2>{isCvc ? "Find the sound" : "Spell it out"}</h2>
          <p>{isCvc ? "Which letter fills the gap?" : "Tap letters to fill the boxes"}</p>
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
        placed={placed}
        tiles={tiles}
        checked={checked}
        guides={guides}
        onSlotClick={onSlotClick}
      />

      {guides && <SpellingGuideLegend />}

      <div className="tile-instructions">
        <span className="step-number">02</span>
        <span>{isCvc ? "Tap the missing letter" : "Tap letters in spelling order"}</span>
        <span className="instruction-line" />
      </div>

      <LetterBank
        label={isCvc ? "Letter choices" : "Scrambled letters"}
        round={round}
        tiles={tiles}
        placed={placed}
        onTileClick={onTileClick}
      />

      <div className="answer-footer">
        {checked && !complete && <Mascot name="elly" className="mascot-feedback" />}
        <p className={`feedback${checked ? (complete ? " feedback-success" : " feedback-try") : ""}`} aria-live="polite">
          {feedbackMessage({ checked, complete, allPlaced })}
        </p>
        <button className="action-button check-button" type="button" onClick={onCheck}>
          Check word <span aria-hidden="true">🪄</span>
        </button>
      </div>
    </section>
  );
}
