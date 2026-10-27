// A right answer's little cheer at the top of the screen: "Amazing! +1" with a rainbow coin. It
// disappears by itself (see answerToastTime); `key` it by answer so each one pops in afresh.
export default function AnswerToast({ message, earnedLabel, lang }) {
  return (
    <div className="answer-toast" role="status" lang={lang}>
      <img className="answer-toast-coin" src="/images/rainbow-coin.svg" alt="" width="34" height="34" />
      <span className="answer-toast-message">{message}</span>
      <span className="answer-toast-plus" aria-hidden="true">+1</span>
      <span className="sr-only">{earnedLabel}</span>
    </div>
  );
}
