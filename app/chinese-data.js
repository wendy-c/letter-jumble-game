// Chinese character recognition topics, in Traditional Chinese with Cantonese (jyutping) readings.
// Words sharing a `group` mean the same thing (啡 and 棕 are both brown), so they're never
// offered as choices for each other.
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
