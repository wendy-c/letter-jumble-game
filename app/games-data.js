export const ageGroups = [
  { id: "3-4", label: "3-4 years old" },
  { id: "5-6", label: "5-6 years old" },
];

// `ages` limits a game to those age groups; games without it are for everyone.
export const games = [
  {
    id: "cvc",
    name: "CVC Sounds",
    color: "yellow",
    pattern: ["c", null, "t"],
    note: "Beginning, middle and ending sounds",
    badge: "CVC SOUNDS",
    ages: ["3-4"],
  },
  {
    id: "letter-jumble",
    name: "Letter Jumble for Movers",
    color: "lilac",
    pattern: ["b", "t", "a"],
    note: "Cambridge Movers · 8 topics",
    badge: "CAMBRIDGE MOVERS",
    ages: ["5-6"],
  },
  {
    id: "dragon",
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
