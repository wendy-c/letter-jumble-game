// Chinese character recognition topics, in Traditional Chinese with Cantonese (jyutping) readings.
// Words sharing a `group` mean the same thing (啡 and 棕 are both brown) or have look-alike
// pictures (麵 and 粉 are both noodles), so they're never offered as choices for each other.
// `phrases` are everyday words where children will see the character.
const topics = [
  {
    id: "colours",
    name: "顏色",
    english: "Colours",
    icon: "/images/icons/chinese-colours.svg",
    color: "pink",
    words: [
      { character: "紅", jyutping: "hung4", english: "red", picture: "red" },
      { character: "橙", jyutping: "caang2", english: "orange", picture: "orange" },
      { character: "黃", jyutping: "wong4", english: "yellow", picture: "yellow" },
      { character: "綠", jyutping: "luk6", english: "green", picture: "green" },
      { character: "青", jyutping: "ceng1", english: "cyan", picture: "cyan" },
      { character: "藍", jyutping: "laam4", english: "blue", picture: "blue" },
      { character: "紫", jyutping: "zi2", english: "purple", picture: "purple" },
      { character: "啡", jyutping: "fe1", english: "brown", picture: "brown", group: "brown" },
      { character: "棕", jyutping: "zung1", english: "brown", picture: "brown", group: "brown" },
      { character: "白", jyutping: "baak6", english: "white", picture: "white" },
      { character: "黑", jyutping: "hak1", english: "black", picture: "black" },
      { character: "灰", jyutping: "fui1", english: "grey", picture: "grey" },
      { character: "彩色", jyutping: "coi2 sik1", english: "colourful", picture: "rainbow" },
    ],
  },
  {
    id: "food",
    name: "食物",
    english: "Food",
    icon: "/images/icons/chinese-food.svg",
    color: "yellow",
    words: [
      { character: "餅", jyutping: "beng2", english: "biscuit", picture: "biscuit", phrases: ["餅乾", "月餅"] },
      { character: "飯", jyutping: "faan6", english: "rice", picture: "rice", phrases: ["白飯", "飯碗"] },
      { character: "糖", jyutping: "tong4", english: "sweet", picture: "sweet", phrases: ["糖果", "蜜糖"] },
      { character: "肉", jyutping: "juk6", english: "meat", picture: "meat", phrases: ["牛肉", "肌肉"] },
      { character: "菜", jyutping: "coi3", english: "vegetable", picture: "vegetable", phrases: ["蔬菜", "菠菜"] },
      { character: "蛋", jyutping: "daan2", english: "egg", picture: "egg", phrases: ["雞蛋", "復活蛋"] },
      { character: "糕", jyutping: "gou1", english: "cake", picture: "cake", phrases: ["蛋糕", "年糕"] },
      { character: "麵", jyutping: "min6", english: "noodles", picture: "noodles", phrases: ["拉麵", "麵粉"], group: "noodles" },
      { character: "包", jyutping: "baau1", english: "bun", picture: "bun", phrases: ["麵包", "菜肉包"] },
      { character: "粉", jyutping: "fan2", english: "rice noodles", picture: "rice-noodles", phrases: ["米粉", "粉麵"], group: "noodles" },
      { character: "魚", jyutping: "jyu4", english: "fish", picture: "fish", phrases: ["魚蛋", "蒸魚"] },
      { character: "奶", jyutping: "naai5", english: "milk", picture: "milk", phrases: ["牛奶", "豆奶"] },
      { character: "豆", jyutping: "dau6", english: "peas", picture: "peas", phrases: ["豆腐", "青豆"] },
    ],
  },
];

const optionCount = 4;

// The right picture plus three others, picked and ordered the same way every time.
function pictureOptions(words, wordIndex) {
  const word = words[wordIndex];
  const sameMeaning = (other) => other === word || (word.group && other.group === word.group);
  const others = words.filter((other) => !sameMeaning(other));
  const distractors = [];
  for (let step = 0; distractors.length < optionCount - 1; step += 1) {
    const candidate = others[(wordIndex * 5 + step * 3) % others.length];
    if (!distractors.includes(candidate) && !distractors.some((chosen) => chosen.picture === candidate.picture)) {
      distractors.push(candidate);
    }
  }
  const options = [...distractors];
  options.splice((wordIndex * 3) % optionCount, 0, word);
  return options.map((option) => ({ character: option.character, picture: option.picture, english: option.english }));
}

export const chineseTopics = topics.map((topic) => ({
  ...topic,
  words: topic.words.map((word, wordIndex, words) => ({
    ...word,
    // `answers` lets the shared word menu and progress code treat characters like spelling words.
    answers: [word.character],
    picture: `/images/chinese/${topic.id}/${word.picture}.svg`,
    category: topic.name,
    color: topic.color,
    options: pictureOptions(words, wordIndex).map((option) => ({
      ...option,
      picture: `/images/chinese/${topic.id}/${option.picture}.svg`,
    })),
  })),
}));
