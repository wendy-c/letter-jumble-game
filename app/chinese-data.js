// Chinese character recognition topics, in Traditional Chinese with Cantonese (jyutping) readings.
// Words sharing a `group` mean the same thing (啡 and 棕 are both brown) or have look-alike
// pictures (麵 and 粉 are both noodles; 衫 and 衣 are both tops), so they're never offered
// as choices for each other.
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
  {
    id: "fruit",
    name: "水果",
    english: "Fruit",
    icon: "/images/icons/chinese-fruit.svg",
    color: "green",
    words: [
      { character: "蘋", jyutping: "ping4", english: "apple", picture: "apple", phrases: ["蘋果"] },
      { character: "芒", jyutping: "mong1", english: "mango", picture: "mango", phrases: ["芒果"] },
      { character: "莓", jyutping: "mui2", english: "strawberry", picture: "strawberry", phrases: ["草莓", "藍莓"] },
      { character: "梨", jyutping: "lei4", english: "pear", picture: "pear", phrases: ["梨子"] },
      { character: "瓜", jyutping: "gwaa1", english: "watermelon", picture: "watermelon", phrases: ["西瓜", "木瓜"] },
      { character: "葡", jyutping: "pou4", english: "grapes", picture: "grapes", phrases: ["葡萄"] },
      { character: "橙", jyutping: "caang2", english: "orange", picture: "orange", phrases: ["鮮橙"] },
      { character: "蕉", jyutping: "ziu1", english: "banana", picture: "banana", phrases: ["香蕉"] },
      { character: "菠", jyutping: "bo1", english: "pineapple", picture: "pineapple", phrases: ["菠蘿"] },
      { character: "檸", jyutping: "ning4", english: "lemon", picture: "lemon", phrases: ["檸檬"] },
    ],
  },
  {
    id: "animals",
    name: "動物",
    english: "Animals",
    icon: "/images/icons/chinese-animals.svg",
    color: "peach",
    words: [
      { character: "虎", jyutping: "fu2", english: "tiger", picture: "tiger", phrases: ["老虎"] },
      { character: "狗", jyutping: "gau2", english: "dog", picture: "dog", phrases: ["小狗"] },
      { character: "雞", jyutping: "gai1", english: "chicken", picture: "chicken", phrases: ["母雞", "公雞"] },
      { character: "貓", jyutping: "maau1", english: "cat", picture: "cat", phrases: ["花貓", "狸貓"] },
      { character: "馬", jyutping: "maa5", english: "horse", picture: "horse", phrases: ["白馬", "河馬"] },
      { character: "豬", jyutping: "zyu1", english: "pig", picture: "pig", phrases: ["野豬"] },
      { character: "熊", jyutping: "hung4", english: "bear", picture: "bear", phrases: ["黑熊", "北極熊"] },
      { character: "牛", jyutping: "ngau4", english: "cow", picture: "cow", phrases: ["水牛"] },
      { character: "羊", jyutping: "joeng4", english: "sheep", picture: "sheep", phrases: ["山羊", "綿羊"] },
      { character: "獅", jyutping: "si1", english: "lion", picture: "lion", phrases: ["獅子"] },
      { character: "鼠", jyutping: "syu2", english: "mouse", picture: "mouse", phrases: ["老鼠"] },
      { character: "鵝", jyutping: "ngo4", english: "swan", picture: "swan", phrases: ["天鵝"] },
      { character: "兔", jyutping: "tou3", english: "rabbit", picture: "rabbit", phrases: ["白兔"] },
      { character: "象", jyutping: "zoeng6", english: "elephant", picture: "elephant", phrases: ["大象"] },
    ],
  },
  {
    id: "clothes",
    name: "衣物",
    english: "Clothes",
    icon: "/images/icons/chinese-clothes.svg",
    color: "blue",
    words: [
      { character: "帽", jyutping: "mou2", english: "hat", picture: "hat", phrases: ["帽子"] },
      { character: "裙", jyutping: "kwan4", english: "skirt", picture: "skirt", phrases: ["裙子"] },
      { character: "褲", jyutping: "fu3", english: "trousers", picture: "trousers", phrases: ["褲子"] },
      { character: "衫", jyutping: "saam1", english: "shirt", picture: "shirt", phrases: ["恤衫"], group: "tops" },
      { character: "襪", jyutping: "mat6", english: "socks", picture: "socks", phrases: ["襪子"] },
      { character: "鞋", jyutping: "haai4", english: "shoes", picture: "shoes", phrases: ["鞋子"] },
      { character: "衣", jyutping: "ji1", english: "top", picture: "top", phrases: ["上衣"], group: "tops" },
    ],
  },
];

const optionCount = 4;

// The right picture plus three others, picked and ordered the same way every time.
// The other words are put in a fixed shuffled order (seeded by the word's position), and the
// first three with different pictures are used.
function pictureOptions(words, wordIndex) {
  const word = words[wordIndex];
  const sameMeaning = (other) => other === word || (word.group && other.group === word.group);
  const shuffled = words
    .map((other, otherIndex) => ({ other, order: (wordIndex * 7 + otherIndex * 13 + otherIndex * otherIndex * 5) % 101 }))
    .filter(({ other }) => !sameMeaning(other))
    .sort((first, second) => first.order - second.order)
    .map(({ other }) => other);

  const distractors = [];
  for (const candidate of shuffled) {
    if (distractors.length === optionCount - 1) break;
    if (!distractors.some((chosen) => chosen.picture === candidate.picture)) distractors.push(candidate);
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
