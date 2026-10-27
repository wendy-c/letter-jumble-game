import { fn } from "storybook/test";
import { gamesForAge } from "../games-data";
import GamePicker from "./GamePicker";

export default {
  title: "Components/Menus/GamePicker",
  component: GamePicker,
  args: { onSelectGame: fn(), playerName: "Ada" },
};

export const Age3To4 = { args: { games: gamesForAge("3-4") } };
export const Age5To6 = { args: { games: gamesForAge("5-6") } };
export const NobodyPlaying = { args: { games: gamesForAge("3-4"), playerName: null } };
export const NoGames = { args: { games: [], emptyMessage: "No games are turned on for Ada yet. Ask a grown-up to choose some in Parent mode." } };
