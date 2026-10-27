import { fn } from "storybook/test";
import RewardDialog, { chineseRewardLabels } from "./RewardDialog";

export default {
  title: "Components/Cards/RewardDialog",
  component: RewardDialog,
  args: { message: "Brilliant spelling!", onContinue: fn() },
};

export const English = {};
export const Chinese = { args: { message: "做得好！", labels: chineseRewardLabels } };
