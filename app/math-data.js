// Math and Logic: six levels of ten questions. Levels 1-3 are about numbers under 10, levels 4-6
// within 20. A level opens once the one before it has been finished. Every question is answered
// by tapping one of the choices: numbers, or pictures for "what comes next?" patterns.
// The pictures are drawn by scripts/draw-words.py.
const art = "/images/game-asset/math";
const english = "en";
const chinese = "zh-Hant-HK";

// The pictures that make up a pattern, and its choices.
const patternPieces = {
  butterfly: "/images/game-asset/animals/butterfly.svg",
  bee: "/images/game-asset/animals/bee.svg",
  dragonfly: "/images/game-asset/animals/dragonfly.svg",
  apple: `${art}/apple.svg`,
  banana: `${art}/banana.svg`,
  grapes: `${art}/grapes.svg`,
  circle: `${art}/circle.svg`,
  square: `${art}/square.svg`,
  triangle: `${art}/triangle.svg`,
  sock: "/images/game-asset/clothes/socks.svg",
  shoe: "/images/game-asset/clothes/shoes.svg",
  hat: "/images/game-asset/clothes/hat.svg",
  "big circle": `${art}/big-circle.svg`,
  "small circle": `${art}/small-circle.svg`,
  "red flower": `${art}/flower-red.svg`,
  "yellow flower": `${art}/flower-yellow.svg`,
  "blue flower": `${art}/flower-blue.svg`,
  up: `${art}/arrow-up.svg`,
  right: `${art}/arrow-right.svg`,
  down: `${art}/arrow-down.svg`,
  left: `${art}/arrow-left.svg`,
};

// The right number and three close to it (never below zero).
function numberOptions(answer) {
  const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, answer + 4].filter((n) => n >= 0).slice(0, 3);
  return [answer, ...near].map((n) => ({ label: String(n), correct: n === answer }));
}

// A question with a number to find. `title` names it in the question menu without giving the answer away.
function numberQuestion({ prompt, answer, title, picture = null, visual = null, lang = english }) {
  return {
    prompt,
    lang,
    picture: picture && `${art}/${picture}.svg`,
    visual,
    answer: String(answer),
    answers: [title],
    options: numberOptions(answer),
  };
}

// A number bond: the whole and one part are shown, the other part is missing.
const bond = (whole, part, picture, prompt) => numberQuestion({
  prompt, picture, answer: whole - part, title: `Number bond of ${whole}`, visual: { type: "bond", whole, parts: [part, null] },
});

const sum = (a, b, picture = null, prompt = "Add them up!") => numberQuestion({
  prompt, picture, answer: a + b, title: `${a} + ${b} = ?`, visual: { type: "equation", text: `${a} + ${b} = ?` },
});

const difference = (a, b, picture = null, prompt = "Take away!") => numberQuestion({
  prompt, picture, answer: a - b, title: `${a} − ${b} = ?`, visual: { type: "equation", text: `${a} − ${b} = ?` },
});

// A run of numbers going up or down in equal steps, with one missing (null).
function sequence(items) {
  const known = items.findIndex((item, index) => item !== null && items[index + 1] != null);
  const step = items[known + 1] - items[known];
  return numberQuestion({
    prompt: "Which number is missing?",
    answer: items[known] + step * (items.indexOf(null) - known),
    title: items.map((item) => item ?? "?").join(", "),
    visual: { type: "sequence", items },
  });
}

// Counting or a little story, with a picture.
const story = (picture, prompt, answer, title, lang = english) => numberQuestion({ prompt, picture, answer, title, lang });

// "What comes next?": a row of pictures with one missing (null), answered by picking a picture.
function pattern(items, answer, choices) {
  return {
    prompt: "What comes next?",
    lang: english,
    picture: null,
    visual: { type: "pattern", items: items.map((item) => item && { name: item, picture: patternPieces[item] }) },
    answer,
    answers: [`Pattern: ${items.map((item) => item ?? "?").join(", ")}`],
    options: choices.map((choice) => ({ label: choice, picture: patternPieces[choice], correct: choice === answer })),
  };
}

