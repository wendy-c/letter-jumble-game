// Makes the Daily Challenge's later levels (4 to 20 for each age) from question templates, the
// same every time (each level has its own seed). Their pictures are drawn by the game from small
// pictures of things to count (`scene`), rather than one drawing per question.
import { seededRandom } from "../lib/spelling";
import { differentGroup, numberOrder } from "./number-puzzles";

const art = "/images/game-asset";

// Things to count: their picture, English names, Chinese name and measure word, and what happens
// when some of them go (for take-away questions).
const things = {
  cat: { picture: `${art}/animals/cat.svg`, en: ["cat", "cats"], zh: "貓", unit: "隻", gone: ["run away", "跑走了"] },
  dog: { picture: `${art}/animals/dog.svg`, en: ["dog", "dogs"], zh: "狗", unit: "隻", gone: ["run away", "跑走了"] },
  rabbit: { picture: `${art}/animals/rabbit.svg`, en: ["rabbit", "rabbits"], zh: "兔子", unit: "隻", gone: ["hop away", "跳走了"] },
  pig: { picture: `${art}/animals/pig.svg`, en: ["pig", "pigs"], zh: "豬", unit: "隻", gone: ["run away", "跑走了"] },
  sheep: { picture: `${art}/animals/sheep.svg`, en: ["sheep", "sheep"], zh: "綿羊", unit: "隻", gone: ["run away", "跑走了"] },
  goat: { picture: `${art}/animals/goat.svg`, en: ["goat", "goats"], zh: "山羊", unit: "隻", gone: ["run away", "跑走了"] },
  chicken: { picture: `${art}/animals/chicken.svg`, en: ["chicken", "chickens"], zh: "雞", unit: "隻", gone: ["run away", "跑走了"] },
  duck: { picture: `${art}/animals/duck.svg`, en: ["duck", "ducks"], zh: "鴨子", unit: "隻", gone: ["swim away", "游走了"] },
  bird: { picture: `${art}/animals/bird.svg`, en: ["bluebird", "bluebirds"], zh: "藍色小鳥", unit: "隻", gone: ["fly away", "飛走了"] },
  parrot: { picture: `${art}/animals/parrot.svg`, en: ["parrot", "parrots"], zh: "鸚鵡", unit: "隻", gone: ["fly away", "飛走了"] },
  swan: { picture: `${art}/animals/swan.svg`, en: ["swan", "swans"], zh: "天鵝", unit: "隻", gone: ["swim away", "游走了"] },
  bee: { picture: `${art}/animals/bee.svg`, en: ["bee", "bees"], zh: "蜜蜂", unit: "隻", gone: ["fly away", "飛走了"] },
  butterfly: { picture: `${art}/animals/butterfly.svg`, en: ["butterfly", "butterflies"], zh: "蝴蝶", unit: "隻", gone: ["fly away", "飛走了"] },
  dragonfly: { picture: `${art}/animals/dragonfly.svg`, en: ["dragonfly", "dragonflies"], zh: "蜻蜓", unit: "隻", gone: ["fly away", "飛走了"] },
  moth: { picture: `${art}/animals/moth.svg`, en: ["moth", "moths"], zh: "飛蛾", unit: "隻", gone: ["fly away", "飛走了"] },
  frog: { picture: `${art}/animals/frog.svg`, en: ["frog", "frogs"], zh: "青蛙", unit: "隻", gone: ["hop away", "跳走了"] },
  apple: { picture: `${art}/food/apple.svg`, en: ["apple", "apples"], zh: "蘋果", unit: "個", gone: ["are eaten", "被吃掉了"] },
  orange: { picture: `${art}/food/orange.svg`, en: ["orange", "oranges"], zh: "橙", unit: "個", gone: ["are eaten", "被吃掉了"] },
  pear: { picture: `${art}/food/pear.svg`, en: ["pear", "pears"], zh: "啤梨", unit: "個", gone: ["are eaten", "被吃掉了"] },
  cake: { picture: `${art}/food/cake.svg`, en: ["cake", "cakes"], zh: "蛋糕", unit: "個", gone: ["are eaten", "被吃掉了"] },
  ball: { picture: `${art}/starters/ball.svg`, en: ["beach ball", "beach balls"], zh: "沙灘球", unit: "個", gone: ["roll away", "滾走了"] },
  football: { picture: `${art}/starters/football.svg`, en: ["football", "footballs"], zh: "足球", unit: "個", gone: ["roll away", "滾走了"] },
  basketball: { picture: `${art}/starters/basketball.svg`, en: ["basketball", "basketballs"], zh: "籃球", unit: "個", gone: ["roll away", "滾走了"] },
  car: { picture: `${art}/starters/car.svg`, en: ["car", "cars"], zh: "汽車", unit: "架", gone: ["drive away", "開走了"] },
  bus: { picture: `${art}/cvc/bus.svg`, en: ["bus", "buses"], zh: "巴士", unit: "架", gone: ["drive away", "開走了"] },
  truck: { picture: `${art}/blends/truck.svg`, en: ["truck", "trucks"], zh: "貨車", unit: "架", gone: ["drive away", "開走了"] },
  bike: { picture: `${art}/starters/bike.svg`, en: ["bike", "bikes"], zh: "單車", unit: "架", gone: ["are ridden away", "被騎走了"] },
  kite: { picture: `${art}/starters/kite.svg`, en: ["kite", "kites"], zh: "風箏", unit: "隻", gone: ["blow away", "被吹走了"] },
  teddy: { picture: `${art}/starters/teddy-bear.svg`, en: ["teddy bear", "teddy bears"], zh: "熊仔", unit: "隻", gone: ["are put away", "被收起了"] },
  cookie: { picture: `${art}/food/biscuit.svg`, en: ["cookie", "cookies"], zh: "曲奇", unit: "塊", gone: ["are eaten", "被吃掉了"] },
  // The same thing in different colours.
  pinkCircle: { picture: `${art}/math/circle.svg`, en: ["pink circle", "pink circles"], zh: "粉紅色圓形", unit: "個", gone: ["are rubbed out", "被擦掉了"] },
  yellowCircle: { picture: `${art}/math/circle-yellow.svg`, en: ["yellow circle", "yellow circles"], zh: "黃色圓形", unit: "個", gone: ["are rubbed out", "被擦掉了"] },
  blueCircle: { picture: `${art}/math/circle-blue.svg`, en: ["blue circle", "blue circles"], zh: "藍色圓形", unit: "個", gone: ["are rubbed out", "被擦掉了"] },
  redFlower: { picture: `${art}/math/flower-red.svg`, en: ["red flower", "red flowers"], zh: "紅花", unit: "朵", gone: ["are picked", "被摘走了"] },
  yellowFlower: { picture: `${art}/math/flower-yellow.svg`, en: ["yellow flower", "yellow flowers"], zh: "黃花", unit: "朵", gone: ["are picked", "被摘走了"] },
  blueFlower: { picture: `${art}/math/flower-blue.svg`, en: ["blue flower", "blue flowers"], zh: "藍花", unit: "朵", gone: ["are picked", "被摘走了"] },
};

