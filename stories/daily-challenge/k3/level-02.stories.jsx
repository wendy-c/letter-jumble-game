import LevelQuestions from "../LevelQuestions";

export default {
  title: "Challenge/Daily Challenge/K3/Level 2",
  component: LevelQuestions,
  args: { level: "k3-level-2" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
