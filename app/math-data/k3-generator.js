// Makes K3's twenty Daily Challenge levels, the same every time (each level has its own seed).
// Every level has ten questions, in a mixed-up order: one count of shapes or leaves, two little
// stories (things coming and going, a queue, swapping animals), two sums or number bonds typed on
// a number pad, two about numbers to 100 (runs with a gap, odd and even, putting in order), two
// logic puzzles and one about everyday things (prices, coins, days of the week, the time).
import { seededRandom } from "../lib/spelling";
import { gridPattern, makers as k2Makers } from "./math-generator";
import { differentGroup, numberOrder } from "./number-puzzles";

const art = "/images/game-asset";
const say = (en, zh) => ({ en, zh });

// The right number and three close to it (never below zero); `step` puts two of them a step away,
// for runs that go up in twos, fives or tens.
function numberOptions(answer, step = 1) {
  const near = [answer + step, answer - step, answer + 1, answer - 1, answer + 2, answer + step * 2]
    .filter((n, index, list) => n >= 0 && n !== answer && list.indexOf(n) === index).slice(0, 3);
  return [answer, ...near].map((n) => ({ label: String(n), correct: n === answer }));
}

const question = ({ prompt, answer, title, scene = null, visual = null, options = null, input = null }) => ({
  prompt, picture: null, scene, visual, answer: String(answer), answers: [title],
  options: options ?? numberOptions(Number(answer)), ...(input && { input }),
});

// Text choices (days, times, rows, groups): `label` is the answer key, `name` what's shown.
const textOptions = (choices, answer) => choices.map(([label, name, reveal]) => ({
  label, name, ...(reveal && { reveal }), correct: label === answer,
}));

const leaves = {
  maple: { picture: `${art}/math/leaf-maple.svg`, en: "maple leaves", zh: "楓葉", unit: "片" },
  spotted: { picture: `${art}/math/leaf-spotted.svg`, en: "spotted leaves", zh: "有斑點的葉子", unit: "片" },
  fern: { picture: `${art}/math/leaf-fern.svg`, en: "fern leaves", zh: "蕨葉", unit: "片" },
  plain: { picture: `${art}/math/leaf-plain.svg`, en: "plain green leaves", zh: "淺綠色的葉子", unit: "片" },
  sprout: { picture: `${art}/blends/sprout.svg`, en: "sprouts", zh: "幼苗", unit: "棵" },
};

const shapeNames = {
  circle: say("circles", "圓形"), square: say("squares", "正方形"), triangle: say("triangles", "三角形"),
};

// Things that come and go, where they are, and what they do.
const movers = {
  car: { picture: `${art}/starters/car.svg`, en: ["car", "cars"], zh: "汽車", unit: "架", place: ["in the car park", "停車場"], go: ["drive away", "開走了"], come: ["drive in", "駛進來"] },
  bird: { picture: `${art}/animals/bird.svg`, en: ["bird", "birds"], zh: "小鳥", unit: "隻", place: ["in the tree", "樹上"], go: ["fly away", "飛走了"], come: ["fly in", "飛來了"] },
  duck: { picture: `${art}/animals/duck.svg`, en: ["duck", "ducks"], zh: "鴨子", unit: "隻", place: ["in the pond", "池塘裏"], go: ["swim away", "游走了"], come: ["swim over", "游過來"] },
  child: { picture: `${art}/starters/child.svg`, en: ["child", "children"], zh: "小朋友", unit: "個", place: ["in the playground", "遊樂場"], go: ["go home", "回家了"], come: ["come to play", "來玩"] },
  rabbit: { picture: `${art}/animals/rabbit.svg`, en: ["rabbit", "rabbits"], zh: "兔子", unit: "隻", place: ["in the garden", "花園裏"], go: ["hop away", "跳走了"], come: ["hop in", "跳進來"] },
};

const animals = {
  rabbit: { picture: `${art}/animals/rabbit.svg`, en: "rabbit", zh: "兔子" },
  cat: { picture: `${art}/animals/cat.svg`, en: "cat", zh: "貓" },
  pig: { picture: `${art}/animals/pig.svg`, en: "pig", zh: "豬" },
  duck: { picture: `${art}/animals/duck.svg`, en: "duck", zh: "鴨子" },
  frog: { picture: `${art}/animals/frog.svg`, en: "frog", zh: "青蛙" },
  panda: { picture: `${art}/animals/panda.svg`, en: "panda", zh: "熊貓" },
};

