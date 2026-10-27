import { fn } from "storybook/test";
import PlayerDialog, { NewPlayerForm } from "./PlayerDialog";

const players = [{ name: "Ada", coins: 37, age: "3-4" }, { name: "Elly", coins: 120, age: "5-6" }];

export default {
  title: "Components/Players/PlayerDialog",
  component: PlayerDialog,
  args: { players, currentName: "Ada", onSelect: fn(), onCreate: fn(() => null), onSetAge: fn(), onClose: fn() },
};

export const WhosPlaying = {};
export const FirstPlayer = { args: { players: [], currentName: null } };
export const AskAge = { args: { players: [{ name: "Ada", coins: 0 }], askAgeFor: "Ada" } };
export const NewPlayerFormOnly = {
  render: () => <div style={{ maxWidth: 420 }}><NewPlayerForm label="What’s your name?" onCreate={fn(() => null)} submitLabel="Let’s play!" /></div>,
};
