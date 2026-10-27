import { fn } from "storybook/test";
import { chineseTopics } from "../chinese-data";
import { categories } from "../game-data";
import WordMenu from "./WordMenu";

const animals = categories.find((topic) => topic.id === "animals");

export default {
  title: "Components/Menus/WordMenu",
  component: WordMenu,
  args: {
    topic: animals, round: 2, totalWords: animals.words.length,
    onSelectWord: fn(), onShuffle: fn(), onClose: fn(),
  },
};

export const Spelling = {};
export const Chinese = { args: { topic: chineseTopics[0], totalWords: chineseTopics[0].words.length, language: "zh" } };
