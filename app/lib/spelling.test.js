import { getSpellingGuides, scramble, seededRandom, shuffled, shuffledDeck, slotCount } from "./spelling";

describe("getSpellingGuides", () => {
  it("marks consonant teams, vowel teams and single sounds across words", () => {
    expect(getSpellingGuides("swimming pool")).toEqual([
      "consonant", "consonant", "other", "other", "other", "other", "other", "other",
      "other", "vowel", "vowel", "other",
    ]);
  });

  it("treats ph, sh and th as consonant teams", () => {
    expect(getSpellingGuides("dolphin")).toEqual(["other", "other", "other", "consonant", "consonant", "other", "other"]);
    expect(getSpellingGuides("shark").slice(0, 2)).toEqual(["consonant", "consonant"]);
    expect(getSpellingGuides("tooth").slice(3)).toEqual(["consonant", "consonant"]);
  });

  it("prefers the longest team and ignores letter case", () => {
    expect(getSpellingGuides("Night")).toEqual(["other", "vowel", "vowel", "vowel", "other"]);
  });
});

describe("scramble", () => {
  it("returns the same letters in a different order", () => {
    ["bat", "dolphin", "kangaroo", "shoppingcenter"].forEach((word) => {
      for (let round = 0; round < 6; round += 1) {
        const mixed = scramble(word, round);
        expect([...mixed].sort()).toEqual(word.split("").sort());
        expect(mixed.join("")).not.toBe(word);
      }
    });
  });

  it("is the same for the same word and round", () => {
    expect(scramble("penguin", 3)).toEqual(scramble("penguin", 3));
  });

  it("leaves a single letter alone", () => {
    expect(scramble("a", 0)).toEqual(["a"]);
  });
});

describe("slotCount", () => {
  it("counts every letter, ignoring spaces, in Letter Jumble", () => {
    expect(slotCount({ answers: ["swimming pool"] }, 0)).toBe(12);
  });

  it("uses the answer for the word's position when there are alternatives", () => {
    expect(slotCount({ answers: ["lift", "elevator"] }, 1)).toBe(8);
  });

  it("has a single slot when one letter is missing", () => {
    expect(slotCount({ answers: ["cat"], missing: 0 }, 0)).toBe(1);
  });
});

describe("shuffledDeck", () => {
  it("picks the requested number of different positions", () => {
    const deck = shuffledDeck(46, 20);
    expect(deck).toHaveLength(20);
    expect(new Set(deck).size).toBe(20);
    deck.forEach((index) => expect(index).toBeGreaterThanOrEqual(0));
    deck.forEach((index) => expect(index).toBeLessThan(46));
  });

  it("never asks for more than there are", () => {
    expect(shuffledDeck(5, 20)).toHaveLength(5);
  });

  it("keeps the original order when random() is just below 1", () => {
    expect(shuffledDeck(6, 4, () => 0.9999)).toEqual([0, 1, 2, 3]);
  });
});


describe("shuffled and seededRandom", () => {
  it("shuffles a copy, keeping every item", () => {
    const items = ["a", "b", "c", "d"];
    const mixed = shuffled(items, seededRandom("deal"));
    expect(items).toEqual(["a", "b", "c", "d"]);
    expect([...mixed].sort()).toEqual(items);
  });

  it("gives the same numbers for the same seed, and different ones for another", () => {
    const first = seededRandom("cvc/middle-sound:3,1,2");
    const again = seededRandom("cvc/middle-sound:3,1,2");
    const other = seededRandom("cvc/middle-sound:2,1,3");
    const draws = (random) => Array.from({ length: 5 }, () => random());
    const firstDraws = draws(first);
    expect(firstDraws).toEqual(draws(again));
    expect(firstDraws).not.toEqual(draws(other));
    firstDraws.forEach((value) => expect(value >= 0 && value < 1).toBe(true));
  });

  it("puts the right answer in every position across deals", () => {
    const spots = new Set(Array.from({ length: 40 }, (_, deal) => shuffled([true, false, false, false], seededRandom(`deal ${deal}`)).indexOf(true)));
    expect(spots.size).toBe(4);
  });

  it("scrambles with a random source, never leaving the word in order", () => {
    for (let deal = 0; deal < 30; deal += 1) {
      const mixed = scramble("cat", 0, seededRandom(`deal ${deal}`));
      expect(mixed.join("")).not.toBe("cat");
      expect([...mixed].sort()).toEqual(["a", "c", "t"]);
    }
  });
});
