// How many questions a round of CVC Sounds, Consonant Digraphs or R & L Blends deals: a parent
// can choose for each child (in Parent mode).
export const questionCountChoices = [5, 10, 15, 20];
export const defaultQuestionCount = 10;

export const ageGroups = [
  { id: "3-4", label: "3-4 years old" },
  { id: "5-6", label: "5-6 years old" },
];

// The front page shows games under these headings, in this order, each with its icon (drawn by
// scripts/draw-pictures.py).
export const gameGroups = [
  { id: "phonics", name: "Phonics", icon: "/images/icons/group-phonics.svg" },
  { id: "cambridge", name: "Cambridge YLE training", icon: "/images/icons/group-cambridge.svg" },
  { id: "chinese", name: "中文", icon: "/images/icons/group-chinese.svg", lang: "zh-Hant-HK" },
  { id: "challenge", name: "Math", icon: "/images/icons/group-challenge.svg" },
  { id: "mochi", name: "Visit Mochi", icon: "/images/icons/group-mochi.svg" },
];

// `ages` limits a game to those age groups; games without it are for everyone. `group` is the
// front-page heading it's listed under. A `spellingGuide` game can colour the vowel and consonant
// teams in its words, and a `questionCount` game deals as many questions as a parent chooses,
// when a parent sets that for a child. On the front page each game shows its `picture` (with
// `pattern` letters as a little chip, where it has them).
export const games = [
  {
    id: "cvc",
    group: "phonics",
    name: "CVC Sounds",
    color: "yellow",
    picture: "/images/game-asset/animals/cat.svg",
    pattern: ["c", null, "t"],
    note: "For age 3-4 - Beginning, middle and ending sounds",
    badge: "CVC SOUNDS",
    ages: ["3-4"],
    questionCount: true,
  },
  {
    id: "digraphs",
    group: "phonics",
    name: "Consonant Digraphs",
    color: "pink",
    picture: "/images/icons/digraphs-ch-sh-th.svg",
    note: "For age 3-6 - ch, sh, th, ph, wh, ck and ng",
    badge: "DIGRAPHS",
    ages: ["3-4", "5-6"],
    questionCount: true,
  },
  {
    id: "blends",
    group: "phonics",
    name: "R & L Blends",
    color: "blue",
    picture: "/images/icons/blends-mixed.svg",
    note: "For age 3-6 - br, cr, str, bl, cl, fl and more",
    badge: "BLENDS",
    ages: ["3-4", "5-6"],
    questionCount: true,
  },
  {
    id: "starters",
    group: "cambridge",
    name: "Letter Jumble - Starters",
    color: "green",
    picture: "/images/icons/starters-pets-and-farm.svg",
    note: "For age 5-6 - Cambridge Starters · 12 topics",
    badge: "CAMBRIDGE STARTERS",
    ages: ["5-6"],
    spellingGuide: true,
  },
  {
    id: "letter-jumble",
    group: "cambridge",
    name: "Letter Jumble - Movers",
    color: "lilac",
    picture: "/images/icons/starters-wild-animals.svg",
    note: "For age 5-6 - Cambridge Movers · 8 topics",
    badge: "CAMBRIDGE MOVERS",
    ages: ["5-6"],
    spellingGuide: true,
  },
  {
    id: "chinese",
    group: "chinese",
    name: "中文認字 · 入門篇",
    color: "green",
    picture: "/images/icons/chinese-animals-advanced.svg",
    pattern: ["單", "字"],
    note: "For age 3-4 - Chinese characters · Cantonese",
    badge: "中文認字",
    ages: ["3-4"],
  },
  {
    id: "chinese-advanced",
    group: "chinese",
    name: "中文認字 · 進階篇",
    color: "blue",
    picture: "/images/icons/chinese-jobs.svg",
    pattern: ["詞", "語"],
    note: "For age 5-6 - Chinese words · Cantonese",
    badge: "中文認字",
    ages: ["5-6"],
  },
  {
    id: "measure-words",
    group: "chinese",
    name: "量詞配對",
    color: "yellow",
    picture: "/images/game-asset/food/apple.svg",
    pattern: ["一", "個"],
    note: "For age 5-6 - Chinese measure words · Cantonese",
    badge: "量詞配對",
    ages: ["5-6"],
  },
  {
    id: "idioms",
    group: "chinese",
    name: "成語",
    color: "peach",
    picture: "/images/icons/idioms.svg",
    note: "For age 5-6 - Chinese idioms · Cantonese",
    badge: "成語",
    ages: ["5-6"],
  },
  {
    id: "math-logic",
    group: "challenge",
    name: "Daily Challenge",
    color: "blue",
    picture: "/images/icons/math-logic.svg",
    note: "For all ages - Count, add, take away and find patterns · a new level each day",
    badge: "DAILY CHALLENGE",
  },
  {
    id: "speed-quest",
    group: "challenge",
    name: "Rainbow Speed Quest",
    color: "yellow",
    picture: "/images/icons/speed-quest.svg",
    note: "Speed calculation of addition and subtraction. Try to break your own record each time!",
    badge: "SPEED QUEST",
  },
  {
    id: "dragon",
    group: "mochi",
    name: "Mochi the Rainbow Dragon",
    color: "pink",
    picture: "/images/icons/dragon.svg",
    note: "Spend coins on treats and cuddles",
    badge: "RAINBOW DRAGON",
  },
];

export function isGameForAge(game, age) {
  return !game.ages || !age || game.ages.includes(age);
}

export function gamesForAge(age) {
  return games.filter((game) => isGameForAge(game, age));
}

// A game a player can open. Parents can turn any game on or off for a child (`gameSettings`);
// games they haven't changed are on when they suit the child's age.
export function isGameAvailable(game, player) {
  return player?.gameSettings?.[game.id] ?? isGameForAge(game, player?.age);
}

// The games shown in the picker. Before anyone is playing, every game shows.
export function gamesForPlayer(player) {
  return games.filter((game) => isGameAvailable(game, player));
}
