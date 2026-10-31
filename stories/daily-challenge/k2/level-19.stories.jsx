import LevelQuestions from "../LevelQuestions";

// K3 plays the K2 levels too.
export default {
  title: "Challenge/Daily Challenge/K2/Level 19",
  component: LevelQuestions,
  args: { level: "k2-level-19" },
  parameters: { layout: "padded" },
};

export const English = { args: { language: "en" } };
export const Chinese = { name: "中文", args: { language: "zh" } };
