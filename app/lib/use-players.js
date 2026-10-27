import { useEffect, useState } from "react";
import { ageGroups } from "../games-data";

export const playersStorageKey = "letter-jumble:players";
// Coins saved before players existed; they're given to the first player created.
const legacyCoinsStorageKey = "letter-jumble:rainbow-coins";
export const maxNameLength = 20;

const emptyState = { players: [], current: null };

const isCount = (value) => Number.isInteger(value) && value >= 0;
const isAge = (age) => ageGroups.some((group) => group.id === age);

function isValidPlayer(player) {
  return typeof player?.name === "string" && player.name.length > 0 && isCount(player.coins);
}

// Keeps only the fields we understand. Players saved before ages existed have no `age` yet.
function cleanPlayer(player) {
  const cleaned = { name: player.name, coins: player.coins };
  if (isAge(player.age)) cleaned.age = player.age;
  if (player.progress && typeof player.progress === "object") {
    const progress = Object.fromEntries(Object.entries(player.progress).filter(([, index]) => isCount(index)));
    if (Object.keys(progress).length > 0) cleaned.progress = progress;
  }
  if (player.spellingGuide === true) cleaned.spellingGuide = true;
  if (player.gameSettings && typeof player.gameSettings === "object") {
    const gameSettings = Object.fromEntries(Object.entries(player.gameSettings).filter(([, on]) => typeof on === "boolean"));
    if (Object.keys(gameSettings).length > 0) cleaned.gameSettings = gameSettings;
  }
  if (player.decks && typeof player.decks === "object") {
    const decks = Object.fromEntries(Object.entries(player.decks).filter(([, deck]) => Array.isArray(deck) && deck.length > 0 && deck.every(isCount)));
    if (Object.keys(decks).length > 0) cleaned.decks = decks;
  }
  if (player.results && typeof player.results === "object") {
    const isResult = (result) => result === true || result === false || result === null;
    const results = Object.fromEntries(Object.entries(player.results).filter(([, answers]) => Array.isArray(answers) && answers.every(isResult)));
    if (Object.keys(results).length > 0) cleaned.results = results;
  }
  if (Array.isArray(player.unlocks)) {
    const unlocks = [...new Set(player.unlocks.filter((unlock) => typeof unlock === "string" && unlock.length > 0))];
    if (unlocks.length > 0) cleaned.unlocks = unlocks;
  }
  if (Array.isArray(player.badges)) {
    const badges = [...new Set(player.badges.filter((badge) => typeof badge === "string" && badge.length > 0))];
    if (badges.length > 0) cleaned.badges = badges;
  }
  return cleaned;
}

function readStoredState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(playersStorageKey) ?? "null");
    const players = Array.isArray(stored?.players) ? stored.players.filter(isValidPlayer).map(cleanPlayer) : [];
    const current = players.some((player) => player.name === stored?.current) ? stored.current : null;
    return { players, current };
  } catch {
    return emptyState;
  }
}

