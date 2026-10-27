// Shared bits for stories: sample players and a way to set the browser storage a page reads.
import { playersStorageKey } from "../app/lib/use-players";
import { siteStorageKey } from "../app/lib/use-site-settings";

export const ada = { name: "Ada", coins: 37, age: "3-4" };
export const elly = { name: "Elly", coins: 120, age: "5-6" };

const allGames = ["cvc", "digraphs", "starters", "letter-jumble", "chinese", "chinese-advanced", "measure-words", "idioms", "dragon"];

// Sets the players, the site's settings and whether the welcome card was closed, as a story's
// `beforeEach`; everything is put back afterwards. `howToSeen: true` skips every how-to card.
export function withStorage({ players = [ada, elly], current = players[0]?.name ?? null, language = "en", howToSeen = true, welcomeClosed = true } = {}) {
  return () => {
    const saved = { local: { ...window.localStorage }, session: { ...window.sessionStorage } };
    window.localStorage.clear();
    window.sessionStorage.clear();
    if (players.length) window.localStorage.setItem(playersStorageKey, JSON.stringify({ players, current }));
    window.localStorage.setItem(siteStorageKey, JSON.stringify({ language, howToSeen: howToSeen === true ? allGames : howToSeen || [] }));
    if (welcomeClosed) window.sessionStorage.setItem("letter-jumble:welcome-closed", "true");
    return () => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      Object.entries(saved.local).forEach(([key, value]) => window.localStorage.setItem(key, value));
      Object.entries(saved.session).forEach(([key, value]) => window.sessionStorage.setItem(key, value));
    };
  };
}