const levels = [
  {
    focus: "Numbers under 10",
    color: "pink",
    words: [
      bond(6, 2, "kittens", "There are 6 kittens in the pen. 2 are calico cats. How many are tabby cats?"),
      story("shapes-1", "How many triangles can you find?", 6, "Find the triangles"),
      numberQuestion({
        prompt: "豬媽媽到水果店買蘋果，狐狸店長的籃子裏差多少個蘋果？", lang: chinese, picture: "fruit-stand", answer: 2, title: "豬媽媽買蘋果",
        visual: { type: "equation", text: "8 + ? = 10" },
      }),
      sum(2, 2, "monkeys", "2 brown monkeys and 2 grey monkeys. How many monkeys altogether?"),
      bond(5, 3, "houses", "There are 5 houses. 3 have slanted roofs. How many have flat roofs?"),
      sequence([4, 5, null, 7, 8]),
      pattern(["butterfly", "bee", "bee", "butterfly", "bee", null, "butterfly"], "bee", ["butterfly", "bee", "dragonfly"]),
      difference(8, 3, "donuts", "There are 8 donuts. 3 are being taken away. How many are left?"),
      story("bus-upper", "The 5 seats upstairs are full. How many more seats are there?", 5, "Seats on the bus"),
      sequence([7, 6, 5, null, 3]),
    ],
  },
  {
    focus: "Numbers under 10",
    color: "yellow",
    words: [
      bond(7, 3, "ducks-chicks", "There are 7 birds. 3 are ducks. How many are chicks?"),
      story("shapes-2", "How many triangles can you find?", 8, "Find the triangles"),
      story("strawberry-tray", "How many more strawberries to make 10?", 4, "Make 10"),
      sum(3, 5, "birds-3-5", "3 blue birds and 5 yellow birds. How many birds altogether?"),
      bond(8, 5, "cars-buses", "There are 8 cars and buses. 5 are cars. How many are buses?"),
      sequence([2, 4, 6, null, 10]),
      pattern(["apple", "banana", "apple", "banana", "apple", null], "banana", ["apple", "banana", "grapes"]),
      difference(9, 4, "balloons-pop", "There were 9 balloons. 4 went pop! How many are left?"),
      story("birds-fly-away", "There were 9 birds on the branch. 3 flew away. How many are left?", 6, "Birds on the branch"),
      sequence([9, 8, null, 6, 5]),
    ],
  },
  {
    focus: "Numbers under 10",
    color: "blue",
    words: [
      bond(9, 6, "balls", "There are 9 balls. 6 are red. How many are blue?"),
      story("shapes-3", "How many triangles can you find?", 9, "Find the triangles"),
      story("eggs", "The box holds 10 eggs. How many more eggs will fill it?", 3, "Fill the egg box"),
      sum(4, 5, "cupcakes", "4 pink cupcakes and 5 blue cupcakes. How many altogether?"),
      bond(10, 7, "stars", "There are 10 stars. 7 are yellow. How many are pink?"),
      sequence([1, 3, 5, null, 9]),
      pattern(["circle", "square", "triangle", "circle", "square", null], "triangle", ["circle", "square", "triangle"]),
      difference(7, 2, "cookies-bitten", "There are 7 cookies. 2 have a bite out of them. How many have no bites?"),
      story("frogs", "4 frogs sit on the lily pad. 3 more jump on. How many frogs are there now?", 7, "Frogs on the lily pad"),
      sequence([10, 8, 6, null, 2]),
    ],
  },
  {
    focus: "Numbers to 20",
    color: "green",
    words: [
      story("vegetables", "How many tomatoes can you find?", 11, "Count the tomatoes"),
      sequence([20, null, 18, 17, 16]),
      pattern(["sock", "shoe", "sock", "sock", "shoe", "sock", null], "sock", ["sock", "shoe", "hat"]),
      story("bus-stop", "There are 7 people on the bus and 6 people waiting at the bus stop. How many people are on the bus after everyone gets on?", 13, "The bus stop"),
      sum(10, 6, "ten-and-six"),
      sequence([8, 9, 10, null, 12]),
      story("swap-sweets", "1 lollipop is worth 2 candies. 1 candy is worth 2 crackers. How many crackers is 1 lollipop worth?", 4, "Lollipop swap"),
      pattern(["big circle", "small circle", "small circle", "big circle", "small circle", "small circle", null], "big circle", ["big circle", "small circle", "square"]),
      difference(15, 2),
      story("monkeys-tree", "There are 12 monkeys in the tree. 4 jump into the water. How many monkeys are left in the tree?", 8, "Monkeys in the tree"),
    ],
  },
  {
    focus: "Numbers to 20",
    color: "lilac",
    words: [
      story("fruit-mix", "How many strawberries can you find?", 13, "Count the strawberries"),
      sequence([15, 16, null, 18, 19]),
      pattern(["hat", "hat", "sock", "hat", "hat", "sock", null], "hat", ["hat", "sock", "shoe"]),
      story("classroom", "9 children are in the classroom. 5 more come in. How many children are there now?", 14, "The classroom"),
      sum(10, 8, "ten-and-eight"),
      sequence([20, 18, 16, null, 12]),
      story("swap-fruit", "1 watermelon is worth 2 pineapples. 1 pineapple is worth 3 apples. How many apples is 1 watermelon worth?", 6, "Fruit swap"),
      story("towers", "The towers grow: 2 blocks, 4 blocks, 6 blocks. How many blocks will the next tower have?", 8, "Growing towers"),
      difference(18, 5),
      story("ducks-pond", "15 ducks were in the pond. 6 walked out. How many ducks are still in the pond?", 9, "Ducks in the pond"),
    ],
  },
  {
    focus: "Numbers to 20",
    color: "peach",
    words: [
      story("night-sky", "How many stars can you find?", 14, "Count the stars"),
      sequence([11, 13, null, 17, 19]),
      pattern(["red flower", "yellow flower", "yellow flower", "red flower", "yellow flower", "yellow flower", null], "red flower", ["red flower", "yellow flower", "blue flower"]),
      story("birds-wire", "8 birds sit on the wire. 7 more fly down to join them. How many birds are on the wire now?", 15, "Birds on the wire"),
      sum(7, 8, "seven-and-eight"),
      sequence([20, 17, 14, null, 8]),
      story("swap-boxes", "1 big box holds 2 medium boxes. 1 medium box holds 4 small boxes. How many small boxes fit in 1 big box?", 8, "Boxes in boxes"),
      pattern(["up", "right", "down", "left", "up", null], "right", ["up", "right", "down", "left"]),
      difference(19, 7),
      story("cookies-eaten", "There were 16 cookies on the plate. The children ate 9. How many cookies are left?", 7, "Cookies on the plate"),
    ],
  },
];

export const mathLevels = levels.map((level, index) => ({
  id: `level-${index + 1}`,
  name: `Level ${index + 1}`,
  english: level.focus,
  color: level.color,
  pattern: [String(index + 1)],
  words: level.words.map((question) => ({ ...question, category: `LEVEL ${index + 1}`, color: level.color })),
}));

// The unlock saved for a level once the level before it is finished.
export const levelUnlockKey = (level) => `math-logic/${level.id}`;

// Level 1 is always open; each later level opens when the one before it is finished.
export function isLevelOpen(level, player) {
  return level.id === mathLevels[0].id || Boolean(player?.unlocks?.includes(levelUnlockKey(level)));
}
