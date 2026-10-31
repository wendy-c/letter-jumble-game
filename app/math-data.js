// Daily Challenge (每日大挑戰): twenty levels of ten questions for each age, in English or Chinese
// (the site's language): numbers under 10 for 3-4 year olds and to 20 for 5-6 year olds. Each age's
// first three levels are made by hand here; the rest come from math-generator.js. A child starts
// at Level 1 of their age, and a level opens the day after the one before it was finished. Every question is answered by tapping one of the choices: numbers, or
// pictures for "what comes next?" patterns. The pictures are drawn by scripts/draw-words.py.
import { generateLevel } from "./math-generator";

const art = "/images/game-asset/math";

// The pictures that make up a pattern, and their names in each language.
const patternPieces = {
  butterfly: ["/images/game-asset/animals/butterfly.svg", "蝴蝶"],
  bee: ["/images/game-asset/animals/bee.svg", "蜜蜂"],
  dragonfly: ["/images/game-asset/animals/dragonfly.svg", "蜻蜓"],
  apple: [`${art}/apple.svg`, "蘋果"],
  banana: [`${art}/banana.svg`, "香蕉"],
  grapes: [`${art}/grapes.svg`, "提子"],
  circle: [`${art}/circle.svg`, "圓形"],
  square: [`${art}/square.svg`, "正方形"],
  triangle: [`${art}/triangle.svg`, "三角形"],
  sock: ["/images/game-asset/clothes/socks.svg", "襪子"],
  shoe: ["/images/game-asset/clothes/shoes.svg", "鞋"],
  hat: ["/images/game-asset/clothes/hat.svg", "帽子"],
  "big circle": [`${art}/big-circle.svg`, "大圓形"],
  "small circle": [`${art}/small-circle.svg`, "小圓形"],
  "red flower": [`${art}/flower-red.svg`, "紅花"],
  "yellow flower": [`${art}/flower-yellow.svg`, "黃花"],
  "blue flower": [`${art}/flower-blue.svg`, "藍花"],
  up: [`${art}/arrow-up.svg`, "向上"],
  right: [`${art}/arrow-right.svg`, "向右"],
  down: [`${art}/arrow-down.svg`, "向下"],
  left: [`${art}/arrow-left.svg`, "向左"],
};
const piece = (name) => ({ picture: patternPieces[name][0], name: { en: name, zh: patternPieces[name][1] } });

// The right number and three close to it (never below zero).
export function numberOptions(answer) {
  const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, answer + 4].filter((n) => n >= 0).slice(0, 3);
  return [answer, ...near].map((n) => ({ label: String(n), correct: n === answer }));
}

// A question with a number to find. `prompt` is { en, zh }; `picture` names a picture, or is
// { en, zh } when it differs by language. `title` names the question in the question menu without
// giving the answer away.
function numberQuestion({ prompt, answer, title, picture = null, visual = null }) {
  const path = (name) => `${art}/${name}.svg`;
  return {
    prompt,
    picture: picture && (typeof picture === "string" ? path(picture) : { en: path(picture.en), zh: path(picture.zh) }),
    visual,
    answer: String(answer),
    answers: [title],
    options: numberOptions(answer),
  };
}

const say = (en, zh) => ({ en, zh });

// A number bond: the whole and one part are shown, the other part is missing.
const bond = (whole, part, picture, prompt) => numberQuestion({
  prompt, picture, answer: whole - part, title: `Number bond of ${whole}`, visual: { type: "bond", whole, parts: [part, null] },
});

const sum = (a, b, picture = null, prompt = say("Add them up!", "加起來是多少？")) => numberQuestion({
  prompt, picture, answer: a + b, title: `${a} + ${b} = ?`, visual: { type: "equation", text: `${a} + ${b} = ?` },
});

const difference = (a, b, picture = null, prompt = say("Take away!", "減去後是多少？")) => numberQuestion({
  prompt, picture, answer: a - b, title: `${a} − ${b} = ?`, visual: { type: "equation", text: `${a} − ${b} = ?` },
});

// A run of numbers going up or down in equal steps, with one missing (null).
function sequence(items) {
  const known = items.findIndex((item, index) => item !== null && items[index + 1] != null);
  const step = items[known + 1] - items[known];
  return numberQuestion({
    prompt: say("Which number is missing?", "缺少了哪個數字？"),
    answer: items[known] + step * (items.indexOf(null) - known),
    title: items.map((item) => item ?? "?").join(", "),
    visual: { type: "sequence", items },
  });
}

