import fs from "node:fs";
import path from "node:path";
import { starterCategories } from "./starters-data";

const publicDir = path.join(__dirname, "..", "public");

describe("Letter Jumble for Starters", () => {
  it("has the Pets and Farm and Wild Animals words", () => {
    const words = (id) => starterCategories.find((topic) => topic.id === id).words.map((word) => word.word);
    expect(words("pets-and-farm")).toEqual([
      "cat", "dog", "bird", "duck", "chicken", "cow", "sheep", "goat", "horse", "pig", "donkey", "frog", "fish", "lizard", "mouse", "mice", "pet",
    ]);
    expect(words("wild-animals")).toEqual([
      "bear", "elephant", "giraffe", "hippo", "bat", "kangaroo", "monkey", "panda", "parrot", "penguin", "polar bear", "snake", "spider",
      "tiger", "zebra", "crocodile", "dolphin", "jellyfish", "shark", "whale",
    ]);
  });

  it("has a picture for every word, and every picture file exists", () => {
    const files = starterCategories.flatMap((topic) => [topic.icon, ...topic.words.map((word) => word.picture)]).filter((picture) => picture.startsWith("/"));
    starterCategories.flatMap((topic) => topic.words).forEach((word) => expect(word.picture).toBeTruthy());
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
