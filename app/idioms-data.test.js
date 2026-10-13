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

  it("offers four different idioms, exactly one of them right", () => {
    topic.words.forEach((question) => {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.idiom)).size).toBe(4);
      expect(question.options.filter((option) => option.correct).map((option) => option.idiom)).toEqual([question.idiom]);
    });
  });

  it("never offers two idioms that mean nearly the same thing together", () => {
    const groupOf = Object.fromEntries(topic.words.map((question) => [question.idiom, question.group]));
    topic.words.forEach((question) => {
      const groups = question.options.map((option) => groupOf[option.idiom]).filter(Boolean);
      expect(new Set(groups).size).toBe(groups.length);
    });
  });

  it("moves the right answer around", () => {
    expect(new Set(topic.words.map((question) => question.options.findIndex((option) => option.correct))).size).toBe(4);
  });

  it("has a picture for every idiom, and an icon", () => {
    const files = [topic.icon, ...topic.words.map((question) => question.picture)];
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