// Counting or a little story, with a picture.
const story = (picture, prompt, answer, title) => numberQuestion({ prompt, picture, answer, title });

const findTriangles = (picture, answer) => story(picture, say("How many triangles can you find?", "你能找到多少個三角形？"), answer, "Find the triangles");

// "What comes next?": a row of pictures with one missing (null), answered by picking a picture.
function pattern(items, answer, choices) {
  return {
    prompt: say("What comes next?", "下一個是甚麼？"),
    picture: null,
    visual: { type: "pattern", items: items.map((item) => item && piece(item)) },
    answer,
    answers: [`Pattern: ${items.map((item) => item ?? "?").join(", ")}`],
    options: choices.map((choice) => ({ label: choice, ...piece(choice), correct: choice === answer })),
  };
}

const levels = [
  {
    focus: say("Numbers under 10", "10 以內的數"),
    ages: ["3-4"],
    color: "pink",
    words: [
      bond(6, 2, "kittens", say("There are 6 kittens in the pen. 2 are calico cats. How many are tabby cats?", "圍欄裏有 6 隻小貓，其中 2 隻是三色貓。有多少隻是虎斑貓？")),
      findTriangles("shapes-1", 6),
      numberQuestion({
        prompt: say("Mommy Pig wants 10 apples from Mr Fox’s fruit stand. How many more apples does his basket need?", "豬媽媽到水果店買蘋果，狐狸店長的籃子裏差多少個蘋果？"),
        picture: { en: "fruit-stand-en", zh: "fruit-stand" }, answer: 2, title: "Mommy Pig buys apples",
        visual: { type: "equation", text: "8 + ? = 10" },
      }),
      sum(2, 2, "monkeys", say("2 brown monkeys and 2 grey monkeys. How many monkeys altogether?", "2 隻啡色猴子和 2 隻灰色猴子，一共有多少隻猴子？")),
      bond(5, 3, "houses", say("There are 5 houses. 3 have slanted roofs. How many have flat roofs?", "有 5 間屋，3 間是斜屋頂。有多少間是平屋頂？")),
      sequence([4, 5, null, 7, 8]),
      pattern(["butterfly", "bee", "bee", "butterfly", "bee", null, "butterfly"], "bee", ["butterfly", "bee", "dragonfly"]),
      difference(8, 3, "donuts", say("There are 8 donuts. 3 are being taken away. How many are left?", "有 8 個冬甩，3 個被拿走了。還剩多少個？")),
      story("bus-upper", say("The 5 seats upstairs are full. How many more seats are there?", "上層的 5 個座位都坐滿了。還有多少個空座位？"), 5, "Seats on the bus"),
      sequence([7, 6, 5, null, 3]),
    ],
  },
  {
    focus: say("Numbers under 10", "10 以內的數"),
    ages: ["3-4"],
    color: "yellow",
    words: [
      bond(7, 3, "ducks-chicks", say("There are 7 birds. 3 are ducks. How many are chicks?", "有 7 隻雀鳥，3 隻是鴨子。有多少隻是小雞？")),
      findTriangles("shapes-2", 8),
      story("strawberry-tray", say("How many more strawberries to make 10?", "還要多少粒士多啤梨才夠 10 粒？"), 4, "Make 10"),
      sum(3, 5, "birds-3-5", say("3 blue birds and 5 yellow birds. How many birds altogether?", "3 隻藍色小鳥和 5 隻黃色小鳥，一共有多少隻？")),
      bond(8, 5, "cars-buses", say("There are 8 cars and buses. 5 are cars. How many are buses?", "有 8 架汽車和巴士，5 架是汽車。有多少架是巴士？")),
      sequence([2, 4, 6, null, 10]),
      pattern(["apple", "banana", "apple", "banana", "apple", null], "banana", ["apple", "banana", "grapes"]),
      difference(9, 4, "balloons-pop", say("There were 9 balloons. 4 went pop! How many are left?", "本來有 9 個氣球，4 個爆了！還剩多少個？")),
      story("birds-fly-away", say("There were 9 birds on the branch. 3 flew away. How many are left?", "樹枝上本來有 9 隻小鳥，3 隻飛走了。還剩多少隻？"), 6, "Birds on the branch"),
      sequence([9, 8, null, 6, 5]),
    ],
  },
  {
    focus: say("Numbers under 10", "10 以內的數"),
    ages: ["3-4"],
    color: "blue",
    words: [
      bond(9, 6, "balls", say("There are 9 balls. 6 are red. How many are blue?", "有 9 個球，6 個是紅色的。有多少個是藍色的？")),
      findTriangles("shapes-3", 9),
      story("eggs", say("The box holds 10 eggs. How many more eggs will fill it?", "蛋盒可以放 10 隻蛋，還要多少隻蛋才放滿？"), 3, "Fill the egg box"),
      sum(4, 5, "cupcakes", say("4 pink cupcakes and 5 blue cupcakes. How many altogether?", "4 個粉紅色紙杯蛋糕和 5 個藍色紙杯蛋糕，一共有多少個？")),
      bond(10, 7, "stars", say("There are 10 stars. 7 are yellow. How many are pink?", "有 10 粒星星，7 粒是黃色的。有多少粒是粉紅色的？")),
      sequence([1, 3, 5, null, 9]),
      pattern(["circle", "square", "triangle", "circle", "square", null], "triangle", ["circle", "square", "triangle"]),
      difference(7, 2, "cookies-bitten", say("There are 7 cookies. 2 have a bite out of them. How many have no bites?", "有 7 塊曲奇，2 塊被咬了一口。有多少塊沒有被咬？")),
      story("frogs", say("4 frogs sit on the lily pad. 3 more jump on. How many frogs are there now?", "4 隻青蛙坐在荷葉上，再有 3 隻跳上來。現在有多少隻青蛙？"), 7, "Frogs on the lily pad"),
      sequence([10, 8, 6, null, 2]),
    ],
  },
  {
    focus: say("Numbers to 20", "20 以內的數"),
    ages: ["5-6"],
    color: "green",
    words: [
      story("vegetables", say("How many tomatoes can you find?", "你能找到多少個番茄？"), 11, "Count the tomatoes"),
      sequence([20, null, 18, 17, 16]),
      pattern(["sock", "shoe", "sock", "sock", "shoe", "sock", null], "sock", ["sock", "shoe", "hat"]),
      story("bus-stop", say("There are 7 people on the bus and 6 people waiting at the bus stop. How many people are on the bus after everyone gets on?", "巴士上有 7 個人，巴士站有 6 個人在等車。大家都上車後，巴士上有多少人？"), 13, "The bus stop"),
      sum(10, 6, "ten-and-six"),
      sequence([8, 9, 10, null, 12]),
      story("swap-sweets", say("1 lollipop is worth 2 candies. 1 candy is worth 2 crackers. How many crackers is 1 lollipop worth?", "1 枝波板糖可以換 2 粒糖果，1 粒糖果可以換 2 塊餅乾。1 枝波板糖可以換多少塊餅乾？"), 4, "Lollipop swap"),
      pattern(["big circle", "small circle", "small circle", "big circle", "small circle", "small circle", null], "big circle", ["big circle", "small circle", "square"]),
      difference(15, 2),
      story("monkeys-tree", say("There are 12 monkeys in the tree. 4 jump into the water. How many monkeys are left in the tree?", "樹上有 12 隻猴子，4 隻跳進了水裏。樹上還有多少隻猴子？"), 8, "Monkeys in the tree"),
    ],
  },
  {
    focus: say("Numbers to 20", "20 以內的數"),
    ages: ["5-6"],
    color: "lilac",
    words: [
      story("fruit-mix", say("How many strawberries can you find?", "你能找到多少粒士多啤梨？"), 13, "Count the strawberries"),
      sequence([15, 16, null, 18, 19]),
      pattern(["hat", "hat", "sock", "hat", "hat", "sock", null], "hat", ["hat", "sock", "shoe"]),
      story("classroom", say("9 children are in the classroom. 5 more come in. How many children are there now?", "課室裏有 9 個小朋友，再有 5 個走進來。現在有多少個小朋友？"), 14, "The classroom"),
      sum(10, 8, "ten-and-eight"),
      sequence([20, 18, 16, null, 12]),
      story("swap-fruit", say("1 watermelon is worth 2 pineapples. 1 pineapple is worth 3 apples. How many apples is 1 watermelon worth?", "1 個西瓜可以換 2 個菠蘿，1 個菠蘿可以換 3 個蘋果。1 個西瓜可以換多少個蘋果？"), 6, "Fruit swap"),
      story("towers", say("The towers grow: 2 blocks, 4 blocks, 6 blocks. How many blocks will the next tower have?", "積木塔越砌越高：2 塊、4 塊、6 塊。下一座塔有多少塊積木？"), 8, "Growing towers"),
      difference(18, 5),
      story("ducks-pond", say("15 ducks were in the pond. 6 walked out. How many ducks are still in the pond?", "池塘裏本來有 15 隻鴨子，6 隻走了出來。池塘裏還有多少隻鴨子？"), 9, "Ducks in the pond"),
    ],
  },
  {
    focus: say("Numbers to 20", "20 以內的數"),
    ages: ["5-6"],
    color: "peach",
    words: [
      story("night-sky", say("How many stars can you find?", "你能找到多少粒星星？"), 14, "Count the stars"),
      sequence([11, 13, null, 17, 19]),
      pattern(["red flower", "yellow flower", "yellow flower", "red flower", "yellow flower", "yellow flower", null], "red flower", ["red flower", "yellow flower", "blue flower"]),
      story("birds-wire", say("8 birds sit on the wire. 7 more fly down to join them. How many birds are on the wire now?", "電線上有 8 隻小鳥，再有 7 隻飛下來。現在電線上有多少隻小鳥？"), 15, "Birds on the wire"),
      sum(7, 8, "seven-and-eight"),
      sequence([20, 17, 14, null, 8]),
      story("swap-boxes", say("1 big box holds 2 medium boxes. 1 medium box holds 4 small boxes. How many small boxes fit in 1 big box?", "1 個大箱可以放 2 個中箱，1 個中箱可以放 4 個小箱。1 個大箱可以放多少個小箱？"), 8, "Boxes in boxes"),
      pattern(["up", "right", "down", "left", "up", null], "right", ["up", "right", "down", "left"]),
      difference(19, 7),
      story("cookies-eaten", say("There were 16 cookies on the plate. The children ate 9. How many cookies are left?", "碟上本來有 16 塊曲奇，小朋友吃了 9 塊。還剩多少塊？"), 7, "Cookies on the plate"),
    ],
  },
];

