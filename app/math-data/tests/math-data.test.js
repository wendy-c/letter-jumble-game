import fs from "node:fs";
import path from "node:path";
import { isLevelOpen, levelState, levelUnlockKey, mathLevels, today } from "../math-data";
import { speedTopics } from "../speed-quest-data";

const publicDir = path.join(__dirname, "..", "..", "..", "public");
const levelsFor = (age) => mathLevels.filter((level) => level.ages.includes(age));
const allQuestions = mathLevels.flatMap((level) => level.words);

describe("Daily Challenge", () => {
  it("has twenty levels of ten questions for each class", () => {
    ["k1", "k2", "k3"].forEach((age) => {
      expect(levelsFor(age).map((level) => level.name)).toEqual(Array.from({ length: 20 }, (_, index) => `Level ${index + 1}`));
      levelsFor(age).forEach((level) => expect(level.words).toHaveLength(10));
    });
    expect(mathLevels.map((level) => level.id).slice(0, 2)).toEqual(["k1-level-1", "k1-level-2"]);
    expect(mathLevels.filter((level) => level.first).map((level) => level.id)).toEqual(["k1-level-1", "k2-level-1", "k3-level-1"]);
    // Each class plays only its own levels.
    mathLevels.forEach((level) => expect(level.ages).toEqual([level.id.split("-")[0]]));
  });

  it("starts each age with the levels made by hand", () => {
    expect(levelsFor("k1").slice(0, 3).map((level) => level.words.map((question) => question.answer))).toEqual([
      ["4", "6", "2", "4", "2", "6", "bee", "5", "5", "4"],
      ["4", "8", "4", "8", "3", "8", "banana", "5", "6", "7"],
      ["3", "9", "3", "9", "3", "7", "triangle", "5", "7", "4"],
    ]);
    expect(levelsFor("k2").slice(0, 3).map((level) => level.words.map((question) => question.answer))).toEqual([
      ["11", "19", "green sweet | heart sweet | purple sweet | star sweet", "13", "16", "11", "4", "circle | star | triangle | square", "10", "8"],
      ["13", "17", "pig | cat | frog | duck", "14", "18", "14", "6", "8", "1", "9"],
      ["14", "15", "grapes | strawberry | apple | banana", "15", "15", "11", "8", "heart sweet | purple sweet | star sweet | green sweet", "3", "7"],
    ]);
  });

  it("keeps answers to 10 for K1, to 20 for K2 and to 100 for K3", () => {
    const biggest = (age) => Math.max(...levelsFor(age).flatMap((level) => level.words.map((question) => Number(question.answer)).filter(Number.isFinite)));
    expect(biggest("k1")).toBeLessThanOrEqual(10);
    expect(biggest("k2")).toBeLessThanOrEqual(20);
    expect(biggest("k3")).toBeLessThanOrEqual(100);
  });

  it("makes its later levels from question templates, getting harder", () => {
    const level4 = levelsFor("k1")[3].words.map((question) => question.answers[0]);
    expect(level4[0]).toMatch(/^Number bond of \d+$/);
    expect(level4[1]).toMatch(/^Count the /);
    expect(level4[2]).toMatch(/^Make (5|10)$/);
    const olderLast = levelsFor("k2")[19].words.map((question) => question.answers[0]);
    expect(olderLast).toEqual(expect.arrayContaining(["Swap", expect.stringMatching(/^\d+ \+ \? = \d+$/), "Make 20"]));
  });

  it("offers the answer once among its choices, with no negative numbers", () => {
    allQuestions.forEach((question) => {
      expect(question.options.filter((option) => option.correct).map((option) => option.label)).toEqual([question.answer]);
      expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
      question.options.filter((option) => !option.picture && !option.cells && !option.name).forEach((option) => expect(Number(option.label)).toBeGreaterThanOrEqual(0));
    });
  });

  it("asks every question in English and in Chinese", () => {
    allQuestions.forEach((question) => {
      expect(question.prompt.en).toMatch(/[a-z]/);
      expect(question.prompt.zh).toMatch(/[一-鿿]/);
    });
    const fruitStand = levelsFor("k1")[0].words[2];
    expect(fruitStand.prompt).toEqual({
      en: "Mommy Pig wants 10 apples from Mr Fox’s fruit stand. How many more apples does his basket need?",
      zh: "豬媽媽到水果店買蘋果，狐狸店長的籃子裏差多少個蘋果？",
    });
    expect(fruitStand.picture).toEqual({ en: "/images/game-asset/math/fruit-stand-en.svg", zh: "/images/game-asset/math/fruit-stand.svg" });
    expect(fruitStand.visual).toEqual({ type: "equation", text: "8 + ? = 10" });
  });

  it("names each question in the menu without giving the answer away", () => {
    expect(levelsFor("k1")[0].words.map((question) => question.answers[0])).toEqual([
      "Number bond of 6", "Find the triangles", "Mommy Pig buys apples", "2 + 2 = ?", "Number bond of 5", "4, 5, ?, 7, 8",
      "Pattern: butterfly, bee, bee, butterfly, bee, ?, butterfly", "8 − 3 = ?", "Seats on the bus", "7, 6, 5, ?, 3",
    ]);
  });

  it("draws number bonds for K1, but from K2 on only when the whole is 10 or more", () => {
    const bonds = (age) => levelsFor(age).flatMap((level) => level.words).filter((question) => question.visual?.type === "bond");
    bonds("k1").forEach((question) => expect(Boolean(question.picture || question.scene)).toBe(true));
    const k2 = bonds("k2");
    expect(k2.some((question) => question.visual.whole < 10)).toBe(true);
    expect(k2.some((question) => question.visual.whole >= 10)).toBe(true);
    k2.forEach((question) => expect(Boolean(question.scene)).toBe(question.visual.whole >= 10));
    bonds("k3").forEach((question) => expect(question.scene).toBeNull());
  });

  it("only puts things of one kind together in a picture (bugs with bugs, vehicles with vehicles), each kind in its own group", () => {
    const category = {};
    [["cat", "dog", "rabbit"], ["pig", "sheep", "goat", "chicken"], ["duck", "bird", "parrot", "swan"], ["bee", "butterfly", "dragonfly", "moth"],
      ["apple", "orange", "pear"], ["ball", "football", "basketball"], ["car", "bus", "truck", "bike"], ["teddy-bear", "kite"],
      ["circle", "circle-yellow", "circle-blue"], ["flower-red", "flower-yellow", "flower-blue"]]
      .forEach((names, index) => names.forEach((name) => { category[name] = index; }));
    const nameOf = (picture) => picture.split("/").pop().replace(".svg", "");
    const generated = mathLevels.filter((level) => level.ages[0] !== "k3").flatMap((level) => level.words);
    const mixed = generated.flatMap((question) => (
      question.scene?.type === "groups" ? [question.scene.groups.map((group) => group.picture)]
        : question.scene?.type === "count" ? [question.scene.items] : []
    )).map((pictures) => [...new Set(pictures.map(nameOf))]).filter((names) => names.length > 1);
    expect(mixed.length).toBeGreaterThan(50);
    mixed.forEach((names) => expect(new Set(names.map((name) => category[name])).size).toBe(1));
  });

  it("swaps only things of one kind, biggest first: snacks, fruit, farm animals or toys", () => {
    const sets = [["cake", "chocolate", "biscuit", "sweet"], ["watermelon", "pineapple", "apple", "orange"],
      ["horse", "cow", "goat", "chicken"], ["robot", "doll", "teddy-bear", "ball"]];
    const nameOf = (picture) => picture.split("/").pop().replace(".svg", "");
    const swaps = mathLevels.filter((level) => level.ages[0] !== "k3").flatMap((level) => level.words).filter((question) => question.scene?.type === "swap");
    expect(swaps.length).toBeGreaterThan(10);
    swaps.forEach((question) => {
      const [first, second] = question.scene.rows;
      const names = [first.from, first.to, second.to].map(nameOf);
      const set = sets.find((list) => list.includes(names[0]));
      expect(set).toBeDefined();
      const places = names.map((name) => set.indexOf(name));
      expect(places.every((place, index) => place >= 0 && (index === 0 || place > places[index - 1]))).toBe(true);
    });
  });

  it("wraps K1's and K2's pictures of things to add at 5 a row; other groups at 5, or 10 when there are more than 10", () => {
    const groups = (filter) => mathLevels.filter((level) => level.ages[0] !== "k3").flatMap((level) => level.words)
      .filter((question) => question.scene?.type === "groups" && filter(question)).flatMap((question) => question.scene.groups);
    const adding = groups((question) => /^\d+ \+ \d+ = \?$/.test(question.answers[0]));
    expect(adding.length).toBeGreaterThan(20);
    adding.forEach((group) => expect(group.perRow).toBe(5));
    const takingAway = groups((question) => /^\d+ − \d+ = \?$/.test(question.answers[0]));
    expect(takingAway.some((group) => group.count > 10)).toBe(true);
    takingAway.forEach((group) => expect(group.perRow).toBeUndefined());
  });

  it("moves K2's take-aways without a picture from Levels 1-3 to Levels 18-20, and ones with a picture forward", () => {
    const takeAways = (level) => level.words.filter((question) => /^\d+ − \d+ = \?$/.test(question.answers[0]));
    const k2 = levelsFor("k2");
    k2.slice(0, 3).forEach((level) => takeAways(level).forEach((question) => expect(Boolean(question.scene || question.picture)).toBe(true)));
    expect(k2.slice(17).map((level) => takeAways(level).filter((question) => !question.scene && !question.picture).map((question) => question.answers[0])))
      .toEqual([["15 − 2 = ?"], ["18 − 5 = ?"], ["19 − 7 = ?"]]);
    k2.slice(3, 17).forEach((level) => takeAways(level).forEach((question) => expect(question.scene).toBeTruthy()));
  });

  it("puts numbers under 50 in order in some K2 levels, and asks for the different group (under 20) after Level 10", () => {
    const k2 = levelsFor("k2");
    const ordering = k2.flatMap((level) => level.words).filter((question) => question.visual?.type === "cards");
    expect(ordering.length).toBeGreaterThanOrEqual(4);
    ordering.forEach((question) => question.visual.numbers.forEach((number) => expect(number).toBeLessThan(50)));
    k2.forEach((level, index) => {
      const groups = level.words.filter((question) => question.visual?.type === "sets");
      if (index + 1 <= 10) expect(groups).toEqual([]);
      groups.forEach((question) => {
        question.visual.sets.forEach((set) => set.numbers.forEach((number) => expect(number).toBeLessThan(20)));
        const different = question.visual.sets.find((set) => set.letter === question.answer);
        expect(question.visual.sets.filter((set) => set.numbers[0] % 2 === different.numbers[0] % 2)).toHaveLength(1);
        expect(new Set(question.visual.sets.map((set) => set.numbers.join())).size).toBe(4);
      });
    });
    expect(k2.slice(10).filter((level) => level.words.some((question) => question.visual?.type === "sets")).length).toBeGreaterThanOrEqual(5);
  });

  it("gives K2 turning-grid puzzles, and rows of pictures only before Level 10", () => {
    const patterns = (age) => levelsFor(age).flatMap((level) => level.words).map((question) => question.visual?.type).filter((type) => type === "pattern" || type === "grids");
    expect(new Set(patterns("k2"))).toEqual(new Set(["grids", "pattern"]));
    expect(new Set(patterns("k1"))).toEqual(new Set(["pattern"]));
    levelsFor("k2").forEach((level, index) => {
      const rows = level.words.filter((question) => question.visual?.type === "pattern");
      if (index + 1 >= 10) expect(rows).toEqual([]);
      // The harder kinds only: no "A, B, A, B".
      rows.forEach((question) => expect(question.answers[0]).not.toMatch(/^Pattern: (\w+), (?!\1)(\w+), \1, \2, \?$/));
    });
    expect(levelsFor("k2").slice(3, 9).filter((level) => level.words.some((question) => question.visual?.type === "pattern")).length).toBeGreaterThanOrEqual(3);
    // Level 1's: four sweets turning clockwise, the last grid's top left and bottom right to fill.
    const sweets = levelsFor("k2")[0].words[2];
    const file = (picture) => picture && picture.split("/").pop();
    expect(sweets.visual.grids.map((cells) => cells.map(file))).toEqual([
      ["candy-box.svg", "candy-dots.svg", "candy-star.svg", "candy-heart.svg"],
      ["candy-star.svg", "candy-box.svg", "candy-heart.svg", "candy-dots.svg"],
      ["candy-heart.svg", "candy-star.svg", "candy-dots.svg", "candy-box.svg"],
    ]);
    expect(sweets.visual.last.map(file)).toEqual([null, "candy-heart.svg", "candy-box.svg", null]);
    expect(sweets.options.filter((option) => option.correct).map((option) => option.cells.map(file)))
      .toEqual([["candy-dots.svg", "candy-heart.svg", "candy-box.svg", "candy-star.svg"]]);
    expect(sweets.options).toHaveLength(4);
  });

  it("makes the same levels in every browser, however its JavaScript sorts", () => {
    const fingerprint = (levels) => JSON.stringify(levels.map((level) => level.words.map((question) => (
      [question.answers[0], question.answer, question.scene, question.visual, question.options.map((option) => option.label)]
    ))));
    const original = Array.prototype.sort;
    let other;
    // A plain insertion sort: it calls the comparison in a different order from the usual one.
    Array.prototype.sort = function insertionSort(compare = (a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0)) {
      const items = [...this];
      for (let index = 1; index < items.length; index += 1) {
        const item = items[index];
        let place = index;
        while (place > 0 && compare(items[place - 1], item) > 0) {
          items[place] = items[place - 1];
          place -= 1;
        }
        items[place] = item;
      }
      items.forEach((item, index) => { this[index] = item; });
      return this;
    };
    try {
      jest.isolateModules(() => { other = fingerprint(require("../math-data").mathLevels); });
    } finally {
      Array.prototype.sort = original;
    }
    expect(other).toBe(fingerprint(mathLevels));
  });

  it("has every picture it uses", () => {
    const files = allQuestions.flatMap((question) => [
      ...(typeof question.picture === "object" && question.picture ? Object.values(question.picture) : [question.picture]),
      ...question.options.flatMap((option) => [option.picture, ...(option.cells ?? [])]),
      ...(question.visual?.type === "grids" ? [...question.visual.grids.flat(), ...question.visual.last] : []),
      ...(question.visual?.type === "pattern" ? question.visual.items.map((item) => item?.picture) : []),
      ...(question.scene?.type === "groups" ? question.scene.groups.map((group) => group.picture) : []),
      ...(question.scene?.type === "count" ? question.scene.items : []),
      ...(question.scene?.type === "frame" ? [question.scene.picture] : []),
      ...(question.scene?.type === "swap" ? question.scene.rows.flatMap((row) => [row.from, row.to]) : []),
      ...(question.scene?.type === "scatter" ? question.scene.items.map((item) => item.picture) : []),
      ...(question.scene?.type === "queue" ? [question.scene.picture] : []),
      ...(question.scene?.type === "rows" ? question.scene.rows.flat() : []),
      ...(question.scene?.type === "menu" ? [...question.scene.items, ...question.scene.buyers].map((item) => item.picture) : []),
      ...(question.scene?.type === "coins" ? [...question.scene.coins.map((value) => `/images/game-asset/math/coin-${value}.svg`), question.scene.item.picture] : []),
    ]).filter(Boolean);
    expect([...new Set(files)].filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });

  it("opens each class's Level 1, and each later level as soon as the one before is finished", () => {
    const [one, two, three] = levelsFor("k2");
    const finishedLevel1 = { unlocks: [levelUnlockKey(two, today())] };
    expect(levelState(one, null)).toBe("open");
    expect(levelState(two, { unlocks: [] })).toBe("locked");
    // The same day: no waiting until tomorrow.
    expect(levelState(two, finishedLevel1)).toBe("open");
    expect(levelState(three, finishedLevel1)).toBe("locked");
    expect(isLevelOpen(two, finishedLevel1)).toBe(true);
    // An unlock saved before the days were added still counts.
    expect(isLevelOpen(two, { unlocks: [`math-logic/${two.id}`] })).toBe(true);
  });

  it("writes today's date in the player's own time zone", () => {
    expect(today(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(levelUnlockKey(levelsFor("k1")[1], "2026-01-05")).toBe("math-logic/k1-level-2@2026-01-05");
  });
});

describe("Daily Challenge for K3", () => {
  const k3 = levelsFor("k3");
  const kinds = (level) => level.words.map((question) => question.kind).sort();

  it("asks the same mix in every level: 1 count, 2 stories, 2 sums, 2 about numbers to 100, 2 logic, 1 everyday", () => {
    k3.forEach((level) => expect(kinds(level)).toEqual(
      ["counting", "everyday", "logic", "logic", "numbers", "numbers", "story", "story", "sum", "sum"],
    ));
  });

  it("mixes up the order of each level's questions", () => {
    const orders = new Set(k3.map((level) => level.words.map((question) => question.kind).join()));
    expect(orders.size).toBeGreaterThan(15);
  });

  it("uses every kind of question somewhere", () => {
    const titles = k3.flatMap((level) => level.words.map((question) => question.answers[0]));
    [/^Count the (circles|squares|triangles)$/, /^Count the .*(leaves|sprouts)$/, / now$|(in the|in the car) /, /’s line$/, /^Swap /,
      /^\d+ \+ \d+ \+ \d+ = \?$/, /^\? [+−] \d+ = \d+$|^\d+ [+−] \? = \d+$/, /^Smallest to biggest$|^Biggest to smallest$/,
      /^Count the (legs|wheels)$/, /^The different group$/, /^How the shading moves$/, /^The row with the most /, /^Turning grid/,
      /^Who spent the (most|least)$/, /^Enough for the /, /days? (before|after) /, /^What time is it\?$/,
    ].forEach((title) => expect(titles.some((text) => title.test(text))).toBe(true));
  });

  it("has its sums and number bonds typed on a number pad, with the right answer worked out", () => {
    const sums = k3.flatMap((level) => level.words).filter((question) => question.kind === "sum");
    sums.forEach((question) => {
      expect(question.input).toBe("pad");
      if (question.visual.type === "bond") {
        const part = question.visual.parts.find((value) => value !== null);
        expect(Number(question.answer)).toBe(question.visual.whole - part);
        return;
      }
      const [left, right] = question.visual.text.split(" = ");
      const work = (text) => Function(`return ${text.replace(/−/g, "-")}`)();
      if (right === "?") expect(work(left)).toBe(Number(question.answer));
      else expect(work(left.replace("?", question.answer))).toBe(Number(right));
      expect(Number(question.answer)).toBeGreaterThanOrEqual(0);
      // Sums to 20, or to 20 + 20 with a picture.
      expect(Number(question.answer)).toBeLessThanOrEqual(question.scene ? 40 : 20);
    });
    expect(k3.flatMap((level) => level.words).filter((question) => question.input === "pad").every((question) => question.kind === "sum")).toBe(true);
  });

  it("asks some sums with a picture of two kinds of thing, each up to 20, rows of 10 when there are more than 10", () => {
    const drawn = k3.flatMap((level) => level.words).filter((question) => question.kind === "sum" && question.scene);
    expect(drawn.length).toBeGreaterThanOrEqual(4);
    expect(drawn.some((question) => question.scene.groups.some((group) => group.count > 10))).toBe(true);
    drawn.forEach((question) => {
      expect(question.scene.groups).toHaveLength(2);
      question.scene.groups.forEach((group) => {
        expect(group.count).toBeLessThanOrEqual(20);
        // Left to the game: 5 a row, or 10 for more than 10.
        expect(group.perRow).toBeUndefined();
      });
      expect(Number(question.answer)).toBe(question.scene.groups[0].count + question.scene.groups[1].count);
    });
  });

  it("writes some clock times in words: o’clock and half past", () => {
    const clocks = k3.flatMap((level) => level.words).filter((question) => question.scene?.type === "clock");
    expect(clocks.some((question) => question.scene.minute === 30)).toBe(true);
    clocks.forEach((question) => {
      const names = question.options.map((option) => option.name);
      expect(names.some((name) => / o’clock$|^half past /.test(name.en))).toBe(true);
      names.filter((name) => / o’clock$/.test(name.en)).forEach((name) => expect(name.zh).toMatch(/^\d+ 時正$/));
      names.filter((name) => /^half past /.test(name.en)).forEach((name) => expect(name.zh).toMatch(/^\d+ 時半$/));
      const right = question.options.find((option) => option.correct);
      const [hour, minute] = question.answer.split(":").map(Number);
      expect([question.answer, `${hour} o’clock`, `half past ${hour}`]).toContain(right.name.en);
      expect(minute === 30 ? right.name.en !== `${hour} o’clock` : right.name.en !== `half past ${hour}`).toBe(true);
    });
  });

  it("asks some number bonds to 20, without a picture", () => {
    const bonds = k3.flatMap((level) => level.words).filter((question) => question.visual?.type === "bond");
    expect(bonds.length).toBeGreaterThanOrEqual(4);
    bonds.forEach((question) => {
      expect(question.scene).toBeNull();
      expect(question.picture).toBeNull();
      expect(question.visual.whole).toBeLessThanOrEqual(20);
    });
  });

  it("asks about numbers to 100 going up and down, in twos (odd and even), fives, tens and ones", () => {
    const runs = k3.flatMap((level) => level.words).filter((question) => question.visual?.type === "sequence");
    const steps = new Set(runs.map((question) => {
      const [a, b, c] = question.visual.items;
      return a !== null && b !== null ? b - a : c - (a ?? b - (c - b));
    }));
    [1, 2, 5, 10].forEach((size) => expect(steps.has(size) || steps.has(-size)).toBe(true));
    expect([...steps].some((step) => step > 0) && [...steps].some((step) => step < 0)).toBe(true);
    expect(steps.has(2) && steps.has(-2)).toBe(true);
    runs.forEach((question) => question.visual.items.filter((item) => item !== null).forEach((item) => {
      expect(item).toBeGreaterThanOrEqual(0);
      expect(item).toBeLessThanOrEqual(100);
    }));
  });

  it("works out the stories' answers", () => {
    const stories = k3.flatMap((level) => level.words).filter((question) => question.kind === "story");
    stories.forEach((question) => {
      const { scene } = question;
      if (scene.type === "groups" && /^The difference between/.test(question.answers[0])) {
        expect(Number(question.answer)).toBe(Math.abs(scene.groups[0].count - scene.groups[1].count));
      } else if (scene.type === "groups") {
        // "There are 9 cars… 2 drive away, then 3 more drive away (or 3 drive in)…"
        const [start, first, second] = question.prompt.en.match(/\d+/g).map(Number);
        const more = question.prompt.en.includes(`then ${second} more `);
        expect(Number(question.answer)).toBe(start - first + (more ? -second : second));
        // The picture shows only how many there were to begin with.
        expect(scene.groups).toEqual([expect.objectContaining({ count: start })]);
        expect(scene.groups[0].crossed).toBeUndefined();
      }
      if (scene.type === "queue") expect(Number(question.answer)).toBe(scene.front + scene.behind + 1);
      if (scene.type === "swap") expect(Number(question.answer)).toBe(scene.rows[0].count * scene.rows[1].count * scene.rows[2].fromCount);
      // (Bags and bean cards are answered in words or letters, checked with the comparing questions.)
      if (/^\d+$/.test(question.answer)) expect(Number(question.answer)).toBeGreaterThan(0);
    });
  });

  it("asks a queue question both ways later on", () => {
    expect(levelsFor("k3")[10].words.length).toBe(10);
    const queues = k3.flatMap((level) => level.words).filter((question) => question.scene?.type === "queue");
    expect(queues.some((question) => /from the front/.test(question.prompt.en))).toBe(true);
    expect(queues.some((question) => /in front of it/.test(question.prompt.en))).toBe(true);
  });

  it("checks the everyday questions: the clock, the days, the coins and who spent most", () => {
    const everyday = k3.flatMap((level) => level.words).filter((question) => question.kind === "everyday");
    expect(everyday).toHaveLength(20);
    everyday.forEach((question) => {
      const { scene } = question;
      if (scene.type === "clock") expect(question.answer).toBe(`${scene.hour}:${String(scene.minute).padStart(2, "0")}`);
      if (scene.type === "coins") expect(question.answer).toBe(scene.coins.reduce((sum, coin) => sum + coin, 0) >= scene.item.price ? "yes" : "no");
      if (scene.type === "menu") {
        scene.items.forEach((item) => expect(item.price).toBeLessThan(10));
        const totals = scene.buyers.map((buyer) => buyer.picks.reduce((sum, pick) => sum + scene.items[pick].price, 0));
        const best = /least/.test(question.prompt.en) ? Math.min(...totals) : Math.max(...totals);
        expect(totals.filter((total) => total === best)).toHaveLength(1);
        expect(question.options.find((option) => option.correct).picture).toBe(scene.buyers[totals.indexOf(best)].picture);
      }
    });
    const week = everyday.find((question) => question.scene.type === "week");
    expect(week.options.map((option) => option.name.zh)).toContain(week.options.find((option) => option.correct).name.zh);
  });

  it("asks the different-group puzzle with three groups of one kind (odd or even) and one of the other", () => {
    k3.flatMap((level) => level.words).filter((question) => question.visual?.type === "sets").forEach((question) => {
      const odd = question.visual.sets.map((set) => set.numbers[0] % 2);
      const different = question.visual.sets.find((set) => set.letter === question.answer);
      expect(odd.filter((value) => value === different.numbers[0] % 2)).toHaveLength(1);
    });
  });

  it("keeps the different group's numbers to 30 in Levels 1-5, 50 in Levels 6-15 and 80 in Levels 16-20", () => {
    const limit = (level) => (level <= 5 ? 30 : level <= 15 ? 50 : 80);
    const found = k3.flatMap((level, index) => level.words.filter((question) => question.visual?.type === "sets").map((question) => [index + 1, question]));
    expect(new Set(found.map(([level]) => limit(level)))).toEqual(new Set([30, 50, 80]));
    found.forEach(([level, question]) => {
      const numbers = question.visual.sets.flatMap((set) => set.numbers);
      numbers.forEach((number) => {
        expect(number).toBeGreaterThanOrEqual(1);
        expect(number).toBeLessThanOrEqual(limit(level));
      });
      // From 50 up, no two groups share a number.
      if (limit(level) >= 50) expect(new Set(numbers).size).toBe(16);
    });
  });

  it("has just two shading puzzles, a 2 × 2 in Level 5 and a 3 × 3 in Level 15, each with one example pair", () => {
    const shading = k3.flatMap((level, index) => level.words.filter((question) => question.visual?.type === "shading").map((question) => [index + 1, question]));
    expect(shading.map(([level, question]) => [level, question.visual.size])).toEqual([[5, 2], [15, 3]]);
    shading.forEach(([, question]) => {
      expect(question.options).toHaveLength(4);
      expect(question.options.filter((option) => option.correct).map((option) => option.label)).toEqual([question.answer]);
      expect(question.visual.pairs).toHaveLength(1);
    });
  });

  it("compares two lots of things every other level: bags of bread rolls, cards of beans and two groups", () => {
    const comparing = k3.map((level) => level.words.find((question) => question.scene?.type === "bags" || question.scene?.type === "beanCards" || /^The difference between/.test(question.answers[0])));
    expect(comparing.map((question, index) => (question ? index + 1 : null)).filter(Boolean)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    comparing.filter(Boolean).forEach((question) => {
      if (question.scene.type === "bags") {
        const [a, b] = question.scene.bags.map((bag) => bag.count);
        expect(question.answer).toBe(`${a > b ? "more" : "fewer"}-${Math.abs(a - b)}`);
        expect(question.options.find((option) => option.correct).name).toEqual(a > b ? { en: `${a - b} more`, zh: `多${a - b}個` } : { en: `${b - a} fewer`, zh: `少${b - a}個` });
        expect(question.options).toHaveLength(4);
      } else if (question.scene.type === "beanCards") {
        const count = (letter) => question.scene.cards.find((card) => card.letter === letter).count;
        const more = Number(question.prompt.en.match(/has (\d+) more/)[1]);
        expect(count(question.answer)).toBe(count("C") + more);
        expect(question.scene.cards.filter((card) => card.count === count("C") + more)).toHaveLength(1);
        expect(question.options.map((option) => option.label)).toEqual(["A", "B", "D"]);
      } else {
        const [a, b] = question.scene.groups.map((group) => group.count);
        expect(Number(question.answer)).toBe(Math.abs(a - b));
      }
    });
  });

  it("asks about a December calendar in Levels 5, 10, 15 and 20: Grandma’s birthday on the 9th (a Wednesday), Christmas on the 25th (a Friday)", () => {
    const asked = k3.flatMap((level, index) => level.words.filter((question) => question.scene?.type === "calendar").map((question) => [index + 1, question.answers[0], question.answer]));
    expect(asked).toEqual([
      [5, "Christmas: what date?", "25"], [10, "Christmas: what day?", "Friday"],
      [15, "Grandma’s birthday: what date?", "9"], [20, "Grandma’s birthday: what day?", "Wednesday"],
    ]);
    const { scene } = k3[4].words.find((question) => question.scene?.type === "calendar");
    expect(scene.marks.map((mark) => [mark.day, mark.name.en])).toEqual([[9, "Grandma’s birthday"], [25, "Christmas"]]);
    // The 9th and the 25th fall on those days when the month starts on a Tuesday.
    expect(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(9 - 1 + scene.firstDay) % 7]).toBe("Wednesday");
    expect(k3[4].words.find((question) => question.scene?.type === "calendar").options.map((option) => option.name.zh)).toContain("12月25日");
  });
});

describe("Left or right", () => {
  const leftRight = (age) => levelsFor(age).flatMap((level, index) => level.words
    .filter((question) => / left or right\?$/.test(question.answers[0])).map((question) => [index + 1, question]));

  it("asks a few K2 and K3 levels left-or-right questions about Ada and her pets, Elly’s mirror and Tofu’s arm", () => {
    expect(leftRight("k2").map(([level, question]) => [level, question.answers[0]])).toEqual([
      [5, "Ada’s cat: left or right?"], [9, "Elly’s mole: left or right?"], [13, "Tofu’s arm: left or right?"], [17, "Ada’s cat: left or right?"],
    ]);
    expect(leftRight("k3").map(([level]) => level)).toEqual([3, 8, 12, 18]);
    expect(leftRight("k1")).toEqual([]);
  });

  it("shows the picture for the right answer, with both sides to choose from", () => {
    const both = [...leftRight("k2"), ...leftRight("k3")].map(([, question]) => question);
    expect(new Set(both.map((question) => question.answer))).toEqual(new Set(["left", "right"]));
    both.forEach((question) => {
      expect(question.picture).toMatch(new RegExp(`-${question.answer}(-arm)?\\.svg$`));
      expect(question.options.map((option) => option.label)).toEqual(["left", "right"]);
      expect(question.options.find((option) => option.correct).label).toBe(question.answer);
    });
    const tofu = both.find((question) => question.answers[0].startsWith("Tofu"));
    expect(tofu.options.map((option) => option.name.zh)).toEqual(["左手", "右手"]);
  });
});

describe("Rainbow Speed Quest", () => {
  const sums = (topic) => topic.words.map((question) => question.answers[0]);

  it("has adding and taking-away sums within 10 and within 20, ten a round", () => {
    expect(speedTopics.map((topic) => [topic.id, topic.wordsPerGame, topic.timed])).toEqual([["within-10", 10, true], ["within-20", 10, true]]);
    expect(sums(speedTopics[0])).toEqual(expect.arrayContaining(["1 + 1 = ?", "9 + 1 = ?", "10 − 9 = ?", "5 − 4 = ?"]));
    expect(sums(speedTopics[1])).toEqual(expect.arrayContaining(["9 + 9 = ?", "1 + 19 = ?", "20 − 19 = ?", "11 − 1 = ?"]));
    expect(sums(speedTopics[1])).not.toContain("3 + 4 = ?");
  });

  it("works out every answer, never below 1 or above the limit", () => {
    speedTopics.forEach((topic, index) => {
      const limit = [10, 20][index];
      topic.words.forEach((question) => {
        const [a, sign, b] = question.answers[0].split(" ");
        expect(Number(question.answer)).toBe(sign === "+" ? Number(a) + Number(b) : Number(a) - Number(b));
        expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
        expect(Number(question.answer)).toBeLessThanOrEqual(limit);
      });
    });
  });
});
