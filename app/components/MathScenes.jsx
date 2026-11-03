import { useEffect } from "react";

// K3's Daily Challenge pictures, drawn from the question's data: shapes to count, a pile of leaves,
// a queue, rows of things, a menu with prices, coins, a week and a clock.
// Also its puzzles (number cards, groups of numbers, shading pairs) and the number pad for sums.

const say = (language, en, zh) => (language === "zh" ? zh : en);

function Shape({ kind, x, y, r, color }) {
  const style = { fill: color, fillOpacity: 0.6 };
  if (kind === "circle") return <circle cx={x} cy={y} r={r} style={style} />;
  if (kind === "square") return <rect x={x - r * 0.8} y={y - r * 0.8} width={r * 1.6} height={r * 1.6} rx="3" style={style} />;
  const points = [[x, y - r], [x + r * 0.866, y + r / 2], [x - r * 0.866, y + r / 2]].map((point) => point.join(" ")).join(" ");
  return <polygon points={points} style={style} />;
}

// One grid of a shading puzzle: `size` cells across, the `shaded` ones coloured in.
export function ShadeGrid({ size, shaded, className = "" }) {
  return (
    <span className={`math-shade${size === 3 ? " math-shade-three" : ""} ${className}`} aria-hidden="true">
      {Array.from({ length: size * size }, (_, cell) => (
        <span key={cell} className={`math-shade-cell${shaded.includes(cell) ? " math-shade-on" : ""}`} />
      ))}
    </span>
  );
}

function Person() {
  return (
    <svg className="math-queue-person" viewBox="0 0 24 32" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M2 31q0-15 10-15t10 15Z" />
    </svg>
  );
}

function Clock({ hour, minute }) {
  const hand = (angle, length) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return `M100 100L${100 + length * Math.cos(radians)} ${100 + length * Math.sin(radians)}`;
  };
  return (
    <svg className="math-clock" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="92" className="math-clock-face" />
      {Array.from({ length: 12 }, (_, index) => {
        const radians = (((index + 1) * 30 - 90) * Math.PI) / 180;
        return (
          <text key={index} x={100 + 72 * Math.cos(radians)} y={100 + 72 * Math.sin(radians)} dy="0.35em" textAnchor="middle">
            {index + 1}
          </text>
        );
      })}
      <path className="math-clock-hour" d={hand(((hour % 12) + minute / 60) * 30, 42)} />
      <path className="math-clock-minute" d={hand(minute * 6, 64)} />
      <circle cx="100" cy="100" r="6" className="math-clock-pin" />
    </svg>
  );
}

const coinPicture = (value) => `/images/game-asset/math/coin-${value}.svg`;

