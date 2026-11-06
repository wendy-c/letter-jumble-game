// How each player's data is saved (version 3), and moving older saved data into it.
//
// A player is { id, name, coins, age, settings, lastPlayed, games }: `id` is made when the player
// is (a GUID, for matching players up), `settings` are their own site settings ({ language,
// tutorialSeen }), `lastPlayed` is the game they played last ({ game, topic }, the topic null for a
// game without one; there's none until they've played) and `games` holds everything about each
// game, by game id. A game has its own settings, tutorial and unlocks, and then each module (topic
// or level) it's been played in, by the module's id, with that module's own data:
//
//   games["blends"] = {
//     settings: { enabled, spellingGuide, questionCount },  // what a parent chose (only if changed)
//     tutorial: { seen: true },                            // its how-to-play card has been shown
//     unlocks: ["k1-level-2@2026-11-01"],                  // what's been opened (levels, places)
//     "r-blends": {
//       progress: 3,                                       // the word they're on
//       decks: 1234567,                                    // the dealt words, as a seed
//       results: [true, false, null],                      // answers in this round
//       badge: true,                                       // finished with all answers right
//       records: 41250,                                    // best time, in milliseconds
//       scores: [8, 10],                                   // best score, [right, out of]
//     },
//   }
//
// so a module's deck is at players[n].games.blends["r-blends"].decks. (No module is called
// "settings", "tutorial" or "unlocks": those names are the game's own.)
//
// The save is { version, players, current, language }. `migrateSaved` brings an older one up to
// date one version at a time, through `migrations`; a new version adds its step there.
//
// Version 1 (saved with no version number) kept each kind of data at the top of the player, keyed
// "<game>/<topic>" ({ progress: { "letter-jumble/animals": 3 }, … }), and the site settings for the
// whole browser; its step moves them into the layout above without losing anything. A deck used to
// be the dealt order itself (an array): one with no progress becomes a seed straight away, and one
// with progress is kept until its round is finished (when the next deal is a seed).
//
// Version 2 kept each kind of data at the game, by module ({ decks: { "r-blends": 1234567 },
// badges: ["r-blends"] }); its step moves each module's data into the module.
import { ageGroups, defaultQuestionCount, games, questionCountChoices } from "../games-data";
import { seededRandom, shuffledDeck } from "./spelling";

export const savedVersion = 3;
// A game's own data, beside its modules.
export const gameWideKeys = ["settings", "tutorial", "unlocks"];
// What each module keeps (and `badge`).
const moduleKinds = ["progress", "decks", "results", "records", "scores"];
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

// A module's saved data, by its "<game>/<topic>" key.
function moduleData(player, key) {
  const [gameId, topicId] = splitKey(key);
  if (gameWideKeys.includes(topicId)) return {};
  const module = gameData(player, gameId)[topicId];
  return isObject(module) ? module : {};
}

// A module's saved value of one kind ("progress", "decks", "results", "records", "scores"), by its
// "<game>/<topic>" key.
export const topicValue = (player, kind, key) => moduleData(player, key)[kind];

export const hasBadge = (player, key) => moduleData(player, key).badge === true;

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

// A player with one module's data changed by `change(module)`; a module left empty is dropped.
function withModule(player, key, change) {
  const [gameId, topicId] = splitKey(key);
  if (!topicId || gameWideKeys.includes(topicId)) return player;
  return withGame(player, gameId, (game) => {
    const module = change(isObject(game[topicId]) ? { ...game[topicId] } : {});
    return { ...game, [topicId]: Object.fromEntries(Object.entries(module).filter(([, value]) => value !== undefined)) };
  });
}

// A player with a module's value of one kind set (or, with `undefined`, removed).
export const withTopicValue = (player, kind, key, value) => withModule(player, key, (module) => ({ ...module, [kind]: value }));

// A player with a module's badge.
export const withBadge = (player, key) => withModule(player, key, (module) => ({ ...module, badge: true }));

// A player with something added to a game's list ("unlocks"), once.
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

// A game's modules: [id, data] for each.
const modulesOf = (game) => (isObject(game) ? Object.entries(game).filter(([id, module]) => !gameWideKeys.includes(id) && isObject(module)) : []);

