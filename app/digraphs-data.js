// Consonant Digraphs: two letters that make one sound. Each word shows with its digraph missing
// (e.g. "_ _ip" for ship); the learner picks the digraph that fills the gap.
const drawn = "/images/game-asset/digraphs";

const words = {
  ch: [
    ["chair", "/images/game-asset/home/chair.svg"], ["chin", `${drawn}/chin.svg`], ["cheese", "🧀"], ["cherry", "🍒"],
    ["chicken", "/images/game-asset/animals/chicken.svg"], ["beach", "🏖️"], ["lunch", "🍱"], ["peach", "🍑"],
    ["bench", `${drawn}/bench.svg`], ["match", `${drawn}/match.svg`],
  ],
  sh: [
    ["ship", "🚢"], ["shop", "🏪"], ["shell", "🐚"], ["shoe", "/images/game-asset/clothes/shoes.svg"],
    ["shirt", "/images/game-asset/clothes/shirt.svg"], ["fish", "🐟"], ["wish", "🌠"], ["brush", "🪥"], ["wash", "🧼"], ["dish", "🍽️"],
  ],
  th: [
    ["thin", "/images/game-asset/body-and-face/thin.svg"], ["thick", `${drawn}/thick.svg`], ["thumb", "👍"], ["three", "3️⃣"],
    ["think", "🤔"], ["bath", "🛁"], ["moth", "/images/game-asset/animals/moth.svg"], ["path", `${drawn}/path.svg`],
    ["tooth", "/images/game-asset/body-and-face/tooth.svg"], ["both", "🙌"],
  ],
  ph: [["graph", "📊"], ["phone", "📱"], ["photo", "📸"], ["phase", "🌓"], ["phantom", "👻"]],
  wh: [
    ["wheel", `${drawn}/wheel.svg`], ["white", "/images/game-asset/colours/white.svg"],
    ["whale", "/images/game-asset/animals/whale.svg"], ["where", "🔍❓"], ["whisper", "🤫"],
  ],
  ck: [["duck", "🦆"], ["lock", "🔒"], ["pack", "🎒"], ["black", "/images/game-asset/colours/black.svg"], ["kick", "🦵⚽"]],
  ng: [["king", "🤴"], ["ring", "💍"], ["song", "🎵"], ["long", "📏"], ["bring", "🎁"]],
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
