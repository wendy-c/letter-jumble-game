import Mascot from "./Mascot";

const englishRevealLabels = {
  kicker: "NOT QUITE",
  title: "The answer is…",
  next: "Next question",
};

export const chineseRevealLabels = {
  kicker: "答錯了",
  title: "正確答案是……",
  next: "下一題",
};

// Shown after a wrong answer: Mochi holds up a red cross, and the right answer is shown in a red
// box (the answer given was wrong), then on to the next question (no second try).
// `reveal` is { text, picture, note }: the picture is an image path or an emoji.
export default function AnswerRevealDialog({ reveal, labels = englishRevealLabels, lang, onContinue }) {
  const wide = reveal.picture?.startsWith("/images/idioms/");
  return (
    <div className="reward-overlay">
      <div className="reward-dialog reveal-dialog" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
        <div className="reward-card completion-card reveal-card">
          <Mascot mood="wrong" className="reveal-mascot" />
          <span className="reward-kicker">{labels.kicker}</span>
          <h2 className="reward-title reveal-title" id="reveal-title">{labels.title}</h2>
          <div className="reveal-answer" lang={lang}>
            {reveal.picture && (reveal.picture.startsWith("/")
              ? <img className={`reveal-picture${wide ? " reveal-picture-wide" : ""}`} src={reveal.picture} alt="" width={wide ? 256 : 96} height={wide ? 160 : 96} />
              : <span className="reveal-emoji" aria-hidden="true">{reveal.picture}</span>)}
            <span className="reveal-text">{reveal.text}</span>
            {reveal.note && <p className="reveal-note">{reveal.note}</p>}
          </div>
          <button className="reward-continue completion-button" type="button" autoFocus onClick={onContinue}>
            {labels.next} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
