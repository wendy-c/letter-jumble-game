// Rainbow Speed Quest (彩虹速算站): ten quick sums a round, adding and taking away, within 10 or
// within 20. Each round deals ten at random from every sum there is, and is timed: getting all ten
// right sets a record, and beating it next time earns a bonus of rainbow coins.
import { numberOptions } from "./math-data";

export const speedRecordBonus = 10;

function sumQuestion(a, sign, b) {
  const answer = sign === "+" ? a + b : a - b;
  const text = `${a} ${sign === "+" ? "+" : "−"} ${b} = ?`;
  return {
    prompt: { en: "Quick! What’s the answer?", zh: "快！答案是多少？" },
    picture: null,
    scene: null,
    visual: { type: "equation", text },
    answer: String(answer),
    answers: [text],
    options: numberOptions(answer),
  };
}

// Every adding and taking-away sum up to `limit` (no zeros), keeping only those with a number
// bigger than `above` (so "within 20" doesn't repeat "within 10").
function allSums(limit, above) {
  const sums = [];
  for (let a = 1; a <= limit; a += 1) {
    for (let b = 1; a + b <= limit; b += 1) {
      if (a + b > above) sums.push(sumQuestion(a, "+", b));
    }
    for (let b = 1; b < a; b += 1) {
      if (a > above) sums.push(sumQuestion(a, "−", b));
    }
  }
  return sums;
}

export const speedTopics = [
  { id: "within-10", limit: 10, above: 0, color: "yellow", pattern: ["1", "0"], names: { en: "Within 10", zh: "10 以內" } },
  { id: "within-20", limit: 20, above: 10, color: "blue", pattern: ["2", "0"], names: { en: "Within 20", zh: "20 以內" } },
].map(({ limit, above, ...topic }) => ({
  ...topic,
  name: topic.names.en,
  english: "Adding and taking away",
  focus: { en: "Adding and taking away", zh: "加法和減法" },
  timed: true,
  wordsPerGame: 10,
  words: allSums(limit, above).map((question) => ({ ...question, category: topic.names.en.toUpperCase(), color: topic.color })),
}));
