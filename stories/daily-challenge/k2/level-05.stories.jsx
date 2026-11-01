import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/K2/Level 5",
  component: LevelQuestions,
  args: { level: "k2-level-5" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
