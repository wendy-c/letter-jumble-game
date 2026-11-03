import { useId, useState } from "react";
import { ageGroups } from "../games-data";
import { useText } from "../i18n";
import { loadTransferData, makeTransferCode, readTransferCode, reloadHome } from "../lib/record-transfer";

// Parent mode's way to move game records to another browser. On the old browser: "Generate" makes
// a code of everything saved here, to copy. On the new one: paste it, tap "Load", and confirm
// (after a warning that it replaces what's saved there); the home page then opens with the
// records loaded.
export default function RecordTransfer() {
  const text = useText();
  const codeId = useId();
  const pasteId = useId();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [problem, setProblem] = useState(null);
  // A pasted code that's been checked, waiting for "Yes, replace them".
  const [ready, setReady] = useState(null);

  function generate() {
    setCode(makeTransferCode());
    setCopied(false);
  }

  async function copy(event) {
    const box = event.currentTarget.form?.elements.namedItem("transfer-code");
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // No clipboard access: select the code so it can be copied by hand.
      box?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
  }

  function check() {
    const result = readTransferCode(pasted);
    setProblem(result.error ?? null);
    setReady(result.error ? null : result);
  }

  function load() {
    loadTransferData(ready.data);
    reloadHome();
  }

  const childrenIn = (players) => players.map((player) => {
    const age = ageGroups.find((group) => group.id === player.age)?.label;
    return text.transferChild(player.name, age, player.coins);
  });

  return (
    <section className="record-transfer" aria-labelledby="record-transfer-title">
      <h3 id="record-transfer-title">{text.transferTitle}</h3>
      <p className="parent-intro">{text.transferIntro}</p>
      <ol className="record-transfer-steps">
        {text.transferSteps.map((step) => <li key={step}>{step}</li>)}
      </ol>

      <form className="record-transfer-part" onSubmit={(event) => event.preventDefault()}>
        <h4>{text.transferSendTitle}</h4>
        <button className="action-button record-transfer-button" type="button" onClick={generate}>{text.transferGenerate}</button>
        {code && (
          <>
            <label className="record-transfer-label" htmlFor={codeId}>{text.transferCodeLabel}</label>
            <textarea
              id={codeId}
              name="transfer-code"
              className="record-transfer-code"
              readOnly
              rows={4}
              value={code}
              onFocus={(event) => event.target.select()}
            />
            <button className="action-button record-transfer-button" type="button" onClick={copy}>
              {copied ? text.transferCopied : text.transferCopy}
            </button>
          </>
        )}
      </form>

      <form className="record-transfer-part" onSubmit={(event) => { event.preventDefault(); check(); }}>
        <h4>{text.transferLoadTitle}</h4>
        <p className="record-transfer-warning" role="note">{text.transferWarning}</p>
        <label className="record-transfer-label" htmlFor={pasteId}>{text.transferPasteLabel}</label>
        <textarea
          id={pasteId}
          className="record-transfer-code"
          rows={4}
          value={pasted}
          onChange={(event) => { setPasted(event.target.value); setProblem(null); setReady(null); }}
          aria-describedby={problem ? `${pasteId}-problem` : undefined}
        />
        {problem && <p className="record-transfer-problem" id={`${pasteId}-problem`} role="alert">{text.transferProblems[problem]}</p>}
        {!ready && <button className="action-button record-transfer-button" type="submit">{text.transferLoad}</button>}
        {ready && (
          <div className="record-transfer-confirm" role="alertdialog" aria-labelledby={`${pasteId}-confirm`}>
            <p id={`${pasteId}-confirm`}><strong>{text.transferConfirm}</strong></p>
            <ul>{childrenIn(ready.players).map((line) => <li key={line}>{line}</li>)}</ul>
            <p>{text.transferConfirmNote}</p>
            <div className="record-transfer-actions">
              <button className="action-button record-transfer-replace" type="button" onClick={load}>{text.transferReplace}</button>
              <button className="action-button record-transfer-cancel" type="button" onClick={() => setReady(null)}>{text.transferCancel}</button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
