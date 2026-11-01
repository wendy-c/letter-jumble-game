import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/K1/Level 4",
  component: LevelQuestions,
  args: { level: "k1-level-4" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
