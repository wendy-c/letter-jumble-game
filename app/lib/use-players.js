import { useEffect, useState } from "react";
import { ageGroups, defaultQuestionCount } from "../games-data";
import {
  howToSeen, migrateSaved, newPlayerId, savedVersion, splitKey, topicValue,
  withGame, withGameSetting, withListItem, withTopicValue,
} from "./player-data";

// Everything about the players is saved here (in the layout described in player-data.js).
export const playersStorageKey = "letter-jumble:players";
// Version 1 kept the site's settings (language, how-to cards seen, the tour) for the whole browser
// here; they're moved into each player's settings, then this is removed.
export const siteStorageKey = "letter-jumble:site";
// Coins saved before players existed; they're given to the first player created.
const legacyCoinsStorageKey = "letter-jumble:rainbow-coins";
export const maxNameLength = 20;

const emptyState = { version: savedVersion, players: [], current: null, language: "en" };
const isCount = (value) => Number.isInteger(value) && value >= 0;
const isAge = (age) => ageGroups.some((group) => group.id === age);

// The players saved as `text` (what's stored under playersStorageKey, in any version), as version
// 2: { version, players, current (an id), language }. `site` is version 1's site settings, if any.
// Throws if it isn't JSON.
export function readPlayersText(text, site = null) {
  return migrateSaved(JSON.parse(text ?? "null"), site);
}

function readStoredState() {
  try {
    let site = null;
    try {
      site = JSON.parse(window.localStorage.getItem(siteStorageKey) ?? "null");
    } catch {
      // Unreadable old settings are left behind.
    }
    return readPlayersText(window.localStorage.getItem(playersStorageKey), site);
  } catch {
    return emptyState;
  }
}

function storeState(state) {
  try {
    window.localStorage.setItem(playersStorageKey, JSON.stringify(state));
    // The old browser-wide settings now live with each player.
    window.localStorage.removeItem(siteStorageKey);
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); players still work for this visit.
  }
}

