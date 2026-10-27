import { fn } from "storybook/test";
import { measureWordTopics } from "../measure-words-data";
import MeasureWordGame from "./MeasureWordGame";

const topic = measureWordTopics[0];

export default {
  title: "Components/Chinese/MeasureWordGame",
  component: MeasureWordGame,
  args: { topic, round: 0, question: topic.words[0], onAnswer: fn() },
};

export const Question = {};
export const AnotherQuestion = { args: { round: 3, question: topic.words[3] } };
