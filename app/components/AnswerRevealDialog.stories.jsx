import { fn } from "storybook/test";
import AnswerRevealDialog, { chineseRevealLabels } from "./AnswerRevealDialog";

export default {
  title: "Components/Cards/AnswerRevealDialog",
  component: AnswerRevealDialog,
  args: { onContinue: fn() },
};

export const Emoji = { args: { reveal: { text: "dolphin", picture: "🐬" } } };
export const Drawing = { args: { reveal: { text: "beard", picture: "/images/game-asset/body-and-face/beard.svg" } } };
export const Chinese = {
  args: { reveal: { text: "紅色", picture: "🔴", note: "紅色的紅" }, labels: chineseRevealLabels, lang: "zh-Hant-HK" },
};
