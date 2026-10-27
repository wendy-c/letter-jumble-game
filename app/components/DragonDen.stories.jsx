import { fn } from "storybook/test";
import { dragons } from "../dragon-data";
import Breadcrumbs from "./Breadcrumbs";
import DragonDen from "./DragonDen";

// The 3D dragon (three.js) runs live here: tap her, drag to turn her, or spend coins.
export default {
  title: "Components/Dragons/DragonDen",
  component: DragonDen,
  args: { coins: 50, onSpendCoins: fn(() => true), onGoToVillage: fn() },
};

export const Mochi = {
  args: { dragon: dragons.mochi, breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Mochi the Rainbow Dragon", href: "/dragon" }]} /> },
};
export const Tofu = {
  args: { dragon: dragons.tofu, breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tofu’s House", href: "/dragon/tofu" }]} /> },
};
export const ThePark = {
  args: { dragon: dragons.park, breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "The Park", href: "/dragon/park" }]} /> },
};
export const OutOfCoins = { args: { ...Mochi.args, coins: 0 } };
