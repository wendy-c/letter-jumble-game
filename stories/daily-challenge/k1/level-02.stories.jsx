import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/K1/Level 2",
  component: LevelQuestions,
  args: { level: "k1-level-2" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
