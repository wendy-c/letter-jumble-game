import fs from "node:fs";
import path from "node:path";
import { digraphTopics, digraphWordsPerGame } from "./digraphs-data";

const publicDir = path.join(__dirname, "..", "public");
const topic = (id) => digraphTopics.find((candidate) => candidate.id === id);

describe("Consonant Digraphs", () => {
  it("has three modules of 10 questions each: ch/sh/th, ph/wh/ck/ng, and all of them mixed", () => {
    expect(digraphTopics.map((module) => [module.name, module.words.length, module.wordsPerGame])).toEqual([
      ["ch · sh · th", 30, 10],
      ["ph · wh · ck · ng", 20, 10],
      ["Mixed Digraphs", 50, 10],
    ]);
    expect(digraphWordsPerGame).toBe(10);
    expect(topic("ch-sh-th").words.filter((word) => word.digraph === "ch").map((word) => word.word))
      .toEqual(["chair", "chin", "cheese", "cherry", "chicken", "beach", "lunch", "peach", "bench", "match"]);
    expect(topic("ph-wh-ck-ng").words.filter((word) => word.digraph === "ng").map((word) => word.word))
      .toEqual(["king", "ring", "song", "long", "bring"]);
  });

  it("leaves a two-letter gap where the word's digraph is", () => {
    const gap = (id, word) => {
      const question = topic(id).words.find((candidate) => candidate.word === word);
      return question.word.slice(question.missing, question.missing + question.gapLength);
    };
    expect(gap("ch-sh-th", "chicken")).toBe("ch");
    expect(gap("ch-sh-th", "thick")).toBe("th");
    expect(gap("ch-sh-th", "match")).toBe("ch");
    expect(gap("ph-wh-ck-ng", "kick")).toBe("ck");
    expect(gap("ph-wh-ck-ng", "graph")).toBe("ph");
    digraphTopics.flatMap((module) => module.words).forEach((question) => {
      expect(question.word.slice(question.missing, question.missing + 2)).toBe(question.digraph);
    });
  });

  it("offers each module's digraphs, and in Mixed the right one plus three that don't spell another word", () => {
    topic("ch-sh-th").words.forEach((question) => expect(question.choices).toEqual(["ch", "sh", "th"]));
    topic("ph-wh-ck-ng").words.forEach((question) => expect(question.choices).toEqual(["ph", "wh", "ck", "ng"]));
    topic("mixed").words.forEach((question) => {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.digraph);
    });
    const mixed = (word) => topic("mixed").words.find((question) => question.word === word).choices;
    expect(mixed("ship")).not.toContain("ch");
    expect(mixed("chin")).not.toContain("th");
    expect(mixed("chin")).not.toContain("sh");
    expect(mixed("wish")).not.toContain("th");
  });

  it("has a picture for every word, and every picture file exists", () => {
    const words = digraphTopics.flatMap((module) => module.words);
    words.forEach((question) => expect(question.picture).toBeTruthy());
    const files = [...digraphTopics.map((module) => module.icon), ...words.map((question) => question.picture)].filter((picture) => picture.startsWith("/"));
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
