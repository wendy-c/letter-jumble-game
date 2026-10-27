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
// front-page heading it's listed under. On the front page each game shows its `picture` (with
// `pattern` letters as a little chip, where it has them), and its speaker button says `say` —
// in Cantonese for the Chinese games.
export const games = [
  {
    id: "cvc",
    group: "phonics",
    name: "CVC Sounds",
    color: "yellow",
    picture: "/images/game-asset/animals/cat.svg",
    pattern: ["c", null, "t"],
    note: "For age 3-4 - Beginning, middle and ending sounds",
    say: "CVC Sounds! Find the missing sound.",
    badge: "CVC SOUNDS",
    ages: ["3-4"],
  },
  {
    id: "digraphs",
    group: "phonics",
    name: "Consonant Digraphs",
    color: "pink",
    picture: "/images/icons/digraphs-ch-sh-th.svg",
    note: "For age 3-4 - ch, sh, th, ph, wh, ck and ng",
    say: "Consonant digraphs! Two letters, one sound.",
    badge: "DIGRAPHS",
    ages: ["3-4"],
  },
  {
    id: "starters",
    group: "cambridge",
    name: "Letter Jumble for Starters",
    color: "green",
    picture: "/images/icons/starters-pets-and-farm.svg",
    note: "For age 5-6 - Cambridge Starters · 8 topics",
    say: "Letter Jumble for Starters! Put the letters in order.",
    badge: "CAMBRIDGE STARTERS",
    ages: ["5-6"],
  },
  {
    id: "letter-jumble",
    group: "cambridge",
    name: "Letter Jumble for Movers",
    color: "lilac",
    picture: "/images/icons/starters-wild-animals.svg",
    note: "For age 5-6 - Cambridge Movers · 8 topics",
    say: "Letter Jumble for Movers! Put the letters in order.",
    badge: "CAMBRIDGE MOVERS",
    ages: ["5-6"],
  },
  {
    id: "chinese",
    group: "chinese",
    name: "中文認字 · 入門篇",
    color: "green",
    picture: "/images/icons/chinese-animals-advanced.svg",
    pattern: ["單", "字"],
    note: "For age 3-4 - Chinese characters · Cantonese",
    say: "中文認字入門篇，一齊認識中文字！",
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
    say: "中文認字進階篇，一齊認識詞語！",
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
    say: "量詞配對，一個蘋果，一隻貓！",
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
    say: "成語，一齊學成語！",
    badge: "成語",
    ages: ["5-6"],
  },
  {
    id: "dragon",
    group: "mochi",
    name: "Mochi the Rainbow Dragon",
    color: "pink",
    picture: "/images/icons/dragon.svg",
    note: "Spend coins on treats and cuddles",
    say: "Visit Mochi the Rainbow Dragon!",
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
