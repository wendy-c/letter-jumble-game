import fs from "node:fs";
import path from "node:path";
import { badgeImage, badgeShelves, topicsByGame } from "./badges";

const publicDir = path.join(__dirname, "..", "public");

describe("badges", () => {
  it("has a badge picture for every topic of every game", () => {
    const missing = Object.entries(topicsByGame).flatMap(([gameId, topics]) => topics.map((topic) => badgeImage(gameId, topic.id)))
      .filter((image) => !fs.existsSync(path.join(publicDir, image)));
    expect(missing).toEqual([]);
  });

  it("lists each of a player's badges with its picture and whether it's earned", () => {
    const shelves = badgeShelves({ name: "Ada", coins: 0, age: "3-4", badges: ["cvc/middle-sound"] });
    const cvc = shelves.find((shelf) => shelf.game.id === "cvc");
    expect(cvc.badges.map(({ key, image, earned }) => [key, image, earned])).toEqual([
      ["cvc/beginning-sound", "/images/badges/cvc/beginning-sound.svg", false],
      ["cvc/middle-sound", "/images/badges/cvc/middle-sound.svg", true],
      ["cvc/ending-sound", "/images/badges/cvc/ending-sound.svg", false],
      ["cvc/mixed-sounds", "/images/badges/cvc/mixed-sounds.svg", false],
    ]);
  });
});
