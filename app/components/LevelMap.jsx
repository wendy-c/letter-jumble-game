import { useEffect, useState } from "react";
import { useLanguage } from "../i18n";
import GameFooter from "./GameFooter";

// The Challenge's 20 levels on a map, in Rainbow Village's colours: a winding path of level tiles,
// four to a row, from Level 1 at the top. A finished level shows its best score; a level still to
// open shows a padlock. Mochi stands on the furthest level open, and when a new one has opened since
// the map was last shown she walks along the path to it, a tile at a time.

// Where each level sits on the map (a 400 × 660 box): rows of four, going back and forth, with
// room above each tile for Mochi.
const width = 400;
const height = 660;
const columns = [62, 154, 246, 338];
const rowY = (row) => 70 + row * 130;
const spots = Array.from({ length: 20 }, (_, index) => {
  const row = Math.floor(index / 4);
  const column = row % 2 === 0 ? index % 4 : 3 - (index % 4);
  return { x: columns[column], y: rowY(row) };
});

// The path through every spot, curving round at the end of each row.
const path = spots.reduce((d, { x, y }, index) => {
  if (index === 0) return `M${x} ${y}`;
  const before = spots[index - 1];
  if (before.y === y) return `${d}L${x} ${y}`;
  const side = x > 200 ? 392 : 8;
  return `${d}C${side} ${before.y} ${side} ${y} ${x} ${y}`;
}, "");

// Trees and flowers between the rows.
const trees = [[200, 135], [108, 265], [292, 395], [200, 525], [30, 20], [372, 650]];
const flowers = [[110, 135, "#ff8fb7"], [290, 135, "#ffd45e"], [200, 265, "#8cc8f2"], [20, 330, "#ff8fb7"], [110, 395, "#ffd45e"],
  [380, 330, "#c9b6f5"], [290, 525, "#ff8fb7"], [110, 525, "#8cc8f2"], [200, 650, "#ffd45e"]];

const words = {
  en: {
    eyebrow: "BRAIN CHALLENGE",
    note: "Everyone starts at Level 1. Finish a level, and Mochi walks on to the next one!",
    footer: "PICK A LEVEL",
    level: (number) => `Level ${number}`,
    score: (right, total) => `${right} of ${total} right`,
    done: (done, total) => `${done} of ${total} questions done`,
    locked: (before) => `locked: finish Level ${before} to open`,
    here: "Mochi is here",
  },
  zh: {
    eyebrow: "腦力挑戰",
    note: "每個人都由第一關開始。完成一關，Mochi 就會走到下一關！",
    footer: "選一個關卡",
    level: (number) => `第 ${number} 關`,
    score: (right, total) => `答對 ${right} / ${total} 題`,
    done: (done, total) => `已答 ${done} / ${total} 題`,
    locked: (before) => `未開放：完成第 ${before} 關就可以玩`,
    here: "Mochi 在這裏",
  },
};

