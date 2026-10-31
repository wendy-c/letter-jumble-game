// Makes the Daily Challenge's later levels (4 to 20 for each age) from question templates, the
// same every time (each level has its own seed). Their pictures are drawn by the game from small
// pictures of things to count (`scene`), rather than one drawing per question.
import { seededRandom } from "./lib/spelling";

const art = "/images/game-asset";

// Things to count: their picture, English names, Chinese name and measure word, and what happens
// when some of them go (for take-away questions).
const things = {
  cat: { picture: `${art}/animals/cat.svg`, en: ["cat", "cats"], zh: "貓", unit: "隻", gone: ["run away", "跑走了"] },
  duck: { picture: `${art}/animals/duck.svg`, en: ["duck", "ducks"], zh: "鴨子", unit: "隻", gone: ["swim away", "游走了"] },
  frog: { picture: `${art}/animals/frog.svg`, en: ["frog", "frogs"], zh: "青蛙", unit: "隻", gone: ["hop away", "跳走了"] },
  bee: { picture: `${art}/animals/bee.svg`, en: ["bee", "bees"], zh: "蜜蜂", unit: "隻", gone: ["fly away", "飛走了"] },
  butterfly: { picture: `${art}/animals/butterfly.svg`, en: ["butterfly", "butterflies"], zh: "蝴蝶", unit: "隻", gone: ["fly away", "飛走了"] },
  bird: { picture: `${art}/animals/bird.svg`, en: ["bird", "birds"], zh: "小鳥", unit: "隻", gone: ["fly away", "飛走了"] },
  rabbit: { picture: `${art}/animals/rabbit.svg`, en: ["rabbit", "rabbits"], zh: "兔子", unit: "隻", gone: ["hop away", "跳走了"] },
  pig: { picture: `${art}/animals/pig.svg`, en: ["pig", "pigs"], zh: "豬", unit: "隻", gone: ["run away", "跑走了"] },
  apple: { picture: `${art}/math/apple.svg`, en: ["apple", "apples"], zh: "蘋果", unit: "個", gone: ["are eaten", "被吃掉了"] },
  cake: { picture: `${art}/food/cake.svg`, en: ["cake", "cakes"], zh: "蛋糕", unit: "個", gone: ["are eaten", "被吃掉了"] },
  ball: { picture: `${art}/starters/ball.svg`, en: ["ball", "balls"], zh: "球", unit: "個", gone: ["roll away", "滾走了"] },
  car: { picture: `${art}/starters/car.svg`, en: ["car", "cars"], zh: "汽車", unit: "架", gone: ["drive away", "開走了"] },
  kite: { picture: `${art}/starters/kite.svg`, en: ["kite", "kites"], zh: "風箏", unit: "隻", gone: ["blow away", "被吹走了"] },
  teddy: { picture: `${art}/starters/teddy-bear.svg`, en: ["teddy bear", "teddy bears"], zh: "熊仔", unit: "隻", gone: ["are put away", "被收起了"] },
  cookie: { picture: `${art}/food/biscuit.svg`, en: ["cookie", "cookies"], zh: "曲奇", unit: "塊", gone: ["are eaten", "被吃掉了"] },
};
// Things that share a measure word, so two kinds can be counted together in Chinese.
const families = [["cat", "duck", "frog", "bee", "butterfly", "bird", "rabbit", "pig"], ["apple", "cake", "ball"], ["teddy", "kite"], ["car"], ["cookie"]];
// Things it makes sense to swap for each other.
const swappable = ["apple", "cake", "cookie", "ball", "kite", "teddy"];

// Pattern pieces (the same pictures as the hand-made levels' patterns).
const pieces = {
  butterfly: [`${art}/animals/butterfly.svg`, "蝴蝶"],
  bee: [`${art}/animals/bee.svg`, "蜜蜂"],
  apple: [`${art}/math/apple.svg`, "蘋果"],
  banana: [`${art}/math/banana.svg`, "香蕉"],
  grapes: [`${art}/math/grapes.svg`, "提子"],
  circle: [`${art}/math/circle.svg`, "圓形"],
  square: [`${art}/math/square.svg`, "正方形"],
  triangle: [`${art}/math/triangle.svg`, "三角形"],
  sock: [`${art}/clothes/socks.svg`, "襪子"],
  shoe: [`${art}/clothes/shoes.svg`, "鞋"],
  hat: [`${art}/clothes/hat.svg`, "帽子"],
  "red flower": [`${art}/math/flower-red.svg`, "紅花"],
  "yellow flower": [`${art}/math/flower-yellow.svg`, "黃花"],
  "blue flower": [`${art}/math/flower-blue.svg`, "藍花"],
  up: [`${art}/math/arrow-up.svg`, "向上"],
  right: [`${art}/math/arrow-right.svg`, "向右"],
  down: [`${art}/math/arrow-down.svg`, "向下"],
  left: [`${art}/math/arrow-left.svg`, "向左"],
};
const piece = (name) => ({ picture: pieces[name][0], name: { en: name, zh: pieces[name][1] } });
const pieceSets = [
  ["butterfly", "bee", "apple"], ["apple", "banana", "grapes"], ["circle", "square", "triangle"], ["sock", "shoe", "hat"],
  ["red flower", "yellow flower", "blue flower"], ["up", "right", "down"],
];

