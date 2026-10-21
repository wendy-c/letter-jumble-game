import { categories } from "./game-data";
import { starterCategories } from "./starters-data";
import { cvcModes } from "./cvc-data";
import { chineseAdvancedTopics, chineseTopics } from "./chinese-data";
import { measureWordTopics } from "./measure-words-data";
import { idiomTopics } from "./idioms-data";
import { gamesForPlayer } from "./games-data";

// Every game's topics. Finishing a topic earns its badge, saved per player by
// "<game>/<topic>" (the same key as the topic's progress).
export const topicsByGame = {
  cvc: cvcModes,
  chinese: chineseTopics,
  "chinese-advanced": chineseAdvancedTopics,
  "measure-words": measureWordTopics,
  idioms: idiomTopics,
  starters: starterCategories,
  "letter-jumble": categories,
};

export const badgeKey = (gameId, topicId) => `${gameId}/${topicId}`;

// Each topic's badge picture, drawn by scripts/make-badges.py.
export const badgeImage = (gameId, topicId) => `/images/badges/${gameId}/${topicId}.svg`;

// The badge shelves a player sees: one per game they can play that has topics, in game order.
export function badgeShelves(player) {
  return gamesForPlayer(player)
    .filter((game) => topicsByGame[game.id])
    .map((game) => ({
      game,
      badges: topicsByGame[game.id].map((topic) => ({
        key: badgeKey(game.id, topic.id),
        topic,
        image: badgeImage(game.id, topic.id),
        earned: Boolean(player?.badges?.includes(badgeKey(game.id, topic.id))),
      })),
    }));
}