// Farm animals to swap, biggest first.
const farm = {
  horse: { picture: `${art}/animals/horse.svg`, en: ["horse", "horses"], zh: "馬", unit: "匹" },
  cow: { picture: `${art}/animals/cow.svg`, en: ["cow", "cows"], zh: "牛", unit: "頭" },
  goat: { picture: `${art}/animals/goat.svg`, en: ["goat", "goats"], zh: "山羊", unit: "隻" },
  pig: { picture: `${art}/animals/pig.svg`, en: ["pig", "pigs"], zh: "豬", unit: "隻" },
  chicken: { picture: `${art}/animals/chicken.svg`, en: ["chicken", "chickens"], zh: "雞", unit: "隻" },
};
const swapChains = [["cow", "goat", "chicken"], ["horse", "cow", "goat"], ["cow", "pig", "chicken"], ["horse", "goat", "chicken"]];

// Legs and wheels: each thing's picture, names, measure word and how many it has.
const legged = {
  dog: { picture: `${art}/math/legs-dog.svg`, en: ["dog", "dogs"], zh: "狗", unit: "隻", count: 4 },
  child: { picture: `${art}/math/legs-child.svg`, en: ["child", "children"], zh: "小朋友", unit: "個", count: 2 },
  elephant: { picture: `${art}/math/legs-elephant.svg`, en: ["elephant", "elephants"], zh: "大象", unit: "隻", count: 4 },
  bird: { picture: `${art}/animals/bird.svg`, en: ["bird", "birds"], zh: "小鳥", unit: "隻", count: 2 },
  ant: { picture: `${art}/math/legs-ant.svg`, en: ["ant", "ants"], zh: "螞蟻", unit: "隻", count: 6 },
};
const wheeled = {
  raceCar: { picture: `${art}/math/race-car.svg`, en: ["race car", "race cars"], zh: "賽車", unit: "架", count: 4 },
  bike: { picture: `${art}/starters/bike.svg`, en: ["bike", "bikes"], zh: "單車", unit: "架", count: 2 },
  motorbike: { picture: `${art}/starters/motorbike.svg`, en: ["motorbike", "motorbikes"], zh: "電單車", unit: "架", count: 2 },
  tricycle: { picture: `${art}/math/tricycle.svg`, en: ["tricycle", "tricycles"], zh: "三輪車", unit: "架", count: 3 },
  helicopter: { picture: `${art}/starters/helicopter.svg`, en: ["helicopter", "helicopters"], zh: "直升機", unit: "架", count: 0 },
  rocket: { picture: `${art}/math/rocket.svg`, en: ["rocket", "rockets"], zh: "火箭", unit: "枚", count: 0 },
};

// Things for the "which row has the most …?" puzzle, by kind.
const kinds = {
  food: { en: "food", zh: "食物", items: ["food/burger", "food/fries", "food/ice-cream", "food/pie", "food/bread", "math/apple", "math/banana", "food/cake"] },
  toys: { en: "toys", zh: "玩具", items: ["starters/ball", "starters/kite", "starters/teddy-bear", "starters/doll", "starters/robot"] },
  animals: { en: "animals", zh: "動物", items: ["animals/cat", "animals/dog", "animals/duck", "animals/pig", "animals/rabbit", "animals/frog"] },
};

// Food with prices, for the menu and coin questions.
const foods = {
  burger: { picture: `${art}/food/burger.svg`, en: "burger", zh: "漢堡包" },
  fries: { picture: `${art}/food/fries.svg`, en: "fries", zh: "薯條" },
  iceCream: { picture: `${art}/food/ice-cream.svg`, en: "ice cream", zh: "雪糕" },
  pie: { picture: `${art}/food/pie.svg`, en: "pie", zh: "批" },
  drink: { picture: `${art}/food/drink.svg`, en: "drink", zh: "飲品" },
  cake: { picture: `${art}/food/cake.svg`, en: "cake", zh: "蛋糕" },
  bread: { picture: `${art}/food/bread.svg`, en: "bread", zh: "麵包" },
};

