import { fn } from "storybook/test";
import Breadcrumbs from "./Breadcrumbs";
import RainbowVillage from "./RainbowVillage";

export default {
  title: "Components/Dragons/RainbowVillage",
  component: RainbowVillage,
  args: {
    breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Mochi the Rainbow Dragon", href: "/dragon" }]} />,
    unlockCost: 100, onVisit: fn(), onUnlockTofu: fn(),
  },
};

export const SavingUpForTofu = { args: { tofuUnlocked: false, coins: 37 } };
export const ReadyToUnlockTofu = { args: { tofuUnlocked: false, coins: 120 } };
export const SavingUpForThePark = { args: { tofuUnlocked: true, coins: 20 } };
export const ReadyToOpenThePark = { args: { tofuUnlocked: true, coins: 140 } };
export const EverythingOpen = { args: { tofuUnlocked: true, parkUnlocked: true, coins: 20 } };
