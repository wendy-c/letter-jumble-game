import { fn } from "storybook/test";
import { gamesForAge } from "../games-data";
import GamePicker from "./GamePicker";

export default {
  title: "Components/Menus/GamePicker",
  component: GamePicker,
  args: { onSelectGame: fn(), playerName: "Ada" },
};

export const K1 = { args: { games: gamesForAge("k1") } };
export const K2 = { args: { games: gamesForAge("k2") } };
export const K3 = { args: { games: gamesForAge("k3") } };
export const NobodyPlaying = { args: { games: gamesForAge("k1"), playerName: null } };
export const NoGames = { args: { games: [], emptyMessage: "No games are turned on for Ada yet. Ask a grown-up to choose some in Parent mode." } };
