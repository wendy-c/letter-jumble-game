import { useEffect, useState } from "react";

const rainbowCoinsStorageKey = "letter-jumble:rainbow-coins";

function readStoredRainbowCoins() {
  try {
    const stored = Number.parseInt(window.localStorage.getItem(rainbowCoinsStorageKey) ?? "", 10);
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function storeRainbowCoins(count) {
  try {
    window.localStorage.setItem(rainbowCoinsStorageKey, String(count));
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); coins still work for this visit.
  }
}

// Rainbow coins persist in localStorage. The saved count is read after the first render
// so the server-rendered page (always 0) matches, and nothing is saved until it has loaded.
export function useRainbowCoins() {
  const [rainbowCoins, setRainbowCoins] = useState(0);
  const [rainbowCoinsLoaded, setRainbowCoinsLoaded] = useState(false);

  useEffect(() => {
    setRainbowCoins(readStoredRainbowCoins());
    setRainbowCoinsLoaded(true);
  }, []);

  useEffect(() => {
    if (rainbowCoinsLoaded) storeRainbowCoins(rainbowCoins);
  }, [rainbowCoins, rainbowCoinsLoaded]);

  return [rainbowCoins, setRainbowCoins];
}
