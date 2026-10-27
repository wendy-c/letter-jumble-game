import { fn } from "storybook/test";
import { badgeImage } from "../badges";
import CompletionDialog, { chineseCompletionText } from "./CompletionDialog";

export default {
  title: "Components/Cards/CompletionDialog",
  component: CompletionDialog,
  args: { topicName: "Animals", count: 10, onDone: fn(), onVisitMochi: fn() },
};

export const NewBadge = { args: { badge: { name: "Animals", image: badgeImage("letter-jumble", "animals") } } };
export const GoodTry = { args: { correct: 8 } };
export const GoodTryBadgeAlreadyEarned = { args: { correct: 8, hasBadge: true } };
export const Chinese = { args: { topicName: "顏色", correct: 10, text: chineseCompletionText, badge: { name: "顏色", image: badgeImage("chinese", "colours") } } };
