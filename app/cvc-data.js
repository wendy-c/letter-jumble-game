const cvcWords = [
  ["Cat", "🐱"],
  ["Hat", "👒"],
  ["Bat", "🦇"],
  ["Rat", "🐀"],
  ["Map", "🗺️"],
  ["Cap", "🧢"],
  ["Dad", "👨"],
  ["Bag", "👜"],
  ["Sat", "🪑"],
  ["Jam", "🫙"],
  ["Van", "🚐"],
  ["Bed", "🛏️"],
  ["Red", "🔴"],
  ["Hen", "🐔"],
  ["Ten", "🔟"],
  ["Pen", "🖊️"],
  ["Net", "🥅"],
  ["Leg", "🦵"],
  ["Get", "🤲"],
  ["Web", "🕸️"],
  ["Wet", "💦"],
  ["Pig", "🐷"],
  ["Pin", "📌"],
  ["Bin", "🗑️"],
  ["Lid", "🥫"],
  ["Kid", "🧒"],
  ["Lip", "👄"],
  ["Win", "🏆"],
  ["Zip", "🤐"],
  ["Dog", "🐕"],
  ["Fox", "🦊"],
  ["Pot", "🍲"],
  ["Cot", "👶"],
  ["Top", "🔝"],
  ["Mop", "🧹"],
  ["Box", "📦"],
  ["Job", "👷"],
  ["Sun", "☀️"],
  ["Cup", "☕"],
  ["Bus", "🚌"],
  ["Bug", "🐛"],
  ["Rug", "🟫"],
  ["Tub", "🛁"],
  ["Nut", "🥜"],
  ["Pup", "🐶"],
  ["Put", "📥"],
];

const vowels = ["a", "e", "i", "o", "u"];
const consonants = "bcdfghjklmnprstvwxz".split("");

// The middle sound always offers every short vowel; beginning and ending sounds offer
// the right consonant plus three others, picked and ordered the same way every time.
function letterChoices(word, missing, wordIndex) {
  if (missing === 1) return vowels;

  const correct = word[missing];
  const seed = wordIndex * 7 + missing * 3 + word.charCodeAt(0) + word.charCodeAt(2);
  const distractors = [];
  for (let step = 0; distractors.length < 3; step += 1) {
    const letter = consonants[(seed + step * 5) % consonants.length];
    if (letter !== correct && !distractors.includes(letter)) distractors.push(letter);
  }

  const choices = [...distractors];
  choices.splice((wordIndex + missing) % 4, 0, correct);
  return choices;
}

const modes = [
  { id: "beginning-sound", name: "Beginning Sound", color: "pink", position: 0, pattern: [null, "a", "t"] },
  { id: "middle-sound", name: "Middle Sound", color: "yellow", position: 1, pattern: ["c", null, "t"] },
  { id: "ending-sound", name: "Ending Sound", color: "blue", position: 2, pattern: ["c", "a", null] },
  { id: "mixed-sounds", name: "Mixed Sounds", color: "green", position: null, pattern: [null, "?", null] },
];

// Each CVC game deals this many words, picked at random from the full list.
export const cvcWordsPerGame = 20;

export const cvcModes = modes.map((mode) => ({
  ...mode,
  wordsPerGame: cvcWordsPerGame,
  words: cvcWords.map(([title, picture], wordIndex) => {
    const word = title.toLowerCase();
    const missing = mode.position ?? wordIndex % 3;

    return {
      word,
      answers: [word],
      picture,
      category: mode.name.toUpperCase(),
      color: mode.color,
      missing,
      choices: letterChoices(word, missing, wordIndex),
    };
  }),
}));