function storeState(state) {
  try {
    window.localStorage.setItem(playersStorageKey, JSON.stringify(state));
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

  const currentPlayer = state.players.find((player) => player.name === state.current) ?? null;

  // Returns an error message for the form, or null once the player is created and selected.
  function createPlayer(rawName, age) {
    const name = normalizeName(rawName);
    if (!name) return "Please type a name.";
    if (name.length > maxNameLength) return `Names can be up to ${maxNameLength} letters long.`;
    const existing = state.players.find((player) => sameName(player.name, name));
    if (existing) return `${existing.name} is already a player. Tap their name above.`;
    if (!isAge(age)) return "Please choose how old you are.";

    const coins = state.players.length === 0 ? takeLegacyCoins() : 0;
    setState((current) => ({ players: [...current.players, { name, coins, age }], current: name }));
    return null;
  }

  function updatePlayer(name, change) {
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (player.name === name ? change(player) : player)),
    }));
  }

  function setPlayerAge(name, age) {
    if (isAge(age)) updatePlayer(name, (player) => ({ ...player, age }));
  }

  // Remembers which word the current player is on in a topic (e.g. "cvc/middle-sound").
  function saveProgress(key, wordIndex) {
    if (!state.current || !isCount(wordIndex)) return;
    updatePlayer(state.current, (player) => ({ ...player, progress: { ...player.progress, [key]: wordIndex } }));
  }

  // Parent settings: turn any game on or off for one child. `byDefault` is whether the game is
  // on for their age anyway; a setting matching it is dropped, so age changes still apply.
  function setGameEnabled(name, gameId, enabled, byDefault) {
    updatePlayer(name, (player) => {
      const { gameSettings: old = {}, ...rest } = player;
      const gameSettings = { ...old };
      if (enabled === byDefault) delete gameSettings[gameId];
      else gameSettings[gameId] = enabled;
      return Object.keys(gameSettings).length > 0 ? { ...rest, gameSettings } : rest;
    });
  }

  // Parent settings: show the spelling guide (vowel and consonant teams) in a child's spelling games.
  function setSpellingGuide(name, on) {
    updatePlayer(name, (player) => {
      const { spellingGuide, ...rest } = player;
      return on ? { ...rest, spellingGuide: true } : rest;
    });
  }

  function selectPlayer(name) {
    setState((current) => ({ ...current, current: name }));
  }

  function logOut() {
    setState((current) => ({ ...current, current: null }));
  }

  function addCoin() {
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (
        player.name === current.current ? { ...player, coins: player.coins + 1 } : player
      )),
    }));
  }

  // Takes coins from the current player. Returns false (and spends nothing) if they can't afford it.
  function spendCoins(amount) {
    const player = state.players.find((candidate) => candidate.name === state.current);
    if (!player || player.coins < amount) return false;

    setState((current) => ({
      ...current,
      players: current.players.map((candidate) => (
        candidate.name === current.current ? { ...candidate, coins: candidate.coins - amount } : candidate
      )),
    }));
    return true;
  }

  // Remembers the shuffled words dealt for a topic (e.g. 20 of the CVC words), or forgets them.
  // A new hand starts a new score, so the topic's answers are forgotten too.
  function saveDeck(key, deck) {
    if (!state.current) return;
    updatePlayer(state.current, (player) => {
      const decks = { ...player.decks };
      if (deck) decks[key] = deck;
      else delete decks[key];
      const results = { ...player.results };
      delete results[key];
      const { decks: _oldDecks, results: _oldResults, ...rest } = player;
      return {
        ...rest,
        ...(Object.keys(decks).length > 0 && { decks }),
        ...(Object.keys(results).length > 0 && { results }),
      };
    });
  }

  // Records whether the current player got a question right (by its place in the dealt hand).
  // Only the first answer counts, so going back to a question can't change the score.
  function saveResult(key, index, correct) {
    if (!state.current || !isCount(index)) return;
    updatePlayer(state.current, (player) => {
      const answers = player.results?.[key] ?? [];
      if (typeof answers[index] === "boolean") return player;
      const next = Array.from({ length: Math.max(answers.length, index + 1) }, (_, at) => (at === index ? correct : answers[at] ?? null));
      return { ...player, results: { ...player.results, [key]: next } };
    });
  }

  // Gives the current player a topic's badge (e.g. "letter-jumble/animals"), once.
  function awardBadge(key) {
    if (!state.current) return;
    updatePlayer(state.current, (player) => (
      player.badges?.includes(key) ? player : { ...player, badges: [...(player.badges ?? []), key] }
    ));
  }

  // Unlocks something for the current player for good (e.g. "tofu", once her house is bought).
  function unlock(key) {
    if (!state.current) return;
    updatePlayer(state.current, (player) => (
      player.unlocks?.includes(key) ? player : { ...player, unlocks: [...(player.unlocks ?? []), key] }
    ));
  }

  return {
    loaded,
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
    spendCoins,
    saveProgress,
    setGameEnabled,
    setSpellingGuide,
  };
}