const days = [
  ["Sunday", "星期日"], ["Monday", "星期一"], ["Tuesday", "星期二"], ["Wednesday", "星期三"],
  ["Thursday", "星期四"], ["Friday", "星期五"], ["Saturday", "星期六"],
];

// Shading puzzles: which cell each cell moves to, for a grid `size` cells across.
const moves = {
  half: (size) => (cell) => size * size - 1 - cell,
  mirror: (size) => (cell) => Math.floor(cell / size) * size + (size - 1 - (cell % size)),
  flip: (size) => (cell) => (size - 1 - Math.floor(cell / size)) * size + (cell % size),
  turn: (size) => (cell) => (cell % size) * size + (size - 1 - Math.floor(cell / size)),
};

// One question maker per kind of question.
function makers(random, level) {
  const between = (low, high) => low + Math.floor(random() * (high - low + 1));
  const pick = (list) => list[Math.floor(random() * list.length)];
  const mix = (list) => list.map((item) => [random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
  const later = level > 10;
  const plural = (thing, count) => thing.en[count === 1 ? 0 : 1];
  // K1's and K2's question makers, for pictures of things to add.
  const pictures = k2Makers(random);
  // "2 dogs, 1 bird and 3 ants" / "2 隻狗、1 隻小鳥和 3 隻螞蟻".
  const listOf = (groups) => {
    const en = groups.map(({ thing, count }) => `${count} ${plural(thing, count)}`);
    const zh = groups.map(({ thing, count }) => `${count} ${thing.unit}${thing.zh}`);
    const join = (parts, comma, and) => (parts.length > 1 ? `${parts.slice(0, -1).join(comma)}${and}${parts[parts.length - 1]}` : parts[0]);
    return say(join(en, ", ", " and "), join(zh, "、", "和"));
  };

  return {
    // Overlapping and nested shapes in clusters; count one kind.
    countShapes() {
      // Circles, squares and triangles take turns.
      const target = Object.keys(shapeNames)[Math.floor(level / 2) % 3];
      const colors = ["#ffb3c6", "#8cc8f2", "#ffd45e", "#8fe3a8", "#c9b3f2", "#ffc89a"];
      for (;;) {
        const shapes = [];
        const clusters = later ? 9 : 8;
        const columns = later ? 3 : 4;
        for (let index = 0; index < clusters; index += 1) {
          const width = 480 / columns;
          const rows = Math.ceil(clusters / columns);
          const x = width * (index % columns) + width / 2;
          const y = (300 / rows) * Math.floor(index / columns) + 150 / rows;
          const size = Math.min(width, 300 / rows) / 2 - 8;
          const color = () => pick(colors);
          const kind = () => pick(["circle", "square", "triangle"]);
          const style = pick(later ? ["single", "nested", "nested", "overlap", "overlap", "three"] : ["single", "nested", "overlap"]);
          if (style === "single") shapes.push({ kind: kind(), x, y, r: size * 0.8, color: color() });
          if (style === "nested" || style === "three") {
            shapes.push({ kind: kind(), x, y, r: size, color: color() });
            shapes.push({ kind: kind(), x, y, r: size * 0.42, color: color() });
            if (style === "three") shapes.push({ kind: kind(), x, y, r: size * 0.16, color: color() });
          }
          if (style === "overlap") {
            shapes.push({ kind: kind(), x: x - size * 0.32, y: y - size * 0.1, r: size * 0.62, color: color() });
            shapes.push({ kind: kind(), x: x + size * 0.32, y: y + size * 0.15, r: size * 0.62, color: color() });
          }
        }
        const answer = shapes.filter((shape) => shape.kind === target).length;
        if (answer < 4 || answer > (later ? 10 : 8)) continue;
        const name = shapeNames[target];
        return question({
          prompt: say(`How many ${name.en} can you find?`, `你能找到多少個${name.zh}？`),
          answer,
          title: `Count the ${name.en}`,
          scene: { type: "shapes", shapes: shapes.map((shape) => ({ ...shape, x: Math.round(shape.x), y: Math.round(shape.y), r: Math.round(shape.r) })) },
        });
      }
    },
    // A pile of mixed leaves; count one kind.
    countLeaves() {
      const [target, ...others] = mix(Object.keys(leaves));
      const answer = between(later ? 6 : 4, later ? 9 : 7);
      const total = between(answer + 6, 18);
      const ids = mix([...Array(answer).fill(target), ...Array.from({ length: total - answer }, (_, index) => others[index % others.length])]);
      const cells = mix(Array.from({ length: 18 }, (_, index) => index)).slice(0, total);
      const items = ids.map((id, index) => ({
        picture: leaves[id].picture,
        x: Math.round(((cells[index] % 6) + 0.2 + random() * 0.6) * (100 / 6)),
        y: Math.round((Math.floor(cells[index] / 6) + 0.2 + random() * 0.6) * (100 / 3)),
        rotate: between(-40, 40),
      }));
      const leaf = leaves[target];
      return question({
        prompt: say(`How many ${leaf.en} can you find?`, `你能找到多少${leaf.unit}${leaf.zh}？`),
        answer,
        title: `Count the ${leaf.en}`,
        scene: { type: "scatter", items },
      });
    },
    // Some leave, then more leave or arrive.
    comeAndGo() {
      const thing = movers[pick(Object.keys(movers))];
      const start = between(later ? 12 : 8, later ? 20 : 14);
      const first = between(2, 4);
      const arrives = random() < (later ? 0.5 : 0.3);
      const second = between(2, arrives ? 5 : Math.min(4, start - first - 1));
      const answer = start - first + (arrives ? second : -second);
      const [placeEn, placeZh] = thing.place;
      return question({
        prompt: say(
          `There are ${start} ${thing.en[1]} ${placeEn}. ${first} ${thing.go[0]}, then ${second} ${arrives ? thing.come[0] : `more ${thing.go[0]}`}. How many ${thing.en[1]} are ${placeEn} now?`,
          `${placeZh}有 ${start} ${thing.unit}${thing.zh}。${first} ${thing.unit}${thing.go[1]}，然後${arrives ? `有 ${second} ${thing.unit}${thing.come[1]}` : `再有 ${second} ${thing.unit}${thing.go[1]}`}。${placeZh}現在有多少${thing.unit}${thing.zh}？`,
        ),
        answer,
        title: `${thing.en[1][0].toUpperCase()}${thing.en[1].slice(1)} ${placeEn}`,
        scene: { type: "steps", picture: thing.picture, start, changes: [-first, arrives ? second : -second] },
      });
    },
    // How many in a queue: some in front and some behind, or a place from each end.
    queue() {
      const hero = animals[pick(Object.keys(animals))];
      const front = between(2, later ? 7 : 5);
      const behind = between(2, later ? 7 : 5);
      const places = later && random() < 0.5;
      const ordinal = (n) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
      const prompt = places
        ? say(
          `The ${hero.en} is in a line. It is ${ordinal(front + 1)} from the front and ${ordinal(behind + 1)} from the back. How many animals are in the line?`,
          `${hero.zh}在排隊。由前面數起，${hero.zh}排第 ${front + 1}；由後面數起，排第 ${behind + 1}。隊伍裏一共有多少隻動物？`,
        )
        : say(
          `The ${hero.en} is in a line. There are ${front} animals in front of it and ${behind} behind it. How many animals are in the line?`,
          `${hero.zh}在排隊，前面有 ${front} 隻動物，後面有 ${behind} 隻動物。隊伍裏一共有多少隻動物？`,
        );
      return question({
        prompt,
        answer: front + behind + 1,
        title: `The ${hero.en}’s line`,
        scene: { type: "queue", picture: hero.picture, front, behind, places },
      });
    },
    // A chain of swaps: 1 goat for 3 chickens, 1 cow for 2 goats, so 1 cow for 6 chickens.
    exchange() {
      const [big, middle, small] = pick(swapChains).map((id) => farm[id]);
      const have = later && random() < 0.5 ? 2 : 1;
      const first = between(2, 3);
      let second = between(2, 4);
      while (first * second * have > 20) second -= 1;
      return question({
        prompt: say(
          `1 ${middle.en[0]} can be swapped for ${second} ${small.en[1]}. 1 ${big.en[0]} can be swapped for ${first} ${middle.en[1]}. Farmer Fox has ${have} ${plural(big, have)}. How many ${small.en[1]} can Farmer Fox get?`,
          `1 ${middle.unit}${middle.zh}可以換 ${second} ${small.unit}${small.zh}，1 ${big.unit}${big.zh}可以換 ${first} ${middle.unit}${middle.zh}。狐狸農夫有 ${have} ${big.unit}${big.zh}，可以換多少${small.unit}${small.zh}？`,
        ),
        answer: have * first * second,
        title: `Swap ${big.en[1]} for ${small.en[1]}`,
        scene: { type: "swap", rows: [
          { from: middle.picture, to: small.picture, count: second },
          { from: big.picture, to: middle.picture, count: first },
          { from: big.picture, fromCount: have, to: small.picture, count: null },
        ] },
      });
    },
    // Sums typed on the number pad.
    add() {
      const a = between(later ? 6 : 4, 9);
      const b = between(11 - a, 9);
      return pad(`${a} + ${b} = ?`, a + b);
    },
    subtract() {
      const a = between(11, later ? 18 : 16);
      const b = between((a % 10) + 1, 9);
      return pad(`${a} − ${b} = ?`, a - b);
    },
    threeNumbers() {
      const parts = [between(2, 9), between(2, 9), between(1, 6)];
      while (parts[0] + parts[1] + parts[2] > 20) parts[0] -= 1;
      return pad(`${parts.join(" + ")} = ?`, parts[0] + parts[1] + parts[2]);
    },
    // Two groups of things of one category to add (each up to 20), typed on the number pad. A group
    // of more than 10 is split into rows of 10.
    addPicture() {
      const a = between(later ? 8 : 4, later ? 20 : 12);
      const b = between(later ? 6 : 3, later ? 20 : 12);
      return { ...pictures.sumOf(a, b), options: [{ label: String(a + b), correct: true }], input: "pad" };
    },
    // A number bond to 20, no picture: the whole and one part, the other part typed in.
    bond() {
      const whole = between(11, 20);
      const part = between(whole - 9, 9);
      return question({
        prompt: say("Type the missing number in the number bond.", "用數字鍵輸入數字組合中缺少的數字。"),
        answer: whole - part,
        title: `Number bond of ${whole}`,
        visual: { type: "bond", whole, parts: random() < 0.5 ? [part, null] : [null, part] },
        options: [{ label: String(whole - part), correct: true }],
        input: "pad",
      });
    },
    missing() {
      const total = between(11, 19);
      const part = between(total - 9, 9);
      const forms = [`${total} − ? = ${part}`, `? + ${part} = ${total}`, `${part} + ? = ${total}`, `? − ${part} = ${total - part}`];
      const form = pick(later ? forms : forms.slice(0, 3));
      return pad(form, form.startsWith("? −") ? total : total - part);
    },
    // A run of numbers to 100 with one missing: odd or even numbers (steps of 2), or tens, fives
    // or ones, going up or down.
    oddEven() {
      const step = pick([2, -2]);
      const odd = random() < 0.5;
      let first = between(10, 90);
      if (first % 2 !== (odd ? 1 : 0)) first += 1;
      while (first + step * 4 > 99 || first + step * 4 < 1) first -= step * 4;
      return run(first, step, odd ? say("odd", "單數") : say("even", "雙數"));
    },
    skipCount() {
      // The steps take turns from level to level.
      const steps = later ? [5, -5, 10, -10, 1, -1] : [10, -5, 1, 5, -10];
      const step = steps[level % steps.length];
      let first = Math.abs(step) === 1 ? between(30, 95) : Math.abs(step) * between(1, 100 / Math.abs(step));
      while (first + step * 4 > 100 || first + step * 4 < 0) first -= step * 4;
      return run(first, step);
    },
    // Four numbers to put in order, smallest first (or biggest first).
    order() {
      return numberOrder(random, { sameTens: later });
    },
    // How many legs (or wheels) do they have altogether?
    legsOrWheels() {
      const wheels = random() < 0.5;
      const set = wheels ? wheeled : legged;
      const count = later ? 3 : 2;
      for (;;) {
        const ids = mix(Object.keys(set)).slice(0, count);
        if (wheels && ids.every((id) => set[id].count === 0)) continue;
        const groups = ids.map((id) => ({ thing: set[id], count: between(1, 3) }));
        const answer = groups.reduce((sum, group) => sum + group.thing.count * group.count, 0);
        if (answer > (later ? 30 : 20) || answer < 4) continue;
        const things = listOf(groups);
        return question({
          prompt: wheels
            ? say(`${things.en}. How many wheels are there altogether?`, `${things.zh}，一共有多少個輪子？`)
            : say(`${things.en}. How many legs are there altogether?`, `${things.zh}，一共有多少條腿？`),
          answer,
          title: wheels ? "Count the wheels" : "Count the legs",
          scene: { type: "groups", groups: groups.map((group) => ({ picture: group.thing.picture, count: group.count })) },
        });
      }
    },
    // Four groups of numbers: three of odd numbers and one of even (or the other way round).
    oddOneOut() {
      return differentGroup(random);
    },
    // Pairs of grids: the shaded cells move the same way in each pair; finish the last pair.
    shading() {
      const size = later ? 3 : 2;
      const shaded = later ? 2 : 1;
      const names = later ? Object.keys(moves) : ["half", "mirror", "flip"];
      const move = pick(names);
      const apply = (name, cells) => cells.map(moves[name](size)).sort((a, b) => a - b);
      const key = (cells) => cells.join(",");
      for (;;) {
        const cellsOf = () => mix(Array.from({ length: size * size }, (_, index) => index)).slice(0, shaded).sort((a, b) => a - b);
        const figures = [];
        while (figures.length < 4) {
          const cells = cellsOf();
          if (!figures.some((other) => key(other) === key(cells))) figures.push(cells);
        }
        const examples = figures.slice(0, 3);
        const last = figures[3];
        const answer = apply(move, last);
        // Every other move must give a different answer and be ruled out by an example.
        const fair = names.filter((name) => name !== move).every((name) => (
          key(apply(name, last)) === key(answer) || examples.some((cells) => key(apply(name, cells)) !== key(apply(move, cells)))
        ));
        if (!fair || key(answer) === key(last)) continue;
        const candidates = [answer, last, ...names.filter((name) => name !== move).map((name) => apply(name, last))];
        if (shaded === 1) candidates.push(...Array.from({ length: 4 }, (_, cell) => [cell]));
        while (candidates.length < 8) candidates.push(cellsOf());
        const seen = new Set();
        const choices = candidates.filter((cells) => !seen.has(key(cells)) && seen.add(key(cells))).slice(0, 4);
        return question({
          prompt: say("Look at how each picture changes. Which picture goes in the empty box?", "看看每對圖形怎樣變化。空格裏應該是哪一個圖形？"),
          answer: key(answer),
          title: "How the shading moves",
          visual: { type: "shading", size, pairs: examples.map((cells) => [cells, apply(move, cells)]), last },
          options: choices.map((cells) => ({
            label: key(cells), size, shade: cells,
            name: say(`Shaded: ${cells.map((cell) => cell + 1).join(", ")}`, `塗了顏色的格：${cells.map((cell) => cell + 1).join("、")}`),
            correct: key(cells) === key(answer),
          })),
        });
      }
    },
    // Rows of mixed things: which row has the most of one kind?
    mostRow() {
      const [target, ...others] = mix(Object.keys(kinds));
      const rows = later ? 4 : 3;
      const length = later ? 7 : 6;
      const counts = mix([1, 2, 3, 4, 5].slice(0, later ? 5 : 4)).slice(0, rows);
      const picture = (id) => `${art}/${pick(kinds[id].items)}.svg`;
      const items = counts.map((count) => mix([
        ...Array.from({ length: count }, () => picture(target)),
        ...Array.from({ length: length - count }, () => picture(pick(others))),
      ]));
      const best = counts.indexOf(Math.max(...counts));
      const kind = kinds[target];
      const rowName = (index) => say(`Row ${index + 1}`, `第 ${index + 1} 行`);
      return question({
        prompt: say(`Which row has the most ${kind.en}?`, `哪一行的${kind.zh}最多？`),
        answer: `row-${best + 1}`,
        title: `The row with the most ${kind.en}`,
        scene: { type: "rows", rows: items },
        options: textOptions(counts.map((_, index) => [`row-${index + 1}`, rowName(index)]), `row-${best + 1}`),
      });
    },
    turningGrid() {
      const turn = pick(["clockwise", "anticlockwise", "half"]);
      const blanks = mix([0, 1, 2, 3]).slice(0, later ? 3 : 2).sort();
      return gridPattern({ set: pick(["sweets", "animals", "shapes", "fruit"]), turn, blanks, start: mix([0, 1, 2, 3]) });
    },
    // Four foods with prices, and what four animals bought: who spent the most (or least)?
    menu() {
      for (;;) {
        const ids = mix(Object.keys(foods)).slice(0, 4);
        const prices = mix([3, 4, 5, 6, 7, 8, 9, 10, 12, 15]).slice(0, 4);
        const buyers = mix(Object.keys(animals)).slice(0, 4);
        const picks = buyers.map(() => mix([0, 1, 2, 3]).slice(0, 2).sort());
        const totals = picks.map(([a, b]) => prices[a] + prices[b]);
        const most = later && random() < 0.4 ? Math.min(...totals) : Math.max(...totals);
        if (totals.filter((total) => total === most).length > 1 || new Set(picks.map(String)).size < 4) continue;
        const least = most === Math.min(...totals);
        const winner = buyers[totals.indexOf(most)];
        return question({
          prompt: least
            ? say("Each animal buys two things. Who spent the least money?", "每隻動物買了兩樣東西。誰用的錢最少？")
            : say("Each animal buys two things. Who spent the most money?", "每隻動物買了兩樣東西。誰用的錢最多？"),
          answer: winner,
          title: least ? "Who spent the least" : "Who spent the most",
          scene: {
            type: "menu",
            items: ids.map((id, index) => ({ picture: foods[id].picture, price: prices[index] })),
            buyers: buyers.map((id, index) => ({ picture: animals[id].picture, picks: picks[index] })),
          },
          options: buyers.map((id) => ({ label: id, picture: animals[id].picture, name: say(animals[id].en, animals[id].zh), correct: id === winner })),
        });
      }
    },
    // Hong Kong coins and a price: is there enough money?
    coins() {
      const values = later ? [10, 5, 2, 1] : [5, 2, 1];
      const coins = Array.from({ length: between(3, later ? 5 : 4) }, () => pick(values)).sort((a, b) => b - a);
      const total = coins.reduce((sum, coin) => sum + coin, 0);
      const enough = random() < 0.5;
      const price = Math.max(1, enough ? total - between(0, 2) : total + between(1, 3));
      const food = foods[pick(Object.keys(foods))];
      const answer = price <= total ? "yes" : "no";
      return question({
        prompt: say(`You have these coins. Do you have enough money to buy the ${food.en} for $${price}?`, `你有這些硬幣。夠錢買 $${price} 的${food.zh}嗎？`),
        answer,
        title: `Enough for the ${food.en}?`,
        scene: { type: "coins", coins, item: { picture: food.picture, price } },
        options: textOptions([["yes", say("Yes", "夠")], ["no", say("No", "不夠")]], answer),
      });
    },
    // Days of the week: so many days before or after a day.
    week() {
      const shift = between(1, 3) * (random() < 0.5 ? -1 : 1);
      // Early on the answer stays within the week shown (Sunday to Saturday); later it can go round.
      const today = later ? between(0, 6) : between(Math.max(0, -shift), Math.min(6, 6 - shift));
      const day = (today + shift + 7) % 7;
      const [en, zh] = days[today];
      const choices = [day, (day + 1) % 7, (day + 6) % 7, (today - shift + 7) % 7];
      while (new Set(choices).size < 4 || choices.slice(1).includes(day)) choices[3] = (choices[3] + 1) % 7;
      return question({
        prompt: shift > 0
          ? say(`What day is it ${shift} ${shift === 1 ? "day" : "days"} after ${en}?`, `${zh}之後的第 ${shift} 天是星期幾？`)
          : say(`What day is it ${-shift} ${shift === -1 ? "day" : "days"} before ${en}?`, `${zh}之前的第 ${-shift} 天是星期幾？`),
        answer: days[day][0],
        title: `${Math.abs(shift)} ${Math.abs(shift) === 1 ? "day" : "days"} ${shift > 0 ? "after" : "before"} ${en}`,
        scene: { type: "week", days: days.map(([dayEn, dayZh]) => say(dayEn.slice(0, 3), dayZh.slice(2))), today },
        options: textOptions([...new Set(choices)].map((index) => [days[index][0], say(days[index][0], days[index][1])]), days[day][0]),
      });
    },
    // A round clock at o'clock (or half past, later on): which digital time is it?
    clock() {
      const hour = between(1, 12);
      // From Level 9, every other clock shows half past.
      const minute = level >= 9 && level % 2 === 1 ? 30 : 0;
      const time = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
      const answer = time(hour, minute);
      // Easy mistakes: reading the hands the wrong way round, the hour either side, the other half.
      const swapped = minute === 0 ? time(12, (hour % 12) * 5) : time(6, (hour % 12) * 5);
      const candidates = [answer, swapped, time(hour + 1, minute), time(hour - 1 + 12, minute), time(hour, 30 - minute)];
      const seen = new Set();
      const choices = candidates.filter((text) => !seen.has(text) && seen.add(text)).slice(0, 4);
      // Some times on the hour or half hour are written in words: "11 o’clock", "half past 11".
      const inWords = (text) => {
        const [h, m] = text.split(":");
        return m === "00" ? say(`${h} o’clock`, `${h} 點鐘`) : say(`half past ${h}`, `${h} 點半`);
      };
      const wordy = choices.filter((text) => /:(00|30)$/.test(text));
      const written = new Set(wordy.filter(() => random() < 0.5));
      if (written.size === 0) written.add(wordy[Math.floor(random() * wordy.length)]);
      return question({
        prompt: say("What time does the clock show?", "時鐘顯示的是甚麼時間？"),
        answer,
        title: "What time is it?",
        scene: { type: "clock", hour, minute },
        options: textOptions(choices.map((text) => [text, written.has(text) ? inWords(text) : say(text, text)]), answer),
      });
    },
  };

  // A sum answered by typing on the number pad.
  function pad(text, answer) {
    return question({
      prompt: say("Type the answer on the number pad.", "用數字鍵輸入答案。"),
      answer,
      title: text,
      visual: { type: "equation", text },
      options: [{ label: String(answer), correct: true }],
      input: "pad",
    });
  }

  function run(first, step, kind = null) {
    const items = [0, 1, 2, 3, 4].map((index) => first + step * index);
    const gap = between(1, 4);
    const shown = items.map((value, index) => (index === gap ? null : value));
    return question({
      prompt: kind
        ? say(`These are ${kind.en} numbers. Which number is missing?`, `這些都是${kind.zh}。缺少了哪個數字？`)
        : say("Which number is missing?", "缺少了哪個數字？"),
      answer: items[gap],
      title: shown.map((item) => item ?? "?").join(", "),
      visual: { type: "sequence", items: shown },
      options: numberOptions(items[gap], Math.abs(step)),
    });
  }
}

// One level's ten questions, in a mixed-up order.
export function generateK3Level(level) {
  const random = seededRandom(`daily-challenge:k3:${level}`);
  const make = makers(random, level);
  // Each kind's makers take turns from level to level (`count` at a time), so every one of them
  // comes up regularly.
  const turn = (names, count) => Array.from({ length: count }, (_, index) => names[((level - 1) * count + index) % names.length]);
  // [kind of question, maker] for each of the ten.
  const plan = [
    ["counting", turn(["countShapes", "countLeaves"], 1)[0]],
    ...turn(["comeAndGo", "queue", "exchange"], 2).map((name) => ["story", name]),
    ...turn(["add", "bond", "subtract", "addPicture", "threeNumbers", "missing"], 2).map((name) => ["sum", name]),
    ...turn(["oddEven", "skipCount", "order"], 2).map((name) => ["numbers", name]),
    ...turn(["legsOrWheels", "oddOneOut", "shading", "mostRow", "turningGrid"], 2).map((name) => ["logic", name]),
    ["everyday", turn(["clock", "menu", "week", "coins"], 1)[0]],
  ];
  const questions = plan.map(([kind, name]) => ({ ...make[name](), kind }));
  return questions.map((item) => [random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
}
