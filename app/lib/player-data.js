// How each player's data is saved (version 2), and moving older saved data into it.
//
// A player is { id, name, coins, age, settings, games }: `id` is made when the player is (a GUID,
// for matching players up), `settings` are their own site settings ({ language, tutorialSeen }),
// and `games` holds everything about each game, by game id:
//
//   games["letter-jumble"] = {
//     settings: { enabled, spellingGuide, questionCount },  // what a parent chose (only if changed)
//     tutorial: { seen: true },                            // its how-to-play card has been shown
//     progress: { animals: 3 },                             // the word they're on, by topic
//     decks: { animals: 1234567 },                          // each topic's dealt words, as a seed
//     results: { animals: [true, false, null] },            // answers in this round
//     badges: ["animals"],                                  // topics finished with all answers right
//     records: { "within-10": 41250 },                      // best times, in milliseconds
//     scores: { "k1-level-3": [8, 10] },                    // best scores, [right, out of]
//     unlocks: ["k1-level-2@2026-11-01"],                   // what's been opened (levels, places)
//   }
//
// The save is { version, players, current, language }. `migrateSaved` brings an older one up to
// date one version at a time, through `migrations`; a new version adds its step there.
//
// Version 1 (saved with no version number) kept each kind of data at the top of the player, keyed
// "<game>/<topic>" ({ progress: { "letter-jumble/animals": 3 }, … }), and the site settings for the
// whole browser; its step moves them into the layout above without losing anything. A deck used to
// be the dealt order itself (an array): one with no progress becomes a seed straight away, and one
// with progress is kept until its round is finished (when the next deal is a seed).
import { ageGroups, defaultQuestionCount, games, questionCountChoices } from "../games-data";
import { seededRandom, shuffledDeck } from "./spelling";

export const savedVersion = 2;
const languages = ["en", "zh"];
const spellingGuideGames = games.filter((game) => game.spellingGuide).map((game) => game.id);
const countGames = games.filter((game) => game.questionCount).map((game) => game.id);

const isCount = (value) => Number.isInteger(value) && value >= 0;
const isAge = (age) => ageGroups.some((group) => group.id === age);
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

/* ---------- Ids and deck seeds ---------- */