// Where Mochi was last shown, for each child and class, so she can walk on from there.
const readShown = (key) => {
  try {
    const stored = window.sessionStorage.getItem(key);
    const value = Number(stored);
    return stored !== null && Number.isInteger(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
};
const saveShown = (key, index) => {
  try {
    window.sessionStorage.setItem(key, String(index));
  } catch {
    // Storage can be blocked; Mochi just doesn't walk next time.
  }
};

// `levels` are the class's 20 levels; `lockFor(level)` is "open" or "locked"; `scoreFor(level)` is
// the best [right, out of] so far, or null; `progressFor(level)` how many questions of a level
// being played are done. `mapKey` names whose map it is (child and class), for Mochi's walk.
export default function LevelMap({ title, focus, levels, lockFor, scoreFor, progressFor = () => 0, mapKey, breadcrumbs, titleAction = null, onSelectLevel }) {
  const language = useLanguage() === "zh" ? "zh" : "en";
  const text = words[language];
  const open = levels.map((level) => lockFor(level) === "open");
  const furthest = Math.max(0, open.lastIndexOf(true));
  const [mochiAt, setMochiAt] = useState(() => {
    const shown = typeof window === "undefined" ? null : readShown(mapKey);
    return shown !== null && shown < furthest ? shown : furthest;
  });

  // Walk on to the furthest open level, a tile at a time.
  useEffect(() => {
    saveShown(mapKey, furthest);
    if (mochiAt >= furthest) {
      if (mochiAt > furthest) setMochiAt(furthest);
      return undefined;
    }
    const step = setTimeout(() => setMochiAt((at) => Math.min(furthest, at + 1)), 450);
    return () => clearTimeout(step);
  }, [mochiAt, furthest, mapKey]);

  const at = spots[Math.min(mochiAt, spots.length - 1)];

  return (
    <section className="game-wrap level-map-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        <p className="eyebrow">{text.eyebrow}</p>
        <div className="title-row">
          <h1 id="game-title" lang={language === "zh" ? "zh-Hant-HK" : undefined}>{title}</h1>
          {titleAction}
        </div>
        <p className="heading-note" lang={language === "zh" ? "zh-Hant-HK" : undefined}>{text.note}</p>
        {focus && <p className="level-map-focus">{focus}</p>}
      </div>

      <div className="level-map">
        <svg className="level-map-land" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <path className="level-map-rainbow" d="M-20 70a90 90 0 0 1 180 0" />
          {trees.map(([x, y]) => (
            <g key={`${x}-${y}`} className="level-map-tree">
              <rect x={x - 3} y={y + 2} width="6" height="12" rx="2" />
              <circle cx={x} cy={y} r="13" />
            </g>
          ))}
          {flowers.map(([x, y, colour]) => (
            <g key={`${x}-${y}`} className="level-map-flower">
              {[0, 72, 144, 216, 288].map((angle) => (
                <circle key={angle} cx={x + 5 * Math.cos((angle * Math.PI) / 180)} cy={y + 5 * Math.sin((angle * Math.PI) / 180)} r="3.6" fill={colour} />
              ))}
              <circle cx={x} cy={y} r="2.6" fill="#fff6c8" />
            </g>
          ))}
          <path className="level-map-path" d={path} />
          <path className="level-map-path-stones" d={path} />
        </svg>

        <ol className="level-map-levels">
          {levels.map((level, index) => {
            const locked = !open[index];
            const score = scoreFor(level);
            const done = progressFor(level);
            const perfect = score && score[0] === score[1];
            const label = [
              text.level(index + 1),
              locked ? text.locked(index) : score ? text.score(score[0], score[1]) : done > 0 ? text.done(done, level.words.length) : level.focus?.[language] ?? level.english,
              index === mochiAt ? text.here : null,
            ].filter(Boolean).join(" · ");
            return (
              <li key={level.id} style={{ left: `${(spots[index].x / width) * 100}%`, top: `${(spots[index].y / height) * 100}%` }}>
                <button
                  className={`level-tile category-${level.color}${locked ? " level-tile-locked" : ""}${score ? " level-tile-done" : ""}${perfect ? " level-tile-perfect" : ""}${index === furthest ? " level-tile-next" : ""}`}
                  type="button"
                  disabled={locked}
                  aria-label={label}
                  onClick={() => onSelectLevel(level)}
                >
                  {locked ? <img src="/images/icons/menu-parent.svg" alt="" width="24" height="24" /> : <span className="level-tile-number">{index + 1}</span>}
                </button>
                {score && <span className={`level-tile-score${perfect ? " level-tile-score-perfect" : ""}`} aria-hidden="true">{perfect && "★ "}{score[0]}/{score[1]}</span>}
              </li>
            );
          })}
        </ol>

        <img
          className="level-map-mochi"
          src="/images/mochi/happy.svg"
          alt=""
          width="64"
          height="64"
          style={{ left: `${(at.x / width) * 100}%`, top: `${(at.y / height) * 100}%` }}
        />
      </div>

      <GameFooter>{text.footer}</GameFooter>
    </section>
  );
}
