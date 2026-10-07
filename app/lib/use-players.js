import { useEffect, useState } from "react";

export const playersStorageKey = "letter-jumble:players";
// Coins saved before players existed; they're given to the first player created.
const legacyCoinsStorageKey = "letter-jumble:rainbow-coins";
export const maxNameLength = 20;

const emptyState = { players: [], current: null };

function isValidPlayer(player) {
  return typeof player?.name === "string" && player.name.length > 0 &&
    Number.isInteger(player.coins) && player.coins >= 0;
}

function readStoredState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(playersStorageKey) ?? "null");
    const players = Array.isArray(stored?.players) ? stored.players.filter(isValidPlayer) : [];
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
  function createPlayer(rawName) {
    const name = normalizeName(rawName);
    if (!name) return "Please type a name.";
    if (name.length > maxNameLength) return `Names can be up to ${maxNameLength} letters long.`;
    const existing = state.players.find((player) => sameName(player.name, name));
    if (existing) return `${existing.name} is already a player. Tap their name above.`;

    const coins = state.players.length === 0 ? takeLegacyCoins() : 0;
    setState((current) => ({ players: [...current.players, { name, coins }], current: name }));
    return null;
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

  return { loaded, players: state.players, currentPlayer, createPlayer, selectPlayer, logOut, addCoin, spendCoins };
}
