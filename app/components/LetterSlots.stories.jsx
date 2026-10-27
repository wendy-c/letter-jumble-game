import { fn } from "storybook/test";
import { getSpellingGuides } from "../lib/spelling";
import LetterSlots from "./LetterSlots";

// "kitten": every letter is a box to fill; tiles are the scrambled letters.
const answer = "kitten";
const tiles = ["t", "k", "e", "i", "n", "t"];

export default {
  title: "Components/Spelling/LetterSlots",
  component: LetterSlots,
  args: { answer, round: 0, blanks: [0, 1, 2, 3, 4, 5], placed: [], tiles, checked: false, guides: null, onSlotClick: fn() },
};

export const Empty = {};
export const PartlyFilled = { args: { placed: [1, 3, 0] } };
export const CheckedRight = { args: { placed: [1, 3, 0, 5, 2, 4], checked: true } };
export const CheckedWrong = { args: { placed: [1, 3, 5, 0, 2, 4], checked: true } };
export const SpellingGuide = { args: { answer: "rainbow", tiles: [..."rainbow"], blanks: [0, 1, 2, 3, 4, 5, 6], guides: getSpellingGuides("rainbow") } };
export const TwoWords = { args: { answer: "ice cream", tiles: [..."icecream"], blanks: [0, 1, 2, 3, 4, 5, 6, 7] } };
export const CvcGap = { args: { answer: "cat", tiles: ["a", "e", "i", "o", "u"], blanks: [1], placed: [0] } };
export const DigraphGap = { args: { answer: "ship", tiles: ["sh", "ch", "th"], blanks: [0], gapLength: 2, placed: [] } };
