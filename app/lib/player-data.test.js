import { deckOrder, gameSetting, hasBadge, howToSeen, kindFirst, migrateSaved, migrations, moduleFirst, newDeckSeed, newPlayerId, savedVersion, topicValue, unlocksOf, withBadge, withTopicValue } from "./player-data";

// A version 1 save: everything at the top of the player, keyed "<game>/<topic>".
const oldAda = {
  name: "Ada", coins: 37, age: "k1",
  progress: { "letter-jumble/animals": 3, "cvc/middle-sound": 0 },
  decks: { "letter-jumble/animals": [2, 0, 1], "cvc/middle-sound": [4, 3, 2, 1, 0] },
  results: { "letter-jumble/animals": [true, false, null] },
  badges: ["cvc/beginning-sound", "math-logic/k1-level-1"],
  unlocks: ["tofu", "park", "math-logic/k1-level-2@2026-11-01"],
  records: { "speed-quest/within-10": 41250 },
  scores: { "math-logic/k1-level-1": [8, 10] },
  spellingGuide: ["starters"],
  questionCounts: { cvc: 15 },
  gameSettings: { idioms: true, dragon: false },
};
const oldSite = { language: "zh", howToSeen: ["cvc", "dragon"], tutorialSeen: true };

describe("player ids", () => {
  it("makes a different GUID for every new player", () => {
    const ids = Array.from({ length: 50 }, newPlayerId);
    expect(new Set(ids).size).toBe(50);
    ids.forEach((id) => expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  });

  it("gives players saved before ids one, and keeps an id once it's saved", () => {
    const first = migrateSaved({ players: [oldAda], current: "Ada" });
    const { id } = first.players[0];
    expect(id).toEqual(expect.any(String));
    expect(first.current).toBe(id);
    const again = migrateSaved(JSON.parse(JSON.stringify(first)));
    expect(again.players[0].id).toBe(id);
    expect(again.current).toBe(id);
  });
});

describe("seeded decks", () => {
  it("deals the same order every time for the same seed, and a different one for another seed", () => {
    const seed = 123456;
    const orders = Array.from({ length: 5 }, () => deckOrder(seed, 13, 13));
    orders.forEach((order) => expect(order).toEqual(orders[0]));
    expect([...orders[0]].sort((a, b) => a - b)).toEqual(Array.from({ length: 13 }, (_, index) => index));
    expect(deckOrder(seed + 1, 13, 13)).not.toEqual(orders[0]);
    // A shorter hand: still the same each time, all different words from the topic.
    const hand = deckOrder(seed, 30, 10);
    expect(deckOrder(seed, 30, 10)).toEqual(hand);
    expect(new Set(hand).size).toBe(10);
    hand.forEach((index) => expect(index).toBeLessThan(30));
  });

  it("still deals an order saved before seeds, as it was", () => {
    expect(deckOrder([2, 0, 1], 3, 3)).toEqual([2, 0, 1]);
    expect(deckOrder(undefined, 3, 3)).toBeNull();
    expect(Number.isInteger(newDeckSeed())).toBe(true);
  });
});

describe("moving version 1 saves up to date", () => {
  const saved = migrateSaved({ players: [oldAda], current: "Ada" }, oldSite);
  const [ada] = saved.players;

  it("puts each module's data under its game and module, nothing lost", () => {
    expect(saved.version).toBe(3);
    expect(ada.games["letter-jumble"]).toEqual({ animals: { progress: 3, decks: [2, 0, 1], results: [true, false, null] } });
    expect(topicValue(ada, "progress", "cvc/middle-sound")).toBe(0);
    expect(hasBadge(ada, "cvc/beginning-sound")).toBe(true);
    expect(ada.games["math-logic"]).toEqual({ unlocks: ["k1-level-2@2026-11-01"], "k1-level-1": { badge: true, scores: [8, 10] } });
    expect(unlocksOf(ada, "dragon")).toEqual(["tofu", "park"]);
    expect(topicValue(ada, "records", "speed-quest/within-10")).toBe(41250);
    expect(gameSetting(ada, "starters", "spellingGuide")).toBe(true);
    expect(gameSetting(ada, "cvc", "questionCount")).toBe(15);
    expect(gameSetting(ada, "idioms", "enabled")).toBe(true);
    expect(gameSetting(ada, "dragon", "enabled")).toBe(false);
    expect({ name: ada.name, coins: ada.coins, age: ada.age }).toEqual({ name: "Ada", coins: 37, age: "k1" });
  });

  it("moves the browser's site settings into the player's own", () => {
    expect(ada.settings).toEqual({ language: "zh", tutorialSeen: true });
    expect(howToSeen(ada, "cvc")).toBe(true);
    expect(howToSeen(ada, "dragon")).toBe(true);
    expect(howToSeen(ada, "starters")).toBe(false);
    // And the language for when nobody's playing.
    expect(saved.language).toBe("zh");
  });

  it("turns a deck whose round hasn't started into a seed, and keeps one in progress as it is", () => {
    // Animals is on word 3: its order stays until that round is done.
    expect(topicValue(ada, "decks", "letter-jumble/animals")).toEqual([2, 0, 1]);
    // Middle sound hasn't started: now a seed.
    expect(Number.isInteger(topicValue(ada, "decks", "cvc/middle-sound"))).toBe(true);
  });

  it("comes out the same when read again", () => {
    const again = migrateSaved(JSON.parse(JSON.stringify(saved)));
    expect(again).toEqual(saved);
  });

  it("drops what it doesn't understand, as before", () => {
    const messy = migrateSaved({
      players: [{ name: "Elly", coins: 3, age: "5-6", progress: { "cvc/middle-sound": -1, "math-logic/5-6-level-2": 4 }, badges: [1, ""], records: { x: 5 } }, { name: "", coins: 1 }],
      current: "Nobody",
    });
    expect(messy.players).toHaveLength(1);
    const [elly] = messy.players;
    // An old 5-6 child is K3 now, with their old level renamed.
    expect(elly.age).toBe("k3");
    expect(elly.games).toEqual({ "math-logic": { "k2-level-2": { progress: 4 } } });
    expect(messy.current).toBeNull();
    expect(elly.settings).toEqual({ language: "en", tutorialSeen: false });
  });
});

describe("moving version 2 saves to version 3", () => {
  const version2 = {
    version: 2,
    players: [{
      id: "ada-id", name: "Ada", coins: 12, age: "k2", settings: { language: "en", tutorialSeen: true },
      games: {
        blends: {
          settings: { questionCount: 15 }, tutorial: { seen: true },
          progress: { "r-blends": 2 }, decks: { "r-blends": 1234, "l-blends": 99 }, results: { "r-blends": [true, false] }, badges: ["l-blends"],
        },
        "math-logic": { unlocks: ["k1-level-2@2026-11-01"], scores: { "k1-level-1": [8, 10] }, progress: { "k1-level-1": 10 } },
        "speed-quest": { records: { "within-10": 41250 } },
        dragon: { unlocks: ["tofu"] },
      },
    }],
    current: "ada-id",
    language: "en",
  };
  const saved = migrateSaved(version2);
  const [ada] = saved.players;

  it("puts each module first: games.blends[\"r-blends\"].decks", () => {
    expect(saved.version).toBe(3);
    expect(ada.games.blends).toEqual({
      settings: { questionCount: 15 }, tutorial: { seen: true },
      "r-blends": { progress: 2, decks: 1234, results: [true, false] },
      "l-blends": { decks: 99, badge: true },
    });
    expect(ada.games.blends["r-blends"].decks).toBe(1234);
    expect(ada.games["math-logic"]).toEqual({ unlocks: ["k1-level-2@2026-11-01"], "k1-level-1": { scores: [8, 10], progress: 10 } });
    expect(ada.games["speed-quest"]).toEqual({ "within-10": { records: 41250 } });
    expect(ada.games.dragon).toEqual({ unlocks: ["tofu"] });
  });

  it("keeps the player and who's playing as they were", () => {
    expect({ id: ada.id, name: ada.name, coins: ada.coins, age: ada.age, settings: ada.settings }).toEqual({ id: "ada-id", name: "Ada", coins: 12, age: "k2", settings: { language: "en", tutorialSeen: true } });
    expect(saved.current).toBe("ada-id");
    expect(hasBadge(ada, "blends/l-blends")).toBe(true);
    expect(topicValue(ada, "results", "blends/r-blends")).toEqual([true, false]);
    expect(unlocksOf(ada, "dragon")).toEqual(["tofu"]);
  });

  it("can be turned back into version 2's layout, unchanged", () => {
    Object.values(version2.players[0].games).forEach((game) => expect(kindFirst(moduleFirst(game))).toEqual(game));
  });
});

describe("version numbers", () => {
  it("has a step up from every older version, each raising the version by one", () => {
    for (let version = 1; version < savedVersion; version += 1) {
      expect(migrations[version]).toEqual(expect.any(Function));
      expect(migrations[version]({ players: [oldAda], current: "Ada" }, oldSite).version).toBe(version + 1);
    }
  });

  it("reads a save with no version number as version 1", () => {
    const saved = migrateSaved({ players: [oldAda], current: "Ada" });
    expect(saved.version).toBe(savedVersion);
    expect(saved.players[0].games["letter-jumble"].animals.progress).toBe(3);
    expect(saved.current).toBe(saved.players[0].id);
  });

  it("doesn't move a current save again: version 1's site settings no longer apply to it", () => {
    const saved = migrateSaved({ players: [oldAda], current: "Ada" });
    const again = migrateSaved(saved, oldSite);
    expect(again).toEqual(saved);
    expect(again.players[0].settings).toEqual({ language: "en", tutorialSeen: false });
  });

  it("reads what it understands of a save from a newer version", () => {
    const saved = migrateSaved({ players: [oldAda], current: "Ada" });
    const newer = { ...saved, version: savedVersion + 1, players: [{ ...saved.players[0], pets: ["owl"] }] };
    expect(migrateSaved(newer)).toEqual(saved);
  });
});

describe("the game played last", () => {
  it("keeps the game and topic played last, and drops one it doesn't know", () => {
    const saved = migrateSaved({ players: [{ ...oldAda, lastPlayed: { game: "letter-jumble", topic: "animals" } }, { name: "Elly", coins: 0, lastPlayed: { game: "tetris", topic: "x" } }], current: "Ada" });
    expect(saved.players[0].lastPlayed).toEqual({ game: "letter-jumble", topic: "animals" });
    expect(saved.players[1].lastPlayed).toBeUndefined();
    expect(migrateSaved(JSON.parse(JSON.stringify(saved))).players[0].lastPlayed).toEqual({ game: "letter-jumble", topic: "animals" });
    expect(migrateSaved({ players: [{ name: "Mia", coins: 0, lastPlayed: { game: "dragon" } }] }).players[0].lastPlayed).toEqual({ game: "dragon", topic: null });
  });
});

describe("changing a player's data", () => {
  it("drops kinds and games that end up empty", () => {
    const ada = { id: "a", name: "Ada", coins: 0, settings: { language: "en", tutorialSeen: false }, games: {} };
    const playing = withTopicValue(ada, "progress", "cvc/middle-sound", 2);
    expect(playing.games).toEqual({ cvc: { "middle-sound": { progress: 2 } } });
    expect(withTopicValue(playing, "progress", "cvc/middle-sound", undefined).games).toEqual({});
  });

  it("keeps a module's badge with the rest of its data", () => {
    const ada = { id: "a", name: "Ada", coins: 0, settings: { language: "en", tutorialSeen: false }, games: {} };
    const done = withBadge(withTopicValue(ada, "decks", "blends/r-blends", 1234), "blends/r-blends");
    expect(done.games).toEqual({ blends: { "r-blends": { decks: 1234, badge: true } } });
    expect(hasBadge(done, "blends/r-blends")).toBe(true);
    expect(hasBadge(done, "blends/l-blends")).toBe(false);
  });

  it("never treats a game's own settings, tutorial or unlocks as a module", () => {
    const ada = { id: "a", name: "Ada", coins: 0, settings: { language: "en", tutorialSeen: false }, games: { cvc: { settings: { enabled: false } } } };
    expect(topicValue(ada, "decks", "cvc/settings")).toBeUndefined();
    expect(withTopicValue(ada, "decks", "cvc/settings", 5)).toBe(ada);
  });
});
