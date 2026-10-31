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
      problem = result.current.createPlayer("  Ada ", "k3");
    });

    expect(problem).toBeNull();
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 0, age: "k3" });
    expect(stored()).toEqual({ players: [{ name: "Ada", coins: 0, age: "k3" }], current: "Ada" });
  });

  it.each([
    ["", "Please type a name."],
    ["   ", "Please type a name."],
    ["A".repeat(21), "Names can be up to 20 letters long."],
  ])("rejects the name %p", (name, message) => {
    const { result } = renderHook(() => usePlayers());
    let problem;
    act(() => {
      problem = result.current.createPlayer(name, "k1");
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
    expect(problem).toBe("Please choose which class you’re in.");
    act(() => {
      problem = result.current.createPlayer("Ada", "7-8");
    });
    expect(problem).toBe("Please choose which class you’re in.");
    expect(result.current.players).toEqual([]);
  });

  it("sets the age of a player saved before ages existed", () => {
    seed({ players: [{ name: "Ada", coins: 2 }], current: null });
    const { result } = renderHook(() => usePlayers());
    act(() => result.current.setPlayerAge("Ada", "k1"));
    act(() => result.current.setPlayerAge("Ada", "teen"));
    expect(stored().players).toEqual([{ name: "Ada", coins: 2, age: "k1" }]);
  });

  it("makes players saved as 3-4 year olds K1 and 5-6 year olds K3, keeping their Daily Challenge levels", () => {
    seed({
      players: [
        { name: "Ada", coins: 1, age: "3-4", progress: { "math-logic/3-4-level-2": 4 }, badges: ["math-logic/3-4-level-1"], unlocks: ["math-logic/3-4-level-2@2026-10-30"] },
        { name: "Elly", coins: 2, age: "5-6", decks: { "math-logic/5-6-level-1": [0, 1] }, results: { "math-logic/5-6-level-1": [true] } },
      ],
      current: "Ada",
    });
    renderHook(() => usePlayers());
    expect(stored().players).toEqual([
      { name: "Ada", coins: 1, age: "k1", progress: { "math-logic/k1-level-2": 4 }, badges: ["math-logic/k1-level-1"], unlocks: ["math-logic/k1-level-2@2026-10-30"] },
      { name: "Elly", coins: 2, age: "k3", decks: { "math-logic/k2-level-1": [0, 1] }, results: { "math-logic/k2-level-1": [true] } },
    ]);
  });

  it("saves where the current player is up to in each topic", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k3" }, { name: "Elly", coins: 0, age: "k1" }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());

    act(() => result.current.saveProgress("letter-jumble/animals", 4));
    act(() => result.current.saveProgress("letter-jumble/food-and-drink", 2));
    act(() => result.current.saveProgress("letter-jumble/animals", 5));
    act(() => result.current.saveProgress("letter-jumble/animals", -1));

    expect(result.current.currentPlayer.progress).toEqual({ "letter-jumble/animals": 5, "letter-jumble/food-and-drink": 2 });
    expect(stored().players[1]).toEqual({ name: "Elly", coins: 0, age: "k1" });
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
      problem = result.current.createPlayer("ada", "k1");
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
      result.current.createPlayer("Ada", "k1");
    });
    act(() => {
      result.current.createPlayer("Elly", "k3");
    });

    expect(stored().players).toEqual([{ name: "Ada", coins: 9, age: "k1" }, { name: "Elly", coins: 0, age: "k3" }]);
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
      result.current.createPlayer("Ada", "k1");
    });
    act(() => result.current.addCoin());
    expect(result.current.currentPlayer).toEqual({ name: "Ada", coins: 1, age: "k1" });
  });

  it("turns games on and off for one child, keeping only changes from the age default", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k1" }, { name: "Elly", coins: 0, age: "k1" }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());

    // cvc is on for 3-4 by default; letter-jumble is off by default.
    act(() => result.current.setGameEnabled("Ada", "cvc", false, true));
    act(() => result.current.setGameEnabled("Ada", "letter-jumble", true, false));
    expect(stored().players[0].gameSettings).toEqual({ cvc: false, "letter-jumble": true });
    expect(stored().players[1].gameSettings).toBeUndefined();

    act(() => result.current.setGameEnabled("Ada", "cvc", true, true));
    act(() => result.current.setGameEnabled("Ada", "letter-jumble", false, false));
    expect(stored().players[0].gameSettings).toBeUndefined();
  });

  it("awards each badge to the current player once", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k3" }, { name: "Elly", coins: 0, age: "k3" }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    act(() => result.current.awardBadge("letter-jumble/animals"));
    act(() => result.current.awardBadge("letter-jumble/animals"));
    act(() => result.current.awardBadge("idioms/idioms"));
    expect(stored().players[0].badges).toEqual(["letter-jumble/animals", "idioms/idioms"]);
    expect(stored().players[1].badges).toBeUndefined();
  });

  it("keeps saved badges and drops anything that isn't one", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k3", badges: ["cvc/middle-sound", 3, "", "cvc/middle-sound"] }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    expect(result.current.currentPlayer.badges).toEqual(["cvc/middle-sound"]);
  });

  it("keeps only the first answer to each question, and forgets a topic's answers with its hand", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k3", decks: { "idioms/idioms": [0, 1, 2] } }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    act(() => result.current.saveResult("idioms/idioms", 2, true));
    act(() => result.current.saveResult("idioms/idioms", 0, false));
    act(() => result.current.saveResult("idioms/idioms", 0, true));
    expect(stored().players[0].results).toEqual({ "idioms/idioms": [false, null, true] });

    act(() => result.current.saveDeck("idioms/idioms", null));
    expect(stored().players[0].results).toBeUndefined();
    expect(stored().players[0].decks).toBeUndefined();
  });

  it("drops saved answers that aren't right/wrong", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k3", results: { "cvc/middle-sound": [true, null, false], bad: [1], worse: "yes" } }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    expect(result.current.currentPlayer.results).toEqual({ "cvc/middle-sound": [true, null, false] });
  });

  it("unlocks things for the current player for good, once", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k1" }, { name: "Elly", coins: 0, age: "k3" }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    act(() => result.current.unlock("tofu"));
    act(() => result.current.unlock("tofu"));
    expect(stored().players[0].unlocks).toEqual(["tofu"]);
    expect(stored().players[1].unlocks).toBeUndefined();
  });

  it("drops game settings that aren't on/off", () => {
    seed({ players: [{ name: "Ada", coins: 0, age: "k1", gameSettings: { cvc: false, dragon: "yes" } }], current: "Ada" });
    const { result } = renderHook(() => usePlayers());
    expect(result.current.currentPlayer.gameSettings).toEqual({ cvc: false });
  });
});

