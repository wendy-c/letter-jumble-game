import { fn } from "storybook/test";
import PlayerMenu from "./PlayerMenu";
import SiteHeader from "./SiteHeader";

export default {
  title: "Components/Header/SiteHeader",
  component: SiteHeader,
  args: { onBrandClick: fn() },
};

export const WithPlayer = {
  args: {
    children: (
      <>
        <PlayerMenu player={{ name: "Ada", coins: 37, age: "3-4" }} onSwitch={fn()} onBadges={fn()} onParentMode={fn()} onLanguage={fn()} onLogOut={fn()} />
      </>
    ),
  },
};
export const NobodyPlaying = { args: { children: null } };
