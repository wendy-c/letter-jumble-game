import { speedTopics } from "../../app/math-data/speed-quest-data";
import LevelQuestions from "./LevelQuestions";

// A sample of each Rainbow Speed Quest topic (each round deals 10 at random from all of them).
export default {
  title: "Challenge/Rainbow Speed Quest",
  component: LevelQuestions,
  parameters: { layout: "padded" },
};

export const Within10 = { name: "Within 10", args: { topic: speedTopics[0], language: "en" } };
export const Within20 = { name: "Within 20", args: { topic: speedTopics[1], language: "en" } };
export const Within10Chinese = { name: "Within 10 · 中文", args: { topic: { ...speedTopics[0], name: speedTopics[0].names.zh }, language: "zh" } };
export const Within20Chinese = { name: "Within 20 · 中文", args: { topic: { ...speedTopics[1], name: speedTopics[1].names.zh }, language: "zh" } };
