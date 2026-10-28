// Consonant Digraphs: two letters that make one sound. Each word shows with its digraph missing
// (e.g. "_ _ip" for ship); the learner picks the digraph that fills the gap.
const drawn = "/images/game-asset/digraphs";

const words = {
  ch: [
    ["chair", "/images/game-asset/home/chair.svg"], ["chin", `${drawn}/chin.svg`], ["cheese", `${drawn}/cheese.svg`], ["cherry", `${drawn}/cherry.svg`],
    ["chicken", "/images/game-asset/animals/chicken.svg"], ["beach", "/images/game-asset/places/beach.svg"], ["lunch", `${drawn}/lunch.svg`], ["peach", `${drawn}/peach.svg`],
    ["bench", `${drawn}/bench.svg`], ["match", `${drawn}/match.svg`],
  ],
  sh: [
    ["ship", `${drawn}/ship.svg`], ["shop", "/images/game-asset/places/supermarket.svg"], ["shell", `${drawn}/shell.svg`], ["shoe", "/images/game-asset/clothes/shoes.svg"],
    ["shirt", "/images/game-asset/clothes/shirt.svg"], ["fish", "/images/game-asset/food/fish.svg"], ["wish", `${drawn}/wish.svg`], ["brush", `${drawn}/brush.svg`], ["wash", `${drawn}/wash.svg`], ["dish", "/images/game-asset/home/dishes.svg"],
  ],
  th: [
    ["thin", "/images/game-asset/body-and-face/thin.svg"], ["thick", `${drawn}/thick.svg`], ["thumb", `${drawn}/thumb.svg`], ["three", `${drawn}/three.svg`],
    ["think", `${drawn}/think.svg`], ["bath", "/images/game-asset/cvc/tub.svg"], ["moth", "/images/game-asset/animals/moth.svg"], ["path", `${drawn}/path.svg`],
    ["tooth", "/images/game-asset/body-and-face/tooth.svg"], ["both", `${drawn}/both.svg`],
  ],
  ph: [["graph", `${drawn}/graph.svg`], ["phone", "/images/game-asset/starters/phone.svg"], ["photo", `${drawn}/photo.svg`], ["phase", `${drawn}/phase.svg`], ["phantom", `${drawn}/phantom.svg`]],
  wh: [
    ["wheel", `${drawn}/wheel.svg`], ["white", "/images/game-asset/colours/white.svg"],
    ["whale", "/images/game-asset/animals/whale.svg"], ["where", `${drawn}/where.svg`], ["whisper", `${drawn}/whisper.svg`],
  ],
  ck: [["duck", "/images/game-asset/animals/duck.svg"], ["lock", `${drawn}/lock.svg`], ["pack", "/images/game-asset/starters/bag.svg"], ["black", "/images/game-asset/colours/black.svg"], ["kick", `${drawn}/kick.svg`]],
  ng: [["king", `${drawn}/king.svg`], ["ring", `${drawn}/ring.svg`], ["song", `${drawn}/song.svg`], ["long", `${drawn}/long.svg`], ["bring", "/images/game-asset/sports-and-leisure/present.svg"]],
};

export const digraphs = Object.keys(words);
const allWords = new Set(Object.values(words).flat().map(([word]) => word));
// Real words that a wrong digraph could make (chip for ship, with for wish...), so the Mixed
// module never offers that digraph as a "wrong" answer.
const otherRealWords = new Set(["chip", "chop", "shin", "with", "chick", "thing", "wing", "sing", "sick", "shock", "chess", "whip", "wink", "thump", "chunk"]);

// The right digraph and three others that don't spell a real word, picked the same way every time.
function mixedChoices(word, digraph, start, index) {
  const others = digraphs.filter((candidate) => {
    if (candidate === digraph) return false;
    const spelled = word.slice(0, start) + candidate + word.slice(start + 2);
    return !allWords.has(spelled) && !otherRealWords.has(spelled);
  });
  const wrong = [...others.slice(index % others.length), ...others.slice(0, index % others.length)].slice(0, 3);
  return [digraph, ...wrong];
}

const modules = [
  { id: "ch-sh-th", name: "ch · sh · th", icon: "/images/icons/digraphs-ch-sh-th.svg", color: "pink", digraphs: ["ch", "sh", "th"] },
  { id: "ph-wh-ck-ng", name: "ph · wh · ck · ng", icon: "/images/icons/digraphs-ph-wh-ck-ng.svg", color: "blue", digraphs: ["ph", "wh", "ck", "ng"] },
  { id: "mixed", name: "Mixed Digraphs", icon: "/images/icons/digraphs-mixed.svg", color: "green", digraphs, mixed: true },
];

// Each round deals this many words, in random order.
export const digraphWordsPerGame = 10;

export const digraphTopics = modules.map(({ digraphs: sounds, mixed, ...module }) => ({
  ...module,
  wordsPerGame: digraphWordsPerGame,
  words: sounds.flatMap((digraph) => words[digraph].map(([word, picture]) => ({ word, picture, digraph }))).map(({ word, picture, digraph }, index) => {
    const start = word.indexOf(digraph);
    return {
      word,
      answers: [word],
      picture,
      category: module.name.toUpperCase(),
      color: module.color,
      digraph,
      // The gap: two letters starting at `missing`.
      missing: start,
      gapLength: 2,
      // A module offers all its digraphs; Mixed offers the right one and three others.
      choices: mixed ? mixedChoices(word, digraph, start, index) : sounds,
    };
  }),
}));
