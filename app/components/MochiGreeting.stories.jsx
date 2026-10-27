import MochiGreeting from "./MochiGreeting";

// Switch the toolbar's Language to see the greeting in 繁體中文.
export default {
  title: "Components/Menus/MochiGreeting",
  component: MochiGreeting,
};

export const ByName = { args: { playerName: "Ada" } };
export const NobodyPlaying = { args: { playerName: null } };
