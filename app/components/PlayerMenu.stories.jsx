import { expect, fn, userEvent, within } from "storybook/test";
import PlayerMenu from "./PlayerMenu";

export default {
  title: "Components/Header/PlayerMenu",
  component: PlayerMenu,
  args: { player: { name: "Ada", coins: 37, age: "3-4" }, onSwitch: fn(), onBadges: fn(), onParentMode: fn(), onLanguage: fn(), onLogOut: fn() },
  decorators: [(Story) => <div style={{ display: "flex", justifyContent: "flex-end", minHeight: 320 }}><Story /></div>],
};

export const Closed = {};
export const Open = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Player options|玩家選項/ }));
    await expect(await canvas.findByRole("menu")).toBeInTheDocument();
  },
};
