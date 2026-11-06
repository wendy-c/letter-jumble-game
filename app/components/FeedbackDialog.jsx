import { useEffect, useId, useState } from "react";
import { feedbackProblem, imageProblem, imageTypes, maxMessageLength } from "../lib/feedback";
import { useLanguage, useText } from "../i18n";

// "Send feedback", from the player menu: a message, and a picture if they'd like to show us
// something (a screenshot, say). It's sent to the Rainbow Academy's email address by the server
// (app/api/feedback/route.js).
export default function FeedbackDialog({ onClose }) {
  const text = useText();
  const language = useLanguage();
  const messageId = useId();
  const imageId = useId();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  // "editing", "sending" or "sent".
  const [status, setStatus] = useState("editing");
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // The picture's preview, let go of when it's changed or the form closes.
  useEffect(() => {
    if (!image) return undefined;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [image]);

  function chooseImage(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    const wrong = imageProblem(file);
    setProblem(wrong);
    setImage(wrong ? null : file);
  }

  async function send(event) {
    event.preventDefault();
    const wrong = feedbackProblem(message, image);
    if (wrong) {
      setProblem(wrong);
      return;
    }
    setProblem(null);
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    if (image) form.set("image", image);
    form.set("page", window.location.pathname);
    form.set("language", language);
    try {
      const response = await fetch("/api/feedback", { method: "POST", body: form });
      if (!response.ok) throw new Error();
      setStatus("sent");
    } catch {
      setProblem("notSent");
      setStatus("editing");
    }
  }

  return (
    <div className="player-overlay">
      <div className="player-dialog feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title" lang={language === "zh" ? "zh-Hant-HK" : "en"}>
        <h2 id="feedback-title">{text.feedbackTitle}</h2>
        {status === "sent" ? (
          <>
            <p className="feedback-sent" role="status">{text.feedbackSent}</p>
            <button className="reward-continue completion-button feedback-button" type="button" autoFocus onClick={onClose}>{text.close}</button>
          </>
        ) : (
          <form onSubmit={send} noValidate>
            <p className="feedback-intro">{text.feedbackIntro}</p>
            <label className="feedback-label" htmlFor={messageId}>{text.feedbackMessage}</label>
            <textarea
              id={messageId}
              name="message"
              className="feedback-message"
              rows={5}
              maxLength={maxMessageLength}
              value={message}
              autoFocus
              onChange={(event) => setMessage(event.target.value)}
              aria-invalid={problem === "message"}
            />
            {/* Hidden from people: only spam robots fill it in. */}
            <input className="feedback-trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label className="feedback-label" htmlFor={imageId}>{text.feedbackImage}</label>
            <input id={imageId} className="feedback-image-input" type="file" accept={imageTypes.join(",")} onChange={chooseImage} />
            {preview && (
              <div className="feedback-preview">
                <img src={preview} alt={text.feedbackChosenImage} />
                <button className="feedback-remove" type="button" onClick={() => setImage(null)}>{text.feedbackRemoveImage}</button>
              </div>
            )}
            {problem && <p className="feedback-problem" role="alert">{text.feedbackProblems[problem] ?? text.feedbackProblems.notSent}</p>}
            <div className="feedback-actions">
              <button className="action-button feedback-cancel" type="button" onClick={onClose}>{text.feedbackCancel}</button>
              <button className="reward-continue completion-button feedback-button" type="submit" disabled={status === "sending"}>
                {status === "sending" ? text.feedbackSending : text.feedbackSend}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
