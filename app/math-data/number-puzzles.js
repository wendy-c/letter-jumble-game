// Number puzzles shared by K2's and K3's Daily Challenge levels: putting four numbers in order,
// and finding the different group of numbers (three groups of odd numbers and one of even, or the
// other way round). `random` is the level's seeded random; `max` is the biggest number used.

const say = (en, zh) => ({ en, zh });

function helpers(random) {
  const between = (low, high) => low + Math.floor(random() * (high - low + 1));
  const mix = (list) => list.map((item) => [random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
  return { between, mix };
}

// Text choices: `label` is the answer key, `name` what's shown and `reveal` the "not quite" card's.
const textOptions = (choices, answer) => choices.map(([label, name, reveal]) => ({
  label, name, ...(reveal && { reveal }), correct: label === answer,
}));

// Four numbers to put in order, smallest first (or biggest first). To 100, each has its own tens
// digit (two share one with `sameTens`); below that, any four different numbers from 10 to `max`.
export function numberOrder(random, { max = 99, sameTens = false } = {}) {
  const { between, mix } = helpers(random);
  let numbers;
  do {
    if (max >= 99) {
      const tens = mix([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      numbers = [between(1, 9), between(1, 9), between(0, 9), between(1, 9)].map((ones, index) => tens[index] * 10 + ones);
      if (sameTens) numbers[1] = Math.floor(numbers[0] / 10) * 10 + ((numbers[0] + between(1, 8)) % 10);
    } else {
      numbers = [0, 1, 2, 3].map(() => between(10, max));
    }
  } while (new Set(numbers).size < 4);
  const down = random() < 0.5;
  const sorted = [...numbers].sort((a, b) => (down ? b - a : a - b));
  const swap = (list, i, j) => { const copy = [...list]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy; };
  // A likely mistake: going by the ones digit instead of the tens.
  const byOnes = [...numbers].sort((a, b) => (down ? -1 : 1) * ((a % 10) - (b % 10) || a - b));
  const candidates = [sorted, swap(sorted, 0, 1), swap(sorted, 2, 3), byOnes, swap(sorted, 1, 2), [...sorted].reverse()];
  const seen = new Set();
  const choices = candidates.map((list) => list.join(", ")).filter((text) => !seen.has(text) && seen.add(text)).slice(0, 4);
  const answer = sorted.join(", ");
  return {
    prompt: down
      ? say("Which row puts the numbers in order from biggest to smallest?", "哪一行把數字由大至小排列？")
      : say("Which row puts the numbers in order from smallest to biggest?", "哪一行把數字由小至大排列？"),
    picture: null,
    scene: null,
    visual: { type: "cards", numbers },
    answer,
    answers: [down ? "Biggest to smallest" : "Smallest to biggest"],
    options: textOptions(choices.map((text) => [text, say(text, text)]), answer),
  };
}

// Four lettered groups of four numbers going up in twos, all from 1 to `max`: three odd and one
// even, or the other way round. With room for it (`max` of 40 or more), no two groups share a
// number; below that they can, but are never the same.
export function differentGroup(random, { max }) {
  const { mix } = helpers(random);
  const oddOne = random() < 0.5;
  // Starts that keep a group's last number (start + 6) within `max`.
  const startsOf = (odd) => Array.from({ length: max }, (_, n) => n + 1).filter((n) => n % 2 === (odd ? 1 : 0) && n + 6 <= max);
  const apart = (starts) => starts.every((start, index) => starts.slice(index + 1).every((other) => Math.abs(start - other) > 7));
  let groups;
  for (let tries = 0; ; tries += 1) {
    const [different] = mix(startsOf(oddOne));
    const others = mix(startsOf(!oddOne)).slice(0, 3);
    groups = [different, ...others].map((start) => [0, 1, 2, 3].map((n) => start + n * 2));
    if (max < 40 || apart([different, ...others]) || tries > 50) break;
  }
  const letters = ["A", "B", "C", "D"];
  const shown = mix(groups);
  const answer = letters[shown.indexOf(groups[0])];
  const kind = oddOne ? say("odd", "單數") : say("even", "雙數");
  return {
    prompt: say("Which group of numbers is different from the others?", "哪一組數字跟其他的不同？"),
    picture: null,
    scene: null,
    visual: { type: "sets", sets: shown.map((numbers, index) => ({ letter: letters[index], numbers })) },
    answer,
    answers: ["The different group"],
    options: textOptions(shown.map((numbers, index) => [letters[index], say(letters[index], letters[index]),
      say(`${letters[index]}: ${numbers.join(", ")} (${kind.en} numbers)`, `${letters[index]}：${numbers.join("、")}（${kind.zh}）`)]), answer),
  };
}
