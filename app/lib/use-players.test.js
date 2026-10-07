import { act, renderHook } from "@testing-library/react";
import { normalizeName, playersStorageKey, usePlayers } from "./use-players";

function stored() {
  return JSON.parse(window.localStorage.getItem(playersStorageKey));
}

function seed(state) {
  window.localStorage.setItem(playersStorageKey, JSON.stringify(state));
}

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe("normalizeName", () => {
  it("trims and collapses spaces", () => {
    expect(normalizeName("  Mia   Rose ")).toBe("Mia Rose");
  });
});

describe("usePlayers", () => {
  it("starts with no players and nobody playing", () => {
    const { result } = renderHook(() => usePlayers());
    expect(result.current.players).toEqual([]);
    expect(result.current.currentPlayer).toBeNull();
  });

  it("creates a player, selects them and saves them", () => {
    const { result } = renderHook(() => usePlayers());

    let problem;
    act(() => {
      problem = result.current.createPlayer("  Ada ");
    });

    expect(problem).toBeNull();
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 0 });
    expect(stored()).toEqual({ players: [{ name: "Ada", coins: 0 }], current: "Ada" });
  });

  it.each([
    ["", "Please type a name."],
    ["   ", "Please type a name."],
    ["A".repeat(21), "Names can be up to 20 letters long."],
  ])("rejects the name %p", (name, message) => {
    const { result } = renderHook(() => usePlayers());
    let problem;
    act(() => {
      problem = result.current.createPlayer(name);
    });
    expect(problem).toBe(message);
    expect(result.current.players).toEqual([]);
  });

  it("does not allow the same name twice, ignoring case", () => {
    seed({ players: [{ name: "Ada", coins: 2 }], current: null });
    const { result } = renderHook(() => usePlayers());

    let problem;
    act(() => {
      problem = result.current.createPlayer("ada");
    });

    expect(problem).toBe("Ada is already a player. Tap their name above.");
    expect(result.current.players).toHaveLength(1);
  });

  it("gives coins only to the player who is playing", () => {
    seed({ players: [{ name: "Ada", coins: 2 }, { name: "Elly", coins: 5 }], current: "Elly" });
    const { result } = renderHook(() => usePlayers());

    act(() => result.current.addCoin());
    act(() => result.current.selectPlayer("Ada"));
    act(() => result.current.addCoin());

    expect(stored().players).toEqual([{ name: "Ada", coins: 3 }, { name: "Elly", coins: 6 }]);
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 3 });
  });

  it("logs out but keeps the players and their coins", () => {
    seed({ players: [{ name: "Ada", coins: 4 }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());

    act(() => result.current.logOut());

    expect(result.current.currentPlayer).toBeNull();
    expect(stored()).toEqual({ players: [{ name: "Ada", coins: 4 }], current: null });
  });

  it("gives coins saved before players existed to the first player only", () => {
    window.localStorage.setItem("letter-jumble:rainbow-coins", "9");
    const { result } = renderHook(() => usePlayers());

    act(() => {
      result.current.createPlayer("Ada");
    });
    act(() => {
      result.current.createPlayer("Elly");
    });

    expect(stored().players).toEqual([{ name: "Ada", coins: 9 }, { name: "Elly", coins: 0 }]);
    expect(window.localStorage.getItem("letter-jumble:rainbow-coins")).toBeNull();
  });

  it("ignores broken saved data", () => {
    window.localStorage.setItem(playersStorageKey, "{not json");
    const { result } = renderHook(() => usePlayers());
    expect(result.current.players).toEqual([]);

    seed({ players: [{ name: "Ada", coins: -1 }, { name: "Elly", coins: 3 }, { coins: 2 }], current: "Nobody" });
    const { result: second } = renderHook(() => usePlayers());
    expect(second.current.players).toEqual([{ name: "Elly", coins: 3 }]);
    expect(second.current.currentPlayer).toBeNull();
  });

  it("still works when storage is blocked", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    const { result } = renderHook(() => usePlayers());
    act(() => {
      result.current.createPlayer("Ada");
    });
    act(() => result.current.addCoin());
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 1 });
  });
});
