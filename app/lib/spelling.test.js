import { getSpellingGuides, scramble, slotCount } from "./spelling";

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