// Things only swapped, never counted.
const swapThings = {
  cow: { picture: `${art}/animals/cow.svg`, en: ["cow", "cows"], zh: "牛", unit: "頭" },
  horse: { picture: `${art}/animals/horse.svg`, en: ["horse", "horses"], zh: "馬", unit: "匹" },
  sweet: { picture: `${art}/food/sweet.svg`, en: ["sweet", "sweets"], zh: "糖果", unit: "粒" },
  chocolate: { picture: `${art}/food/chocolate.svg`, en: ["chocolate bar", "chocolate bars"], zh: "朱古力", unit: "排" },
  watermelon: { picture: `${art}/food/watermelon.svg`, en: ["watermelon", "watermelons"], zh: "西瓜", unit: "個" },
  pineapple: { picture: `${art}/food/pineapple.svg`, en: ["pineapple", "pineapples"], zh: "菠蘿", unit: "個" },
  robot: { picture: `${art}/starters/robot.svg`, en: ["robot", "robots"], zh: "機械人", unit: "個" },
  doll: { picture: `${art}/starters/doll.svg`, en: ["doll", "dolls"], zh: "洋娃娃", unit: "個" },
};
// Kinds of things that belong together (pets, farm animals, birds, bugs, fruit, balls, vehicles,
// toys), each sharing a measure word so they can be counted together in Chinese. A picture with
// more than one kind of thing only ever mixes kinds from one of these.
const categories = [
  ["cat", "dog", "rabbit"], ["pig", "sheep", "goat", "chicken"], ["duck", "bird", "parrot", "swan"],
  ["bee", "butterfly", "dragonfly", "moth"], ["apple", "orange", "pear"], ["ball", "football", "basketball"],
  ["car", "bus", "truck", "bike"], ["teddy", "kite"],
  ["pinkCircle", "yellowCircle", "blueCircle"], ["redFlower", "yellowFlower", "blueFlower"],
];
// Things to swap for each other, one kind at a time (snacks, fruit, farm animals, toys), biggest
// first: a swap always gives more of a smaller thing for one of a bigger one.
const swapSets = [
  ["cake", "chocolate", "cookie", "sweet"], ["watermelon", "pineapple", "apple", "orange"],
  ["horse", "cow", "goat", "chicken"], ["robot", "doll", "teddy", "ball"],
];
const swapThing = (id) => things[id] ?? swapThings[id];

