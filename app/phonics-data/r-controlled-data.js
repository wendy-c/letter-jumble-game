// R-Controlled Vowels: a vowel followed by r, which changes the vowel's sound (car, her, bird, fur,
// corn). Each word shows with its vowel and r missing (c _ _ for car); the learner picks the pair
// that fills the gap, from ar, er, ir, or and ur. There's one game, with them all mixed.
const drawn = "/images/game-asset/r-controlled";
const asset = "/images/game-asset";

const words = {
  ar: [
    ["car", `${asset}/starters/car.svg`], ["bar"], ["star", `${asset}/nature/star.svg`], ["far"], ["arm", `${asset}/starters/arm.svg`],
    ["art"], ["barn"], ["park"], ["target"], ["market", `${asset}/places/market.svg`], ["carpet"],
  ],
  er: [["her"], ["serve"], ["water", `${asset}/nature/water.svg`], ["paper", `${asset}/measure-words/paper.svg`], ["winter", `${asset}/weather-and-seasons/winter.svg`]],
  ir: [
    ["bird", `${asset}/animals/bird.svg`], ["girl", `${asset}/starters/girl.svg`], ["first"], ["sir"], ["shirt", `${asset}/clothes/shirt.svg`],
    ["dirt"], ["circle", `${asset}/math/circle.svg`],
  ],
  ur: [["fur"], ["turn"], ["burn"], ["nurse", `${asset}/jobs/nurse.svg`], ["purple", `${asset}/colours/purple.svg`], ["turtle"]],
  or: [
    ["for"], ["corn"], ["fork"], ["short"], ["storm", `${asset}/weather-and-seasons/stormy.svg`], ["horn"], ["north"],
    ["forest"], ["orange", `${asset}/food/orange.svg`], ["report"],
  ],
};

// Every question offers all five pairs, in this order (they're mixed up when dealt), except where
// one would spell a word children shouldn't see.
export const rControlledPairs = ["ar", "er", "ir", "or", "ur"];
const avoid = { shirt: ["ar"], short: ["ar"], fork: ["ar"] };
const choicesFor = (word) => rControlledPairs.filter((pair) => !avoid[word]?.includes(pair));

// Each round deals this many words (or a parent's choice, in Parent mode), in random order.
export const rControlledWordsPerGame = 10;

const name = "R-Controlled Vowels - ar, er, ir, or, ur";

export const rControlledTopics = [{
  id: "mixed",
  name,
  icon: "/images/icons/r-controlled.svg",
  color: "peach",
  wordsPerGame: rControlledWordsPerGame,
  words: Object.entries(words).flatMap(([pair, list]) => list.map(([word, art]) => ({
    word,
    answers: [word],
    picture: art ?? `${drawn}/${word}.svg`,
    category: name.toUpperCase(),
    color: "peach",
    pair,
    // The gap: the vowel and its r.
    missing: word.indexOf(pair),
    gapLength: 2,
    choices: choicesFor(word),
  }))),
}];
