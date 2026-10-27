import { fn } from "storybook/test";
import { categories } from "../game-data";
import Breadcrumbs from "./Breadcrumbs";
import GameHeading from "./GameHeading";
import { HowToPlayButton } from "./HowToPlayDialog";

const animals = categories.find((topic) => topic.id === "animals");

export default {
  title: "Components/Spelling/GameHeading",
  component: GameHeading,
  args: {
    topic: animals, round: 3, rainbowCoins: 12, wordMenuOpen: false, onOpenWordMenu: fn(),
    breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Letter Jumble for Movers", href: "/letter-jumble" }, { label: "Animals", href: "/letter-jumble/animals" }]} />,
    titleAction: <HowToPlayButton language="en" onClick={fn()} />,
  },
};

export const Spelling = {};
export const Cvc = { args: { isCvc: true } };
export const Idioms = { args: { eyebrow: "今日魔法堂", note: "看圖畫，學成語！" } };
