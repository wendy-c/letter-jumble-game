import { fn } from "storybook/test";
import { chineseAdvancedTopics, chineseTopics } from "../chinese-data";
import ChineseGame from "./ChineseGame";

const colours = chineseTopics.find((topic) => topic.id === "colours") ?? chineseTopics[0];
const advanced = chineseAdvancedTopics[0];

export default {
  title: "Components/Chinese/ChineseGame",
  component: ChineseGame,
  args: { onAnswer: fn() },
};

export const OneCharacter = { args: { topic: colours, round: 0, word: colours.words[0] } };
export const Words = { args: { topic: advanced, round: 2, word: advanced.words[2] } };
