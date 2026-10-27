import { fn } from "storybook/test";
import { idiomTopics } from "../idioms-data";
import IdiomGame from "./IdiomGame";

const topic = idiomTopics[0];

export default {
  title: "Components/Chinese/IdiomGame",
  component: IdiomGame,
  args: { topic, round: 0, question: topic.words[0], onAnswer: fn() },
};

export const Question = {};
export const AnotherQuestion = { args: { round: 4, question: topic.words[4] } };
