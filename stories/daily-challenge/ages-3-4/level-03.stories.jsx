import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/Ages 3-4/Level 3",
  component: LevelQuestions,
  args: { level: "3-4-level-3" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
