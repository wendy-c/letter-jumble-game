// Chinese measure words (量詞) for 5-6 year olds: each question shows a measure word
// (一個 ＿＿) and the learner picks the noun that goes with it.

// An emoji (or picture) shown next to each noun, to make the choices friendlier.
const nounIcons = {
  橙: "🍊", 太陽: "☀️", 蘋果: "🍎", 老師: "🧑‍🏫", 同學: "🧒", 信: "✉️", 圖畫: "🖼️", 鮮花: "💐",
  生日禮物: "🎁", 紅旗: "🚩", 飯店: "🏨", 屋: "🏠", 房子: "🏡", 學校: "🏫", 門: "🚪", 鉛筆: "✏️",
  筆: "🖊️", 椅子: "🪑", 桌子: "/images/chinese/home/table.svg", 紙: "📄", 照片: "📸", 書: "📖",
  雨傘: "☂️", 頭髮: "💇", 筷子: "🥢", 鞋子: "👟", 手: "👐", 衣服: "👕", 帽子: "🧢", 大樹: "🌳",
  草: "🌱", 花: "🌸", 白雲: "☁️", 樹葉: "🍃", 草地: "🏞️", 山: "⛰️", 大橋: "🌉", 彩虹: "🌈",
  種子: "🌰", 糖果: "🍬", 植物: "🪴",
};

const measureWords = [
  { word: "個", jyutping: "go3", nouns: ["橙", "太陽", "蘋果"] },
  { word: "位", jyutping: "wai2", nouns: ["老師", "同學"] },
  { word: "封", jyutping: "fung1", nouns: ["信"] },
  { word: "幅", jyutping: "fuk1", nouns: ["圖畫"] },
  { word: "束", jyutping: "cuk1", nouns: ["鮮花"] },
  { word: "份", jyutping: "fan6", nouns: ["生日禮物"] },
  { word: "面", jyutping: "min6", nouns: ["紅旗"] },
  { word: "間", jyutping: "gaan1", nouns: ["飯店", "屋"] },
  { word: "所", jyutping: "so2", nouns: ["房子", "學校"] },
  { word: "扇", jyutping: "sin3", nouns: ["門"] },
  { word: "枝", jyutping: "zi1", nouns: ["鉛筆", "筆"] },
  { word: "張", jyutping: "zoeng1", nouns: ["椅子", "桌子", "紙", "照片"] },
  { word: "本", jyutping: "bun2", nouns: ["書"] },
  { word: "把", jyutping: "baa2", nouns: ["椅子", "雨傘", "頭髮"] },
  { word: "雙", jyutping: "soeng1", nouns: ["筷子", "鞋子", "手"] },
  { word: "件", jyutping: "gin6", nouns: ["衣服"] },
  { word: "頂", jyutping: "ding2", nouns: ["帽子"] },
  { word: "棵", jyutping: "fo1", nouns: ["大樹", "草"] },
  { word: "朵", jyutping: "do2", nouns: ["花", "白雲"] },
  { word: "片", jyutping: "pin3", nouns: ["樹葉", "草地"] },
  { word: "座", jyutping: "zo6", nouns: ["山", "大橋"] },
  { word: "道", jyutping: "dou6", nouns: ["彩虹", "門"] },
  { word: "粒", jyutping: "lap1", nouns: ["種子", "糖果"] },
  { word: "盆", jyutping: "pun4", nouns: ["植物"] },
];

// Pairings that are also fine in everyday Cantonese, though they aren't the ones being taught
// (一個老師, 一張圖畫, 一間學校, 一盆花...). These nouns are never offered as a *wrong*
// answer for that measure word, so a child is never marked wrong for a sensible answer.
const alsoFits = {
  個: ["老師", "同學", "生日禮物", "糖果", "房子", "屋", "學校"],
  張: ["圖畫"],
  幅: ["照片"],
  間: ["房子", "學校"],
  所: ["屋", "飯店"],
  朵: ["鮮花"],
  束: ["花", "頭髮"],
  盆: ["花", "鮮花"],
  棵: ["植物"],
  座: ["房子", "學校", "屋"],
  道: ["大橋"],
  件: ["生日禮物"],
  片: ["白雲"],
  把: ["筷子"],
};

const optionCount = 4;

function fits(measureWord, noun) {
  return measureWord.nouns.includes(noun) || (alsoFits[measureWord.word] ?? []).includes(noun);
}

// The right noun plus three that don't go with this measure word, picked and ordered the
// same way every time (a fixed shuffle seeded by the question's position).
function nounOptions(measureWord, noun, questionIndex) {
  const allNouns = Object.keys(nounIcons);
  const wrong = allNouns
    .filter((candidate) => !fits(measureWord, candidate))
    .map((candidate, index) => ({ candidate, order: (questionIndex * 11 + index * 17 + index * index * 7) % 103 }))
    .sort((first, second) => first.order - second.order)
    .slice(0, optionCount - 1)
    .map(({ candidate }) => candidate);
  const options = [...wrong];
  options.splice((questionIndex * 3) % optionCount, 0, noun);
  return options.map((option) => ({ noun: option, icon: nounIcons[option], correct: option === noun }));
}

const questions = measureWords.flatMap((measureWord) => measureWord.nouns.map((noun) => ({ measureWord, noun })));

export const measureWordTopics = [
  {
    id: "measure-words",
    name: "量詞",
    english: "Measure words",
    color: "yellow",
    pattern: ["一", "個"],
    // Each game deals this many questions, at random, from all of them.
    wordsPerGame: 20,
    words: questions.map(({ measureWord, noun }, questionIndex) => ({
      character: measureWord.word,
      jyutping: measureWord.jyutping,
      noun,
      icon: nounIcons[noun],
      // `answers` lets the shared word menu and progress code treat questions like words.
      answers: [`一${measureWord.word}${noun}`],
      category: "量詞",
      color: "yellow",
      options: nounOptions(measureWord, noun, questionIndex),
    })),
  },
];

export const measureWordsForTesting = { measureWords, alsoFits, nounIcons, fits };
