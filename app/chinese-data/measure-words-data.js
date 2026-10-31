// Chinese measure words (量詞) for 5-6 year olds: each question shows a measure word
// (一個 ＿＿) and the learner picks the noun that goes with it.

// A picture shown with each noun, to make the choices friendlier.
const asset = "/images/game-asset";
const nounIcons = {
  橙: `${asset}/food/orange.svg`, 太陽: `${asset}/weather-and-seasons/sunny.svg`, 蘋果: `${asset}/food/apple.svg`,
  老師: `${asset}/jobs/teacher.svg`, 同學: `${asset}/starters/child.svg`, 信: `${asset}/measure-words/letter.svg`,
  圖畫: `${asset}/starters/picture.svg`, 鮮花: `${asset}/measure-words/bouquet.svg`,
  生日禮物: `${asset}/sports-and-leisure/present.svg`, 紅旗: `${asset}/blends/flag.svg`,
  飯店: `${asset}/places/restaurant.svg`, 屋: `${asset}/starters/house.svg`, 房子: `${asset}/starters/home.svg`,
  學校: `${asset}/places/school.svg`, 門: `${asset}/starters/door.svg`, 鉛筆: `${asset}/measure-words/pencil.svg`,
  筆: `${asset}/cvc/pen.svg`, 椅子: `${asset}/home/chair.svg`, 桌子: `${asset}/home/table.svg`,
  紙: `${asset}/measure-words/paper.svg`, 照片: `${asset}/digraphs/photo.svg`,
  書: `${asset}/measure-words/book.svg`, 雨傘: `${asset}/measure-words/umbrella.svg`,
  頭髮: `${asset}/starters/hair.svg`, 筷子: `${asset}/measure-words/chopsticks.svg`,
  鞋子: `${asset}/clothes/shoes.svg`, 手: `${asset}/starters/hand.svg`, 衣服: `${asset}/clothes/shirt.svg`,
  帽子: `${asset}/cvc/cap.svg`, 大樹: `${asset}/blends/tree.svg`, 草: `${asset}/blends/grass.svg`,
  花: `${asset}/blends/flower.svg`, 白雲: `${asset}/weather-and-seasons/cloudy.svg`,
  樹葉: `${asset}/measure-words/leaf.svg`, 草地: `${asset}/places/country-park.svg`,
  山: `${asset}/measure-words/mountain.svg`, 大橋: `${asset}/measure-words/bridge.svg`,
  彩虹: `${asset}/colours/rainbow.svg`, 種子: `${asset}/measure-words/seeds.svg`, 糖果: `${asset}/food/sweet.svg`,
  植物: `${asset}/blends/plant.svg`,
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
  { word: "把", jyutping: "baa2", nouns: ["雨傘", "頭髮"] },
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
  個: ["老師", "同學"],
  張: ["圖畫"],
  幅: ["照片"],
  間: ["房子", "學校"],
  所: ["飯店"],
  朵: ["鮮花"],
  束: ["花", "頭髮"],
  盆: ["花", "鮮花"],
  棵: ["植物"],
  座: ["房子", "學校"],
  道: ["大橋"],
  片: ["白雲"],
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