function takeLegacyCoins() {
  try {
    const stored = Number.parseInt(window.localStorage.getItem(legacyCoinsStorageKey) ?? "", 10);
    window.localStorage.removeItem(legacyCoinsStorageKey);
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function sameName(first, second) {
  return first.toLocaleLowerCase() === second.toLocaleLowerCase();
}

// Players and their rainbow coins persist in localStorage. Saved state is read after the
// first render so the server-rendered page matches, and nothing is saved until it has loaded.
// Players are matched by their id. The site's settings (`site`) are the current player's own, or
// the browser's language when nobody is playing.
export function usePlayers() {
  const [state, setState] = useState(emptyState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) storeState(state);
  }, [state, loaded]);

  const currentPlayer = state.players.find((player) => player.id === state.current) ?? null;

  // Returns an error message for the form, or null once the player is created and selected.
  function createPlayer(rawName, age) {
    const name = normalizeName(rawName);
    if (!name) return "Please type a name.";
    if (name.length > maxNameLength) return `Names can be up to ${maxNameLength} letters long.`;
    const existing = state.players.find((player) => sameName(player.name, name));
    if (existing) return `${existing.name} is already a player. Tap their name above.`;
    if (!isAge(age)) return "Please choose which class you’re in.";

    const coins = state.players.length === 0 ? takeLegacyCoins() : 0;
    const player = { id: newPlayerId(), name, coins, age, settings: { language: state.language, tutorialSeen: false }, games: {} };
    setState((current) => ({ ...current, players: [...current.players, player], current: player.id }));
    return null;
  }

  function updatePlayer(id, change) {
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (player.id === id ? change(player) : player)),
    }));
  }
  const updateCurrent = (change) => {
    if (state.current) updatePlayer(state.current, change);
  };

  function setPlayerAge(id, age) {
    if (isAge(age)) updatePlayer(id, (player) => ({ ...player, age }));
  }

  // Remembers the game (and its topic, if it has one) the current player is playing, for the front
  // page's "Keep playing".
  function setLastPlayed(game, topic = null) {
    updateCurrent((player) => (player.lastPlayed?.game === game && player.lastPlayed?.topic === topic ? player : { ...player, lastPlayed: { game, topic } }));
  }

  // Remembers which word the current player is on in a topic (e.g. "cvc/middle-sound").
  function saveProgress(key, wordIndex) {
    if (isCount(wordIndex)) updateCurrent((player) => withTopicValue(player, "progress", key, wordIndex));
  }

  // Parent settings: turn any game on or off for one child. `byDefault` is whether the game is
  // on for their age anyway; a setting matching it is dropped, so age changes still apply.
  function setGameEnabled(id, gameId, enabled, byDefault) {
    updatePlayer(id, (player) => withGameSetting(player, gameId, "enabled", enabled === byDefault ? undefined : enabled));
  }

  // Parent settings: show the spelling guide (vowel and consonant teams) in one of a child's
  // Letter Jumble games.
  function setSpellingGuide(id, gameId, on) {
    updatePlayer(id, (player) => withGameSetting(player, gameId, "spellingGuide", on ? true : undefined));
  }

  // Parent settings: how many questions a round of one of a child's games deals.
  function setQuestionCount(id, gameId, count) {
    updatePlayer(id, (player) => withGameSetting(player, gameId, "questionCount", count === defaultQuestionCount ? undefined : count));
  }

  function selectPlayer(id) {
    setState((current) => ({ ...current, current: id }));
  }

  function logOut() {
    setState((current) => ({ ...current, current: null }));
  }

  // Gives the current player coins: one for a right answer, more for a bonus.
  function addCoin(amount = 1) {
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (player.id === current.current ? { ...player, coins: player.coins + amount } : player)),
    }));
  }

  // Saves the current player's best time for a timed topic ("<game>/<topic>").
  function saveRecord(key, time) {
    updateCurrent((player) => withTopicValue(player, "records", key, time));
  }

  // Saves the current player's score for finishing a topic ("<game>/<topic>"), if it's their best.
  function saveScore(key, correct, count) {
    updateCurrent((player) => {
      const best = topicValue(player, "scores", key);
      return best && best[0] >= correct ? player : withTopicValue(player, "scores", key, [correct, count]);
    });
  }

  // Takes coins from the current player. Returns false (and spends nothing) if they can't afford it.
  function spendCoins(amount) {
    if (!currentPlayer || currentPlayer.coins < amount) return false;
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (player.id === current.current ? { ...player, coins: player.coins - amount } : player)),
    }));
    return true;
  }

  // Remembers how a topic's words are dealt (a seed, e.g. 20 of the CVC words in a shuffled
  // order), or forgets them. A new hand starts a new score, so the topic's answers go too.
  function saveDeck(key, deck) {
    updateCurrent((player) => withTopicValue(withTopicValue(player, "decks", key, deck ?? undefined), "results", key, undefined));
  }

  // Records whether the current player got a question right (by its place in the dealt hand).
  // Only the first answer counts, so going back to a question can't change the score.
  function saveResult(key, index, correct) {
    if (!isCount(index)) return;
    updateCurrent((player) => {
      const answers = topicValue(player, "results", key) ?? [];
      if (typeof answers[index] === "boolean") return player;
      const next = Array.from({ length: Math.max(answers.length, index + 1) }, (_, at) => (at === index ? correct : answers[at] ?? null));
      return withTopicValue(player, "results", key, next);
    });
  }

  // Gives the current player a topic's badge (e.g. "letter-jumble/animals"), once.
  function awardBadge(key) {
    const [gameId, topicId] = splitKey(key);
    updateCurrent((player) => withListItem(player, gameId, "badges", topicId));
  }

  // Unlocks something for the current player for good: Tofu's house and the park ("tofu", "park",
  // in Mochi's game), or a Challenge level ("math-logic/k1-level-2@2026-11-01").
  function unlock(key) {
    const [gameId, item] = key.includes("/") ? splitKey(key) : ["dragon", key];
    updateCurrent((player) => withListItem(player, gameId, "unlocks", item));
  }

  // The site's settings: the current player's own, or (nobody playing) the browser's language.
  const site = {
    loaded,
    language: currentPlayer?.settings.language ?? state.language,
    tutorialSeen: Boolean(currentPlayer?.settings.tutorialSeen),
    howToSeen: currentPlayer ? Object.keys(currentPlayer.games).filter((gameId) => howToSeen(currentPlayer, gameId)) : [],
    setLanguage: (language) => setState((current) => ({
      ...current,
      language,
      players: current.players.map((player) => (player.id === current.current ? { ...player, settings: { ...player.settings, language } } : player)),
    })),
    markTutorialSeen: () => updateCurrent((player) => ({ ...player, settings: { ...player.settings, tutorialSeen: true } })),
    markHowToSeen: (gameId) => updateCurrent((player) => (howToSeen(player, gameId) ? player : withGame(player, gameId, (game) => ({ ...game, tutorial: { seen: true } })))),
  };

  return {
    loaded,
    site,
    unlock,
    awardBadge,
    saveResult,
    saveDeck,
    players: state.players,
    currentPlayer,
    createPlayer,
    setPlayerAge,
    selectPlayer,
    logOut,
    addCoin,
    saveRecord,
    saveScore,
    spendCoins,
    saveProgress,
    setLastPlayed,
    setGameEnabled,
    setSpellingGuide,
    setQuestionCount,
  };
}
