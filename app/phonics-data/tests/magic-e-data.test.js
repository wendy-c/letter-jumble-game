import fs from "node:fs";
import path from "node:path";
import { magicETopics, magicEWordsPerGame } from "../magic-e-data";

const publicDir = path.join(__dirname, "..", "..", "..", "public");
const topic = (id) => magicETopics.find((candidate) => candidate.id === id);
const wordsOf = (id) => topic(id).words.map((question) => question.word);

describe("Magic E", () => {
  it("has a game for each long vowel (a_e, i_e, o_e, u_e) and one with them all mixed", () => {
    expect(magicETopics.map((module) => [module.name, module.words.length, module.wordsPerGame])).toEqual([
      ["Long A · a_e", 10, 10], ["Long I · i_e", 10, 10], ["Long O · o_e", 10, 10], ["Long U · u_e", 8, 10], ["Mixed Magic E", 38, 10],
    ]);
    expect(magicEWordsPerGame).toBe(10);
    expect(wordsOf("a-e")).toEqual(["bake", "cake", "date", "gate", "late", "make", "name", "rake", "tape", "wave"]);
    expect(wordsOf("i-e")).toEqual(["bite", "dive", "five", "hike", "kite", "lime", "pine", "ride", "time", "wipe"]);
    expect(wordsOf("o-e")).toEqual(["bone", "cone", "home", "hope", "joke", "note", "pole", "rope", "rose", "vote"]);
    expect(wordsOf("u-e")).toEqual(["cube", "cute", "flute", "huge", "mule", "mute", "tube", "tune"]);
  });

  it("leaves out the vowel and the e at the end, filled together by the word's pair", () => {
    magicETopics.flatMap((module) => module.words).forEach((question) => {
      expect(question.magicE).toBe(true);
      expect(`${question.word[question.missing]}_${question.word.at(-1)}`).toBe(question.pattern);
      expect(question.word.length - question.missing).toBe(3);
    });
    const flute = topic("u-e").words.find((question) => question.word === "flute");
    expect(flute.word.slice(0, flute.missing)).toBe("fl");
  });

  it("offers a_e, i_e, o_e and u_e in that order, except that rope never offers a_e", () => {
    magicETopics.flatMap((module) => module.words).forEach((question) => {
      expect(question.choices).toContain(question.pattern);
      expect(question.choices).toHaveLength(4);
      if (question.word !== "rope") expect(question.choices).toEqual(["a_e", "i_e", "o_e", "u_e"]);
    });
    expect(topic("o-e").words.find((question) => question.word === "rope").choices).toEqual(["e_e", "i_e", "o_e", "u_e"]);
  });

  it("has a picture for every word, and every picture file exists", () => {
    const words = magicETopics.flatMap((module) => module.words);
    const files = [...magicETopics.map((module) => module.icon), ...words.map((question) => question.picture)];
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
