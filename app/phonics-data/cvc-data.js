const cvcWords = [
  ["Cat", "/images/game-asset/animals/cat.svg"],
  ["Hat", "/images/game-asset/cvc/hat.svg"],
  ["Bat", "/images/game-asset/animals/bat.svg"],
  ["Rat", "/images/game-asset/animals/mouse.svg"],
  ["Map", "/images/game-asset/cvc/map.svg"],
  ["Cap", "/images/game-asset/cvc/cap.svg"],
  ["Dad", "/images/game-asset/starters/father.svg"],
  ["Bag", "/images/game-asset/starters/bag.svg"],
  ["Sat", "/images/game-asset/home/chair.svg"],
  ["Jam", "/images/game-asset/cvc/jam.svg"],
  ["Van", "/images/game-asset/cvc/van.svg"],
  ["Bed", "/images/game-asset/starters/bed.svg"],
  ["Red", "/images/game-asset/colours/red.svg"],
  ["Hen", "/images/game-asset/animals/chicken.svg"],
  ["Ten", "/images/game-asset/cvc/ten.svg"],
  ["Pen", "/images/game-asset/cvc/pen.svg"],
  ["Net", "/images/game-asset/sports-and-leisure/goal.svg"],
  ["Leg", "/images/game-asset/starters/leg.svg"],
  ["Get", "/images/game-asset/cvc/get.svg"],
  ["Web", "/images/game-asset/cvc/web.svg"],
  ["Wet", "/images/game-asset/cvc/wet.svg"],
  ["Pig", "/images/game-asset/animals/pig.svg"],
  ["Pin", "/images/game-asset/cvc/pin.svg"],
  ["Bin", "/images/game-asset/cvc/bin.svg"],
  ["Lid", "/images/game-asset/cvc/lid.svg"],
  ["Kid", "/images/game-asset/starters/child.svg"],
  ["Lip", "/images/game-asset/starters/mouth.svg"],
  ["Win", "/images/game-asset/cvc/win.svg"],
  ["Zip", "/images/game-asset/cvc/zip.svg"],
  ["Dog", "/images/game-asset/animals/dog.svg"],
  ["Fox", "/images/game-asset/animals/fox.svg"],
  ["Pot", "/images/game-asset/cvc/pot.svg"],
  ["Cot", "/images/game-asset/cvc/cot.svg"],
  ["Top", "/images/game-asset/cvc/top.svg"],
  ["Mop", "/images/game-asset/cvc/mop.svg"],
  ["Box", "/images/game-asset/cvc/box.svg"],
  ["Job", "/images/game-asset/jobs/construction-worker.svg"],
  ["Sun", "/images/game-asset/weather-and-seasons/sunny.svg"],
  ["Cup", "/images/game-asset/food/cup.svg"],
  ["Bus", "/images/game-asset/cvc/bus.svg"],
  ["Bug", "/images/game-asset/cvc/bug.svg"],
  ["Rug", "/images/game-asset/starters/rug.svg"],
  ["Tub", "/images/game-asset/cvc/tub.svg"],
  ["Nut", "/images/game-asset/cvc/nut.svg"],
  ["Pup", "/images/game-asset/animals/dog.svg"],
  ["Put", "/images/game-asset/cvc/put.svg"],
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
const cvcWordsPerGame = 10;

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
