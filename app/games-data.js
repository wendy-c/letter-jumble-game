export const ageGroups = [
  { id: "3-4", label: "3-4 years old" },
  { id: "5-6", label: "5-6 years old" },
];

// The front page shows games under these headings, in this order.
export const gameGroups = [
  { id: "phonics", name: "Phonics", icon: "🔤" },
  { id: "cambridge", name: "Cambridge YLE training", icon: "🎓" },
  { id: "chinese", name: "中文", icon: "🪭", lang: "zh-Hant-HK" },
  { id: "mochi", name: "Visit Mochi", icon: "❤️" },
];

// `ages` limits a game to those age groups; games without it are for everyone. `group` is the
// front-page heading it's listed under.
export const games = [
  {
    id: "cvc",
    group: "phonics",
    name: "CVC Sounds",
    color: "yellow",
    pattern: ["c", null, "t"],
    note: "For age 3-4 - Beginning, middle and ending sounds",
    badge: "CVC SOUNDS",
    ages: ["3-4"],
  },
  {
    id: "digraphs",
    group: "phonics",
    name: "Consonant Digraphs",
    color: "pink",
    pattern: ["sh", null],
    note: "For age 5-6 - ch, sh, th, ph, wh, ck and ng",
    badge: "DIGRAPHS",
    ages: ["5-6"],
  },
  {
    id: "starters",
    group: "cambridge",
    name: "Letter Jumble for Starters",
    color: "green",
    pattern: ["t", "a", "c"],
    note: "For age 5-6 - Cambridge Starters · 8 topics",
    badge: "CAMBRIDGE STARTERS",
    ages: ["5-6"],
  },
  {
    id: "letter-jumble",
    group: "cambridge",
    name: "Letter Jumble for Movers",
    color: "lilac",
    pattern: ["b", "t", "a"],
    note: "For age 5-6 - Cambridge Movers · 8 topics",
    badge: "CAMBRIDGE MOVERS",
    ages: ["5-6"],
  },
  {
    id: "chinese",
    group: "chinese",
    name: "中文認字 · 入門篇",
    color: "green",
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
    pattern: ["成", "語"],
    note: "For age 5-6 - Chinese idioms · Cantonese",
    badge: "成語",
    ages: ["5-6"],
  },
  {
    id: "dragon",
    group: "mochi",
    name: "Mochi the Rainbow Dragon",
    color: "pink",
    icon: "/images/icons/dragon.svg",
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
