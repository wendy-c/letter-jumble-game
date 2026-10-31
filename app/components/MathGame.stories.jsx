import { fn } from "storybook/test";
import { mathLevels } from "../math-data";
import { speedTopics } from "../speed-quest-data";
import MathGame from "./MathGame";

const level = (id) => mathLevels.find((item) => item.id === id);
const question = (id, index) => ({ topic: level(id), round: index, question: level(id).words[index] });

export default {
  title: "Components/Math/MathGame",
  component: MathGame,
  args: { ...question("3-4-level-1", 0), onAnswer: fn(), language: "en" },
  argTypes: { language: { control: "inline-radio", options: ["en", "zh"] } },
};

export const NumberBond = {};
export const Counting = { args: question("3-4-level-1", 1) };
export const FruitStand = { args: question("3-4-level-1", 2) };
export const FruitStandInChinese = { args: { ...question("3-4-level-1", 2), language: "zh" } };
export const MissingNumber = { args: question("3-4-level-1", 5) };
export const Pattern = { args: question("3-4-level-1", 6) };
export const GeneratedGroups = { args: question("3-4-level-4", 0) };
export const GeneratedCount = { args: question("3-4-level-4", 1) };
export const GeneratedTenFrame = { args: question("3-4-level-10", 2) };
export const GeneratedTakeAway = { args: question("3-4-level-4", 4) };
export const GeneratedSwap = { args: question("5-6-level-10", 6) };
export const SpeedQuest = { args: { topic: speedTopics[1], round: 0, question: speedTopics[1].words[40], startedAt: Date.now() } };