const levelsPerAge = 20;
const colors = ["pink", "yellow", "blue", "green", "lilac", "peach"];
const focusFor = { "3-4": say("Numbers under 10", "10 以內的數"), "5-6": say("Numbers to 20", "20 以內的數") };

// Each age's levels: the three made by hand above, then generated ones up to Level 20.
export const mathLevels = ["3-4", "5-6"].flatMap((age) => {
  const handMade = levels.filter((level) => level.ages[0] === age);
  return Array.from({ length: levelsPerAge }, (_, index) => {
    const number = index + 1;
    const color = colors[index % colors.length];
    const words = index < handMade.length ? handMade[index].words : generateLevel(age, number);
    return {
      id: `${age}-level-${number}`,
      name: `Level ${number}`,
      names: say(`Level ${number}`, `第 ${number} 關`),
      english: focusFor[age].en,
      focus: focusFor[age],
      ages: [age],
      // Each age's Level 1 is open from the start.
      first: number === 1,
      color,
      pattern: String(number).split(""),
      words: words.map((question) => ({ ...question, category: `LEVEL ${number}`, color })),
    };
  });
});

// Today as YYYY-MM-DD, in the player's own time zone.
export function today(now = new Date()) {
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
}

// The unlock saved, with the day, when the level before this one is finished: "math-logic/level-2@2026-10-31".
export const levelUnlockKey = (level, day = today()) => `math-logic/${level.id}@${day}`;

// The day the level before this one was finished, or null if it hasn't been yet.
function earnedOn(level, player) {
  const key = `math-logic/${level.id}`;
  const unlock = player?.unlocks?.find((entry) => entry === key || entry.startsWith(`${key}@`));
  return unlock ? unlock.split("@")[1] ?? "" : null;
}

// Whether a level can be played: "open"; "tomorrow" when the level before it was finished today
// (one new level a day); or "locked" until the level before it is finished. Each age's Level 1 is
// always open.
export function levelState(level, player, day = today()) {
  if (level.first) return "open";
  const earned = earnedOn(level, player);
  if (earned === null) return "locked";
  return earned < day ? "open" : "tomorrow";
}

export const isLevelOpen = (level, player, day = today()) => levelState(level, player, day) === "open";

// Whether finishing the level before has already earned this one (today or before).
export const isLevelEarned = (level, player) => earnedOn(level, player) !== null;
