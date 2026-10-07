import { act, renderHook } from "@testing-library/react";
import { useRainbowCoins } from "./use-rainbow-coins";

const storageKey = "letter-jumble:rainbow-coins";

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe("useRainbowCoins", () => {
  it("starts at 0 when nothing is saved", () => {
    const { result } = renderHook(() => useRainbowCoins());
    expect(result.current[0]).toBe(0);
  });

  it("loads the saved count", () => {
    window.localStorage.setItem(storageKey, "7");
    const { result } = renderHook(() => useRainbowCoins());
    expect(result.current[0]).toBe(7);
  });

  it("saves new coins and keeps the saved count on startup", () => {
    window.localStorage.setItem(storageKey, "3");
    const { result } = renderHook(() => useRainbowCoins());
    expect(window.localStorage.getItem(storageKey)).toBe("3");

    act(() => result.current[1]((current) => current + 1));
    expect(result.current[0]).toBe(4);
    expect(window.localStorage.getItem(storageKey)).toBe("4");
  });

  it.each(["", "abc", "-5", "0"])("ignores a saved value of %p", (stored) => {
    window.localStorage.setItem(storageKey, stored);
    const { result } = renderHook(() => useRainbowCoins());
    expect(result.current[0]).toBe(0);
  });

  it("still counts coins when storage is blocked", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    const { result } = renderHook(() => useRainbowCoins());
    expect(result.current[0]).toBe(0);
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
  });
});
