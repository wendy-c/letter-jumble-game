import fs from "node:fs";
import path from "node:path";
import { chineseAdvancedTopics, chineseTopics } from "./chinese-data";

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

describe("food", () => {
  const food = chineseTopics.find((topic) => topic.id === "food");

  it("has the 13 food characters, in order", () => {
    expect(food.name).toBe("食物");
    expect(food.words.map((word) => word.character)).toEqual([
      "餅", "飯", "糖", "肉", "菜", "蛋", "糕", "麵", "包", "粉", "魚", "奶", "豆",
    ]);
  });

  it("gives every character two everyday phrases that contain it", () => {
    food.words.forEach((word) => {
      expect(word.phrases).toHaveLength(2);
      word.phrases.forEach((phrase) => expect(phrase).toContain(word.character));
    });
    expect(food.words[0].phrases).toEqual(["餅乾", "月餅"]);
  });

  it("offers four different pictures, but never both noodle dishes (麵 and 粉) together", () => {
    food.words.forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      expect(characters).toContain(word.character);
      expect(characters.includes("麵") && characters.includes("粉")).toBe(false);
    });
  });

  it("has a picture file for every food and the topic icon", () => {
    const images = [food.icon, ...food.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])];
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });
});

describe("every topic", () => {
  it("has the topics in order: colours, food, fruit, animals, clothes", () => {
    expect(chineseTopics.map((topic) => topic.name)).toEqual(["顏色", "食物", "水果", "動物", "衣物"]);
  });

  it.each([
    ["水果", ["蘋", "芒", "莓", "梨", "瓜", "葡", "橙", "蕉", "菠", "檸"]],
    ["動物", ["虎", "狗", "雞", "貓", "馬", "豬", "熊", "牛", "羊", "獅", "鼠", "鵝", "兔", "象"]],
    ["衣物", ["帽", "裙", "褲", "衫", "襪", "鞋", "衣"]],
  ])("%s has its characters in order", (name, characters) => {
    const topic = chineseTopics.find((candidate) => candidate.name === name);
    expect(topic.words.map((word) => word.character)).toEqual(characters);
  });

  it("only uses phrases that contain their character", () => {
    chineseTopics.flatMap((topic) => topic.words).forEach((word) => {
      (word.phrases ?? []).forEach((phrase) => expect(phrase).toContain(word.character));
    });
  });

  it("offers four different pictures each time, never pairing look-alikes (衫 and 衣)", () => {
    chineseTopics.flatMap((topic) => topic.words).forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      expect(characters).toContain(word.character);
      expect(characters.includes("衫") && characters.includes("衣")).toBe(false);
    });
  });

  it("has every picture and icon file", () => {
    const images = chineseTopics.flatMap((topic) => [topic.icon, ...topic.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])]);
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });
});

describe("jobs (5-6 year olds)", () => {
  const jobs = chineseAdvancedTopics.find((topic) => topic.id === "jobs");
  const byCharacter = Object.fromEntries(jobs.words.map((word) => [word.character, word]));

  it("has the 27 job words, in order", () => {
    expect(jobs.name).toBe("職業");
    expect(jobs.words.map((word) => word.character)).toEqual([
      "警察", "消防員", "醫生", "護士", "理髮師", "侍應生", "廚師", "郵差", "交通警察", "救護員",
      "飛行服務員", "獸醫", "牙醫", "送遞員", "保安員", "飛機師", "餐廳", "維持治安", "救火", "生病",
      "送信", "老師", "郵政局", "警署", "醫院", "教導學生", "醫治病人",
    ]);
  });

  it("offers four different pictures, never two look-alikes together", () => {
    jobs.words.forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      expect(characters).toContain(word.character);
      const groups = (other) => byCharacter[other].groups ?? [];
      characters.forEach((first) => characters.forEach((second) => {
        if (first !== second) expect(groups(first).some((group) => groups(second).includes(group))).toBe(false);
      }));
    });
  });

  it("keeps 醫治病人 away from both doctors and being sick", () => {
    const pairs = jobs.words.filter((word) => word.options.some((option) => option.character === "醫治病人"));
    pairs.forEach((word) => expect(["醫生", "生病"]).not.toContain(word.character));
  });

  it("has every picture and the icon", () => {
    const images = [jobs.icon, ...jobs.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])];
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });
});

