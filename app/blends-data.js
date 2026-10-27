// R and L Blends: two or three consonants said together (br, cl, str…). Each word shows with its
// blend missing (e.g. "_ _ead" for bread); the learner picks the blend that fills the gap.
const asset = "/images/game-asset";

const rBlends = {
  br: [["bread", "🍞"], ["brush", "🪥"], ["brick", "🧱"], ["bring", "🫴"], ["brave", "🦸"]],
  cr: [["crab", "🦀"], ["crown", "👑"], ["cross", "❌"], ["cry", "😢"], ["crib", "👶🛏️"]],
  dr: [["drum", "🥁"], ["dress", "👗"], ["drink", "🧃"], ["draw", "🖍️"], ["dream", "💭"]],
  fr: [["frog", "🐸"], ["free", "🕊️"], ["fruit", "🍓🍊"], ["frost", "❄️"], ["friend", "🧑‍🤝‍🧑"]],
  gr: [["grass", "🌿"], ["green", `${asset}/colours/green.svg`], ["grin", "😁"], ["grape", "🍇"], ["grow", "🌻"]],
  pr: [["press", "👇🔘"], ["prize", "🏆"], ["prince", "🤴"], ["present", "🎁"], ["print", "🖨️"]],
  tr: [["tree", "🌳"], ["train", "🚂"], ["truck", "🚚"], ["trash", "🗑️"], ["trap", "🪤"]],
  str: [["street", "🚦"], ["strong", "💪"], ["straw", "🥤"], ["stretch", "🙆"]],
  thr: [["throw", "🤾"], ["three", "3️⃣"], ["through", "🚇"]],
  shr: [["shrimp", "🦐"], ["shred", "📄✂️"], ["shrug", "🤷"]],
  scr: [["scream", "😱"], ["scratch", "🐱🐾"], ["scrub", "🧽"]],
  spr: [["spring", "🌸"], ["spray", "🧴"], ["sprout", "🌱"]],
};

const lBlends = {
  bl: [["blue", `${asset}/colours/blue.svg`], ["black", `${asset}/colours/black.svg`], ["blanket", `${asset}/home/blanket.svg`], ["blow", "🌬️"], ["blink", "😉"]],
  cl: [["clap", "👏"], ["clock", `${asset}/home/clock.svg`], ["cloud", "☁️"], ["clown", "🤡"], ["climb", "🧗"]],
  fl: [["flag", "🚩"], ["flower", "🌷"], ["fly", "🪰"], ["floor", `${asset}/home/floor.svg`], ["flame", "🔥"]],
  gl: [["glass", `${asset}/food/glass.svg`], ["glove", "🧤"], ["glasses", "👓"], ["globe", "🌍"], ["glow", "🌟"]],
  pl: [["plate", `${asset}/food/plate.svg`], ["plane", "✈️"], ["plant", "🪴"], ["play", "🧸"], ["plug", "🔌"]],
  sl: [["slide", "🛝"], ["sleep", "😴"], ["sled", "🛷"], ["slow", "🐢"], ["slipper", "🥿"]],
  spl: [["splash", "💦"], ["split", "🪓🪵"]],
};

const words = { ...rBlends, ...lBlends };
export const blends = Object.keys(words);
const allWords = new Set(Object.values(words).flat().map(([word]) => word));
// Real words that a wrong blend would spell (grab for crab, slap for clap…), so they're never
// offered as a "wrong" answer.
const otherRealWords = new Set([
  "blame", "bled", "bless", "block", "blower", "blown", "blush", "brag", "brain", "brass", "bray",
  "bred", "bride", "brink", "brow", "brown", "clash", "class", "classes", "claw", "clay", "click",
  "cling", "clog", "clue", "crack", "crane", "crap", "crash", "crate", "crave", "crow", "cream",
  "creep", "crush", "drag", "drain", "drape", "dread", "dry", "drown", "drug", "drove", "flap",
  "flash", "flaw", "flee", "fled", "flick", "fling", "flipper", "flock", "flow", "flown", "flush",
  "frame", "fry", "frown", "glee", "glide", "glue", "grab", "grain", "grant", "grate", "grave",
  "gray", "gross", "grower", "grown", "plain", "plum", "pluck", "plush", "pray", "pride", "prove",
  "pry", "shrub", "slab", "slack", "slant", "slap", "slash", "slate", "slay", "slick", "sling",
  "slug", "slush", "sly", "spree", "stray", "stream", "string", "tray", "track", "trick", "true",
  "try", "tread", "thrash", "throng"
]);

// The right blend and three others of the same length (so they fit the gap) that don't spell a
// real word: from the module's own blends first, then any others. Picked the same way every time.
function choicesFor(word, blend, family, index) {
  const rest = word.slice(blend.length);
  const fits = (candidate) => candidate !== blend && candidate.length === blend.length &&
    !allWords.has(candidate + rest) && !otherRealWords.has(candidate + rest);
  const rotate = (list) => [...list.slice(index % list.length), ...list.slice(0, index % list.length)];
  const own = rotate(family.filter(fits));
  const more = rotate(blends.filter((candidate) => fits(candidate) && !family.includes(candidate)));
  const wrong = [...own, ...more].slice(0, 3);
  // The right blend goes in a different spot each time.
  const choices = [...wrong];
  choices.splice(index % 4, 0, blend);
  return choices;
}

const modules = [
  { id: "r-blends", name: "R Blends", icon: "/images/icons/blends-r.svg", color: "pink", blends: Object.keys(rBlends) },
  { id: "l-blends", name: "L Blends", icon: "/images/icons/blends-l.svg", color: "blue", blends: Object.keys(lBlends) },
  { id: "mixed", name: "Mixed Blends", icon: "/images/icons/blends-mixed.svg", color: "green", blends },
];

// Each round deals this many words, in random order.
export const blendWordsPerGame = 10;

export const blendTopics = modules.map(({ blends: family, ...module }) => ({
  ...module,
  wordsPerGame: blendWordsPerGame,
  words: family.flatMap((blend) => words[blend].map(([word, picture]) => ({ word, picture, blend }))).map(({ word, picture, blend }, index) => ({
    word,
    answers: [word],
    picture,
    category: module.name.toUpperCase(),
    color: module.color,
    blend,
    // The gap: the blend's two or three letters at the start of the word.
    missing: 0,
    gapLength: blend.length,
    choices: choicesFor(word, blend, family, index),
  })),
}));
