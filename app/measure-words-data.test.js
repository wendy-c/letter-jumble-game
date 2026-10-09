import fs from "node:fs";
import path from "node:path";
import { measureWordTopics, measureWordsForTesting } from "./measure-words-data";

const topic = measureWordTopics[0];
const { measureWords, nounIcons, fits } = measureWordsForTesting;
const publicDir = path.join(__dirname, "..", "public");

describe("measure words", () => {
  it("has a question for every pairing in the list, 20 per game", () => {
    expect(measureWords.map((measure) => measure.word).join("")).toBe("個位封幅束份面間所扇枝張本把雙件頂棵朵片座道粒盆");
    expect(topic.words).toHaveLength(measureWords.reduce((total, measure) => total + measure.nouns.length, 0));
    expect(topic.wordsPerGame).toBe(20);
    expect(topic.words.map((question) => question.answers[0])).toContain("一張照片");
    expect(topic.words.map((question) => question.answers[0])).toContain("幾朵白雲".replace("幾", "一"));
  });

  it("offers four different nouns, exactly one of which goes with the measure word", () => {
    topic.words.forEach((question) => {
      const measure = measureWords.find((candidate) => candidate.word === question.character);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.noun)).size).toBe(4);
      const fitting = question.options.filter((option) => fits(measure, option.noun));
      expect(fitting.map((option) => option.noun)).toEqual([question.noun]);
      expect(question.options.find((option) => option.correct).noun).toBe(question.noun);
    });
  });

  it("never marks an everyday pairing wrong (一個老師, 一張圖畫, 一把椅子 and 一張椅子)", () => {
    const optionsFor = (word) => topic.words.filter((question) => question.character === word).flatMap((question) => question.options);
    expect(optionsFor("個").filter((option) => !option.correct).map((option) => option.noun)).not.toContain("老師");
    expect(optionsFor("張").filter((option) => !option.correct).map((option) => option.noun)).not.toContain("圖畫");
    expect(optionsFor("張").filter((option) => !option.correct).map((option) => option.noun)).not.toContain("椅子");
    expect(optionsFor("把").filter((option) => !option.correct).map((option) => option.noun)).not.toContain("椅子");
  });

  it("moves the right answer around", () => {
    expect(new Set(topic.words.map((question) => question.options.findIndex((option) => option.correct))).size).toBe(4);
  });

  it("gives every noun an icon, and any picture icon exists", () => {
    topic.words.flatMap((question) => question.options).forEach((option) => expect(option.icon).toBeTruthy());
    const pictures = Object.values(nounIcons).filter((icon) => icon.startsWith("/"));
    expect(pictures.filter((picture) => !fs.existsSync(path.join(publicDir, picture)))).toEqual([]);
  });
});
