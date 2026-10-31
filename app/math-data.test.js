import fs from "node:fs";
import path from "node:path";
import { isLevelOpen, levelUnlockKey, mathLevels } from "./math-data";

const publicDir = path.join(__dirname, "..", "public");

describe("Math and Logic", () => {
  it("has six levels of ten questions", () => {
    expect(mathLevels.map((level) => [level.name, level.words.length])).toEqual([
      ["Level 1", 10], ["Level 2", 10], ["Level 3", 10], ["Level 4", 10], ["Level 5", 10], ["Level 6", 10],
    ]);
  });

  it("has the right answers, under 10 in levels 1-3 and within 20 in levels 4-6", () => {
    expect(mathLevels.map((level) => level.words.map((question) => question.answer))).toEqual([
      ["4", "6", "2", "4", "2", "6", "bee", "5", "5", "4"],
      ["4", "8", "4", "8", "3", "8", "banana", "5", "6", "7"],
      ["3", "9", "3", "9", "3", "7", "triangle", "5", "7", "4"],
      ["11", "19", "sock", "13", "16", "11", "4", "big circle", "13", "8"],
      ["13", "17", "hat", "14", "18", "14", "6", "8", "13", "9"],
      ["14", "15", "red flower", "15", "15", "11", "8", "right", "12", "7"],
    ]);
  });

  it("offers the answer once among its choices, with no negative numbers", () => {
    mathLevels.flatMap((level) => level.words).forEach((question) => {
      expect(question.options.filter((option) => option.correct).map((option) => option.label)).toEqual([question.answer]);
      expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
      question.options.filter((option) => !option.picture).forEach((option) => expect(Number(option.label)).toBeGreaterThanOrEqual(0));
    });
  });

  it("names each question in the menu without giving the answer away", () => {
    expect(mathLevels[0].words.map((question) => question.answers[0])).toEqual([
      "Number bond of 6", "Find the triangles", "豬媽媽買蘋果", "2 + 2 = ?", "Number bond of 5", "4, 5, ?, 7, 8",
      "Pattern: butterfly, bee, bee, butterfly, bee, ?, butterfly", "8 − 3 = ?", "Seats on the bus", "7, 6, 5, ?, 3",
    ]);
  });

  it("asks the fruit stand question in Chinese", () => {
    const [question] = mathLevels[0].words.filter((item) => item.lang !== "en");
    expect(question.prompt).toBe("豬媽媽到水果店買蘋果，她說「請給我10個蘋果，謝謝!」，狐狸店長差多少個蘋果？");
    expect(question.lang).toBe("zh-Hant-HK");
  });

  it("has every picture it uses", () => {
    const files = mathLevels.flatMap((level) => level.words.flatMap((question) => [
      question.picture,
      ...question.options.map((option) => option.picture),
      ...(question.visual?.type === "pattern" ? question.visual.items.map((item) => item?.picture) : []),
    ])).filter(Boolean);
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });

  it("opens level 1 for everyone, and each later level once the one before is finished", () => {
    const [one, two, three] = mathLevels;
    expect(isLevelOpen(one, null)).toBe(true);
    expect(isLevelOpen(two, { unlocks: [] })).toBe(false);
    expect(isLevelOpen(two, { unlocks: [levelUnlockKey(two)] })).toBe(true);
    expect(isLevelOpen(three, { unlocks: [levelUnlockKey(two)] })).toBe(false);
  });
});
