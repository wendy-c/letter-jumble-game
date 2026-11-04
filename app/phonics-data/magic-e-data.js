// Magic E: a vowel, a consonant, then an e that makes the vowel say its name (cake, kite, bone,
// cube). Each word shows with its vowel and its e missing (c _ k _ for cake), joined by an arch;
// the learner picks the pair that fills both gaps, from a_e, i_e, o_e and u_e. There's one game,
// with all four long vowels mixed (a game of one vowel alone would always have the same answer).
const drawn = "/images/game-asset/magic-e";
const picture = (word) => `${drawn}/${word}.svg`;

const words = {
  a_e: [
    ["bake"], ["cake", "/images/game-asset/food/cake.svg"], ["date"], ["gate"], ["late"],
    ["make"], ["name"], ["rake"], ["tape"], ["wave"],
  ],
  i_e: [
    ["bite"], ["dive"], ["five"], ["hike"], ["kite", "/images/game-asset/starters/kite.svg"],
    ["lime", "/images/game-asset/starters/lime.svg"], ["pine"], ["ride"], ["time", "/images/game-asset/home/clock.svg"], ["wipe"],
  ],
  o_e: [
    ["bone"], ["cone"], ["home", "/images/game-asset/starters/home.svg"], ["hope"], ["joke"],
    ["note"], ["pole"], ["rope"], ["rose"], ["vote"],
  ],
  u_e: [
    ["cube"], ["cute"], ["flute"], ["huge"], ["mule", "/images/game-asset/animals/donkey.svg"],
    ["mute"], ["tube"], ["tune", "/images/game-asset/digraphs/song.svg"],
  ],
};

export const magicEPatterns = Object.keys(words);

// Every question offers all four pairs. One swap: "rope" never offers a_e (it would spell a word
// children shouldn't see), and e_e takes its place.
const avoid = { rope: { a_e: "e_e" } };
const choicesFor = (word) => magicEPatterns.map((pattern) => avoid[word]?.[pattern] ?? pattern);

// Its id is still "mixed", from when it was one of five, so what's been saved about it still counts.
const modules = [
  { id: "mixed", name: "Magic E - Long a, Long i, Long o, Long u", icon: "/images/icons/magic-e-mixed.svg", color: "lilac", patterns: magicEPatterns },
];

// Each round deals this many words (or a parent's choice, in Parent mode), in random order.
export const magicEWordsPerGame = 10;

export const magicETopics = modules.map(({ patterns, ...module }) => ({
  ...module,
  wordsPerGame: magicEWordsPerGame,
  words: patterns.flatMap((pattern) => words[pattern].map(([word, art]) => ({
    word,
    answers: [word],
    picture: art ?? picture(word),
    category: module.name.toUpperCase(),
    color: module.color,
    pattern,
    // The gap: the vowel (every word ends vowel, consonant, e) and the e, filled together by one pair.
    missing: word.length - 3,
    magicE: true,
    choices: choicesFor(word),
  }))),
}));
