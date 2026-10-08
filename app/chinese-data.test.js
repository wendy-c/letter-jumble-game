import fs from "node:fs";
import path from "node:path";
import { chineseTopics } from "./chinese-data";

const colours = chineseTopics.find((topic) => topic.id === "colours");
const publicDir = path.join(__dirname, "..", "public");

describe("chineseTopics", () => {
  it("starts with the 13 colour characters, in order", () => {
    expect(colours.name).toBe("顏色");
    expect(colours.words.map((word) => word.character)).toEqual([
      "紅", "橙", "黃", "綠", "青", "藍", "紫", "啡", "棕", "白", "黑", "灰", "彩色",
    ]);
  });

  it("offers four different pictures for each character, including the right one", () => {
    colours.words.forEach((word) => {
      expect(word.options).toHaveLength(4);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      expect(word.options.filter((option) => option.character === word.character)).toHaveLength(1);
    });
  });

  it("never offers 啡 and 棕 together, since both mean brown", () => {
    colours.words.forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(characters.includes("啡") && characters.includes("棕")).toBe(false);
    });
  });

  it("moves the right picture around, so it isn't always in the same spot", () => {
    const spots = new Set(colours.words.map((word) => word.options.findIndex((option) => option.character === word.character)));
    expect(spots.size).toBe(4);
  });

  it("has a picture file for every character and the topic icon", () => {
    const images = [colours.icon, ...colours.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])];
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });

  it("lets the shared word menu and progress code use the character as the answer", () => {
    colours.words.forEach((word) => expect(word.answers).toEqual([word.character]));
  });
});
