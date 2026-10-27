import AnswerToast from "./AnswerToast";

// The cheer after a right answer. In the app it shows for a second (answerToastTime).
export default {
  title: "Components/Cards/AnswerToast",
  component: AnswerToast,
  parameters: { layout: "fullscreen" },
};

export const English = { args: { message: "Amazing!", earnedLabel: "You collected a rainbow coin!" } };
export const Chinese = { args: { message: "做得好！", earnedLabel: "你得到一個彩虹金幣！", lang: "zh-Hant-HK" } };
