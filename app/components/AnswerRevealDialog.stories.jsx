import { fn } from "storybook/test";
import AnswerRevealDialog, { chineseRevealLabels } from "./AnswerRevealDialog";

export default {
  title: "Components/Cards/AnswerRevealDialog",
  component: AnswerRevealDialog,
  args: { onContinue: fn() },
};

export const Animal = { args: { reveal: { text: "dolphin", picture: "/images/game-asset/animals/dolphin.svg" } } };
export const Drawing = { args: { reveal: { text: "beard", picture: "/images/game-asset/body-and-face/beard.svg" } } };
export const Chinese = {
  args: { reveal: { text: "紅色", picture: "/images/game-asset/colours/red.svg", note: "紅色的紅" }, labels: chineseRevealLabels, lang: "zh-Hant-HK" },
};
