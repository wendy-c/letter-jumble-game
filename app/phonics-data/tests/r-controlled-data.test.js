import fs from "node:fs";
import path from "node:path";
import { rControlledPairs, rControlledTopics, rControlledWordsPerGame } from "../r-controlled-data";

const publicDir = path.join(__dirname, "..", "..", "..", "public");
const [game] = rControlledTopics;
const wordsOf = (pair) => game.words.filter((question) => question.pair === pair).map((question) => question.word);

describe("R-Controlled Vowels", () => {
  it("has one game with every word, ten to a round", () => {
    expect(rControlledTopics).toHaveLength(1);
    expect([game.id, game.name, game.wordsPerGame]).toEqual(["mixed", "R-Controlled Vowels - ar, er, ir, or, ur", 10]);
    expect(rControlledWordsPerGame).toBe(10);
    expect(wordsOf("ar")).toEqual(["car", "bar", "star", "far", "arm", "art", "barn", "park", "target", "market", "carpet"]);
    expect([...wordsOf("er"), ...wordsOf("ir"), ...wordsOf("ur")]).toEqual([
      "her", "serve", "water", "paper", "winter", "bird", "girl", "first", "sir", "shirt", "dirt", "circle",
      "fur", "turn", "burn", "nurse", "purple", "turtle",
    ]);
    expect(wordsOf("or")).toEqual(["for", "corn", "fork", "short", "storm", "horn", "north", "forest", "orange", "report"]);
  });

  it("leaves out the vowel and its r, two letters filled together by the word's pair", () => {
    game.words.forEach((question) => {
      expect(question.gapLength).toBe(2);
      expect(question.word.slice(question.missing, question.missing + 2)).toBe(question.pair);
    });
    const water = game.words.find((question) => question.word === "water");
    expect(water.word.slice(0, water.missing)).toBe("wat");
  });

  it("offers ar, er, ir, or and ur, but never a pair that would spell a word children shouldn't see", () => {
    expect(rControlledPairs).toEqual(["ar", "er", "ir", "or", "ur"]);
    game.words.forEach((question) => {
      expect(question.choices).toContain(question.pair);
      if (!["shirt", "short", "fork"].includes(question.word)) expect(question.choices).toEqual(rControlledPairs);
    });
    ["shirt", "short", "fork"].forEach((word) => {
      expect(game.words.find((question) => question.word === word).choices).toEqual(["er", "ir", "or", "ur"]);
    });
  });

  it("has a picture for every word, and an icon", () => {
    const files = [game.icon, ...game.words.map((question) => question.picture)];
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
    expect(new Set(game.words.map((question) => question.picture)).size).toBe(game.words.length);
  });
});
