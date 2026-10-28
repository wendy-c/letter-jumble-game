// R and L Blends: two or three consonants said together (br, cl, str…). Each word shows with its
// blend missing (e.g. "_ _ead" for bread); the learner picks the blend that fills the gap.
const asset = "/images/game-asset";

const rBlends = {
  br: [["bread", "/images/game-asset/food/bread.svg"], ["brush", "/images/game-asset/digraphs/brush.svg"], ["brick", "/images/game-asset/starters/wall.svg"], ["bring", "/images/game-asset/sports-and-leisure/present.svg"], ["brave", "/images/game-asset/blends/brave.svg"]],
  cr: [["crab", "/images/game-asset/blends/crab.svg"], ["crown", "/images/game-asset/blends/crown.svg"], ["cross", "/images/game-asset/blends/cross.svg"], ["cry", "/images/game-asset/feelings/sad.svg"], ["crib", "/images/game-asset/cvc/cot.svg"]],
  dr: [["drum", "/images/game-asset/blends/drum.svg"], ["dress", "/images/game-asset/starters/dress.svg"], ["drink", "/images/game-asset/food/fruit-juice.svg"], ["draw", "/images/game-asset/blends/draw.svg"], ["dream", "/images/game-asset/blends/dream.svg"]],
  fr: [["frog", "/images/game-asset/animals/frog.svg"], ["free", "/images/game-asset/blends/free.svg"], ["fruit", "/images/game-asset/food/strawberry.svg"], ["frost", "/images/game-asset/weather-and-seasons/snowy.svg"], ["friend", "/images/game-asset/starters/friend.svg"]],
  gr: [["grass", "/images/game-asset/blends/grass.svg"], ["green", `${asset}/colours/green.svg`], ["grin", "/images/game-asset/feelings/cheerful.svg"], ["grape", "/images/game-asset/food/grapes.svg"], ["grow", "/images/game-asset/blends/grow.svg"]],
  pr: [["press", "/images/game-asset/blends/press.svg"], ["prize", "/images/game-asset/cvc/win.svg"], ["prince", "/images/game-asset/digraphs/king.svg"], ["present", "/images/game-asset/sports-and-leisure/present.svg"], ["print", "/images/game-asset/blends/print.svg"]],
  tr: [["tree", "/images/game-asset/blends/tree.svg"], ["train", "/images/game-asset/blends/train.svg"], ["truck", "/images/game-asset/blends/truck.svg"], ["trash", "/images/game-asset/cvc/bin.svg"], ["trap", "/images/game-asset/blends/trap.svg"]],
  str: [["street", "/images/game-asset/blends/street.svg"], ["strong", "/images/game-asset/starters/arm.svg"], ["straw", "/images/game-asset/food/drink.svg"], ["stretch", "/images/game-asset/blends/stretch.svg"]],
  thr: [["throw", "/images/game-asset/blends/throw.svg"], ["three", "/images/game-asset/digraphs/three.svg"], ["through", "/images/game-asset/blends/through.svg"]],
  shr: [["shrimp", "/images/game-asset/blends/shrimp.svg"], ["shred", "/images/game-asset/blends/shred.svg"], ["shrug", "/images/game-asset/blends/shrug.svg"]],
  scr: [["scream", "/images/game-asset/feelings/panicked.svg"], ["scratch", "/images/game-asset/blends/scratch.svg"], ["scrub", "/images/game-asset/blends/scrub.svg"]],
  spr: [["spring", "/images/game-asset/weather-and-seasons/spring.svg"], ["spray", "/images/game-asset/blends/spray.svg"], ["sprout", "/images/game-asset/blends/sprout.svg"]],
};

const lBlends = {
  bl: [["blue", `${asset}/colours/blue.svg`], ["black", `${asset}/colours/black.svg`], ["blanket", `${asset}/home/blanket.svg`], ["blow", "/images/game-asset/blends/blow.svg"], ["blink", "/images/game-asset/blends/blink.svg"]],
  cl: [["clap", "/images/game-asset/blends/clap.svg"], ["clock", `${asset}/home/clock.svg`], ["cloud", "/images/game-asset/weather-and-seasons/cloudy.svg"], ["clown", "/images/game-asset/blends/clown.svg"], ["climb", "/images/game-asset/blends/climb.svg"]],
  fl: [["flag", "/images/game-asset/blends/flag.svg"], ["flower", "/images/game-asset/blends/flower.svg"], ["fly", "/images/game-asset/blends/fly.svg"], ["floor", `${asset}/home/floor.svg`], ["flame", "/images/game-asset/nature/fire.svg"]],
  gl: [["glass", `${asset}/food/glass.svg`], ["glove", "/images/game-asset/blends/glove.svg"], ["glasses", "/images/game-asset/starters/glasses.svg"], ["globe", "/images/game-asset/blends/globe.svg"], ["glow", "/images/game-asset/blends/glow.svg"]],
  pl: [["plate", `${asset}/food/plate.svg`], ["plane", "/images/game-asset/blends/plane.svg"], ["plant", "/images/game-asset/blends/plant.svg"], ["play", "/images/game-asset/blends/play.svg"], ["plug", "/images/game-asset/blends/plug.svg"]],
  sl: [["slide", "/images/game-asset/blends/slide.svg"], ["sleep", "/images/game-asset/feelings/tired.svg"], ["sled", "/images/game-asset/blends/sled.svg"], ["slow", "/images/game-asset/blends/slow.svg"], ["slipper", "/images/game-asset/blends/slipper.svg"]],
  spl: [["splash", "/images/game-asset/blends/splash.svg"], ["split", "/images/game-asset/blends/split.svg"]],
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
