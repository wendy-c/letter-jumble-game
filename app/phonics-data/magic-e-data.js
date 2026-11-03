// Magic E: a vowel, a consonant, then an e that makes the vowel say its name (cake, kite, bone,
// cube). Each word shows with its vowel and its e missing (c _ k _ for cake), joined by an arch;
// the learner picks the pair that fills both gaps, from a_e, i_e, o_e and u_e. Four games practise
// one long vowel each, and Mixed has them all.
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

const modules = [
  { id: "a-e", name: "Long A · a_e", icon: "/images/icons/magic-e-a.svg", color: "pink", patterns: ["a_e"] },
  { id: "i-e", name: "Long I · i_e", icon: "/images/icons/magic-e-i.svg", color: "yellow", patterns: ["i_e"] },
  { id: "o-e", name: "Long O · o_e", icon: "/images/icons/magic-e-o.svg", color: "blue", patterns: ["o_e"] },
  { id: "u-e", name: "Long U · u_e", icon: "/images/icons/magic-e-u.svg", color: "green", patterns: ["u_e"] },
  { id: "mixed", name: "Mixed Magic E", icon: "/images/icons/magic-e-mixed.svg", color: "lilac", patterns: magicEPatterns },
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