// A GUID for a new player.
export function newPlayerId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex().slice(1)}-${hex()}${hex()}${hex()}`;
}

// A seed for dealing a topic's words.
export const newDeckSeed = () => 1 + Math.floor(Math.random() * 2147483646);
const isSeed = (value) => Number.isInteger(value) && value > 0;
const isOrder = (value) => Array.isArray(value) && value.length > 0 && value.every(isCount);

// The order a saved deck deals a topic's words in: `count` of its `size` words. A seed always deals
// the same order for the same topic size and count; an older saved order is used as it is.
// (The end-to-end tests set `window.__dealInOrder`, so a seed deals the words in their original
// order and the tests know which word comes first.)
export function deckOrder(deck, size, count) {
  if (isSeed(deck)) {
    if (typeof window !== "undefined" && window.__dealInOrder === true) return Array.from({ length: Math.min(count, size) }, (_, index) => index);
    return shuffledDeck(size, count, seededRandom(`deck:${deck}`));
  }
  return isOrder(deck) ? deck : null;
}

/* ---------- Reading and changing a player's game data ---------- */

// "letter-jumble/animals" → ["letter-jumble", "animals"].
export function splitKey(key) {
  const at = key.indexOf("/");
  return at === -1 ? [key, ""] : [key.slice(0, at), key.slice(at + 1)];
}

export const gameData = (player, gameId) => player?.games?.[gameId] ?? {};

// A topic's saved value of one kind ("progress", "decks", "results", "records", "scores"), by its
// "<game>/<topic>" key.
export function topicValue(player, kind, key) {
  const [gameId, topicId] = splitKey(key);
  return gameData(player, gameId)[kind]?.[topicId];
}

export const hasBadge = (player, key) => {
  const [gameId, topicId] = splitKey(key);
  return Boolean(gameData(player, gameId).badges?.includes(topicId));
};

export const unlocksOf = (player, gameId) => gameData(player, gameId).unlocks ?? [];
export const gameSetting = (player, gameId, name) => gameData(player, gameId).settings?.[name];
export const howToSeen = (player, gameId) => Boolean(gameData(player, gameId).tutorial?.seen);

// A player with one game's data changed by `change(game)`; empty kinds and games are dropped, so
// saved data stays small.
export function withGame(player, gameId, change) {
  const game = change({ ...gameData(player, gameId) });
  const kept = Object.fromEntries(Object.entries(game).filter(([, value]) => (
    value !== undefined && !(Array.isArray(value) ? value.length === 0 : isObject(value) && Object.keys(value).length === 0))));
  const allGames = { ...player.games };
  if (Object.keys(kept).length > 0) allGames[gameId] = kept;
  else delete allGames[gameId];
  return { ...player, games: allGames };
}

// A player with a topic's value of one kind set (or, with `undefined`, removed).
export function withTopicValue(player, kind, key, value) {
  const [gameId, topicId] = splitKey(key);
  return withGame(player, gameId, (game) => {
    const values = { ...game[kind] };
    if (value === undefined) delete values[topicId];
    else values[topicId] = value;
    return { ...game, [kind]: values };
  });
}

// A player with something added to a game's list ("badges", "unlocks"), once.
export function withListItem(player, gameId, kind, item) {
  return withGame(player, gameId, (game) => (game[kind]?.includes(item) ? game : { ...game, [kind]: [...(game[kind] ?? []), item] }));
}

export function withGameSetting(player, gameId, name, value) {
  return withGame(player, gameId, (game) => {
    const settings = { ...game.settings };
    if (value === undefined) delete settings[name];
    else settings[name] = value;
    return { ...game, settings };
  });
}

/* ---------- Moving older saves up to date ---------- */

// Players saved before K1-K3 have an age of "3-4" (now K1) or "5-6" (now K3), and their Daily
// Challenge levels were named after those ages ("math-logic/3-4-level-2" is now K1's Level 2,
// "math-logic/5-6-level-2" K2's).
const oldAges = { "3-4": "k1", "5-6": "k3" };
const renameLevel = (key) => key.replace("math-logic/3-4-level-", "math-logic/k1-level-").replace("math-logic/5-6-level-", "math-logic/k2-level-");
const renameKeys = (saved) => (isObject(saved) ? Object.fromEntries(Object.entries(saved).map(([key, value]) => [renameLevel(key), value])) : saved);
const renameList = (list) => (Array.isArray(list) ? list.map((item) => (typeof item === "string" ? renameLevel(item) : item)) : list);

// A version 2 player as version 1's flat fields (keyed "<game>/<topic>"), plus its id, settings
// and the games whose how-to cards it has seen, so both can be checked the same way. (Tests use it
// to check what was saved, by topic.)
export function flattenPlayer(player) {
  if (!isObject(player?.games)) return player;
  const flat = { id: player.id, name: player.name, coins: player.coins, age: player.age, settings: player.settings };
  const keyed = (kind) => Object.fromEntries(Object.entries(player.games).flatMap(([gameId, game]) => (
    isObject(game?.[kind]) ? Object.entries(game[kind]).map(([topicId, value]) => [`${gameId}/${topicId}`, value]) : [])));
  ["progress", "decks", "results", "records", "scores"].forEach((kind) => { flat[kind] = keyed(kind); });
  flat.badges = Object.entries(player.games).flatMap(([gameId, game]) => (Array.isArray(game?.badges) ? game.badges.map((topicId) => `${gameId}/${topicId}`) : []));
  flat.unlocks = Object.entries(player.games).flatMap(([gameId, game]) => (Array.isArray(game?.unlocks)
    ? game.unlocks.map((item) => (gameId === "dragon" ? item : `${gameId}/${item}`)) : []));
  const setting = (name) => Object.fromEntries(Object.entries(player.games).filter(([, game]) => game?.settings?.[name] !== undefined).map(([gameId, game]) => [gameId, game.settings[name]]));
  flat.gameSettings = setting("enabled");
  flat.questionCounts = setting("questionCount");
  flat.spellingGuide = Object.entries(setting("spellingGuide")).filter(([, on]) => on === true).map(([gameId]) => gameId);
  flat.howToSeen = Object.entries(player.games).filter(([, game]) => game?.tutorial?.seen === true).map(([gameId]) => gameId);
  return flat;
}

// Keeps only the flat fields we understand, tidied up.
function cleanFlat(saved, site) {
  const player = {
    ...saved,
    age: oldAges[saved.age] ?? saved.age,
    progress: renameKeys(saved.progress),
    decks: renameKeys(saved.decks),
    results: renameKeys(saved.results),
    badges: renameList(saved.badges),
    unlocks: renameList(saved.unlocks),
  };
  const cleaned = {
    id: typeof player.id === "string" && player.id.length > 0 ? player.id : newPlayerId(),
    name: player.name,
    coins: player.coins,
  };
  if (isAge(player.age)) cleaned.age = player.age;
  // Their own site settings, or (moving from version 1) the browser's.
  const settings = isObject(player.settings) ? player.settings : site;
  cleaned.settings = {
    language: languages.includes(settings?.language) ? settings.language : "en",
    tutorialSeen: settings?.tutorialSeen === true,
  };
  const seen = Array.isArray(player.howToSeen) ? player.howToSeen : site?.howToSeen;
  cleaned.howToSeen = Array.isArray(seen) ? [...new Set(seen.filter((id) => typeof id === "string"))] : [];
  const keep = (kind, valid) => {
    if (!isObject(player[kind])) return;
    const kept = Object.fromEntries(Object.entries(player[kind]).filter(([key, value]) => key.includes("/") && valid(value)));
    if (Object.keys(kept).length > 0) cleaned[kind] = kept;
  };
  keep("progress", isCount);
  keep("decks", (deck) => isSeed(deck) || isOrder(deck));
  keep("results", (answers) => Array.isArray(answers) && answers.every((result) => result === true || result === false || result === null));
  keep("records", (time) => Number.isFinite(time) && time > 0);
  keep("scores", (score) => Array.isArray(score) && score.length === 2 && score.every(Number.isInteger) && score[0] >= 0 && score[0] <= score[1] && score[1] > 0);
  // The games a parent turned the spelling guide on for. It used to be one switch for all of them
  // (`true`), which now means every game that has the guide.
  const guideGames = player.spellingGuide === true ? spellingGuideGames
    : Array.isArray(player.spellingGuide) ? [...new Set(player.spellingGuide.filter((id) => spellingGuideGames.includes(id)))] : [];
  if (guideGames.length > 0) cleaned.spellingGuide = guideGames;
  // How many questions a parent chose for a game's rounds (only those that aren't the default).
  if (isObject(player.questionCounts)) {
    const counts = Object.fromEntries(Object.entries(player.questionCounts)
      .filter(([id, count]) => countGames.includes(id) && questionCountChoices.includes(count) && count !== defaultQuestionCount));
    if (Object.keys(counts).length > 0) cleaned.questionCounts = counts;
  }
  if (isObject(player.gameSettings)) {
    const enabled = Object.fromEntries(Object.entries(player.gameSettings).filter(([, on]) => typeof on === "boolean"));
    if (Object.keys(enabled).length > 0) cleaned.gameSettings = enabled;
  }
  ["unlocks", "badges"].forEach((kind) => {
    if (!Array.isArray(player[kind])) return;
    const list = [...new Set(player[kind].filter((item) => typeof item === "string" && item.length > 0))];
    if (list.length > 0) cleaned[kind] = list;
  });
  // A deck still dealt as an order becomes a seed if its round hasn't started.
  Object.entries(cleaned.decks ?? {}).forEach(([key, deck]) => {
    const started = (cleaned.progress?.[key] ?? 0) > 0 || (cleaned.results?.[key] ?? []).some((result) => typeof result === "boolean");
    if (isOrder(deck) && !started) cleaned.decks[key] = newDeckSeed();
  });
  return cleaned;
}

// Clean flat fields as a version 2 player.
function nest(flat) {
  let player = { id: flat.id, name: flat.name, coins: flat.coins, ...(flat.age && { age: flat.age }), settings: flat.settings, games: {} };
  ["progress", "decks", "results", "records", "scores"].forEach((kind) => {
    Object.entries(flat[kind] ?? {}).forEach(([key, value]) => { player = withTopicValue(player, kind, key, value); });
  });
  (flat.badges ?? []).forEach((key) => {
    const [gameId, topicId] = splitKey(key);
    if (topicId) player = withListItem(player, gameId, "badges", topicId);
  });
  // Unlocks keyed "<game>/<item>" (Challenge levels) are that game's; the others ("tofu", "park")
  // are Mochi's game's.
  (flat.unlocks ?? []).forEach((unlock) => {
    const [gameId, item] = unlock.includes("/") ? splitKey(unlock) : ["dragon", unlock];
    player = withListItem(player, gameId, "unlocks", item);
  });
  Object.entries(flat.gameSettings ?? {}).forEach(([gameId, on]) => { player = withGameSetting(player, gameId, "enabled", on); });
  Object.entries(flat.questionCounts ?? {}).forEach(([gameId, count]) => { player = withGameSetting(player, gameId, "questionCount", count); });
  (flat.spellingGuide ?? []).forEach((gameId) => { player = withGameSetting(player, gameId, "spellingGuide", true); });
  flat.howToSeen.forEach((gameId) => { player = withGame(player, gameId, (game) => ({ ...game, tutorial: { seen: true } })); });
  return player;
}

const isValidPlayer = (player) => typeof player?.name === "string" && player.name.length > 0 && isCount(player.coins);
const playersIn = (stored) => (Array.isArray(stored?.players) ? stored.players : []).filter(isValidPlayer);
const languageOr = (language, fallback) => (languages.includes(language) ? language : fallback);

// `migrations[n]` takes a version n save to version n + 1 (`site` is version 1's site settings,
// kept apart from the players).
export const migrations = {
  // Each game's data under the game, an id for each player, the browser's site settings into each
  // player's own, and decks not yet started as seeds. Who's playing was their name; now their id.
  1: (stored, site) => {
    const players = playersIn(stored).map((player) => nest(cleanFlat(flattenPlayer(player), site)));
    const current = players.find((player) => player.name === stored?.current);
    return { version: 2, players, current: current?.id ?? null, language: languageOr(site?.language, "en") };
  },
};

// A save of the current version, tidied: anything it doesn't understand is dropped.
function cleanSave(stored) {
  const players = playersIn(stored).map((player) => nest(cleanFlat(flattenPlayer(player), null)));
  const current = players.find((player) => player.id === stored?.current) ?? null;
  return { version: savedVersion, players, current: current?.id ?? null, language: languageOr(stored?.language, current?.settings.language ?? "en") };
}

// Saved players of any version (and version 1's site settings, `site`) as the current version:
// { version, players, current, language }. `current` is the id of whoever's playing, and
// `language` the site's language when nobody is. A save from a newer version than this one is
// read as this version, keeping what it understands.
export function migrateSaved(stored, site = null) {
  let save = stored;
  let version = Number.isInteger(stored?.version) && stored.version > 1 ? stored.version : 1;
  for (; version < savedVersion; version += 1) save = migrations[version](save, site);
  return cleanSave(save);
}