// Pictures for K3's questions; `scene.type` says which.
export function K3Scene({ scene, language }) {
  const small = (picture, key, className = "") => <img key={key} className={className} src={picture} alt="" width="32" height="32" />;

  if (scene.type === "shapes") {
    return (
      <svg className="math-scene math-shapes" viewBox="0 0 480 300" aria-hidden="true">
        {scene.shapes.map((shape, index) => <Shape key={index} {...shape} />)}
      </svg>
    );
  }
  if (scene.type === "scatter") {
    return (
      <div className="math-scene math-scatter" aria-hidden="true">
        {scene.items.map((item, index) => (
          <img key={index} src={item.picture} alt="" width="40" height="40"
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) rotate(${item.rotate}deg)` }} />
        ))}
      </div>
    );
  }
  if (scene.type === "queue") {
    return (
      <div className="math-scene math-queue" aria-hidden="true">
        <span className="math-queue-end">{say(language, "Front", "前面")}</span>
        <div className="math-queue-line">
          {Array.from({ length: scene.front }, (_, index) => <Person key={`f${index}`} />)}
          <img className="math-queue-hero" src={scene.picture} alt="" width="48" height="48" />
          {Array.from({ length: scene.behind }, (_, index) => <Person key={`b${index}`} />)}
        </div>
        <span className="math-queue-end">{say(language, "Back", "後面")}</span>
      </div>
    );
  }
  if (scene.type === "rows") {
    return (
      <div className="math-scene math-rows" aria-hidden="true">
        {scene.rows.map((row, index) => (
          <div key={index} className="math-row">
            <span className="math-row-number">{index + 1}</span>
            {row.map((picture, item) => small(picture, item))}
          </div>
        ))}
      </div>
    );
  }
  if (scene.type === "menu") {
    return (
      <div className="math-scene math-menu" aria-hidden="true">
        <div className="math-menu-items">
          {scene.items.map((item, index) => (
            <span key={index} className="math-menu-item">{small(item.picture, "picture")}<b className="math-price">${item.price}</b></span>
          ))}
        </div>
        <div className="math-menu-buyers">
          {scene.buyers.map((buyer, index) => (
            <span key={index} className="math-menu-buyer">
              {small(buyer.picture, "buyer", "math-menu-who")}
              {buyer.picks.map((pick) => small(scene.items[pick].picture, pick))}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (scene.type === "coins") {
    return (
      <div className="math-scene math-coins" aria-hidden="true">
        <div className="math-coin-row">
          {scene.coins.map((value, index) => (
            <img key={index} src={coinPicture(value)} alt="" width="48" height="48" style={{ width: `${44 + value * 3}px` }} />
          ))}
        </div>
        <span className="math-menu-item math-coin-item">{small(scene.item.picture, "item")}<b className="math-price">${scene.item.price}</b></span>
      </div>
    );
  }
  if (scene.type === "week") {
    return (
      <ol className="math-scene math-week" aria-hidden="true">
        {scene.days.map((day, index) => (
          <li key={index} className={index === scene.today ? "math-week-today" : ""}>{day[language] ?? day.en}</li>
        ))}
      </ol>
    );
  }
  if (scene.type === "clock") {
    return <div className="math-scene math-clock-scene" aria-hidden="true"><Clock hour={scene.hour} minute={scene.minute} /></div>;
  }
  return null;
}

// K3's puzzles drawn large: number cards, lettered groups of numbers, and shading pairs (the last
// pair's answer appears once answered).
export function K3Visual({ visual, solved, answer }) {
  if (visual.type === "cards") {
    return (
      <div className="math-cards" aria-label={visual.numbers.join(", ")}>
        {visual.numbers.map((number) => <span key={number} className="math-box">{number}</span>)}
      </div>
    );
  }
  if (visual.type === "sets") {
    return (
      <div className="math-sets">
        {visual.sets.map((set) => (
          <div key={set.letter} className="math-set" aria-label={`${set.letter}: ${set.numbers.join(", ")}`}>
            <b className="math-set-letter">{set.letter}</b>
            <span>{set.numbers.join("  ")}</span>
          </div>
        ))}
      </div>
    );
  }
  // Shading: three pairs, then the last with its gap.
  const answerCells = answer.split(",").map(Number);
  return (
    <div className="math-shading" role="img" aria-label="Pairs of grids">
      {visual.pairs.map(([before, after], index) => (
        <span key={index} className="math-shading-pair">
          <ShadeGrid size={visual.size} shaded={before} /><span className="math-shading-arrow">→</span><ShadeGrid size={visual.size} shaded={after} />
        </span>
      ))}
      <span className="math-shading-pair">
        <ShadeGrid size={visual.size} shaded={visual.last} /><span className="math-shading-arrow">→</span>
        {solved ? <ShadeGrid size={visual.size} shaded={answerCells} className="math-shade-filled" />
          : <span className={`math-shade math-shade-gap${visual.size === 3 ? " math-shade-three" : ""}`}>?</span>}
      </span>
    </div>
  );
}

// Keys 0-9, rub out, and OK (also typed on a keyboard). Answers have at most three digits.
export function NumberPad({ value, onChange, onSubmit, disabled, language, state }) {
  useEffect(() => {
    if (disabled) return undefined;
    const onKey = (event) => {
      // Not while typing elsewhere or in a dialog; Enter on a focused button presses that button.
      if (event.target.closest?.("input, textarea, [role=dialog]")) return;
      if (event.key === "Enter" && event.target.closest?.("button")) return;
      if (/^[0-9]$/.test(event.key)) onChange((value + event.key).slice(0, 3));
      else if (event.key === "Backspace") onChange(value.slice(0, -1));
      else if (event.key === "Enter" && value) onSubmit();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange, onSubmit, disabled]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];
  return (
    <div className="math-pad" role="group" aria-label={say(language, "Number pad", "數字鍵")}>
      <output className={`math-pad-display${state ? ` math-pad-${state}` : ""}`} aria-live="polite">{value || " "}</output>
      <div className="math-pad-keys">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className={`math-pad-key${key === "ok" ? " math-pad-ok" : key === "del" ? " math-pad-del" : ""}`}
            disabled={disabled || (key === "ok" && !value) || (key === "del" && !value)}
            aria-label={key === "del" ? say(language, "Rub out", "刪除") : key === "ok" ? say(language, "Check my answer", "提交答案") : key}
            onClick={() => (key === "ok" ? onSubmit() : key === "del" ? onChange(value.slice(0, -1)) : onChange((value + key).slice(0, 3)))}
          >
            {key === "del" ? "⌫" : key === "ok" ? "OK" : key}
          </button>
        ))}
      </div>
    </div>
  );
}