// A current (version 3) player as version 1's flat fields (keyed "<game>/<topic>"), plus its id,
// settings and the games whose how-to cards it has seen, so both can be checked the same way.
// (Tests use it to check what was saved, by topic.)
export function flattenPlayer(player) {
  if (!isObject(player?.games)) return player;
  const flat = { id: player.id, name: player.name, coins: player.coins, age: player.age, settings: player.settings, lastPlayed: player.lastPlayed };
  const modules = Object.entries(player.games).flatMap(([gameId, game]) => modulesOf(game).map(([topicId, module]) => [`${gameId}/${topicId}`, module]));
  moduleKinds.forEach((kind) => {
    flat[kind] = Object.fromEntries(modules.filter(([, module]) => module[kind] !== undefined).map(([key, module]) => [key, module[kind]]));
  });
  flat.badges = modules.filter(([, module]) => module.badge === true).map(([key]) => key);
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
  const last = player.lastPlayed;
  if (isObject(last) && games.some((game) => game.id === last.game) && (last.topic == null || (typeof last.topic === "string" && last.topic.length > 0))) {
    cleaned.lastPlayed = { game: last.game, topic: last.topic ?? null };
  }
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

// Clean flat fields as a current (version 3) player.
function nest(flat) {
  let player = { id: flat.id, name: flat.name, coins: flat.coins, ...(flat.age && { age: flat.age }), settings: flat.settings, ...(flat.lastPlayed && { lastPlayed: flat.lastPlayed }), games: {} };
  moduleKinds.forEach((kind) => {
    Object.entries(flat[kind] ?? {}).forEach(([key, value]) => { player = withTopicValue(player, kind, key, value); });
  });
  (flat.badges ?? []).forEach((key) => { player = withBadge(player, key); });
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

// Each player's games changed by `change(game)`.
const reshapeGames = (players, change) => players.map((player) => (isObject(player.games)
  ? { ...player, games: Object.fromEntries(Object.entries(player.games).map(([gameId, game]) => [gameId, isObject(game) ? change(game) : game])) }
  : player));
const gameWideOf = (game) => Object.fromEntries(gameWideKeys.filter((key) => game[key] !== undefined).map((key) => [key, game[key]]));

// A version 2 game (each kind of data by module) as version 3 (each module's data together).
export function moduleFirst(game) {
  const moved = gameWideOf(game);
  const put = (topicId, kind, value) => {
    if (typeof topicId !== "string" || !topicId || gameWideKeys.includes(topicId)) return;
    moved[topicId] = { ...moved[topicId], [kind]: value };
  };
  moduleKinds.forEach((kind) => {
    if (isObject(game[kind])) Object.entries(game[kind]).forEach(([topicId, value]) => put(topicId, kind, value));
  });
  if (Array.isArray(game.badges)) game.badges.forEach((topicId) => put(topicId, "badge", true));
  return moved;
}

// A version 3 game as version 2: the other way round.
export function kindFirst(game) {
  const moved = gameWideOf(game);
  modulesOf(game).forEach(([topicId, module]) => {
    moduleKinds.forEach((kind) => {
      if (module[kind] !== undefined) moved[kind] = { ...moved[kind], [topicId]: module[kind] };
    });
    if (module.badge === true) moved.badges = [...(moved.badges ?? []), topicId];
  });
  return moved;
}

// `migrations[n]` takes a version n save to version n + 1 (`site` is version 1's site settings,
// kept apart from the players).
export const migrations = {
  // Each game's data under the game, an id for each player, the browser's site settings into each
  // player's own, and decks not yet started as seeds. Who's playing was their name; now their id.
  1: (stored, site) => {
    const players = playersIn(stored).map((player) => nest(cleanFlat(flattenPlayer(player), site)));
    const current = players.find((player) => player.name === stored?.current);
    return { version: 2, players: reshapeGames(players, kindFirst), current: current?.id ?? null, language: languageOr(site?.language, "en") };
  },
  // Each module's data together, under the module: games.blends["r-blends"].decks, not
  // games.blends.decks["r-blends"].
  2: (stored) => ({ ...stored, version: 3, players: reshapeGames(playersIn(stored), moduleFirst) }),
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
