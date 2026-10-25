import { useEffect, useState } from "react";

// Settings for this browser (not per player): the site's language, and which games' how-to-play
// cards have been seen.
export const siteStorageKey = "letter-jumble:site";
export const languages = ["en", "zh"];

const defaults = { language: "en", howToSeen: [] };

function readSettings() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(siteStorageKey) ?? "null");
    return {
      language: languages.includes(stored?.language) ? stored.language : defaults.language,
      howToSeen: Array.isArray(stored?.howToSeen) ? stored.howToSeen.filter((id) => typeof id === "string") : [],
    };
  } catch {
    return defaults;
  }
}

function storeSettings(settings) {
  try {
    window.localStorage.setItem(siteStorageKey, JSON.stringify(settings));
  } catch {
    // Storage can be blocked; the settings still work for this visit.
  }
}

// Read after the first render (so the server-rendered page matches), and saved on every change.
export function useSiteSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(readSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) storeSettings(settings);
  }, [settings, loaded]);

  return {
    loaded,
    ...settings,
    setLanguage: (language) => setSettings((current) => ({ ...current, language })),
    markHowToSeen: (gameId) => setSettings((current) => (
      current.howToSeen.includes(gameId) ? current : { ...current, howToSeen: [...current.howToSeen, gameId] }
    )),
  };
}
