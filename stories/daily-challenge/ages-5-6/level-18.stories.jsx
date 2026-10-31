import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/Ages 5-6/Level 18",
  component: LevelQuestions,
  args: { level: "5-6-level-18" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
