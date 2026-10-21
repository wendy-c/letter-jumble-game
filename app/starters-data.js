import { wordCategory } from "./game-data";

// Letter Jumble for Starters: Cambridge Starters (YLE) vocabulary, played like Letter Jumble for
// Movers. Pictures reuse the Chinese game's animal drawings where there is one, or an emoji.
const chineseAnimals = "/images/chinese/animals";
const moreAnimals = "/images/chinese/animals-advanced";

export const starterCategories = [
  {
    id: "pets-and-farm",
    name: "Pets and Farm",
    icon: "/images/icons/starters-pets-and-farm.svg",
    color: "green",
    words: [
      ["Cat", `${chineseAnimals}/cat.svg`],
      ["Dog", `${chineseAnimals}/dog.svg`],
      ["Bird", "🐦"],
      ["Duck", "🦆"],
      ["Chicken", `${chineseAnimals}/chicken.svg`],
      ["Cow", `${chineseAnimals}/cow.svg`],
      ["Sheep", `${chineseAnimals}/sheep.svg`],
      ["Goat", "🐐"],
      ["Horse", `${chineseAnimals}/horse.svg`],
      ["Pig", `${chineseAnimals}/pig.svg`],
      ["Donkey", `${moreAnimals}/donkey.svg`],
      ["Frog", "🐸"],
      ["Fish", "🐟"],
      ["Lizard", "🦎"],
      ["Mouse", `${chineseAnimals}/mouse.svg`],
      ["Mice", "🐁🐁🐁"],
      ["Pet", "🐾"],
    ],
  },
  {
    id: "wild-animals",
    name: "Wild Animals",
    icon: "/images/icons/starters-wild-animals.svg",
    color: "peach",
    words: [
      ["Bear", `${chineseAnimals}/bear.svg`],
      ["Elephant", `${chineseAnimals}/elephant.svg`],
      ["Giraffe", "🦒"],
      ["Hippo", "🦛"],
      ["Bat", `${moreAnimals}/bat.svg`],
      ["Kangaroo", `${moreAnimals}/kangaroo.svg`],
      ["Monkey", `${moreAnimals}/monkey.svg`],
      ["Panda", `${moreAnimals}/panda.svg`],
      ["Parrot", `${moreAnimals}/parrot.svg`],
      ["Penguin", "🐧"],
      ["Polar bear", `${moreAnimals}/polar-bear.svg`],
      ["Snake", "🐍"],
      ["Spider", `${moreAnimals}/spider.svg`],
      ["Tiger", `${chineseAnimals}/tiger.svg`],
      ["Zebra", `${moreAnimals}/zebra.svg`],
      ["Crocodile", "🐊"],
      ["Dolphin", `${moreAnimals}/dolphin.svg`],
      ["Jellyfish", "/images/words/starters/jellyfish.svg"],
      ["Shark", "🦈"],
      ["Whale", `${moreAnimals}/whale.svg`],
    ],
  },
].map(wordCategory);
