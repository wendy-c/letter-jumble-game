import { fn } from "storybook/test";
import { mathLevels } from "../math-data";
import MathGame from "./MathGame";

const [level1, , , level4] = mathLevels;
const question = (level, index) => ({ topic: level, round: index, question: level.words[index] });

export default {
  title: "Components/Math/MathGame",
  component: MathGame,
  args: { ...question(level1, 0), onAnswer: fn() },
};

export const NumberBond = {};
export const Counting = { args: question(level1, 1) };
export const InChinese = { args: question(level1, 2) };
export const Sum = { args: question(level1, 3) };
export const MissingNumber = { args: question(level1, 5) };
export const Pattern = { args: question(level1, 6) };
export const Swap = { args: question(level4, 6) };
export const SumWithoutPicture = { args: question(level4, 8) };
