import { categories } from "./game-data";
import { starterCategories } from "./starters-data";
import { cvcModes } from "./phonics-data/cvc-data";
import { digraphTopics } from "./phonics-data/digraphs-data";
import { blendTopics } from "./phonics-data/blends-data";
import { chineseAdvancedTopics, chineseTopics } from "./chinese-data/chinese-data";
import { measureWordTopics } from "./chinese-data/measure-words-data";
import { idiomTopics } from "./chinese-data/idioms-data";
import { mathLevels } from "./math-data/math-data";
import { speedTopics } from "./math-data/speed-quest-data";
import { gamesForPlayer } from "./games-data";

// Every game's topics. Finishing a topic earns its badge, saved per player by
// "<game>/<topic>" (the same key as the topic's progress).
export const topicsByGame = {
  cvc: cvcModes,
  digraphs: digraphTopics,
  blends: blendTopics,
  chinese: chineseTopics,
  "chinese-advanced": chineseAdvancedTopics,
  "measure-words": measureWordTopics,
  idioms: idiomTopics,
  starters: starterCategories,
  "letter-jumble": categories,
  "math-logic": mathLevels,
  "speed-quest": speedTopics,
};

const badgeKey = (gameId, topicId) => `${gameId}/${topicId}`;

// Each topic's badge picture, drawn by scripts/make-badges.py.
export const badgeImage = (gameId, topicId) => `/images/badges/${gameId}/${topicId}.svg`;

// The badge shelves a player sees: one per game they can play that has topics, in game order.
export function badgeShelves(player) {
  return gamesForPlayer(player)
    .filter((game) => topicsByGame[game.id])
    .map((game) => ({
      game,
      // Only the topics for the player's age (the Daily Challenge's levels).
      badges: topicsByGame[game.id].filter((topic) => !topic.ages || !player?.age || topic.ages.includes(player.age)).map((topic) => ({
        key: badgeKey(game.id, topic.id),
        topic,
        image: badgeImage(game.id, topic.id),
        earned: Boolean(player?.badges?.includes(badgeKey(game.id, topic.id))),
      })),
    }));
}
