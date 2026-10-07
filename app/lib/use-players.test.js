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
      problem = result.current.createPlayer("  Ada ", "5-6");
    });

    expect(problem).toBeNull();
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 0, age: "5-6" });
    expect(stored()).toEqual({ players: [{ name: "Ada", coins: 0, age: "5-6" }], current: "Ada" });
  });

  it.each([
    ["", "Please type a name."],
    ["   ", "Please type a name."],
    ["A".repeat(21), "Names can be up to 20 letters long."],
  ])("rejects the name %p", (name, message) => {
    const { result } = renderHook(() => usePlayers());
    let problem;
    act(() => {
      problem = result.current.createPlayer(name, "3-4");
    });
    expect(problem).toBe(message);
    expect(result.current.players).toEqual([]);
  });

  it("needs an age group for a new player", () => {
    const { result } = renderHook(() => usePlayers());
    let problem;
    act(() => {
      problem = result.current.createPlayer("Ada");
    });
    expect(problem).toBe("Please choose how old you are.");
    act(() => {
      problem = result.current.createPlayer("Ada", "7-8");
    });
    expect(problem).toBe("Please choose how old you are.");
    expect(result.current.players).toEqual([]);
  });

  it("sets the age of a player saved before ages existed", () => {
    seed({ players: [{ name: "Ada", coins: 2 }], current: null });
    const { result } = renderHook(() => usePlayers());
    act(() => result.current.setPlayerAge("Ada", "3-4"));
    act(() => result.current.setPlayerAge("Ada", "teen"));
    expect(stored().players).toEqual([{ name: "Ada", coins: 2, age: "3-4" }]);
  });

  it("saves where the current player is up to in each topic", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "5-6" }, { name: "Elly", coins: 0, age: "3-4" }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());

    act(() => result.current.saveProgress("letter-jumble/animals", 4));
    act(() => result.current.saveProgress("letter-jumble/food-and-drink", 2));
    act(() => result.current.saveProgress("letter-jumble/animals", 5));
    act(() => result.current.saveProgress("letter-jumble/animals", -1));

    expect(result.current.currentPlayer.progress).toEqual({ "letter-jumble/animals": 5, "letter-jumble/food-and-drink": 2 });
    expect(stored().players[1]).toEqual({ name: "Elly", coins: 0, age: "3-4" });
  });

  it("keeps valid ages and progress from storage and drops anything else", () => {
    seed({
      players: [{ name: "Ada", coins: 1, age: "99", progress: { "cvc/beginning-sound": 3, broken: "x", negative: -2 }, extra: true }],
      current: "Ada",
    });
    const { result } = renderHook(() => usePlayers());
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 1, progress: { "cvc/beginning-sound": 3 } });
  });

  it("does not allow the same name twice, ignoring case", () => {
    seed({ players: [{ name: "Ada", coins: 2 }], current: null });
    const { result } = renderHook(() => usePlayers());

    let problem;
    act(() => {
      problem = result.current.createPlayer("ada", "3-4");
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

  it("spends coins from the current player only when they can afford it", () => {
    seed({ players: [{ name: "Ada", coins: 3 }, { name: "Elly", coins: 9 }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());

    let spent;
    act(() => {
      spent = result.current.spendCoins(2);
    });
    expect(spent).toBe(true);
    expect(result.current.currentPlayer.coins).toBe(1);

    act(() => {
      spent = result.current.spendCoins(2);
    });
    expect(spent).toBe(false);
    expect(stored().players).toEqual([{ name: "Ada", coins: 1 }, { name: "Elly", coins: 9 }]);
  });

  it("can't spend coins when nobody is playing", () => {
    seed({ players: [{ name: "Ada", coins: 3 }], current: null });
    const { result } = renderHook(() => usePlayers());
    let spent;
    act(() => {
      spent = result.current.spendCoins(1);
    });
    expect(spent).toBe(false);
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
      result.current.createPlayer("Ada", "3-4");
    });
    act(() => {
      result.current.createPlayer("Elly", "5-6");
    });

    expect(stored().players).toEqual([{ name: "Ada", coins: 9, age: "3-4" }, { name: "Elly", coins: 0, age: "5-6" }]);
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
      result.current.createPlayer("Ada", "3-4");
    });
    act(() => result.current.addCoin());
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 1, age: "3-4" });
  });
});
