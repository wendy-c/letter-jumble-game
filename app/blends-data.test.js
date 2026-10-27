import fs from "node:fs";
import path from "node:path";
import { blendTopics, blendWordsPerGame } from "./blends-data";

const publicDir = path.join(__dirname, "..", "public");
const topic = (id) => blendTopics.find((candidate) => candidate.id === id);
const question = (id, word) => topic(id).words.find((candidate) => candidate.word === word);

describe("R and L Blends", () => {
  it("has three modules of 10 questions each: R blends, L blends, and both mixed", () => {
    expect(blendTopics.map((module) => [module.name, module.words.length, module.wordsPerGame])).toEqual([
      ["R Blends", 51, 10],
      ["L Blends", 32, 10],
      ["Mixed Blends", 83, 10],
    ]);
    expect(blendWordsPerGame).toBe(10);
    const wordsFor = (blend) => topic("r-blends").words.filter((word) => word.blend === blend).map((word) => word.word);
    expect(wordsFor("br")).toEqual(["bread", "brush", "brick", "bring", "brave"]);
    expect(wordsFor("pr")).toEqual(["press", "prize", "prince", "present", "print"]);
    expect(wordsFor("str")).toEqual(["street", "strong", "straw", "stretch"]);
    expect(wordsFor("spr")).toEqual(["spring", "spray", "sprout"]);
  });

  it("leaves a gap for the blend at the start of the word, two or three letters long", () => {
    expect(question("r-blends", "bread")).toMatchObject({ missing: 0, gapLength: 2, blend: "br" });
    expect(question("r-blends", "street")).toMatchObject({ missing: 0, gapLength: 3, blend: "str" });
    expect(question("l-blends", "splash")).toMatchObject({ missing: 0, gapLength: 3, blend: "spl" });
    blendTopics.flatMap((module) => module.words).forEach((word) => {
      expect(word.word.slice(word.missing, word.missing + word.gapLength)).toBe(word.blend);
    });
  });

  it("offers the right blend and three others that fit the gap and don't spell another word", () => {
    blendTopics.flatMap((module) => module.words).forEach((word) => {
      expect(word.choices).toHaveLength(4);
      expect(new Set(word.choices).size).toBe(4);
      expect(word.choices).toContain(word.blend);
      word.choices.forEach((choice) => expect(choice).toHaveLength(word.blend.length));
    });
    // An R-blend word is offered R blends, an L-blend word L blends.
    question("r-blends", "drum").choices.forEach((choice) => expect(choice).toMatch(/r$/));
    question("l-blends", "flag").choices.forEach((choice) => expect(choice).toMatch(/l$/));
    // grab, crap, slap, true and stream are real words, so they're never offered.
    expect(question("r-blends", "crab").choices).not.toContain("gr");
    expect(question("r-blends", "trap").choices).not.toContain("cr");
    expect(question("l-blends", "clap").choices).not.toContain("sl");
    expect(question("r-blends", "free").choices).not.toContain("tr");
    expect(question("r-blends", "scream").choices).not.toContain("str");
  });

  it("puts the right blend in different places", () => {
    const spots = new Set(topic("r-blends").words.map((word) => word.choices.indexOf(word.blend)));
    expect(spots.size).toBe(4);
  });

  it("has a picture for every word, and every picture file exists", () => {
    const words = blendTopics.flatMap((module) => module.words);
    words.forEach((word) => expect(word.picture).toBeTruthy());
    const files = [...blendTopics.map((module) => module.icon), ...words.map((word) => word.picture)].filter((picture) => picture.startsWith("/"));
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
