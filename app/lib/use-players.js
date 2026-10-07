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

  return {
    loaded,
    players: state.players,
    currentPlayer,
    createPlayer,
    setPlayerAge,
    selectPlayer,
    logOut,
    addCoin,
    spendCoins,
    saveProgress,
  };
}