// Pattern pieces (the same pictures as the hand-made levels' patterns).
const pieces = {
  butterfly: [`${art}/animals/butterfly.svg`, "蝴蝶"],
  bee: [`${art}/animals/bee.svg`, "蜜蜂"],
  apple: [`${art}/food/apple.svg`, "蘋果"],
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

// Sets of four for the turning-grid puzzles: [picture, English name, Chinese name].
const gridSets = {
  sweets: [[`${art}/math/candy-box.svg`, "purple sweet", "紫色糖果"], [`${art}/math/candy-dots.svg`, "green sweet", "綠色糖果"],
    [`${art}/math/candy-heart.svg`, "heart sweet", "心心糖果"], [`${art}/math/candy-star.svg`, "star sweet", "星星糖果"]],
  animals: [[`${art}/animals/cat.svg`, "cat", "貓"], [`${art}/animals/duck.svg`, "duck", "鴨子"],
    [`${art}/animals/frog.svg`, "frog", "青蛙"], [`${art}/animals/pig.svg`, "pig", "豬"]],
  shapes: [[`${art}/math/circle.svg`, "circle", "圓形"], [`${art}/math/square.svg`, "square", "正方形"],
    [`${art}/math/triangle.svg`, "triangle", "三角形"], [`${art}/math/star.svg`, "star", "星形"]],
  fruit: [[`${art}/food/apple.svg`, "apple", "蘋果"], [`${art}/math/banana.svg`, "banana", "香蕉"],
    [`${art}/math/grapes.svg`, "grapes", "提子"], [`${art}/food/strawberry.svg`, "strawberry", "士多啤梨"]],
};

// A 2 × 2 grid's four things going round it: top left, top right, bottom right, bottom left.
// Each turn moves them all one place clockwise or anticlockwise, or two places (a half turn).
const turns = {
  clockwise: (ring) => [ring[3], ring[0], ring[1], ring[2]],
  anticlockwise: (ring) => [ring[1], ring[2], ring[3], ring[0]],
  half: (ring) => [ring[2], ring[3], ring[0], ring[1]],
};
// The order a grid's cells are shown in: top left, top right, bottom left, bottom right.
const cellsOf = (ring) => [ring[0], ring[1], ring[3], ring[2]];

// A turning-grid puzzle: three 2 × 2 grids, each turned from the one before, then a fourth with
// some cells empty (`blanks`, by cell). The choices are whole grids: the right one, one turned
// the other way, one not turned at all, and one with the missing things swapped round.
export function gridPattern({ set, turn, blanks, start = [0, 1, 2, 3] }) {
  const items = gridSets[set];
  const rings = [start];
  for (let step = 0; step < 3; step += 1) rings.push(turns[turn](rings[step]));
  const grids = rings.map(cellsOf);
  const answer = grids[3];
  const other = turn === "anticlockwise" ? "clockwise" : "anticlockwise";
  const swapped = [...answer];
  if (blanks.length >= 2) [swapped[blanks[0]], swapped[blanks[1]]] = [swapped[blanks[1]], swapped[blanks[0]]];
  const candidates = [answer, cellsOf(turns[other](rings[2])), grids[2], swapped, cellsOf(turns.half(rings[2])), cellsOf(turns.clockwise(rings[3]))];
  const seen = new Set();
  const choices = candidates.filter((cells) => {
    const key = cells.join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
  const label = (cells) => cells.map((index) => items[index][1]).join(" | ");
  const option = (cells) => ({
    label: label(cells),
    cells: cells.map((index) => items[index][0]),
    name: { en: cells.map((index) => items[index][1]).join(", "), zh: cells.map((index) => items[index][2]).join("、") },
    correct: cells === answer,
  });
  return {
    prompt: { en: "The pictures turn round the grid. Which grid comes next?", zh: "圖畫在格子裏轉動。下一個格子應該是怎樣的？" },
    picture: null,
    scene: null,
    visual: {
      type: "grids",
      grids: grids.slice(0, 3).map((cells) => cells.map((index) => items[index][0])),
      last: answer.map((index, cell) => (blanks.includes(cell) ? null : items[index][0])),
    },
    answer: label(answer),
    answers: [`Turning grid (${set})`],
    options: choices.map(option),
  };
}

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
export function makers(random) {
  const between = (low, high) => low + Math.floor(random() * (high - low + 1));
  // The smallest "big" number a level uses, so later levels don't ask easy sums.
  const low = (n) => Math.max(3, Math.ceil(n / 2));
  const pick = (list) => list[Math.floor(random() * list.length)];
  // A shuffle that comes out the same in every browser (sorting with a random comparator doesn't:
  // each JavaScript engine sorts its own way).
  const mix = (list) => list.map((item) => [random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
  // Two different kinds of thing from one category.
  const twoThings = () => {
    const category = pick(categories);
    const first = pick(category);
    return [things[first], things[pick(category.filter((id) => id !== first))]];
  };

  // Two groups of things of one category (or one thing in two colours) to add, each in its own
  // group; `perRow` is how many a row (left out: 5, or 10 for a group of more than 10).
  function sumOf(a, b, perRow = null) {
    const [x, y] = twoThings();
    return question({
      prompt: {
        en: `${a} ${plural(x, a)} and ${b} ${plural(y, b)}. How many altogether?`,
        zh: `${a} ${x.unit}${x.zh}和 ${b} ${y.unit}${y.zh}，一共有多少${x.unit}？`,
      },
      answer: a + b,
      title: `${a} + ${b} = ?`,
      scene: { type: "groups", groups: [{ picture: x.picture, count: a }, { picture: y.picture, count: b }].map((group) => (perRow ? { ...group, perRow } : group)) },
      visual: { type: "equation", text: `${a} + ${b} = ?` },
    });
  }

  return {
    sumOf,
    // A number bond, with a picture of its two parts (each kind in its own row) when the whole is
    // at least `pictureFrom`.
    bond(n, pictureFrom = 0) {
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
        scene: whole >= pictureFrom ? { type: "groups", groups: [{ picture: a.picture, count: part }, { picture: b.picture, count: whole - part }] } : null,
        visual: { type: "bond", whole, parts: [part, null] },
      });
    },
    count(n) {
      const kinds = pick(categories.filter((list) => list.length > 2));
      const [target, ...others] = mix(kinds).slice(0, 3);
      const answer = between(Math.max(2, low(n) - 2), n);
      const items = mix([
        ...Array(answer).fill(things[target].picture),
        ...others.flatMap((id) => Array(between(1, 3)).fill(things[id].picture)),
      ]);
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
      // K1's and K2's groups wrap at 5 a row.
      return sumOf(a, total - a, 5);
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
    // The 5-6 year olds' patterns: turning grids, a quarter turn one way at first, then either
    // way, then half turns with three cells to fill.
    grid(level) {
      const turn = level < 7 ? "clockwise" : level < 14 ? pick(["clockwise", "anticlockwise"]) : pick(["clockwise", "anticlockwise", "half"]);
      const cells = mix([0, 1, 2, 3]);
      const blanks = cells.slice(0, level < 14 ? 2 : 3).sort();
      const start = mix([0, 1, 2, 3]);
      return gridPattern({ set: pick(Object.keys(gridSets)), turn, blanks, start });
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
      const set = pick(swapSets);
      const [x, y, z] = mix([0, 1, 2, 3]).slice(0, 3).sort((a, b) => a - b).map((index) => swapThing(set[index]));
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

// A level's ten questions. K1's levels count up to 10 (more as they go on); K2's count to 20, with
// missing numbers, swaps, turning grids and number puzzles too, and number bonds under 10 without a
// picture.
export function generateLevel(age, level) {
  // Seeded by the set's old name ("3-4", "5-6").
  const random = seededRandom(`daily-challenge:${{ k1: "3-4", k2: "5-6" }[age]}:${level}`);
  const make = makers(random);
  if (age === "k1") {
    const n = Math.min(10, 4 + Math.ceil(level / 3));
    return [
      make.bond(n), make.count(n), make.frame(n), make.sum(n), make.difference(n),
      make.sequence(n, level), make.pattern(level), make.difference(n), make.sum(n), make.sequence(n, level),
    ];
  }
  const n = Math.min(20, 10 + Math.ceil(level / 2));
  const questions = [
    make.count(Math.min(n, 15)), make.sequence(n, level), make.grid(level), make.sum(n), make.missingAddend(n),
    make.frame(n), make.swap(n), make.difference(n),
  ];
  // The ninth question: picture patterns (the harder kinds) before Level 10 and the different
  // group (to 20) after it, with putting numbers (under 50) in order every third level; Level 10
  // has a second take-away.
  const ninth = level % 3 === 0 ? numberOrder(random, { max: 49 })
    : level < 10 ? make.pattern(level + 8)
      : level === 10 ? make.difference(n) : differentGroup(random, { max: 19 });
  return [...questions, ninth, make.bond(n, 10)];
}
