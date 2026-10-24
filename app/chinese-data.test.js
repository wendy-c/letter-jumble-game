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

  it("has the 39 job words, in order (the places are in 地點)", () => {
    expect(jobs.name).toBe("職業");
    expect(jobs.words.map((word) => word.character)).toEqual([
      "警察", "消防員", "醫生", "護士", "理髮師", "侍應生", "廚師", "郵差", "交通警察", "救護員",
      "飛行服務員", "獸醫", "牙醫", "送遞員", "保安員", "飛機師", "維持治安", "救火", "生病",
      "送信", "老師", "教導學生", "醫治病人",
      "時裝設計師", "售貨員", "烘焙師", "新聞主播", "電器技工", "建築工人", "機場特警", "時裝模特兒",
      "製衣工人", "收銀員", "運動員", "記者", "視光師", "科學家", "太空人", "探險家",
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

describe("home (5-6 year olds)", () => {
  const home = chineseAdvancedTopics.find((topic) => topic.id === "home");
  const byCharacter = Object.fromEntries(home.words.map((word) => [word.character, word]));

  it("comes after jobs, with the 20 home words in order", () => {
    expect(chineseAdvancedTopics.map((topic) => topic.name)).toEqual(["職業", "家", "動物", "地點"]);
    expect(home.words.map((word) => word.character)).toEqual([
      "客廳", "廚房", "浴室", "睡房", "書房", "窗戶", "床褥", "椅子", "桌子",
      "衣櫃", "杯子", "碗碟", "電燈", "時鐘", "沙發", "電視", "電腦", "空氣淨化機", "露台", "游泳池",
    ]);
  });

  it("never offers a room together with furniture shown in its picture", () => {
    home.words.forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      expect(characters).toContain(word.character);
      const groups = (character) => byCharacter[character].groups ?? [];
      characters.forEach((first) => characters.forEach((second) => {
        if (first !== second) expect(groups(first).some((group) => groups(second).includes(group))).toBe(false);
      }));
    });
    const livingRoom = home.words.find((word) => word.character === "客廳").options.map((option) => option.character);
    expect(livingRoom).not.toContain("沙發");
    expect(livingRoom).not.toContain("電視");
  });

  it("has every picture and the icon", () => {
    const images = [home.icon, ...home.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])];
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });
});

describe("animals (5-6 year olds)", () => {
  const animals = chineseAdvancedTopics.find((topic) => topic.id === "animals-advanced");
  const byCharacter = Object.fromEntries(animals.words.map((word) => [word.character, word]));

  it("has the 24 animal words, in order", () => {
    expect(animals.name).toBe("動物");
    expect(animals.words.map((word) => word.character)).toEqual([
      "鸚鵡", "海豚", "駱駝", "老虎", "獅子", "熊貓", "鼴鼠", "鯨魚", "北極熊", "花豹", "獵豹", "猴子",
      "斑馬", "狐狸", "鴕鳥", "袋鼠", "驢子", "大猩猩", "蝙蝠", "蜘蛛", "蝴蝶", "蜜蜂", "蜻蜓", "飛蛾",
    ]);
  });

  it("never offers look-alikes together, like 花豹 and 獵豹 or 蝴蝶 and 飛蛾", () => {
    animals.words.forEach((word) => {
      const characters = word.options.map((option) => option.character);
      expect(new Set(word.options.map((option) => option.picture)).size).toBe(4);
      const groups = (character) => byCharacter[character].groups ?? [];
      characters.forEach((first) => characters.forEach((second) => {
        if (first !== second) expect(groups(first).some((group) => groups(second).includes(group))).toBe(false);
      }));
    });
  });

  it("has every picture and the icon", () => {
    const images = [animals.icon, ...animals.words.flatMap((word) => [word.picture, ...word.options.map((option) => option.picture)])];
    expect(images.filter((image) => !fs.existsSync(path.join(publicDir, image)))).toEqual([]);
  });
});


describe("places (5-6 year olds)", () => {
  const places = chineseAdvancedTopics.find((topic) => topic.id === "places");

  it("has the 21 place words, in order, and jobs no longer has any of them", () => {
    expect(places.name).toBe("地點");
    expect(places.words.map((word) => word.character)).toEqual([
      "學校", "音樂室", "操場", "課室", "禮堂", "超級市場", "遊樂場", "圖書館", "沙灘", "郊野公園", "商場",
      "戲院", "電影院", "餐廳", "主題公園", "醫院", "警署", "郵政局", "消防局", "銀行", "街市",
    ]);
    const jobs = chineseAdvancedTopics.find((topic) => topic.id === "jobs").words.map((word) => word.character);
    places.words.forEach((word) => expect(jobs).not.toContain(word.character));
  });

  it("never offers 戲院 and 電影院 (both cinemas) together", () => {
    const cinemaWords = ["戲院", "電影院"];
    places.words.filter((word) => cinemaWords.includes(word.character)).forEach((word) => {
      expect(word.options.filter((option) => cinemaWords.includes(option.character))).toHaveLength(1);
    });
  });
});
