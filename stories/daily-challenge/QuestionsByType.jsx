// Every Daily Challenge question (K1, K2 and K3, all twenty levels) sorted by type of question,
// for reviewing one type at a time: the cards as a child sees them, two to a row, each labelled
// with its class, level and place in the level. The overview counts each type in each class.
import { mathLevels } from "../../app/math-data/math-data";
import { QuestionGrid } from "./LevelQuestions";

const equation = (question) => (question.visual?.type === "equation" ? question.visual.text : "");
const title = (question) => question.answers[0];

// The types, in roughly the order a child meets them. Each question takes the first that matches.
export const questionTypes = [
  { id: "counting", name: "Counting", about: "Count one kind of thing in a mix: pictures, shapes or leaves.",
    match: (q) => ["count", "shapes", "scatter"].includes(q.scene?.type) || (Boolean(q.picture) && !q.visual && /^(Find|Count) the /.test(title(q))) },
  { id: "bonds", name: "Number bonds", about: "A whole and one part; find the other part.", match: (q) => q.visual?.type === "bond" },
  { id: "frames", name: "Ten frames and making 10", about: "How many more to fill the frame or make the number.",
    match: (q) => q.scene?.type === "frame" || /^Make \d+$|^Fill the egg box$/.test(title(q)) },
  { id: "pad", name: "Sums on the number pad", about: "K3's sums without a picture, typed in.", match: (q) => q.input === "pad" && !q.scene },
  { id: "missing", name: "Missing number in a sum", about: "A sum with a gap that isn't the answer: 8 + ? = 10.",
    match: (q) => /\?/.test(equation(q)) && !/= \?$/.test(equation(q)) },
  { id: "adding", name: "Adding", about: "Add two groups (K3's typed on the number pad).", match: (q) => /\+/.test(equation(q)) },
  { id: "taking", name: "Taking away", about: "Some go: how many are left?", match: (q) => /−/.test(equation(q)) },
  { id: "swaps", name: "Swaps", about: "1 of this is worth so many of that, twice over.",
    match: (q) => q.scene?.type === "swap" || /swap|^Boxes in boxes$/i.test(title(q)) },
  { id: "runs", name: "Number runs", about: "Numbers going up or down in steps, with one missing.",
    match: (q) => q.visual?.type === "sequence" || title(q) === "Growing towers" },
  { id: "order", name: "Putting numbers in order", about: "Smallest to biggest, or biggest to smallest.", match: (q) => q.visual?.type === "cards" },
  { id: "patterns", name: "Picture patterns", about: "What comes next in a row of pictures?", match: (q) => q.visual?.type === "pattern" },
  { id: "grids", name: "Turning grids", about: "Pictures turning round a 2 × 2 grid.", match: (q) => q.visual?.type === "grids" },
  { id: "shading", name: "Shading puzzles", about: "Pairs of grids: the shading moves the same way each time.", match: (q) => q.visual?.type === "shading" },
  { id: "different", name: "The different group", about: "Three groups of odd (or even) numbers and one of the other.", match: (q) => q.visual?.type === "sets" },
  { id: "rows", name: "The row with the most", about: "Which row has the most food, toys or animals?", match: (q) => q.scene?.type === "rows" },
  { id: "legs", name: "Legs and wheels", about: "How many legs or wheels altogether?", match: (q) => /^Count the (legs|wheels)$/.test(title(q)) },
  { id: "stories", name: "Story problems", about: "Things come and go, queues, and little stories with a picture.",
    match: (q) => ["steps", "queue"].includes(q.scene?.type) || (Boolean(q.picture) && !q.visual) },
  { id: "money", name: "Money", about: "Who spent the most, and is there enough money?", match: (q) => ["menu", "coins"].includes(q.scene?.type) },
  { id: "days", name: "Days of the week", about: "So many days before or after a day.", match: (q) => q.scene?.type === "week" },
  { id: "clock", name: "Telling the time", about: "Read the round clock.", match: (q) => q.scene?.type === "clock" },
];

const typeOf = (question) => questionTypes.find((type) => type.match(question))?.id ?? "other";

// Every question with where it comes from.
const allQuestions = mathLevels.flatMap((level) => level.words.map((question, index) => ({
  className: level.ages[0], level, index, question, type: typeOf(question),
})));

const page = { fontFamily: "Fredoka, sans-serif", color: "#3d2b63" };
const muted = { color: "#8a80a6" };
const classes = ["k1", "k2", "k3"];

export function QuestionsByType({ type, classes: shown = classes, language = "en" }) {
  const about = questionTypes.find((item) => item.id === type) ?? { name: "Other", about: "Questions no type matched." };
  const items = allQuestions.filter((item) => item.type === type && shown.includes(item.className));
  const counts = classes.map((name) => `${name.toUpperCase()}: ${items.filter((item) => item.className === name).length}`).join(" · ");
  return (
    <section style={page}>
      <h1 style={{ margin: "0 0 4px", fontSize: 30 }}>{about.name}</h1>
      <p style={{ margin: "0 0 20px", ...muted }}>{about.about} · {items.length} questions ({counts})</p>
      {items.length === 0 ? <p style={muted}>None for the classes chosen.</p> : (
        <QuestionGrid
          items={items.map(({ className, level, index, question }) => {
            const name = level.names?.[language] ?? level.name;
            return {
              key: `${level.id}-${index}`,
              label: `${className.toUpperCase()} · ${level.name} · Question ${index + 1} · ${question.answers[0]} · Answer: ${question.answer}`,
              level: { ...level, name },
              round: index,
              question,
              language,
            };
          })}
        />
      )}
    </section>
  );
}

// A table of how many questions of each type each class has.
export function TypeOverview() {
  const types = [...questionTypes, ...(allQuestions.some((item) => item.type === "other") ? [{ id: "other", name: "Other (no type matched)" }] : [])];
  const count = (type, name) => allQuestions.filter((item) => item.type === type && item.className === name).length;
  const cell = { padding: "8px 14px", borderBottom: "1px solid #e8ddfa", textAlign: "left" };
  return (
    <section style={page}>
      <h1 style={{ margin: "0 0 4px", fontSize: 30 }}>Daily Challenge by type</h1>
      <p style={{ margin: "0 0 20px", ...muted }}>
        {allQuestions.length} questions in all. Each type has its own page in this folder, showing every question of that type.
      </p>
      <table style={{ borderCollapse: "collapse", background: "#fff", borderRadius: 12, fontSize: 15 }}>
        <thead>
          <tr>{["Type", "What it asks", "K1", "K2", "K3", "All"].map((head) => <th key={head} style={cell}>{head}</th>)}</tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type.id}>
              <td style={{ ...cell, fontWeight: 700 }}>{type.name}</td>
              <td style={{ ...cell, ...muted }}>{type.about}</td>
              {classes.map((name) => <td key={name} style={cell}>{count(type.id, name) || "–"}</td>)}
              <td style={{ ...cell, fontWeight: 700 }}>{allQuestions.filter((item) => item.type === type.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
