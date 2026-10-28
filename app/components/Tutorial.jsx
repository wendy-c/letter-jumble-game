import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Mascot from "./Mascot";

// The tour for a new family, after their first player is made. It asks which language they'd
// like (that sets the whole site's language), then points out the magic books, Mochi, and the
// player menu with its Parent mode. Each step dims the page except for what it's about.
const copy = {
  en: {
    steps: {
      books: { title: "Pick a magic book!", text: "Tap one of the magic books to start a game." },
      mochi: { title: "Visit Mochi", text: "Spend the rainbow coins you earn on food, grooming and fun with Mochi the dragon." },
      menu: { title: "Your player menu", text: "Tap your name to switch to another player, see your badges, or open Parent mode." },
      parent: { title: "Parent mode", text: "In Parent mode, grown-ups can turn on modules made for other age groups." },
    },
    next: "Next",
    back: "Back",
    skip: "Skip",
    done: "Let’s play!",
    count: (step, total) => `${step} of ${total}`,
  },
  zh: {
    steps: {
      books: { title: "選一本魔法書！", text: "按一本魔法書，就可以開始玩遊戲。" },
      mochi: { title: "探望 Mochi", text: "用賺到的彩虹金幣，買小食、梳洗，和小龍 Mochi 一起玩！" },
      menu: { title: "玩家選單", text: "按你的名字，可以轉換玩家、看看你的徽章，或進入家長模式。" },
      parent: { title: "家長模式", text: "家長可以在家長模式，為孩子開啟其他年齡組別的單元。" },
    },
    next: "下一步",
    back: "上一步",
    skip: "略過",
    done: "開始玩吧！",
    count: (step, total) => `${step} / ${total}`,
  },
};

// The tour after the language question, and what each step points at on the front page.
const tutorialSteps = [
  { id: "books", target: '.game-group:not([data-tour="mochi"])' },
  { id: "mochi", target: '[data-tour="mochi"]' },
  { id: "menu", target: ".player-chip" },
  { id: "parent", target: ".player-chip" },
];

// Where the highlighted part of the page is, kept up to date as it scrolls or resizes.
function useTargetBox(selector) {
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    if (!selector) {
      setBox(null);
      return undefined;
    }
    const target = document.querySelector(selector);
    if (!target) {
      setBox(null);
      return undefined;
    }
    target.scrollIntoView?.({ block: "center" });
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [selector]);
  return box;
}

// `step` is 0 for the language question, then 1… for tutorialSteps.
export default function Tutorial({ step, language, onLanguage, onStep, onDone }) {
  const text = copy[language] ?? copy.en;
  const tourStep = step > 0 ? tutorialSteps[step - 1] : null;
  const box = useTargetBox(tourStep?.target);
  const cardRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(220);
  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [step, language]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onDone();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDone]);

  if (step === 0) {
    return (
      <div className="player-overlay tutorial-overlay">
        <div className="player-dialog tutorial-language" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
          <Mascot mood="welcome" className="tutorial-mochi" />
          <h2 id="tutorial-title">Hello, what language do you prefer?</h2>
          <p className="tutorial-language-zh" lang="zh-Hant-HK">你好！你想用哪種語言？</p>
          <div className="tutorial-language-choices">
            {[["en", "English", "en"], ["zh", "繁體中文", "zh-Hant-HK"]].map(([value, label, lang]) => (
              <button
                key={value}
                className={`tutorial-language-choice${language === value ? " tutorial-language-current" : ""}`}
                type="button"
                lang={lang}
                autoFocus={value === "en"}
                onClick={() => {
                  onLanguage(value);
                  onStep(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { title, text: body } = text.steps[tourStep.id];
  const last = step === tutorialSteps.length;
  // The card sits below the highlighted part when there's room, otherwise above it; with nothing
  // to highlight on screen (e.g. Mochi turned off), it sits in the middle.
  const pad = 8;
  const onScreen = box && box.top < window.innerHeight - 40 && box.top + box.height > 40;
  const gap = pad + 14;
  // Leave room at the top for Mochi peeking over the card.
  const topRoom = 56;
  const below = onScreen && box.top + box.height + gap + cardHeight + 16 < window.innerHeight;
  const cardStyle = onScreen
    ? {
      top: below ? box.top + box.height + gap : Math.max(topRoom, box.top - gap - cardHeight),
      left: Math.max(16, Math.min(box.left + box.width / 2 - 170, window.innerWidth - 356)),
    }
    : null;

  return (
    <div className="tutorial-overlay" lang={language === "zh" ? "zh-Hant-HK" : "en"}>
      {onScreen ? (
        <div
          className="tutorial-spotlight"
          aria-hidden="true"
          style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2 }}
        />
      ) : (
        <div className="tutorial-dim" aria-hidden="true" />
      )}
      <div
        key={step}
        ref={cardRef}
        className={`tutorial-card${onScreen ? "" : " tutorial-card-centred"}`}
        style={cardStyle ?? undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-text"
      >
        <Mascot mood="happy" className="tutorial-card-mochi" />
        <p className="tutorial-count">{text.count(step, tutorialSteps.length)}</p>
        <h2 id="tutorial-title">{title}</h2>
        <p id="tutorial-text">{body}</p>
        <div className="tutorial-actions">
          <button className="tutorial-skip" type="button" onClick={onDone}>{text.skip}</button>
          {step > 1 && <button className="tutorial-back" type="button" onClick={() => onStep(step - 1)}>{text.back}</button>}
          <button className="tutorial-next" type="button" autoFocus onClick={() => (last ? onDone() : onStep(step + 1))}>
            {last ? text.done : text.next} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
