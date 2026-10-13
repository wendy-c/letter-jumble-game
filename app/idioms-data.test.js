import fs from "node:fs";
import path from "node:path";
import { idiomTopics } from "./idioms-data";

const topic = idiomTopics[0];
const publicDir = path.join(__dirname, "..", "public");

describe("成語", () => {
  it("has all twenty idioms, each four characters long", () => {
    expect(topic.name).toBe("成語");
    expect(topic.words).toHaveLength(20);
    expect(topic.words.map((question) => question.idiom)).toContain("井底之蛙");
    topic.words.forEach((question) => {
      expect([...question.idiom]).toHaveLength(4);
      expect(question.answers).toEqual([question.idiom]);
      expect(question.meaning).toBeTruthy();
    });
  });

  it("blanks one character and offers four different characters, exactly one of them right", () => {
    topic.words.forEach((question) => {
      expect(question.blank).toBeGreaterThanOrEqual(0);
      expect(question.blank).toBeLessThan(4);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.character)).size).toBe(4);
      expect(question.options.filter((option) => option.correct).map((option) => option.character)).toEqual([question.idiom[question.blank]]);
    });
  });

  it("never offers a wrong character that's already in the idiom", () => {
    topic.words.forEach((question) => {
      question.options.filter((option) => !option.correct)
        .forEach((option) => expect(question.idiom).not.toContain(option.character));
    });
  });

  it("never blanks a little word like 之 or 而", () => {
    expect(topic.words.map((question) => question.idiom[question.blank])).not.toContain("之");
    expect(topic.words.map((question) => question.idiom[question.blank])).not.toContain("而");
    expect(topic.words.find((question) => question.idiom === "打草驚蛇").options.map((option) => option.character).sort())
      .toEqual(["蛇", "貓", "魚", "龍"].sort());
  });

  it("moves the right answer around", () => {
    expect(new Set(topic.words.map((question) => question.options.findIndex((option) => option.correct))).size).toBe(4);
  });

  it("has a picture for every idiom, and an icon", () => {
    const files = [topic.icon, ...topic.words.map((question) => question.picture)];
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
