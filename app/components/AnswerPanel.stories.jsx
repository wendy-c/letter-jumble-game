import { fn } from "storybook/test";
import { cvcModes } from "../phonics-data/cvc-data";
import { digraphTopics } from "../phonics-data/digraphs-data";
import { magicETopics } from "../phonics-data/magic-e-data";
import { rControlledTopics } from "../phonics-data/r-controlled-data";
import { getSpellingGuides } from "../lib/spelling";
import AnswerPanel from "./AnswerPanel";

const cvc = cvcModes[0].words[0];
const digraph = digraphTopics[0].words[0];
const flute = magicETopics[0].words.find((question) => question.word === "flute");
const bird = rControlledTopics[0].words.find((question) => question.word === "bird");

export default {
  title: "Components/Spelling/AnswerPanel",
  component: AnswerPanel,
  args: {
    isCvc: false, answer: "kitten", round: 0, blanks: [0, 1, 2, 3, 4, 5], placed: [], tiles: ["t", "k", "e", "i", "n", "t"],
    checked: false, complete: false, allPlaced: false, guides: null, voiceMessage: "",
    onSpeak: fn(), onSlotClick: fn(), onTileClick: fn(), onCheck: fn(),
  },
  decorators: [(Story) => <div className="game-card" style={{ maxWidth: 560 }}><Story /></div>],
};

export const Spelling = {};
export const SpellingGuide = { args: { guides: getSpellingGuides("kitten") } };
export const NotQuite = { args: { placed: [1, 3, 5, 0, 2, 4], checked: true, allPlaced: true } };
export const FillEveryBox = { args: { placed: [1, 3], checked: true } };
export const Cvc = {
  args: { isCvc: true, answer: cvc.answers[0], blanks: [cvc.missing], tiles: cvc.choices },
};
export const Digraph = {
  args: { isCvc: true, isDigraph: true, answer: digraph.answers[0], blanks: [digraph.missing], gapLength: digraph.gapLength ?? 2, tiles: digraph.choices },
};
// Magic E: the vowel's and the e's boxes under one arch, and pairs to tap (flute: f l _ t _).
export const MagicE = {
  args: { isCvc: true, isMagicE: true, answer: flute.answers[0], blanks: [flute.missing], tiles: flute.choices },
};
export const MagicEFilled = { args: { ...MagicE.args, placed: [3] } };
// R-Controlled Vowels: the vowel and its r missing (bird: b _ _ d), and the five pairs to tap.
export const RControlled = {
  args: { isCvc: true, isRVowel: true, answer: bird.answers[0], blanks: [bird.missing], gapLength: bird.gapLength, tiles: bird.choices },
};
