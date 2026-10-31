import fs from "node:fs";
import path from "node:path";
import { isLevelOpen, levelState, levelUnlockKey, mathLevels, today } from "./math-data";
import { speedTopics } from "./speed-quest-data";

const publicDir = path.join(__dirname, "..", "public");
const levelsFor = (age) => mathLevels.filter((level) => level.ages.includes(age));
const allQuestions = mathLevels.flatMap((level) => level.words);

describe("Daily Challenge", () => {
  it("has twenty levels of ten questions for each age", () => {
    ["3-4", "5-6"].forEach((age) => {
      expect(levelsFor(age).map((level) => level.name)).toEqual(Array.from({ length: 20 }, (_, index) => `Level ${index + 1}`));
      levelsFor(age).forEach((level) => expect(level.words).toHaveLength(10));
    });
    expect(mathLevels.map((level) => level.id).slice(0, 2)).toEqual(["3-4-level-1", "3-4-level-2"]);
    expect(mathLevels.filter((level) => level.first).map((level) => level.id)).toEqual(["3-4-level-1", "5-6-level-1"]);
  });

  it("starts each age with the levels made by hand", () => {
    expect(levelsFor("3-4").slice(0, 3).map((level) => level.words.map((question) => question.answer))).toEqual([
      ["4", "6", "2", "4", "2", "6", "bee", "5", "5", "4"],
      ["4", "8", "4", "8", "3", "8", "banana", "5", "6", "7"],
      ["3", "9", "3", "9", "3", "7", "triangle", "5", "7", "4"],
    ]);
    expect(levelsFor("5-6").slice(0, 3).map((level) => level.words.map((question) => question.answer))).toEqual([
      ["11", "19", "sock", "13", "16", "11", "4", "big circle", "13", "8"],
      ["13", "17", "hat", "14", "18", "14", "6", "8", "13", "9"],
      ["14", "15", "red flower", "15", "15", "11", "8", "right", "12", "7"],
    ]);
  });

  it("keeps answers to 10 for 3-4 year olds and to 20 for 5-6 year olds", () => {
    const biggest = (age) => Math.max(...levelsFor(age).flatMap((level) => level.words.map((question) => Number(question.answer)).filter(Number.isFinite)));
    expect(biggest("3-4")).toBeLessThanOrEqual(10);
    expect(biggest("5-6")).toBeLessThanOrEqual(20);
  });

  it("makes its later levels from question templates, getting harder", () => {
    const level4 = levelsFor("3-4")[3].words.map((question) => question.answers[0]);
    expect(level4[0]).toMatch(/^Number bond of \d+$/);
    expect(level4[1]).toMatch(/^Count the /);
    expect(level4[2]).toMatch(/^Make (5|10)$/);
    const olderLast = levelsFor("5-6")[19].words.map((question) => question.answers[0]);
    expect(olderLast).toEqual(expect.arrayContaining(["Swap", expect.stringMatching(/^\d+ \+ \? = \d+$/), "Make 20"]));
  });

  it("offers the answer once among its choices, with no negative numbers", () => {
    allQuestions.forEach((question) => {
      expect(question.options.filter((option) => option.correct).map((option) => option.label)).toEqual([question.answer]);
      expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
      question.options.filter((option) => !option.picture).forEach((option) => expect(Number(option.label)).toBeGreaterThanOrEqual(0));
    });
  });

  it("asks every question in English and in Chinese", () => {
    allQuestions.forEach((question) => {
      expect(question.prompt.en).toMatch(/[a-z]/);
      expect(question.prompt.zh).toMatch(/[一-鿿]/);
    });
    const fruitStand = levelsFor("3-4")[0].words[2];
    expect(fruitStand.prompt).toEqual({
      en: "Mommy Pig wants 10 apples from Mr Fox’s fruit stand. How many more apples does his basket need?",
      zh: "豬媽媽到水果店買蘋果，狐狸店長的籃子裏差多少個蘋果？",
    });
    expect(fruitStand.picture).toEqual({ en: "/images/game-asset/math/fruit-stand-en.svg", zh: "/images/game-asset/math/fruit-stand.svg" });
    expect(fruitStand.visual).toEqual({ type: "equation", text: "8 + ? = 10" });
  });

  it("names each question in the menu without giving the answer away", () => {
    expect(levelsFor("3-4")[0].words.map((question) => question.answers[0])).toEqual([
      "Number bond of 6", "Find the triangles", "Mommy Pig buys apples", "2 + 2 = ?", "Number bond of 5", "4, 5, ?, 7, 8",
      "Pattern: butterfly, bee, bee, butterfly, bee, ?, butterfly", "8 − 3 = ?", "Seats on the bus", "7, 6, 5, ?, 3",
    ]);
  });

  it("has every picture it uses", () => {
    const files = allQuestions.flatMap((question) => [
      ...(typeof question.picture === "object" && question.picture ? Object.values(question.picture) : [question.picture]),
      ...question.options.map((option) => option.picture),
      ...(question.visual?.type === "pattern" ? question.visual.items.map((item) => item?.picture) : []),
      ...(question.scene?.type === "groups" ? question.scene.groups.map((group) => group.picture) : []),
      ...(question.scene?.type === "count" ? question.scene.items : []),
      ...(question.scene?.type === "frame" ? [question.scene.picture] : []),
      ...(question.scene?.type === "swap" ? question.scene.rows.flatMap((row) => [row.from, row.to]) : []),
    ]).filter(Boolean);
    expect([...new Set(files)].filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });

  it("opens each age's Level 1, and each later level the day after the one before is finished", () => {
    const [one, two, three] = levelsFor("5-6");
    const finishedLevel1 = { unlocks: [levelUnlockKey(two, "2026-10-30")] };
    expect(levelState(one, null, "2026-10-30")).toBe("open");
    expect(levelState(two, { unlocks: [] }, "2026-10-30")).toBe("locked");
    expect(levelState(two, finishedLevel1, "2026-10-30")).toBe("tomorrow");
    expect(levelState(two, finishedLevel1, "2026-10-31")).toBe("open");
    expect(levelState(three, finishedLevel1, "2026-10-31")).toBe("locked");
    expect(isLevelOpen(two, finishedLevel1, "2026-11-02")).toBe(true);
  });

  it("writes today's date in the player's own time zone", () => {
    expect(today(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(levelUnlockKey(levelsFor("3-4")[1], "2026-01-05")).toBe("math-logic/3-4-level-2@2026-01-05");
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
