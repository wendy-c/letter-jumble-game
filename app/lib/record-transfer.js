// Moving a family's game records to another browser. Everything the app saves in this browser
// (the localStorage entries starting "letter-jumble:": every child with their coins, badges and
// progress, and the site's settings) becomes one code to copy; pasting that code in the other
// browser replaces what's saved there.
import { playersStorageKey, readPlayersText } from "./use-players";

const keyPrefix = "letter-jumble:";
// Codes start with this, so a mistyped or unrelated paste is easy to tell apart.
const codeStart = "RAINBOW1-";

// Text to base64 and back, keeping Chinese names and other non-English letters intact.
const toBase64 = (text) => window.btoa(unescape(encodeURIComponent(text)));
const fromBase64 = (code) => decodeURIComponent(escape(window.atob(code)));

// This browser's game records as one code.
export function makeTransferCode(storage = window.localStorage) {
  const data = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(keyPrefix)) data[key] = storage.getItem(key);
  }
  return codeStart + toBase64(JSON.stringify({ version: 1, data }));
}

// What a pasted code holds: { data, players } (the children it would load), or { error } —
// "empty" (nothing pasted), "invalid" (not a whole code) or "noPlayers" (a code with no children).
export function readTransferCode(pasted) {
  const code = (pasted ?? "").replace(/\s+/g, "");
  if (!code) return { error: "empty" };
  if (!code.startsWith(codeStart)) return { error: "invalid" };
  try {
    const { data } = JSON.parse(fromBase64(code.slice(codeStart.length)));
    const entries = Object.entries(data ?? {});
    if (entries.length === 0 || entries.some(([key, value]) => !key.startsWith(keyPrefix) || typeof value !== "string")) return { error: "invalid" };
    const { players } = readPlayersText(data[playersStorageKey]);
    if (players.length === 0) return { error: "noPlayers" };
    return { data, players };
  } catch {
    return { error: "invalid" };
  }
}

// Replaces this browser's game records with a code's `data` (from readTransferCode). The page
// should be reloaded straight after, so nothing still on screen saves the old records back.
export function loadTransferData(data, storage = window.localStorage) {
  const old = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(keyPrefix)) old.push(key);
  }
  old.forEach((key) => storage.removeItem(key));
  Object.entries(data).forEach(([key, value]) => storage.setItem(key, value));
}

// Opens the home page afresh, reading the newly loaded records.
export function reloadHome() {
  window.location.assign("/");
}
