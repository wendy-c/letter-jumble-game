import { cvcModes } from "./cvc-data";

const modeByName = Object.fromEntries(cvcModes.map((mode) => [mode.name, mode]));

describe("cvcModes", () => {
  it("has the four sound modes, each with all 46 words", () => {
    expect(cvcModes.map((mode) => mode.name)).toEqual([
      "Beginning Sound", "Middle Sound", "Ending Sound", "Mixed Sounds",
    ]);
    cvcModes.forEach((mode) => expect(mode.words).toHaveLength(46));
  });

  it("only uses three-letter consonant-vowel-consonant words", () => {
    modeByName["Beginning Sound"].words.forEach(({ word }) => {
      expect(word).toMatch(/^[^aeiou][aeiou][^aeiou]$/);
    });
  });

  it("hides the letter for each mode's position", () => {
    expect(modeByName["Beginning Sound"].words.every((word) => word.missing === 0)).toBe(true);
    expect(modeByName["Middle Sound"].words.every((word) => word.missing === 1)).toBe(true);
    expect(modeByName["Ending Sound"].words.every((word) => word.missing === 2)).toBe(true);
  });

  it("cycles through beginning, middle and ending sounds in Mixed Sounds", () => {
    expect(modeByName["Mixed Sounds"].words.slice(0, 6).map((word) => word.missing)).toEqual([0, 1, 2, 0, 1, 2]);
  });

  it("always offers every short vowel for the middle sound", () => {
    modeByName["Middle Sound"].words.forEach(({ choices }) => {
      expect(choices).toEqual(["a", "e", "i", "o", "u"]);
    });
  });

  it("offers four different consonants, including the right one, for beginning and ending sounds", () => {
    [...modeByName["Beginning Sound"].words, ...modeByName["Ending Sound"].words].forEach(({ word, missing, choices }) => {
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(word[missing]);
      choices.forEach((letter) => expect(letter).not.toMatch(/[aeiou]/));
    });
  });

  it("does not always put the right letter in the same place", () => {
    const positions = new Set(
      modeByName["Beginning Sound"].words.map(({ word, choices }) => choices.indexOf(word[0])),
    );
    expect(positions.size).toBeGreaterThan(1);
  });
});
