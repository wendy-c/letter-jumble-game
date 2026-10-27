import { fn } from "storybook/test";
import { cvcModes } from "../cvc-data";
import { digraphTopics } from "../digraphs-data";
import { getSpellingGuides } from "../lib/spelling";
import AnswerPanel from "./AnswerPanel";

const cvc = cvcModes[0].words[0];
const digraph = digraphTopics[0].words[0];

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
