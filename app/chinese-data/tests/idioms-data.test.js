import fs from "node:fs";
import path from "node:path";
import { idiomTopics } from "../idioms-data";

const publicDir = path.join(__dirname, "..", "..", "..", "public");
const allIdioms = idiomTopics.flatMap((topic) => topic.words);

describe("成語", () => {
  it("has two modules, 第一篇 (still saved as \"idioms\") and 第二篇, with no idiom or picture twice", () => {
    expect(idiomTopics.map((topic) => [topic.id, topic.name])).toEqual([["idioms", "第一篇"], ["idioms-2", "第二篇"]]);
    expect(idiomTopics[0].words.map((question) => question.idiom)).toContain("井底之蛙");
    expect(idiomTopics[1].words.map((question) => question.idiom)).toContain("洗耳恭聽");
    expect(new Set(allIdioms.map((question) => question.idiom)).size).toBe(40);
    expect(new Set(allIdioms.map((question) => question.picture)).size).toBe(40);
  });

  describe.each(idiomTopics.map((topic) => [topic.name, topic]))("%s", (name, topic) => {
    it("has twenty idioms, each four characters long, with a meaning and an example using it", () => {
      expect(topic.words).toHaveLength(20);
      topic.words.forEach((question) => {
        expect([...question.idiom]).toHaveLength(4);
        expect(question.answers).toEqual([question.idiom]);
        expect(question.meaning).toBeTruthy();
        expect(question.example).toContain(question.idiom);
        expect(question.jyutping.split(" ")).toHaveLength(4);
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

    it("never blanks a little word like 之, 而 or 不", () => {
      ["之", "而", "不"].forEach((word) => expect(topic.words.map((question) => question.idiom[question.blank])).not.toContain(word));
    });

    it("moves the right answer around", () => {
      expect(new Set(topic.words.map((question) => question.options.findIndex((option) => option.correct))).size).toBe(4);
    });

    it("has a picture for every idiom, and an icon", () => {
      const files = [topic.icon, ...topic.words.map((question) => question.picture)];
      expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
    });
  });

  it("offers 打草驚蛇's missing 蛇 among other animals", () => {
    expect(allIdioms.find((question) => question.idiom === "打草驚蛇").options.map((option) => option.character).sort())
      .toEqual(["蛇", "貓", "魚", "龍"].sort());
  });
});
