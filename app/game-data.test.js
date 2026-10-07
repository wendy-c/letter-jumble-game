import fs from "node:fs";
import path from "node:path";
import { categories } from "./game-data";
import { cvcModes } from "./cvc-data";
import { games } from "./games-data";

const publicDir = path.join(__dirname, "..", "public");

describe("categories", () => {
  it("has six topics, each with a unique id, colour and icon", () => {
    expect(categories).toHaveLength(6);
    expect(new Set(categories.map((category) => category.id)).size).toBe(6);
    categories.forEach((category) => {
      expect(category.color).toEqual(expect.any(String));
      expect(category.icon).toMatch(/^\/images\/icons\/.+\.svg$/);
    });
  });

  it("stores answers in lower case with a picture for every word", () => {
    categories.forEach((category) => {
      category.words.forEach((word) => {
        expect(word.answers.length).toBeGreaterThan(0);
        word.answers.forEach((answer) => expect(answer).toBe(answer.toLowerCase()));
        expect(word.picture).toBeTruthy();
        expect(word.category).toBe(category.name.toUpperCase());
      });
    });
  });

  it("points every image path at a file that exists", () => {
    const imagePaths = [
      ...categories.map((category) => category.icon),
      ...games.filter((game) => game.icon).map((game) => game.icon),
      ...categories.flatMap((category) => category.words.map((word) => word.picture)),
      ...cvcModes.flatMap((mode) => mode.words.map((word) => word.picture)),
    ].filter((picture) => picture.startsWith("/"));

    const missing = imagePaths.filter((imagePath) => !fs.existsSync(path.join(publicDir, imagePath)));
    expect(missing).toEqual([]);
  });
});