const plural = (thing, count) => thing.en[count === 1 ? 0 : 1];

// "fly away" for several, "flies away" for one (and "are eaten", "is eaten").
function goneFor(phrase, count) {
  if (count !== 1) return phrase;
  if (phrase.startsWith("are ")) return `is ${phrase.slice(4)}`;
  const [verb, ...rest] = phrase.split(" ");
  const one = /[^aeiou]y$/.test(verb) ? `${verb.slice(0, -1)}ies` : `${verb}s`;
  return [one, ...rest].join(" ");
}

// The right number and three close to it (never below zero).
function numberOptions(answer) {
  const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, answer + 4].filter((n) => n >= 0).slice(0, 3);
  return [answer, ...near].map((n) => ({ label: String(n), correct: n === answer }));
}

const question = ({ prompt, answer, title, scene = null, visual = null }) => ({
  prompt, picture: null, scene, visual, answer: String(answer), answers: [title], options: numberOptions(answer),
});

// One question maker per kind of question; `n` is the biggest number the level uses.
function makers(random) {
  const between = (low, high) => low + Math.floor(random() * (high - low + 1));
  // The smallest "big" number a level uses, so later levels don't ask easy sums.
  const low = (n) => Math.max(3, Math.ceil(n / 2));
  const pick = (list) => list[Math.floor(random() * list.length)];
  // Two different things that share a measure word.
  const twoThings = () => {
    const family = pick(families.filter((list) => list.length > 1));
    const first = pick(family);
    return [things[first], things[pick(family.filter((id) => id !== first))]];
  };

  return {
    bond(n) {
      const whole = between(low(n), n);
      const part = between(1, whole - 1);
      const [a, b] = twoThings();
      return question({
        prompt: {
          en: `There are ${whole} ${a.en[1]} and ${b.en[1]}. ${part} ${part === 1 ? "is a" : "are"} ${plural(a, part)}. How many are ${b.en[1]}?`,
          zh: `${a.zh}和${b.zh}一共有 ${whole} ${a.unit}，其中 ${part} ${a.unit}是${a.zh}。有多少${b.unit}${b.zh}？`,
        },
        answer: whole - part,
        title: `Number bond of ${whole}`,
        scene: { type: "groups", groups: [{ picture: a.picture, count: part }, { picture: b.picture, count: whole - part }] },
        visual: { type: "bond", whole, parts: [part, null] },
      });
    },
    count(n) {
      const kinds = pick(families.filter((list) => list.length > 2));
      const [target, ...others] = [...kinds].sort(() => random() - 0.5).slice(0, 3);
      const answer = between(Math.max(2, low(n) - 2), n);
      const items = [
        ...Array(answer).fill(things[target].picture),
        ...others.flatMap((id) => Array(between(1, 3)).fill(things[id].picture)),
      ].sort(() => random() - 0.5);
      const thing = things[target];
      return question({
        prompt: { en: `How many ${thing.en[1]} can you find?`, zh: `你能找到多少${thing.unit}${thing.zh}？` },
        answer,
        title: `Count the ${thing.en[1]}`,
        scene: { type: "count", items },
      });
    },
    frame(n) {
      const size = n > 10 ? 20 : n >= 8 ? 10 : 5;
      const filled = between(Math.max(1, size - 9), size - 1);
      const thing = things[pick(["apple", "ball", "cookie", "duck", "cake"])];
      return question({
        prompt: { en: `How many more ${thing.en[1]} to make ${size}?`, zh: `還要多少${thing.unit}${thing.zh}才夠 ${size} ${thing.unit}？` },
        answer: size - filled,
        title: `Make ${size}`,
        scene: { type: "frame", size, filled, picture: thing.picture },
      });
    },
    sum(n) {
      const total = between(low(n), n);
      const a = between(1, total - 1);
      const b = total - a;
      const [x, y] = twoThings();
      return question({
        prompt: {
          en: `${a} ${plural(x, a)} and ${b} ${plural(y, b)}. How many altogether?`,
          zh: `${a} ${x.unit}${x.zh}和 ${b} ${y.unit}${y.zh}，一共有多少${x.unit}？`,
        },
        answer: a + b,
        title: `${a} + ${b} = ?`,
        scene: { type: "groups", groups: [{ picture: x.picture, count: a }, { picture: y.picture, count: b }] },
        visual: { type: "equation", text: `${a} + ${b} = ?` },
      });
    },
    difference(n) {
      const a = between(low(n), n);
      const b = between(1, a - 1);
      const thing = things[pick(Object.keys(things))];
      return question({
        prompt: {
          en: `There are ${a} ${plural(thing, a)}. ${b} ${goneFor(thing.gone[0], b)}. How many are left?`,
          zh: `有 ${a} ${thing.unit}${thing.zh}，${b} ${thing.unit}${thing.gone[1]}。還剩多少${thing.unit}？`,
        },
        answer: a - b,
        title: `${a} − ${b} = ?`,
        scene: { type: "groups", groups: [{ picture: thing.picture, count: a, crossed: b }] },
        visual: { type: "equation", text: `${a} − ${b} = ?` },
      });
    },
    sequence(n, level) {
      const steps = level < 8 ? [1] : level < 14 ? [1, -1, 2] : [1, -1, 2, -2, 3];
      const step = pick(steps.filter((value) => Math.abs(value) * 4 < n));
      const first = step > 0 ? between(0, n - step * 4) : between(-step * 4, n);
      const items = [0, 1, 2, 3, 4].map((index) => first + step * index);
      const gap = between(1, level < 10 ? 3 : 4);
      const shown = items.map((value, index) => (index === gap ? null : value));
      return question({
        prompt: { en: "Which number is missing?", zh: "缺少了哪個數字？" },
        answer: items[gap],
        title: shown.map((item) => item ?? "?").join(", "),
        visual: { type: "sequence", items: shown },
      });
    },
    pattern(level) {
      const set = pick(pieceSets);
      const units = level < 6 ? ["AB"] : level < 12 ? ["AB", "AAB", "ABB"] : ["AAB", "ABB", "ABC", "AABB"];
      const unit = pick(units);
      const letters = { A: set[0], B: set[1], C: set[2] };
      const run = Array.from({ length: unit.length * 2 + 1 }, (_, index) => letters[unit[index % unit.length]]);
      const answer = run[run.length - 1];
      const items = [...run.slice(0, -1), null];
      return {
        prompt: { en: "What comes next?", zh: "下一個是甚麼？" },
        picture: null,
        scene: null,
        visual: { type: "pattern", items: items.map((item) => item && piece(item)) },
        answer,
        answers: [`Pattern: ${items.map((item) => item ?? "?").join(", ")}`],
        options: set.map((choice) => ({ label: choice, ...piece(choice), correct: choice === answer })),
      };
    },
    missingAddend(n) {
      const total = between(low(n), n);
      const a = between(1, total - 1);
      return question({
        prompt: { en: "Which number makes it right?", zh: "哪個數字可以令算式正確？" },
        answer: total - a,
        title: `${a} + ? = ${total}`,
        visual: { type: "equation", text: `${a} + ? = ${total}` },
      });
    },
    swap(n) {
      const [x, y, z] = [...swappable].sort(() => random() - 0.5).slice(0, 3).map((id) => things[id]);
      let first = between(2, 3);
      let second = between(2, 4);
      while (first * second > n) second -= 1;
      return question({
        prompt: {
          en: `1 ${x.en[0]} is worth ${first} ${y.en[1]}. 1 ${y.en[0]} is worth ${second} ${z.en[1]}. How many ${z.en[1]} is 1 ${x.en[0]} worth?`,
          zh: `1 ${x.unit}${x.zh}可以換 ${first} ${y.unit}${y.zh}，1 ${y.unit}${y.zh}可以換 ${second} ${z.unit}${z.zh}。1 ${x.unit}${x.zh}可以換多少${z.unit}${z.zh}？`,
        },
        answer: first * second,
        title: "Swap",
        scene: { type: "swap", rows: [
          { from: x.picture, to: y.picture, count: first },
          { from: y.picture, to: z.picture, count: second },
          { from: x.picture, to: z.picture, count: null },
        ] },
      });
    },
  };
}

// A level's ten questions. The younger children's levels count up to 10 (more as they go on);
// the older children's count to 20, with missing numbers and swaps too.
export function generateLevel(age, level) {
  const random = seededRandom(`daily-challenge:${age}:${level}`);
  const make = makers(random);
  if (age === "3-4") {
    const n = Math.min(10, 4 + Math.ceil(level / 3));
    return [
      make.bond(n), make.count(n), make.frame(n), make.sum(n), make.difference(n),
      make.sequence(n, level), make.pattern(level), make.difference(n), make.sum(n), make.sequence(n, level),
    ];
  }
  const n = Math.min(20, 10 + Math.ceil(level / 2));
  return [
    make.count(Math.min(n, 15)), make.sequence(n, level), make.pattern(level), make.sum(n), make.missingAddend(n),
    make.frame(n), make.swap(n), make.difference(n), make.difference(n), make.bond(n),
  ];
}
